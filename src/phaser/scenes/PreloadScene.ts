import Phaser from "phaser";

const PLAYER_SPRITESHEET_FRAME = {
  frameWidth: 768,
  frameHeight: 448
} as const;

const playerSpritesheets = {
  idle: "/assets/images/player/Idle.png",
  dash: "/assets/images/player/Dash.png",
  punchRight: "/assets/images/player/PukulTanganKanan.png",
  punchLeft: "/assets/images/player/PukulTanganKiri.png",
  kickRight: "/assets/images/player/TendangKakiKanan.png",
  kickLeft: "/assets/images/player/TendangKakiKiri.png"
} as const;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    Object.entries(playerSpritesheets).forEach(([key, url]) => {
      this.load.spritesheet(`player.${key}`, url, PLAYER_SPRITESHEET_FRAME);
    });
  }

  create() {
    const loading = this.add
      .text(640, 360, "Loading Fight Typing...", {
        color: "#f8f0d8",
        fontFamily: "Arial",
        fontSize: "28px"
      })
      .setOrigin(0.5);

    this.time.delayedCall(120, () => {
      loading.destroy();
      this.scene.start("IntroScene");
    });
  }
}
