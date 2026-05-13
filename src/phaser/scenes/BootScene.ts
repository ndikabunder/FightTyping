import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.registry.set("round", 1);
    this.scene.start("PreloadScene");
  }
}
