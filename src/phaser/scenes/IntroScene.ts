import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

export class IntroScene extends Phaser.Scene {
  private skipped = false;

  constructor() {
    super("IntroScene");
  }

  create() {
    this.createBackdrop();
    this.createIntroMotion();

    this.input.keyboard?.once("keydown", () => this.goToMenu());
    this.input.once("pointerdown", () => this.goToMenu());
    this.time.delayedCall(2300, () => this.goToMenu());
  }

  private createBackdrop() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x020611, 0x0b1020, 0x061521, 0x210718, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    bg.lineStyle(1, 0x7cf7ff, 0.08);
    for (let x = 0; x <= GAME_WIDTH; x += 48) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 42) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    const scan = this.add.rectangle(GAME_WIDTH / 2, -80, GAME_WIDTH, 78, 0x7cf7ff, 0.1).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: scan,
      y: GAME_HEIGHT + 80,
      duration: 1500,
      ease: "Sine.easeInOut",
      repeat: 0
    });
  }

  private createIntroMotion() {
    const player = this.add
      .sprite(378, 506, "player.idle")
      .setOrigin(0.5, 0.76)
      .setDisplaySize(390, 228)
      .setTint(0x42d9ff)
      .setTintMode(Phaser.TintModes.FILL)
      .setAlpha(0);
    const enemy = this.add
      .sprite(902, 506, "player.idle")
      .setOrigin(0.5, 0.76)
      .setDisplaySize(390, 228)
      .setScale(-Math.abs(player.scaleX), player.scaleY)
      .setTint(0xff70c7)
      .setTintMode(Phaser.TintModes.FILL)
      .setAlpha(0);

    this.time.addEvent({
      delay: 110,
      loop: true,
      callback: () => {
        const frame = Math.floor(this.time.now / 110) % 29;
        player.setFrame(frame);
        enemy.setFrame(frame);
      }
    });

    const title = this.add
      .text(GAME_WIDTH / 2, 250, "FIGHT TYPING", {
        color: "#fff3b0",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "68px",
        fontStyle: "900"
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 0, "#ff4d8d", 24, true, true);

    const sub = this.add
      .text(GAME_WIDTH / 2, 316, "SYNC INPUT  //  ARM STRIKE SYSTEM", {
        color: "#7cf7ff",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "18px",
        fontStyle: "800"
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 0, "#7cf7ff", 10, true, true);

    const leftSlash = this.add.rectangle(-280, GAME_HEIGHT / 2, 540, GAME_HEIGHT * 1.45, 0x7cf7ff, 0.72).setAngle(-14).setAlpha(0);
    const rightSlash = this.add.rectangle(GAME_WIDTH + 280, GAME_HEIGHT / 2, 540, GAME_HEIGHT * 1.45, 0xff4d8d, 0.68).setAngle(-14).setAlpha(0);
    const centerLine = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 2, 0, 0xfff3b0, 0.9).setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({ targets: [player, enemy], alpha: 0.88, duration: 520, ease: "Cubic.easeOut", delay: 160 });
    this.tweens.add({ targets: player, x: 420, duration: 760, ease: "Cubic.easeOut", delay: 180 });
    this.tweens.add({ targets: enemy, x: 860, duration: 760, ease: "Cubic.easeOut", delay: 180 });
    this.tweens.add({ targets: title, alpha: 1, scale: { from: 0.86, to: 1 }, duration: 520, ease: "Back.easeOut", delay: 460 });
    this.tweens.add({ targets: sub, alpha: 1, y: 326, duration: 360, ease: "Cubic.easeOut", delay: 700 });
    this.tweens.add({ targets: centerLine, height: 420, duration: 180, ease: "Cubic.easeOut", delay: 980 });
    this.tweens.add({ targets: centerLine, alpha: 0, duration: 260, ease: "Cubic.easeIn", delay: 1180 });
    this.tweens.add({ targets: leftSlash, x: GAME_WIDTH / 2 - 154, alpha: 0.72, duration: 320, ease: "Cubic.easeOut", delay: 1380 });
    this.tweens.add({ targets: rightSlash, x: GAME_WIDTH / 2 + 154, alpha: 0.68, duration: 320, ease: "Cubic.easeOut", delay: 1380 });

    this.cameras.main.fadeIn(220, 3, 7, 18);
    this.time.delayedCall(1680, () => {
      this.cameras.main.flash(180, 232, 251, 255);
      this.cameras.main.shake(120, 0.003);
    });
  }

  private goToMenu() {
    if (this.skipped) {
      return;
    }

    this.skipped = true;
    this.cameras.main.fadeOut(180, 3, 7, 18);
    this.time.delayedCall(180, () => this.scene.start("MenuScene"));
  }
}
