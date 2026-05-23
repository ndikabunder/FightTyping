import Phaser from "phaser";
import { initCrazySDK } from "../../game/systems/CrazySDK";
import { initGameAnalytics } from "../../gameAnalytics";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  async create() {
    await initCrazySDK();
    initGameAnalytics();
    this.registry.set("round", 1);
    this.scene.start("PreloadScene");
  }
}
