import Phaser from "phaser";
import { audioAssets, audioKey } from "../audio/GameAudio";
import { playerSpritesheetFrame, playerSpritesheets } from "../assets/playerSpritesheets";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    Object.entries(playerSpritesheets).forEach(([key, url]) => {
      this.load.spritesheet(`player.${key}`, url, playerSpritesheetFrame);
    });

    Object.entries(audioAssets).forEach(([key, url]) => {
      this.load.audio(audioKey(key as keyof typeof audioAssets), url);
    });
  }

  create() {
    document.getElementById("loading-screen")?.classList.add("hidden");

    const loading = this.add
      .text(640, 360, "Loading Fight Typing...", {
        color: "#f8f0d8",
        fontFamily: "Arial",
        fontSize: "28px"
      })
      .setOrigin(0.5);

    this.time.delayedCall(120, () => {
      loading.destroy();
      this.scene.start("NoticeScene");
    });
  }
}
