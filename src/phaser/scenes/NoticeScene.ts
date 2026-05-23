import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

export class NoticeScene extends Phaser.Scene {
  constructor() {
    super("NoticeScene");
  }

  create() {
    const bg = this.add.graphics();
    bg.fillStyle(0x06101a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, 320, "Physical Keyboard Required", {
        color: "#fff3b0",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "42px",
        fontStyle: "900",
        align: "center"
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#ff4d8d", 22, true, true);

    this.add
      .text(GAME_WIDTH / 2, 390, "Press any key to continue", {
        color: "rgba(232, 251, 255, 0.6)",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "16px"
      })
      .setOrigin(0.5);

    this.input.keyboard?.once("keydown", () => this.proceed());
    this.input.once("pointerdown", () => this.proceed());
    this.time.delayedCall(4000, () => this.proceed());
  }

  private proceeded = false;
  private proceed() {
    if (this.proceeded) return;
    this.proceeded = true;
    this.cameras.main.fadeOut(200, 6, 16, 26);
    this.time.delayedCall(200, () => this.scene.start("IntroScene"));
  }
}
