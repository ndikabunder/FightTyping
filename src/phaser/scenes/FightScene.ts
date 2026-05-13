import Phaser from "phaser";
import { FightSimulation } from "../../game/simulation/FightSimulation";
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from "../config";
import { DebugRenderer } from "../view/DebugRenderer";
import { FighterRenderer } from "../view/FighterRenderer";
import { HudController } from "../../ui/hud/HudController";
import { playSlashTransition } from "../fx/SceneTransitions";
import { saveLeaderboardEntry } from "../../game/systems/LeaderboardStore";
import type { GameSnapshot, HitEvent } from "../../game/types";

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
  private runStartedAtMs = 0;
  private bestCompletedLevel = 0;
  private lastSavedRoundState: GameSnapshot["roundState"] | null = null;
  private transitioning = false;

  constructor() {
    super("FightScene");
  }

  create() {
    this.transitioning = false;
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

    this.input.keyboard?.on("keydown", this.onKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.renderAll(snapshot);
  }

  update(_time: number, delta: number) {
    const hit = this.simulation.update(delta, this.time.now);
    const snapshot = this.simulation.getSnapshot();

    if (hit) {
      this.playHitFx(hit);
    }

    this.saveResultIfNeeded(snapshot);
    this.playDashFxForNewActions(snapshot);
    this.renderAll(snapshot);
    this.playFeedbackSfx(snapshot);
  }

  private onKeyDown(event: KeyboardEvent) {
    this.simulation.handleKey(event.key, this.time.now);
    const snapshot = this.simulation.getSnapshot();
    if (snapshot.roundState === "countdown") {
      this.lastSavedRoundState = null;
    }
    this.playDashFxForNewActions(snapshot);
    this.renderAll(snapshot);
    this.playFeedbackSfx(snapshot);
  }

  private handleHudCommand(command: "retry" | "next" | "menu") {
    if (this.transitioning) {
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

  private transitionLevel(command: "retry" | "next") {
    this.transitioning = true;
    this.input.enabled = false;
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

    this.playerRenderer.sync(snapshot.player);
    this.enemyRenderer.sync(snapshot.enemy);
    this.debugRenderer.render(snapshot);

    const hudHash = JSON.stringify({
      prompts: snapshot.prompts,
      metrics: snapshot.metrics,
      combo: snapshot.combo,
      skill: snapshot.skill,
      enemySkill: snapshot.enemySkill,
      hp: [snapshot.player.hp, snapshot.enemy.hp],
      state: snapshot.roundState,
      countdown: Math.ceil(snapshot.countdownMs / 200),
      enemyTelegraph: Math.ceil(snapshot.enemyTelegraphMs / 200),
      enemyCooldown: Math.floor(snapshot.enemyAttackClockMs / 50),
      incoming: snapshot.enemyIncomingAttackId,
      debug: snapshot.debugEnabled,
      level: snapshot.level,
      feedback: snapshot.feedback,
      playerState: snapshot.player.state,
      enemyState: snapshot.enemy.state,
      lastHit: snapshot.lastHit?.atMs
    });

    if (hudHash !== this.lastHudHash) {
      this.hud.render(snapshot);
      this.lastHudHash = hudHash;
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
      this.playDashBurst(snapshot.player.position.x, snapshot.player.position.y, 0x7cf7ff, snapshot.player.facing);
    }
    if (snapshot.enemy.visualActionSerial !== this.lastEnemyVisualSerial) {
      this.lastEnemyVisualSerial = snapshot.enemy.visualActionSerial;
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
    this.cameras.main.shake(isKick ? 135 : 90, isKick ? 0.009 : 0.006);
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
    this.time.delayedCall(isKick ? 130 : 90, () => this.fx.clear());
  }

  private playFeedbackSfx(snapshot: GameSnapshot) {
    if (!snapshot.feedback || snapshot.feedback.atMs === this.lastFeedbackAt) {
      return;
    }

    this.lastFeedbackAt = snapshot.feedback.atMs;

    switch (snapshot.feedback.kind) {
      case "wrong":
        this.beep(140, 0.045, 0.04);
        break;
      case "complete":
        this.beep(540, 0.055, 0.035);
        break;
      case "dodge":
        this.beep(760, 0.07, 0.04);
        break;
      case "skill":
        this.beep(880, 0.1, 0.05);
        break;
      case "hit":
      case "ko":
        this.beep(snapshot.feedback.kind === "ko" ? 92 : 190, 0.09, 0.06);
        break;
      default:
        this.beep(360, 0.025, 0.018);
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

  private beep(frequency: number, durationSeconds: number, gainValue: number) {
    const win = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
    const AudioContextCtor = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "triangle";
    gain.gain.setValueAtTime(gainValue, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + durationSeconds);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + durationSeconds);
    oscillator.addEventListener("ended", () => context.close());
  }

  private shutdown() {
    this.input.keyboard?.off("keydown", this.onKeyDown, this);
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
