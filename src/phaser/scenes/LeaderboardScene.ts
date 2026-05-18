import Phaser from "phaser";
import { clearLeaderboard, formatTime, readLeaderboard } from "../../game/systems/LeaderboardStore";
import { playSlashTransition } from "../fx/SceneTransitions";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { ensureBgm } from "../audio/GameAudio";

export class LeaderboardScene extends Phaser.Scene {
  private transitioning = false;

  constructor() {
    super("LeaderboardScene");
  }

  create() {
    ensureBgm(this);
    this.transitioning = false;
    this.input.enabled = true;
    this.createBackground();
    this.add
      .text(GAME_WIDTH / 2, 74, "LEADERBOARD", {
        color: "#fff3b0",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "52px",
        fontStyle: "900"
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff4d8d", 18, true, true);

    const entries = readLeaderboard();
    if (entries.length === 0) {
      this.add
        .text(GAME_WIDTH / 2, 320, "No saved runs yet.", {
          color: "#e8fbff",
          fontFamily: "Trebuchet MS, Arial",
          fontSize: "24px",
          fontStyle: "800"
        })
        .setOrigin(0.5);
    } else {
      this.drawTable(entries);
    }

    this.footerButton(GAME_WIDTH / 2 - 210, 642, "BACK", () => this.backToMenu());
    this.footerButton(GAME_WIDTH / 2, 642, "START", () => this.startFight());
    this.footerButton(GAME_WIDTH / 2 + 210, 642, "CLEAR", () => this.clearAndRestart());
    this.input.keyboard?.on("keydown-B", this.backToMenu, this);
    this.input.keyboard?.on("keydown-ESC", this.backToMenu, this);
    this.input.keyboard?.on("keydown-S", this.startFight, this);
    this.input.keyboard?.on("keydown-ENTER", this.startFight, this);
    this.input.keyboard?.on("keydown-C", this.clearAndRestart, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  private backToMenu() {
    this.transitionTo("MenuScene", "MAIN MENU");
  }

  private startFight() {
    this.transitionTo("FightScene", "TYPE TO STRIKE");
  }

  private clearAndRestart() {
    if (this.transitioning) {
      return;
    }
    clearLeaderboard();
    this.scene.restart();
  }

  private transitionTo(sceneKey: "MenuScene" | "FightScene", label: string) {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    this.input.enabled = false;
    this.tweens.add({ targets: this.children.list, alpha: 0.3, duration: 160, ease: "Cubic.easeOut" });
    playSlashTransition(this, {
      label,
      accent: sceneKey === "FightScene" ? 0xfff3b0 : 0x7cf7ff,
      onCovered: () => this.scene.start(sceneKey)
    });
  }

  private drawTable(entries: ReturnType<typeof readLeaderboard>) {
    const headerY = 148;
    const rowHeight = 42;
    const tableCenterX = GAME_WIDTH / 2;
    const tableWidth = 950;
    const tableLeft = tableCenterX - tableWidth / 2;
    const columns = [
      { label: "#", x: tableLeft + 44 },
      { label: "PLAYER", x: tableLeft + 150 },
      { label: "LEVEL", x: tableLeft + 320 },
      { label: "TIME", x: tableLeft + 470 },
      { label: "SCORE", x: tableLeft + 630 },
      { label: "ACC", x: tableLeft + 780 }
    ];

    columns.forEach((column) => this.tableText(column.x, headerY, column.label, "#7cf7ff", 15));

    entries.forEach((entry, index) => {
      const y = headerY + 46 + index * rowHeight;
      const bg = this.add.graphics();
      bg.fillStyle(index % 2 === 0 ? 0x071423 : 0x100a1d, 0.62);
      bg.fillRoundedRect(tableLeft, y - 18, tableWidth, 34, 4);
      bg.lineStyle(1, index === 0 ? 0xffd166 : 0x7cf7ff, index === 0 ? 0.45 : 0.18);
      bg.strokeRoundedRect(tableLeft, y - 18, tableWidth, 34, 4);
      this.tableText(tableLeft + 44, y, `${index + 1}`, index === 0 ? "#ffd166" : "#e8fbff");
      this.tableText(tableLeft + 150, y, entry.player, "#e8fbff");
      this.tableText(tableLeft + 320, y, `${entry.levelCompleted}`, "#fff3b0");
      this.tableText(tableLeft + 470, y, formatTime(entry.timeMs), "#e8fbff");
      this.tableText(tableLeft + 630, y, `${entry.score}`, "#e8fbff");
      this.tableText(tableLeft + 780, y, `${entry.accuracy}%`, "#e8fbff");
    });
  }

  private tableText(x: number, y: number, value: string, color: string, size = 18) {
    return this.add
      .text(x, y, value, {
        color,
        fontFamily: "Trebuchet MS, Arial",
        fontSize: `${size}px`,
        fontStyle: "800"
      })
      .setOrigin(0.5);
  }

  private footerButton(x: number, y: number, label: string, onClick: () => void) {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    const text = this.add
      .text(0, -5, label, {
        color: "#e8fbff",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "20px",
        fontStyle: "900"
      })
      .setOrigin(0.5);
    const shortcut = this.add
      .text(0, 15, shortcutFor(label), {
        color: "rgba(124, 247, 255, 0.72)",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "10px",
        fontStyle: "900"
      })
      .setOrigin(0.5);

    drawFooterButton(bg, 112, 52, 0x7cf7ff, 0.5);
    container.add([bg, text, shortcut]);
    container.setSize(112, 52);
    container.setInteractive({ useHandCursor: true });
    container.on("pointerover", () => {
      bg.clear();
      drawFooterButton(bg, 124, 56, 0xffd166, 0.86);
      text.setColor("#fff3b0");
      shortcut.setColor("#fff3b0");
    });
    container.on("pointerout", () => {
      bg.clear();
      drawFooterButton(bg, 112, 52, 0x7cf7ff, 0.5);
      text.setColor("#e8fbff");
      shortcut.setColor("rgba(124, 247, 255, 0.72)");
    });
    container.on("pointerdown", onClick);
  }

  private createBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050914, 0x101425, 0x0a0612, 0x1b0719, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.lineStyle(1, 0x7cf7ff, 0.08);
    for (let y = 120; y < GAME_HEIGHT - 80; y += 42) {
      bg.lineBetween(88, y, GAME_WIDTH - 88, y);
    }
    bg.lineStyle(2, 0xff4d8d, 0.22);
    bg.strokeRoundedRect(88, 112, GAME_WIDTH - 176, 500, 8);
  }

  private shutdown() {
    this.input.keyboard?.off("keydown-B", this.backToMenu, this);
    this.input.keyboard?.off("keydown-ESC", this.backToMenu, this);
    this.input.keyboard?.off("keydown-S", this.startFight, this);
    this.input.keyboard?.off("keydown-ENTER", this.startFight, this);
    this.input.keyboard?.off("keydown-C", this.clearAndRestart, this);
  }
}

function drawFooterButton(graphics: Phaser.GameObjects.Graphics, width: number, height: number, color: number, alpha: number) {
  graphics.fillStyle(0x06101a, 0.86);
  graphics.lineStyle(2, color, alpha);
  graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 4);
  graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 4);
}

function shortcutFor(label: string) {
  switch (label) {
    case "BACK":
      return "B / ESC";
    case "START":
      return "S / ENTER";
    case "CLEAR":
      return "C";
    default:
      return "";
  }
}
