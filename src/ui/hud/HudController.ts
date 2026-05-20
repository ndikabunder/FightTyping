import { limbLabels } from "../../game/content/promptPools";
import { medalForRun } from "../../game/systems/LeaderboardStore";
import type { GameSnapshot, PromptState } from "../../game/types";

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;

const promptOffsets = {
  leftHand: { x: -168, y: -172 },
  rightHand: { x: 158, y: -178 },
  leftLeg: { x: -154, y: -26 },
  rightLeg: { x: 146, y: -34 }
} as const;

export class HudController {
  private readonly root: HTMLElement;
  private readonly onWindowKeyDown = (event: KeyboardEvent) => this.handleShortcut(event);
  private lastComboSerial = 0;
  private comboAnimation: { serial: number; startedAtMs: number; durationMs: number } | null = null;
  private comboAnimationFrame: number | null = null;
  private lastObjectiveCompleted = false;
  private questCompleteMotionUntilMs = 0;

  constructor(rootId: string, private readonly onCommand: (command: "retry" | "next" | "menu" | "resume") => void = () => undefined) {
    const root = document.getElementById(rootId);
    if (!root) {
      throw new Error(`Missing HUD root #${rootId}`);
    }
    this.root = root;
    window.addEventListener("keydown", this.onWindowKeyDown);
  }

  render(snapshot: GameSnapshot, options: { suppressResult?: boolean } = {}) {
    const showCombatOverlays = snapshot.roundState !== "won" && snapshot.roundState !== "lost" && snapshot.roundState !== "briefing";
    const showHudBars = snapshot.roundState !== "briefing";
    const objectiveCompleted = snapshot.level.objectiveProgress.completed;
    const nowMs = performance.now();

    if (objectiveCompleted && !this.lastObjectiveCompleted) {
      this.questCompleteMotionUntilMs = nowMs + 900;
    }

    if (!objectiveCompleted) {
      this.questCompleteMotionUntilMs = 0;
    }

    this.lastObjectiveCompleted = objectiveCompleted;

    const questStatusClass = objectiveCompleted ? "complete" : "incomplete";
    const questMotionClass = nowMs < this.questCompleteMotionUntilMs ? "just-completed" : "";
    const questMotionElapsedMs = Math.max(0, 900 - Math.max(0, this.questCompleteMotionUntilMs - nowMs));
    const questMotionStyle = questMotionClass ? ` style="--quest-complete-elapsed: -${questMotionElapsedMs.toFixed(0)}ms"` : "";
    const objectiveProgressPct = pct(snapshot.level.objectiveProgress.current, snapshot.level.objectiveProgress.target);
    const questStatusLabel = objectiveCompleted ? "CLEAR" : "IN PROGRESS";
    const questEmphasisClass = !objectiveCompleted && snapshot.level.objectiveProgress.current === 0 ? "needs-attention" : "";
    this.root.innerHTML = `
      ${showHudBars ? `
      <div class="hud-bars">
        ${this.hpBar("PLAYER", snapshot.player.hp, snapshot.player.maxHp, "player")}
        <div class="round-state">${this.roundLabel(snapshot)}</div>
        ${this.hpBar("ENEMY", snapshot.enemy.hp, snapshot.enemy.maxHp, "enemy")}
      </div>
      <div class="metrics">
        <span>Lv ${snapshot.level.id}</span>
      </div>
      <div class="level-status">
        <div class="level-chip ${questStatusClass} ${questMotionClass} ${questEmphasisClass}"${questMotionStyle}>
          <div class="quest-head">
            <strong>Quest</strong>
            <span>${questStatusLabel}</span>
          </div>
          <small class="quest-objective">${snapshot.level.objective}</small>
          <div class="quest-progress-row">
            <small class="objective-progress ${snapshot.level.objectiveProgress.completed ? "complete" : ""}">
              ${snapshot.level.objectiveProgress.label}: ${snapshot.level.objectiveProgress.current}/${snapshot.level.objectiveProgress.target}
            </small>
          </div>
          <div class="quest-progress-track" aria-hidden="true">
            <span style="width: ${objectiveProgressPct}%"></span>
          </div>
        </div>
        ${this.comboBadge(snapshot)}
      </div>
      ` : ""}
      ${showCombatOverlays ? this.combatOverlays(snapshot) : ""}
      ${this.briefingOverlay(snapshot)}
      ${options.suppressResult ? "" : this.resultOverlay(snapshot)}
    `;
    this.bindResultButtons();
    this.syncComboAnimation(snapshot);
  }

