import Phaser from "phaser";
import { playSlashTransition } from "../fx/SceneTransitions";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { ensureBgm } from "../audio/GameAudio";

export class MenuScene extends Phaser.Scene {
  private transitioning = false;

  constructor() {
    super("MenuScene");
  }

  create() {
    ensureBgm(this);
    this.transitioning = false;
    this.input.enabled = true;
    this.createBackground();
    this.createIdleFighters();

    this.add
      .text(GAME_WIDTH / 2, 144, "FIGHT TYPING", {
        color: "#fff3b0",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "76px",
        fontStyle: "900"
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff4d8d", 22, true, true);

    this.add
      .text(GAME_WIDTH / 2, 212, "TYPE FAST. STRIKE CLEAN.", {
        color: "#7cf7ff",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "19px",
        fontStyle: "800"
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#7cf7ff", 10, true, true);

    this.menuButton(GAME_WIDTH / 2, 330, "START", () => this.startGameTransition());
    this.menuButton(GAME_WIDTH / 2, 414, "LEADERBOARD", () => this.startLeaderboardTransition());
    this.input.keyboard?.on("keydown-S", this.startGameTransition, this);
    this.input.keyboard?.on("keydown-ENTER", this.startGameTransition, this);
    this.input.keyboard?.on("keydown-L", this.startLeaderboardTransition, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.add
      .text(GAME_WIDTH / 2, 598, "Keyboard duel prototype - Phaser 4", {
        color: "rgba(232, 251, 255, 0.58)",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "14px"
      })
      .setOrigin(0.5);
  }

  private menuButton(x: number, y: number, label: string, onClick: () => void) {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    const text = this.add
      .text(0, -3, label, {
        color: "#e8fbff",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "30px",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    const shortcut = this.add
      .text(0, 20, shortcutFor(label), {
        color: "rgba(124, 247, 255, 0.74)",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "11px",
        fontStyle: "900"
      })
      .setOrigin(0.5);

    drawButton(bg, 300, 58, 0x7cf7ff, 0.72);
    const hitZone = this.add.zone(0, 0, 300, 58).setInteractive({ useHandCursor: true });
    container.add([bg, text, shortcut, hitZone]);
    hitZone.on("pointerover", () => {
      if (this.transitioning) {
        return;
      }
      bg.clear();
      drawButton(bg, 316, 62, 0xffd166, 0.9);
      text.setColor("#fff3b0");
      shortcut.setColor("#fff3b0");
    });
    hitZone.on("pointerout", () => {
      if (this.transitioning) {
        return;
      }
      bg.clear();
      drawButton(bg, 300, 58, 0x7cf7ff, 0.72);
      text.setColor("#e8fbff");
      shortcut.setColor("rgba(124, 247, 255, 0.74)");
    });
    hitZone.on("pointerdown", () => {
      if (!this.transitioning) {
        onClick();
      }
    });
    return container;
  }

  private startGameTransition() {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    this.input.enabled = false;

    this.tweens.add({ targets: this.children.list, alpha: 0.26, duration: 180, ease: "Cubic.easeOut" });
    playSlashTransition(this, {
      label: "TYPE TO STRIKE",
      onCovered: () => this.scene.start("FightScene")
    });
  }

  private startLeaderboardTransition() {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    this.input.enabled = false;
    this.tweens.add({ targets: this.children.list, alpha: 0.34, duration: 180, ease: "Cubic.easeOut" });
    playSlashTransition(this, {
      label: "LEADERBOARD",
      accent: 0x7cf7ff,
      onCovered: () => this.scene.start("LeaderboardScene")
    });
  }

  private createBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x06101a, 0x12091f, 0x060913, 0x210718, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.lineStyle(1, 0x7cf7ff, 0.08);
    for (let x = 64; x < GAME_WIDTH; x += 44) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 60; y < GAME_HEIGHT; y += 42) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
    bg.fillStyle(0x7cf7ff, 0.08);
    bg.fillEllipse(330, 520, 240, 34);
    bg.fillStyle(0xff4d8d, 0.08);
    bg.fillEllipse(950, 520, 240, 34);
  }

  private createIdleFighters() {
    const player = this.add
      .sprite(330, 490, "player.idle")
      .setOrigin(0.5, 0.76)
      .setDisplaySize(420, 245)
      .setTint(0x42d9ff)
      .setTintMode(Phaser.TintModes.FILL)
      .setAlpha(0.9);
    const enemy = this.add
      .sprite(950, 490, "player.idle")
      .setOrigin(0.5, 0.76)
      .setDisplaySize(420, 245)
      .setScale(-Math.abs(player.scaleX), player.scaleY)
      .setTint(0xff70c7)
      .setTintMode(Phaser.TintModes.FILL)
      .setAlpha(0.86);

    this.tweens.add({
      targets: [player, enemy],
      y: "-=8",
      duration: 1200,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });

    this.time.addEvent({
      delay: 125,
      loop: true,
      callback: () => {
        const frame = Math.floor(this.time.now / 125) % 29;
        player.setFrame(frame);
        enemy.setFrame(frame);
      }
    });
  }

  private shutdown() {
    this.input.keyboard?.off("keydown-S", this.startGameTransition, this);
    this.input.keyboard?.off("keydown-ENTER", this.startGameTransition, this);
    this.input.keyboard?.off("keydown-L", this.startLeaderboardTransition, this);
  }
}

function shortcutFor(label: string) {
  return label === "START" ? "S / ENTER" : "L";
}

function drawButton(graphics: Phaser.GameObjects.Graphics, width: number, height: number, color: number, alpha: number) {
  graphics.fillStyle(0x06101a, 0.84);
  graphics.lineStyle(2, color, alpha);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
  graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
}
