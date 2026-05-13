import { limbLabels } from "../../game/content/promptPools";
import type { GameSnapshot, PromptState } from "../../game/types";

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;

const promptOffsets = {
  leftHand: { x: -168, y: -172 },
  rightHand: { x: 184, y: -178 },
  leftLeg: { x: -154, y: -26 },
  rightLeg: { x: 172, y: -34 }
} as const;

export class HudController {
  private readonly root: HTMLElement;
  private lastComboPopAtMs = 0;

  constructor(rootId: string, private readonly onCommand: (command: "retry" | "next" | "menu") => void = () => undefined) {
    const root = document.getElementById(rootId);
    if (!root) {
      throw new Error(`Missing HUD root #${rootId}`);
    }
    this.root = root;
  }

  render(snapshot: GameSnapshot) {
    this.root.innerHTML = `
      <div class="hud-bars">
        ${this.hpBar("PLAYER", snapshot.player.hp, snapshot.player.maxHp, "player")}
        <div class="round-state">${this.roundLabel(snapshot)}</div>
        ${this.hpBar("ENEMY", snapshot.enemy.hp, snapshot.enemy.maxHp, "enemy")}
      </div>
      <div class="metrics">
        <span>Lv ${snapshot.level.id}</span>
      </div>
      <div class="level-chip">
        <strong>${snapshot.level.name}</strong>
        <span>${snapshot.level.enemyName} - ${snapshot.level.phaseLabel}</span>
        <small>${snapshot.level.objective}</small>
      </div>
      ${this.comboBadge(snapshot)}
      <div class="prompts">
        ${snapshot.prompts.map((prompt) => this.prompt(prompt, snapshot)).join("")}
        ${snapshot.dodgePrompt ? this.dodgePrompt(snapshot.dodgePrompt, snapshot) : ""}
      </div>
      ${this.enemyCooldown(snapshot)}
      ${this.feedback(snapshot)}
      ${this.resultOverlay(snapshot)}
    `;
    this.bindResultButtons();
    this.animateComboBadge(snapshot);
  }