  setHidden(hidden: boolean) {
    this.root.hidden = hidden;
  }

  destroy() {
    if (this.comboAnimationFrame !== null) {
      window.cancelAnimationFrame(this.comboAnimationFrame);
      this.comboAnimationFrame = null;
    }
    window.removeEventListener("keydown", this.onWindowKeyDown);
    this.root.innerHTML = "";
  }

  private combatOverlays(snapshot: GameSnapshot) {
    return `
      <div class="prompts">
        ${snapshot.prompts.map((prompt) => this.prompt(prompt, snapshot)).join("")}
        ${snapshot.dodgePrompt ? this.dodgePrompt(snapshot.dodgePrompt, snapshot) : ""}
      </div>
      ${this.skillPanel(snapshot)}
      ${this.enemySkillPanel(snapshot)}
      ${this.enemyCooldown(snapshot)}
      ${this.feedback(snapshot)}
    `;
  }

  private briefingOverlay(snapshot: GameSnapshot) {
    if (snapshot.roundState === "briefing") {
      return `
        <div class="briefing-overlay level-intro">
          <div class="briefing-card">
            <div class="briefing-col-level">
              <small>Stage</small>
              <h1>Level ${snapshot.level.id}</h1>
              <span>${snapshot.level.enemyName}</span>
            </div>
            <div class="briefing-col-quest">
              <small>Quest</small>
              <strong>${snapshot.level.objective}</strong>
              <span>${snapshot.level.focus}</span>
              ${this.tutorialHint(snapshot.level.id)}
            </div>
          </div>
          <div class="briefing-start-hint">Press SPACE to start</div>
        </div>
      `;
    }

    if (snapshot.roundState !== "countdown") {
      return "";
    }

    return `
      <div class="briefing-overlay fight-countdown">
        <div class="briefing-level-splash">
          <strong>Level ${snapshot.level.id}</strong>
        </div>
        <div class="briefing-countdown">${this.countdownValue(snapshot)}</div>
      </div>
    `;
  }

  private tutorialHint(levelId: number) {
    const hints: Record<number, string> = {
      1: "Type the words near each limb. Complete both punch prompts before KO.",
      2: "Keep typing clean. Wrong keys break combo and give enemy pressure.",
      3: "Combo x3 unlocks Neon Break. Type its two-word panel when ready."
    };
    const hint = hints[levelId];
    return hint ? `<div class="briefing-tutorial"><small>TIP LEVEL ${levelId}</small><p>${hint}</p></div>` : "";
  }

