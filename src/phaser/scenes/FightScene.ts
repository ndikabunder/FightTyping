import Phaser from "phaser";
import { FightSimulation } from "../../game/simulation/FightSimulation";
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from "../config";
import { DebugRenderer } from "../view/DebugRenderer";
import { DEATH_ANIMATION_MS } from "../view/FighterFrameResolver";
import { FighterRenderer } from "../view/FighterRenderer";
import { HudController } from "../../ui/hud/HudController";
import { playSlashTransition } from "../fx/SceneTransitions";
import { saveLeaderboardEntry } from "../../game/systems/LeaderboardStore";
import { ensureBgm, playSfx, sfxForAttack } from "../audio/GameAudio";
import type { GameSnapshot, HitEvent } from "../../game/types";
import { gameplayStart, gameplayStop, showMidgameAd } from "../../game/systems/CrazySDK";
import { trackEvent } from "../../analytics";
import { gaProgressionStart, gaProgressionComplete, gaProgressionFail } from "../../gameAnalytics";

export class FightScene extends Phaser.Scene {
  private simulation!: FightSimulation;
  private playerRenderer!: FighterRenderer;
  private enemyRenderer!: FighterRenderer;
  private debugRenderer!: DebugRenderer;
  private hud!: HudController;
  private fx!: Phaser.GameObjects.Graphics;
  private arena!: Phaser.GameObjects.Graphics;
  private lastHudHash = "";
  private lastFeedbackAt = -1;
  private lastArenaTheme = "";
  private lastPlayerVisualSerial = 0;
  private lastEnemyVisualSerial = 0;
  private lastEnemyDodgeAt = -1;
  private runStartedAtMs = 0;
  private bestCompletedLevel = 0;
  private lastSavedRoundState: GameSnapshot["roundState"] | null = null;
  private transitioning = false;
  private combatTimeScale = 1;
  private finalBlowActive = false;
  private pendingResultReveal = false;
  private finalBlowRevealAtMs = 0;
  private finalBlowFx: Phaser.GameObjects.GameObject[] = [];

  private readonly onWindowKeyDown = (e: KeyboardEvent) => this.onKeyDown(e);

  constructor() {
    super("FightScene");
  }

  create() {
    ensureBgm(this);
    this.transitioning = false;
    this.lastEnemyDodgeAt = -1;
    this.input.enabled = true;
    this.simulation = new FightSimulation();
    this.arena = this.add.graphics().setDepth(-10);

    const snapshot = this.simulation.getSnapshot();
    this.runStartedAtMs = this.time.now;
    this.createArena(snapshot.level.arenaTheme);
    this.playerRenderer = new FighterRenderer(this, snapshot.player, 0x9d4edd, "PLAYER");
    this.enemyRenderer = new FighterRenderer(this, snapshot.enemy, 0xef476f, "ENEMY");
    this.debugRenderer = new DebugRenderer(this);
    this.hud = new HudController("hud-root", (command) => this.handleHudCommand(command));
    this.fx = this.add.graphics().setDepth(40);

    // Use window-level listener to ensure keyboard works in iframe contexts
    window.addEventListener("keydown", this.onWindowKeyDown);
    // Allow tap/click to start from briefing (tablet with keyboard support)
    this.input.on("pointerdown", this.onPointerDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.renderAll(snapshot);
    gameplayStart();
    gaProgressionStart(snapshot.level.id);
  }

  update(_time: number, delta: number) {
    const hit = this.simulation.update(delta * this.combatTimeScale, this.time.now);
    const snapshot = this.simulation.getSnapshot();

    if (hit) {
      this.playFinalBlowFx(hit, snapshot);
      this.playHitFx(hit);
    }

    if (!this.finalBlowActive) {
      this.saveResultIfNeeded(snapshot);
    }
    this.playDashFxForNewActions(snapshot);
    this.revealResultIfFinalBlowExpired(snapshot);
    this.renderAll(snapshot);
    this.playEnemyEvadeFx(snapshot);
    this.playFeedbackSfx(snapshot);
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.repeat || event.isComposing) {
      return;
    }

    if (event.key.toLowerCase() === "escape") {
      return;
    }

    // Allow Space to start from briefing
    if (event.key === " " && this.simulation.getSnapshot().roundState === "briefing") {
      this.simulation.handleKey(" ", this.time.now);
      this.renderAll(this.simulation.getSnapshot());
      return;
    }

    if (this.simulation.getSnapshot().roundState === "fighting" && /^[a-zA-Z]$/.test(event.key)) {
      playSfx(this, "typing", 0.34, Phaser.Math.FloatBetween(0.94, 1.08));
    }

    this.simulation.handleKey(event.key, this.time.now);
    const snapshot = this.simulation.getSnapshot();
    if (snapshot.roundState === "countdown") {
      this.lastSavedRoundState = null;
    }
    this.playDashFxForNewActions(snapshot);
    this.renderAll(snapshot);
    this.playEnemyEvadeFx(snapshot);
    this.playFeedbackSfx(snapshot);
  }

