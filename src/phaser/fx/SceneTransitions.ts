import Phaser from "phaser";
import { playTransitionSfx } from "../audio/GameAudio";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

interface SlashTransitionOptions {
  label: string;
  accent?: number;
  onCovered: () => void;
}

export function playSlashTransition(scene: Phaser.Scene, options: SlashTransitionOptions) {
  playTransitionSfx(scene);

  const accent = options.accent ?? 0xfff3b0;
  const overlay = scene.add.graphics().setDepth(200);
  const leftSlash = scene.add.rectangle(-GAME_WIDTH * 0.42, GAME_HEIGHT / 2, GAME_WIDTH * 0.74, GAME_HEIGHT * 1.55, 0x7cf7ff, 0.88).setDepth(201);
  const rightSlash = scene.add.rectangle(GAME_WIDTH * 1.42, GAME_HEIGHT / 2, GAME_WIDTH * 0.74, GAME_HEIGHT * 1.55, 0xff4d8d, 0.82).setDepth(202);
  const label = scene.add
    .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, options.label, {
      color: "#fff3b0",
      fontFamily: "Trebuchet MS, Arial",
      fontSize: "48px",
      fontStyle: "900"
    })
    .setOrigin(0.5)
    .setAlpha(0)
    .setDepth(204)
    .setShadow(0, 0, "#ff4d8d", 18, true, true);
  const line = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 54, 0, 3, accent, 0.9).setDepth(203).setBlendMode(Phaser.BlendModes.ADD);

  leftSlash.setAngle(-12);
  rightSlash.setAngle(-12);
  overlay.fillStyle(0x030711, 0);
  overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  scene.cameras.main.shake(100, 0.003);
  scene.tweens.add({ targets: leftSlash, x: GAME_WIDTH / 2 - 170, duration: 260, ease: "Cubic.easeOut" });
  scene.tweens.add({ targets: rightSlash, x: GAME_WIDTH / 2 + 170, duration: 260, ease: "Cubic.easeOut" });
  scene.tweens.add({ targets: label, alpha: 1, scale: { from: 0.72, to: 1 }, duration: 240, ease: "Back.easeOut", delay: 120 });
  scene.tweens.add({ targets: line, width: 360, duration: 220, ease: "Cubic.easeOut", delay: 160 });

  scene.time.delayedCall(390, () => {
    overlay.clear();
    overlay.fillStyle(0xe8fbff, 0.82);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    scene.cameras.main.flash(170, 232, 251, 255);
    options.onCovered();
  });

  scene.time.delayedCall(520, () => {
    scene.tweens.add({ targets: [leftSlash, rightSlash, label, line], alpha: 0, duration: 130, ease: "Cubic.easeIn" });
    scene.tweens.add({ targets: overlay, alpha: 0, duration: 130, ease: "Cubic.easeIn" });
  });

  scene.time.delayedCall(700, () => {
    overlay.destroy();
    leftSlash.destroy();
    rightSlash.destroy();
    label.destroy();
    line.destroy();
  });
}