  private hpBar(label: string, hp: number, maxHp: number, side: string) {
    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    return `
      <div class="hp-wrap ${side}">
        <span>${label}</span>
        <div class="hp-track"><div class="hp-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }

  private countdownValue(snapshot: GameSnapshot) {
    const value = Math.max(1, Math.ceil(snapshot.countdownMs / 600));
    return value === 1 ? "FIGHT" : `${value}`;
  }

  private prompt(prompt: PromptState, snapshot: GameSnapshot) {
    const offset = promptOffsets[prompt.limb];
    const pos = {
      x: snapshot.player.position.x + offset.x,
      y: snapshot.player.position.y + offset.y
    };
    const typed = prompt.typed.length;
    const chars = [...prompt.text]
      .map((char, index) => `<span class="${index < typed ? "typed" : ""} ${index === typed - 1 ? "just-typed" : ""}">${char}</span>`)
      .join("");
    const wrongShake = this.isWrongTarget(snapshot, prompt.id) ? "wrong-shake" : "";
    return `
      <div class="prompt-card ${prompt.limb} ${prompt.status} ${wrongShake}" data-typed="${typed}" style="left:${pct(pos.x, LOGICAL_WIDTH)}%;top:${pct(pos.y, LOGICAL_HEIGHT)}%">
        <small>${limbLabels[prompt.limb]}</small>
        <strong>${chars}</strong>
      </div>
    `;
  }

  private dodgePrompt(prompt: PromptState, snapshot: GameSnapshot) {
    const pos = {
      x: snapshot.player.position.x,
      y: snapshot.player.position.y - 302
    };
    const typed = prompt.typed.length;
    const chars = [...prompt.text]
      .map((char, index) => `<span class="${index < typed ? "typed" : ""} ${index === typed - 1 ? "just-typed" : ""}">${char}</span>`)
      .join("");

    const wrongShake = this.isWrongTarget(snapshot, prompt.id) ? "wrong-shake" : "";
    return `
      <div class="prompt-card dodge ${prompt.status} ${wrongShake}" style="left:${pct(pos.x, LOGICAL_WIDTH)}%;top:${pct(pos.y, LOGICAL_HEIGHT)}%">
        <small>Backstep</small>
        <strong>${chars}</strong>
      </div>
    `;
  }

  private enemyCooldown(snapshot: GameSnapshot) {
    const pctValue = Math.max(0, Math.min(100, (snapshot.enemyAttackClockMs / snapshot.enemyAttackEveryMs) * 100));
    const state = pctValue >= 82 ? "danger" : pctValue >= 58 ? "warning" : "safe";
    const cue = state === "danger" ? "DODGE NOW" : state === "warning" ? "READY" : "WATCH";
    const pos = {
      x: snapshot.enemy.position.x,
      y: snapshot.enemy.position.y - 302
    };
    const label = snapshot.enemyIncomingAttackId ? attackLabel(snapshot.enemyIncomingAttackId) : "Enemy Attack";

    return `
      <div class="enemy-cooldown ${state}" style="left:${pct(pos.x, LOGICAL_WIDTH)}%;top:${pct(pos.y, LOGICAL_HEIGHT)}%">
        <span><em>${cue}</em>${label}</span>
        <div><b style="width:${pctValue}%"></b></div>
      </div>
    `;
  }

  private skillPanel(snapshot: GameSnapshot) {
    if (!snapshot.skill.available) {
      return "";
    }

    const pos = {
      x: snapshot.player.position.x,
      y: snapshot.player.position.y + 70
    };
    const pctValue = Math.round(snapshot.skill.progress * 100);
    const state = snapshot.skill.unlocked ? snapshot.skill.status : "locked";
    const typed = snapshot.skill.typed.length;
    let index = 0;
    const words = snapshot.skill.words
      .map((word) => {
        const chars = [...word]
          .map((char) => {
            const typedClass = index < typed ? "typed" : "";
            index += 1;
            return `<span class="${typedClass}">${char}</span>`;
          })
          .join("");
        return `<strong>${chars}</strong>`;
      })
      .join("<em> </em>");

    const wrongShake = this.isWrongTarget(snapshot, "skill") ? "wrong-shake" : "";
    return `
      <div class="skill-panel ${state} ${wrongShake}" style="left:${pct(pos.x, LOGICAL_WIDTH)}%;top:${pct(pos.y, LOGICAL_HEIGHT)}%">
        <div class="skill-charge"><b style="width:${pctValue}%"></b></div>
        <small>${snapshot.skill.unlocked ? "Skill x2 Ready" : `Skill Lock ${Math.min(snapshot.combo.count, snapshot.skill.requiredCombo)}/${snapshot.skill.requiredCombo}`}</small>
        <div class="skill-words">${words}</div>
      </div>
    `;
  }

  private enemySkillPanel(snapshot: GameSnapshot) {
    if (!snapshot.enemySkill.available) {
      return "";
    }

    const pos = {
      x: snapshot.enemy.position.x,
      y: snapshot.enemy.position.y + 70
    };
    const pctValue = Math.max(0, Math.min(100, (snapshot.enemySkill.clockMs / snapshot.enemySkill.cooldownMs) * 100));
    const state = pctValue >= 85 ? "danger" : pctValue >= 58 || snapshot.enemySkill.telegraphMs > 0 ? "warning" : "charging";
    const cue = state === "danger" ? "DANGER" : state === "warning" ? "WARNING" : "CHARGING";
    return `
      <div class="enemy-skill-panel ${state}" style="left:${pct(pos.x, LOGICAL_WIDTH)}%;top:${pct(pos.y, LOGICAL_HEIGHT)}%">
        <div class="enemy-skill-charge"><b style="width:${pctValue}%"></b></div>
        <small>${cue} · Enemy Skill x2</small>
        <strong>Enemy Skill</strong>
      </div>
    `;
  }

  private feedback(snapshot: GameSnapshot) {
    if (!snapshot.feedback) {
      return "";
    }

    return `<div class="combat-feedback ${snapshot.feedback.kind}">${snapshot.feedback.label}</div>`;
  }

  private isWrongTarget(snapshot: GameSnapshot, targetId: string) {
    if (snapshot.feedback?.kind !== "wrong") {
      return false;
    }
    return snapshot.feedback.targetId === targetId || snapshot.feedback.targetId === "all-prompts";
  }

  private comboBadge(snapshot: GameSnapshot) {
    if (snapshot.combo.count <= 0) {
      return "";
    }

    return `
      <div class="combo-readout ${snapshot.combo.tier}" data-combo-serial="${snapshot.combo.serial}" aria-label="${snapshot.combo.label}">
        <span>COMBO</span><strong>x${snapshot.combo.count}</strong>
      </div>
    `;
  }

  private roundLabel(snapshot: GameSnapshot) {
    if (snapshot.roundState === "countdown") {
      return "GET READY";
    }

    if (snapshot.roundState === "won") {
      return "YOU WIN";
    }

    if (snapshot.roundState === "lost") {
      return "YOU LOSE";
    }

    if (snapshot.roundState === "paused") {
      return "PAUSED";
    }

    return snapshot.enemyTelegraphMs > 0 ? "ENEMY WINDUP" : "TYPE TO STRIKE";
  }

  private resultOverlay(snapshot: GameSnapshot) {
    if (snapshot.roundState !== "won" && snapshot.roundState !== "lost" && snapshot.roundState !== "paused") {
      return "";
    }
    const text = snapshot.roundState === "paused" ? "Paused" : snapshot.roundState === "won" ? "Victory" : "Defeat";
    const sub = snapshot.roundState === "paused" ? "ESC untuk lanjut" : snapshot.roundState === "lost" ? this.defeatReason(snapshot) : "";
    const stateClass = snapshot.roundState === "won" ? "victory" : snapshot.roundState === "lost" ? "defeat" : "paused";
    const runAccuracy = accuracy(snapshot);
    const medal = medalForRun(snapshot.level.id, runAccuracy, snapshot.level.score);
    const perfectQuest = snapshot.roundState === "won" && runAccuracy >= 100;
    const buttons =
      snapshot.roundState === "won"
        ? `<button data-command="next">NEXT <small>N</small></button><button data-command="retry">RETRY <small>R</small></button><button data-command="menu">MAIN MENU <small>M</small></button>`
        : snapshot.roundState === "lost"
        ? `<button data-command="retry">RETRY <small>R</small></button><button data-command="menu">MAIN MENU <small>M</small></button>`
        : `<button data-command="resume">RESUME <small>ESC</small></button><button data-command="retry">RESTART <small>R</small></button><button data-command="menu">MAIN MENU <small>M</small></button>`;
    return `
      <div class="result-overlay ${stateClass}">
        <div class="result-cut result-cut-a"></div>
        <div class="result-cut result-cut-b"></div>
        <div class="result-impact">${snapshot.roundState === "lost" ? "K.O." : ""}</div>
        <div class="result-ring"></div>
        <div class="result-shards" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="result-card">
          <div class="result-kicker">${snapshot.roundState === "won" ? "Objective Secured" : snapshot.roundState === "lost" ? "Combat Failed" : "Paused"}</div>
          <h1>${text}</h1>
          ${snapshot.roundState === "won" ? `<div class="result-medal medal-${medal.toLowerCase()}">MEDAL ${medal}${perfectQuest ? " · PERFECT QUEST ✦" : ""}</div>` : ""}
          <div class="result-stats">
            <span><small>Combo</small><strong>${snapshot.combo.count}</strong></span>
            <span><small>Best</small><strong>${snapshot.combo.best}</strong></span>
            <span><small>Accuracy</small><strong>${runAccuracy}%</strong></span>
            <span><small>Score</small><strong>${snapshot.level.score}</strong></span>
            <span><small>Level</small><strong>${snapshot.level.id}</strong></span>
            <span><small>Rank</small><strong>${snapshot.level.rank}</strong></span>
          </div>
          ${sub ? `<p class="result-reason ${snapshot.roundState === "lost" ? "defeat-reason" : ""}">${sub}</p>` : ""}
          <div class="result-actions">${buttons}</div>
        </div>
      </div>
    `;
  }

  private defeatReason(snapshot: GameSnapshot) {
    if (snapshot.enemy.hp <= 0 && !snapshot.level.objectiveProgress.completed) {
      return `Quest failed · ${snapshot.level.objectiveProgress.label} ${snapshot.level.objectiveProgress.current}/${snapshot.level.objectiveProgress.target}`;
    }

    if (snapshot.player.hp <= 0) {
      return "HP depleted · keep distance and dodge enemy attacks";
    }

    return "You lost this round.";
  }

  private bindResultButtons() {
    this.root.querySelectorAll<HTMLButtonElement>("[data-command]").forEach((button) => {
      button.addEventListener("click", () => {
        const command = button.dataset.command;
        if (command === "retry" || command === "next" || command === "menu" || command === "resume") {
          this.onCommand(command);
        }
      });
    });
  }

  private handleShortcut(event: KeyboardEvent) {
    if (event.repeat) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "escape") {
      event.preventDefault();
      event.stopPropagation();
      this.onCommand("resume");
      return;
    }

    const command =
      key === "n"
        ? "next"
        : key === "r"
        ? "retry"
        : key === "m"
        ? "menu"
        : key === "enter"
        ? this.defaultCommand()
        : null;

    if (!command) {
      return;
    }

    const button = this.root.querySelector<HTMLButtonElement>(`[data-command="${command}"]`);
    if (!button) {
      return;
    }

    event.preventDefault();
    this.onCommand(command);
  }

  private defaultCommand(): "next" | "retry" | "menu" | "resume" | null {
    const button = this.root.querySelector<HTMLButtonElement>("[data-command]");
    const command = button?.dataset.command;
    return command === "next" || command === "retry" || command === "menu" || command === "resume" ? command : null;
  }

  private syncComboAnimation(snapshot: GameSnapshot) {
    if (snapshot.combo.serial === 0) {
      this.lastComboSerial = 0;
      this.comboAnimation = null;
      return;
    }

    if (snapshot.combo.event !== "gain" || snapshot.combo.count <= 0) {
      return;
    }

    if (snapshot.combo.serial !== this.lastComboSerial) {
      this.lastComboSerial = snapshot.combo.serial;
      this.comboAnimation = {
        serial: snapshot.combo.serial,
        startedAtMs: performance.now(),
        durationMs: 520
      };
    }

    this.paintComboAnimationFrame();

    if (this.comboAnimationFrame === null && this.comboAnimation) {
      this.comboAnimationFrame = window.requestAnimationFrame(() => this.stepComboAnimation());
    }
  }

  private stepComboAnimation() {
    this.comboAnimationFrame = null;

    if (!this.paintComboAnimationFrame() || !this.comboAnimation) {
      return;
    }

    this.comboAnimationFrame = window.requestAnimationFrame(() => this.stepComboAnimation());
  }

  private paintComboAnimationFrame() {
    if (!this.comboAnimation) {
      return false;
    }

    const readout = this.root.querySelector<HTMLElement>(`.combo-readout[data-combo-serial="${this.comboAnimation.serial}"]`);
    const elapsedMs = performance.now() - this.comboAnimation.startedAtMs;
    const progress = Math.min(1, elapsedMs / this.comboAnimation.durationMs);

    if (readout && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = comboPopFrame(progress);
      readout.style.opacity = String(frame.opacity);
      readout.style.transform = `scale(${frame.scale}) translateY(${frame.y}px)`;
      readout.style.filter = `drop-shadow(0 0 ${frame.glow}px rgba(255, 243, 176, ${frame.glowAlpha}))`;
    }

    if (progress >= 1) {
      if (readout) {
        readout.style.opacity = "";
        readout.style.transform = "";
        readout.style.filter = "";
      }
      this.comboAnimation = null;
      return false;
    }

    return true;
  }
}

function pct(value: number, total: number) {
  return (value / total) * 100;
}

function accuracy(snapshot: GameSnapshot) {
  const total = snapshot.metrics.correctChars + snapshot.metrics.wrongChars;
  if (total === 0) {
    return 100;
  }
  return Math.round((snapshot.metrics.correctChars / total) * 100);
}

function attackLabel(actionId: string) {
  switch (actionId) {
    case "attack.punch.right":
      return "Right Hand";
    case "attack.punch.left":
      return "Left Hand";
    case "attack.kick.right":
      return "Right Leg";
    case "attack.kick.left":
      return "Left Leg";
    default:
      return "Enemy Attack";
  }
}

function comboPopFrame(progress: number) {
  if (progress < 0.28) {
    const local = easeOutCubic(progress / 0.28);
    return {
      opacity: Math.min(1, progress / 0.08),
      scale: lerp(0.72, 1.9, local),
      y: lerp(10, -3, local),
      glow: lerp(0, 20, local),
      glowAlpha: lerp(0, 0.86, local)
    };
  }

  if (progress < 0.72) {
    const local = easeOutCubic((progress - 0.28) / 0.44);
    return {
      opacity: 1,
      scale: lerp(1.9, 0.94, local),
      y: lerp(-3, 0, local),
      glow: lerp(20, 10, local),
      glowAlpha: lerp(0.86, 0.5, local)
    };
  }

  const local = easeOutCubic((progress - 0.72) / 0.28);
  return {
    opacity: 1,
    scale: lerp(0.94, 1, local),
    y: 0,
    glow: lerp(10, 8, local),
    glowAlpha: lerp(0.5, 0.32, local)
  };
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}