  private onPointerDown() {
    if (this.simulation.getSnapshot().roundState === "briefing") {
      this.simulation.handleKey(" ", this.time.now);
      this.renderAll(this.simulation.getSnapshot());
    }
  }

  private handleHudCommand(command: "retry" | "next" | "menu" | "resume") {
    if (this.transitioning) {
      return;
    }

    if (command === "resume") {
      const roundState = this.simulation.getSnapshot().roundState;
      if (roundState === "paused" || roundState === "fighting") {
        this.simulation.togglePause();
        this.lastHudHash = "";
        this.renderAll(this.simulation.getSnapshot());
      }
      return;
    }

    if (command === "menu") {
      this.transitioning = true;
      this.input.enabled = false;
      playSlashTransition(this, {
        label: "MAIN MENU",
        accent: 0x7cf7ff,
        onCovered: () => this.scene.start("MenuScene")
      });
      return;
    }

    this.transitionLevel(command);
  }

  private async transitionLevel(command: "retry" | "next") {
    this.transitioning = true;
    this.input.enabled = false;

    await showMidgameAd();

    const label = command === "next" ? "NEXT LEVEL" : "RETRY";

    playSlashTransition(this, {
      label,
      accent: command === "next" ? 0xfff3b0 : 0x7cf7ff,
      onCovered: () => {
        if (command === "next") {
          this.simulation.nextLevel();
        } else {
          this.simulation.restart();
        }

        this.runStartedAtMs = this.time.now;
        this.lastSavedRoundState = null;
        this.lastHudHash = "";
        this.lastPlayerVisualSerial = 0;
        this.lastEnemyVisualSerial = 0;
        this.lastEnemyDodgeAt = -1;
        this.resetFinalBlowFx();
        gaProgressionStart(this.simulation.getSnapshot().level.id);
        this.input.enabled = true;
        this.transitioning = false;
        this.renderAll(this.simulation.getSnapshot());
      }
    });
  }

  private renderAll(snapshot: GameSnapshot) {
    if (snapshot.level.arenaTheme !== this.lastArenaTheme) {
      this.createArena(snapshot.level.arenaTheme);
    }

    const skillFeedbackAt = snapshot.feedback?.kind === "skill" && snapshot.feedback.label !== "Enemy Skill" ? snapshot.feedback.atMs : -1;
    this.playerRenderer.sync(snapshot.player, snapshot.roundState, skillFeedbackAt, this.pendingResultReveal);
    this.enemyRenderer.sync(snapshot.enemy, snapshot.roundState, -1, this.pendingResultReveal);
    this.debugRenderer.render(snapshot);

    const hudHash = createHudHash(snapshot);

    if (hudHash !== this.lastHudHash) {
      this.hud.render(snapshot, { suppressResult: this.pendingResultReveal });
      this.lastHudHash = hudHash;
    } else {
      this.hud.updateDynamic(snapshot);
    }
  }