  destroy() {
    this.root.innerHTML = "";
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

  private prompt(prompt: PromptState, snapshot: GameSnapshot) {
    const offset = promptOffsets[prompt.limb];
    const pos = {
      x: snapshot.player.position.x + offset.x,
      y: snapshot.player.position.y + offset.y
    };
    const typed = prompt.typed.length;
    const chars = [...prompt.text]
      .map((char, index) => `<span class="${index < typed ? "typed" : ""}">${char}</span>`)
      .join("");
    return `
      <div class="prompt-card ${prompt.limb} ${prompt.status}" style="left:${pct(pos.x, LOGICAL_WIDTH)}%;top:${pct(pos.y, LOGICAL_HEIGHT)}%">
        <small>${limbLabels[prompt.limb]}</small>
        <strong>${chars}</strong>
      </div>
    `;
  }

  private dodgePrompt(prompt: PromptState, snapshot: GameSnapshot) {
    const pos = {
      x: snapshot.player.position.x,
      y: snapshot.player.position.y - 264
    };
    const typed = prompt.typed.length;
    const chars = [...prompt.text]
      .map((char, index) => `<span class="${index < typed ? "typed" : ""}">${char}</span>`)
      .join("");

    return `
      <div class="prompt-card dodge ${prompt.status}" style="left:${pct(pos.x, LOGICAL_WIDTH)}%;top:${pct(pos.y, LOGICAL_HEIGHT)}%">
        <small>Mundur</small>
        <strong>${chars}</strong>
      </div>
    `;
  }

  private enemyCooldown(snapshot: GameSnapshot) {
    const pctValue = Math.max(0, Math.min(100, (snapshot.enemyAttackClockMs / snapshot.enemyAttackEveryMs) * 100));
    const state = pctValue >= 82 ? "danger" : pctValue >= 58 ? "warning" : "safe";
    const pos = {
      x: snapshot.enemy.position.x,
      y: snapshot.enemy.position.y - 276
    };
    const label = snapshot.enemyIncomingAttackId ? attackLabel(snapshot.enemyIncomingAttackId) : "Enemy Attack";

    return `
      <div class="enemy-cooldown ${state}" style="left:${pct(pos.x, LOGICAL_WIDTH)}%;top:${pct(pos.y, LOGICAL_HEIGHT)}%">
        <span>${label}</span>
        <div><b style="width:${pctValue}%"></b></div>
      </div>
    `;
  }

  private feedback(snapshot: GameSnapshot) {
    if (!snapshot.feedback) {
      return "";
    }

    return `<div class="combat-feedback ${snapshot.feedback.kind}">${snapshot.feedback.label}</div>`;
  }

  private comboBadge(snapshot: GameSnapshot) {
    if (snapshot.metrics.combo <= 0) {
      return "";
    }

    return `
      <div class="level-combo ${comboTier(snapshot.metrics.combo)}">
        <span>COMBO</span><strong>x${snapshot.metrics.combo}</strong>
      </div>
    `;
  }

  private animateComboBadge(snapshot: GameSnapshot) {
    if (snapshot.metrics.combo <= 0 || snapshot.metrics.comboJustChangedAtMs <= 0) {
      return;
    }

    if (snapshot.metrics.comboJustChangedAtMs === this.lastComboPopAtMs) {
      return;
    }

    this.lastComboPopAtMs = snapshot.metrics.comboJustChangedAtMs;
    const badge = this.root.querySelector<HTMLElement>(".level-combo");
    if (!badge) {
      return;
    }

    badge.animate(
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(0.65)", filter: "brightness(1)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1.95)", filter: "brightness(1.85)", offset: 0.36 },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1)", filter: "brightness(1)" }
      ],
      {
        duration: 520,
        easing: "cubic-bezier(0.16, 1.3, 0.3, 1)",
        fill: "none"
      }
    );
  }

  private roundLabel(snapshot: GameSnapshot) {
    if (snapshot.roundState === "countdown") {
      const value = Math.max(1, Math.ceil(snapshot.countdownMs / 600));
      return value === 1 ? "FIGHT" : `${value}`;
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
    const sub = snapshot.roundState === "paused" ? "Press Esc to resume" : "";
    const buttons =
      snapshot.roundState === "won"
        ? `<button data-command="next">NEXT</button><button data-command="retry">RETRY</button><button data-command="menu">MAIN MENU</button>`
        : snapshot.roundState === "lost"
        ? `<button data-command="retry">RETRY</button><button data-command="menu">MAIN MENU</button>`
        : "";
    return `
      <div class="result-overlay">
        <div class="result-card">
          <h1>${text}</h1>
          <div class="result-stats">
            <span><small>Combo</small><strong>${snapshot.metrics.combo}</strong></span>
            <span><small>Best</small><strong>${snapshot.metrics.bestCombo}</strong></span>
            <span><small>Accuracy</small><strong>${accuracy(snapshot)}%</strong></span>
            <span><small>Score</small><strong>${snapshot.level.score}</strong></span>
            <span><small>Level</small><strong>${snapshot.level.id}</strong></span>
            <span><small>Rank</small><strong>${snapshot.level.rank}</strong></span>
          </div>
          ${sub ? `<p>${sub}</p>` : ""}
          <div class="result-actions">${buttons}</div>
        </div>
      </div>
    `;
  }

  private bindResultButtons() {
    this.root.querySelectorAll<HTMLButtonElement>("[data-command]").forEach((button) => {
      button.addEventListener("click", () => {
        const command = button.dataset.command;
        if (command === "retry" || command === "next" || command === "menu") {
          this.onCommand(command);
        }
      });
    });
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
      return "Tangan Kanan";
    case "attack.punch.left":
      return "Tangan Kiri";
    case "attack.kick.right":
      return "Kaki Kanan";
    case "attack.kick.left":
      return "Kaki Kiri";
    default:
      return "Enemy Attack";
  }
}

function comboTier(combo: number) {
  if (combo >= 10) {
    return "mega";
  }
  if (combo >= 5) {
    return "power";
  }
  if (combo >= 3) {
    return "chain";
  }
  return "fresh";
}