  private createArena(theme: string) {
    this.lastArenaTheme = theme;
    const colors = arenaColors(theme);
    const bg = this.arena;
    bg.clear();
    bg.fillGradientStyle(colors.topLeft, colors.topRight, colors.bottomLeft, colors.bottomRight, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    bg.lineStyle(1, 0x2ec4b6, 0.08);
    for (let x = 56; x < GAME_WIDTH; x += 42) {
      bg.lineBetween(x, 0, x, GROUND_Y + 18);
    }
    for (let y = 84; y < GROUND_Y; y += 44) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    for (let i = 0; i < 90; i += 1) {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(88, GROUND_Y - 70);
      const color = i % 2 === 0 ? colors.primary : colors.secondary;
      bg.lineStyle(2, color, Phaser.Math.FloatBetween(0.08, 0.24));
      bg.lineBetween(x, y, x + Phaser.Math.Between(8, 34), y);
    }

    bg.fillStyle(0x05070c, 0.88);
    bg.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    bg.lineStyle(5, colors.primary, 0.28);
    bg.lineBetween(0, GROUND_Y, GAME_WIDTH, GROUND_Y);
    bg.lineStyle(2, colors.secondary, 0.2);
    bg.lineBetween(0, GROUND_Y + 5, GAME_WIDTH, GROUND_Y + 5);

    bg.fillGradientStyle(colors.primary, colors.secondary, colors.primary, colors.secondary, 0.12, 0.12, 0, 0);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    bg.lineStyle(1, colors.primary, 0.14);
    bg.strokeRect(64, 44, GAME_WIDTH - 128, GAME_HEIGHT - 88);
  }

  private playDashFxForNewActions(snapshot: GameSnapshot) {
    if (snapshot.player.visualActionSerial !== this.lastPlayerVisualSerial) {
      this.lastPlayerVisualSerial = snapshot.player.visualActionSerial;
      if (snapshot.player.visualActionId) {
        playSfx(this, sfxForAttack(snapshot.player.visualActionId), 0.74, snapshot.player.visualActionId.includes("kick") ? 0.92 : 1.04);
      }
      this.playDashBurst(snapshot.player.position.x, snapshot.player.position.y, 0x7cf7ff, snapshot.player.facing);
    }
    if (snapshot.enemy.visualActionSerial !== this.lastEnemyVisualSerial) {
      this.lastEnemyVisualSerial = snapshot.enemy.visualActionSerial;
      if (snapshot.enemy.visualActionId) {
        playSfx(this, sfxForAttack(snapshot.enemy.visualActionId), 0.74, snapshot.enemy.visualActionId.includes("kick") ? 0.9 : 0.98);
      }
      this.playDashBurst(snapshot.enemy.position.x, snapshot.enemy.position.y, 0xff4d8d, snapshot.enemy.facing);
    }
  }

  private playDashBurst(x: number, y: number, color: number, facing: number) {
    const burst = this.add.graphics().setDepth(38);
    burst.lineStyle(4, color, 0.75);
    for (let i = 0; i < 5; i += 1) {
      const offsetY = -28 - i * 22;
      burst.lineBetween(x - facing * (18 + i * 8), y + offsetY, x - facing * (92 + i * 14), y + offsetY + Phaser.Math.Between(-10, 10));
    }
    burst.fillStyle(color, 0.3);
    burst.fillEllipse(x - facing * 46, y - 8, 110, 18);
    this.tweens.add({
      targets: burst,
      alpha: 0,
      x: -facing * 20,
      duration: 220,
      ease: "Cubic.easeOut",
      onComplete: () => burst.destroy()
    });
  }

  private playHitFx(hit: HitEvent) {
    const isKick = hit.attackId.includes("kick");
    const isEnemyHit = hit.defenderId === "player";
    this.cameras.main.shake(isKick ? 170 : 115, isKick ? 0.012 : 0.008);
    this.fx.clear();
    this.fx.fillStyle(isEnemyHit ? 0x7cf7ff : 0xfff3b0, 0.96);
    this.fx.fillCircle(hit.impact.x, hit.impact.y, isKick ? 24 : 18);
    this.fx.lineStyle(isKick ? 5 : 4, isEnemyHit ? 0x7cf7ff : 0xff5c8a, 0.88);

    const rays = isKick ? 12 : 8;
    for (let i = 0; i < rays; i += 1) {
      const angle = (Math.PI * 2 * i) / rays;
      this.fx.lineBetween(
        hit.impact.x,
        hit.impact.y,
        hit.impact.x + Math.cos(angle) * (isKick ? 66 : 48),
        hit.impact.y + Math.sin(angle) * (isKick ? 42 : 48)
      );
    }

    this.fx.lineStyle(2, 0xe8fbff, 0.52);
    this.fx.strokeCircle(hit.impact.x, hit.impact.y, isKick ? 46 : 34);
    this.fx.lineStyle(isKick ? 3 : 2, 0xffffff, 0.82);
    this.fx.lineBetween(hit.impact.x - (isKick ? 78 : 54), hit.impact.y - 6, hit.impact.x + (isKick ? 78 : 54), hit.impact.y + 6);
    this.fx.lineBetween(hit.impact.x - 8, hit.impact.y - (isKick ? 54 : 38), hit.impact.x + 8, hit.impact.y + (isKick ? 54 : 38));
    this.time.delayedCall(isKick ? 130 : 90, () => this.fx.clear());
  }

  private playFinalBlowFx(hit: HitEvent, snapshot: GameSnapshot) {
    const defender = hit.defenderId === "player" ? snapshot.player : snapshot.enemy;
    if (defender.hp > 0 || this.finalBlowActive) {
      return;
    }

    this.finalBlowActive = true;
    this.pendingResultReveal = true;
    this.finalBlowRevealAtMs = this.time.now + DEATH_ANIMATION_MS;
    this.hud.setHidden(true);
    this.combatTimeScale = 0.08;
    const attacker = hit.attackerId === "player" ? snapshot.player : snapshot.enemy;
    this.spawnFinalBlowOverlay(hit, attacker.position.x, attacker.position.y);
    this.cameras.main.flash(110, 255, 243, 176, false);
    this.cameras.main.shake(120, 0.004);
    this.cameras.main.pan(attacker.position.x + attacker.facing * 36, attacker.position.y - 150, 120, "Cubic.easeOut");
    this.cameras.main.zoomTo(1.46, 120, "Back.easeOut");

    this.time.delayedCall(120, () => {
      this.combatTimeScale = 0.28;
      this.cameras.main.shake(720, 0.009);
      this.cameras.main.pan(attacker.position.x + attacker.facing * 92, attacker.position.y - 132, 720, "Sine.easeInOut");
      this.cameras.main.zoomTo(1.58, 720, "Cubic.easeInOut");
    });
    this.time.delayedCall(820, () => {
      this.combatTimeScale = 0.42;
      this.cameras.main.flash(180, 255, 255, 255, false);
      this.cameras.main.shake(180, 0.02);
    });
    this.time.delayedCall(DEATH_ANIMATION_MS, () => this.revealResultNow());
  }

  private revealResultIfFinalBlowExpired(snapshot: GameSnapshot) {
    if (!this.finalBlowActive || !this.pendingResultReveal || (snapshot.roundState !== "won" && snapshot.roundState !== "lost")) {
      return;
    }
    if (this.time.now >= this.finalBlowRevealAtMs) {
      this.revealResultNow();
    }
  }

  private revealResultNow() {
    if (!this.pendingResultReveal && !this.finalBlowActive) {
      return;
    }
    this.resetFinalBlowFx();
  }

  private spawnFinalBlowOverlay(hit: HitEvent, attackerX: number, attackerY: number) {
    this.clearFinalBlowOverlay();
    const color = hit.attackerId === "player" ? 0x7cf7ff : 0xff4d8d;
    const overlay = this.add.graphics().setDepth(80).setScrollFactor(0);
    overlay.fillStyle(0x02040a, 0.42);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.fillStyle(color, 0.2);
    overlay.fillEllipse(attackerX, attackerY - 145, 360, 520);

    this.finalBlowFx = [overlay];
    this.tweens.add({ targets: overlay, alpha: 0.18, duration: 740, delay: 160, ease: "Cubic.easeIn" });
  }

  private resetFinalBlowFx() {
    this.combatTimeScale = 1;
    this.finalBlowActive = false;
    this.finalBlowRevealAtMs = 0;
    this.hud?.setHidden(false);
    this.clearFinalBlowOverlay();
    this.cameras.main.pan(GAME_WIDTH / 2, GAME_HEIGHT / 2, 180, "Cubic.easeOut");
    this.cameras.main.zoomTo(1, 180, "Cubic.easeOut");
    if (this.pendingResultReveal) {
      this.pendingResultReveal = false;
      this.lastHudHash = "";
      const snapshot = this.simulation.getSnapshot();
      this.saveResultIfNeeded(snapshot);
      this.renderAll(snapshot);
    }
  }

  private clearFinalBlowOverlay() {
    this.finalBlowFx.forEach((item) => item.destroy());
    this.finalBlowFx = [];
  }

  private playEnemyEvadeFx(snapshot: GameSnapshot) {
    if (snapshot.feedback?.label !== "Enemy Evade" || snapshot.feedback.atMs === this.lastEnemyDodgeAt) {
      return;
    }

    this.lastEnemyDodgeAt = snapshot.feedback.atMs;
    const evade = this.add.graphics().setDepth(39);
    const x = snapshot.enemy.position.x;
    const y = snapshot.enemy.position.y;
    evade.lineStyle(4, 0xfff3b0, 0.8);
    for (let i = 0; i < 7; i += 1) {
      const offsetY = -176 + i * 28;
      evade.lineBetween(x - 14 - i * 6, y + offsetY, x - 112 - i * 10, y + offsetY + Phaser.Math.Between(-12, 12));
    }
    evade.fillStyle(0xff4d8d, 0.22);
    evade.fillEllipse(x - 42, y - 110, 168, 210);
    this.tweens.add({
      targets: evade,
      alpha: 0,
      x: 34,
      duration: 260,
      ease: "Cubic.easeOut",
      onComplete: () => evade.destroy()
    });
  }

  private playFeedbackSfx(snapshot: GameSnapshot) {
    if (!snapshot.feedback || snapshot.feedback.atMs === this.lastFeedbackAt) {
      return;
    }

    this.lastFeedbackAt = snapshot.feedback.atMs;

    switch (snapshot.feedback.kind) {
      case "wrong":
        playSfx(this, "wrong", 0.72);
        break;
      case "complete":
        break;
      case "dodge":
        break;
      case "skill":
        playSfx(this, "skill", 0.82);
        break;
      case "hit":
      case "ko":
        break;
      default:
    }
  }

  private saveResultIfNeeded(snapshot: GameSnapshot) {
    if (snapshot.roundState !== "won" && snapshot.roundState !== "lost") {
      return;
    }
    if (snapshot.roundState === this.lastSavedRoundState) {
      return;
    }

    this.lastSavedRoundState = snapshot.roundState;
    playSfx(this, snapshot.roundState === "won" ? "victory" : "defeat", 0.86);

    trackEvent("round_end", {
      level: snapshot.level.id,
      result: snapshot.roundState,
      accuracy: accuracy(snapshot),
      time_ms: Math.max(0, this.time.now - this.runStartedAtMs),
      player_hp: snapshot.player.hp,
      enemy_hp: snapshot.enemy.hp,
      combo_best: snapshot.combo.best
    });

    if (snapshot.roundState === "won") {
      gaProgressionComplete(snapshot.level.id, snapshot.level.score);
    } else {
      gaProgressionFail(snapshot.level.id, snapshot.level.score);
    }

    if (snapshot.roundState === "won") {
      this.bestCompletedLevel = Math.max(this.bestCompletedLevel, snapshot.level.id);
    }

    saveLeaderboardEntry({
      player: "PLAYER",
      levelCompleted: this.bestCompletedLevel,
      timeMs: Math.max(0, this.time.now - this.runStartedAtMs),
      score: snapshot.level.score,
      accuracy: accuracy(snapshot)
    });
  }

  private shutdown() {
    gameplayStop();
    this.clearFinalBlowOverlay();
    window.removeEventListener("keydown", this.onWindowKeyDown);
    this.input.off("pointerdown", this.onPointerDown, this);
    this.playerRenderer?.destroy();
    this.enemyRenderer?.destroy();
    this.debugRenderer?.destroy();
    this.hud?.destroy();
    this.fx?.destroy();
    this.arena?.destroy();
  }
}

function accuracy(snapshot: GameSnapshot) {
  const total = snapshot.metrics.correctChars + snapshot.metrics.wrongChars;
  if (total === 0) {
    return 100;
  }
  return Math.round((snapshot.metrics.correctChars / total) * 100);
}

function createHudHash(snapshot: GameSnapshot) {
  // Only include values that require DOM structure changes (new/removed elements).
  // Fast-changing numeric values (cooldown bars, HP) are handled by updateDynamic().
  const p = snapshot.prompts;
  return `${snapshot.roundState}|${snapshot.level.id}|${snapshot.player.hp}|${snapshot.enemy.hp}|${p.length}|${p.map((pr) => pr.id + pr.typed.length + pr.status).join(",")}|${snapshot.dodgePrompt?.typed.length ?? ""}|${snapshot.dodgePrompt?.status ?? ""}|${snapshot.combo.count}|${snapshot.combo.serial}|${snapshot.skill.status}|${snapshot.skill.unlocked}|${snapshot.skill.usedSerial}|${snapshot.enemySkill.available}|${snapshot.enemySkill.active}|${snapshot.enemySkill.usedSerial}|${snapshot.enemyIncomingAttackId ?? ""}|${snapshot.feedback?.atMs ?? 0}|${snapshot.level.objectiveProgress.current}|${snapshot.level.objectiveProgress.completed}|${snapshot.level.score}|${snapshot.lastHit?.atMs ?? 0}`;
}

function arenaColors(theme: string) {
  switch (theme) {
    case "violetRing":
      return { topLeft: 0x09061c, topRight: 0x14112f, bottomLeft: 0x130923, bottomRight: 0x251034, primary: 0xd88cff, secondary: 0x7cf7ff };
    case "redPressure":
      return { topLeft: 0x110711, topRight: 0x210817, bottomLeft: 0x15050c, bottomRight: 0x310b1b, primary: 0xff4d8d, secondary: 0xffd166 };
    case "goldFinale":
      return { topLeft: 0x130d05, topRight: 0x221505, bottomLeft: 0x080b14, bottomRight: 0x24160a, primary: 0xffd166, secondary: 0x7cf7ff };
    default:
      return { topLeft: 0x06101a, topRight: 0x071121, bottomLeft: 0x0c0718, bottomRight: 0x14051c, primary: 0x2ec4b6, secondary: 0xff4d8d };
  }
}
