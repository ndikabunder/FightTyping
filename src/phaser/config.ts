import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { FightScene } from "./scenes/FightScene";
import { MenuScene } from "./scenes/MenuScene";
import { LeaderboardScene } from "./scenes/LeaderboardScene";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GROUND_Y = 590;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#101014",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    min: { width: 640, height: 360 },
    max: { width: 1920, height: 1080 }
  },
  fps: {
    target: 60,
    limit: 0,
    smoothStep: true
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: false,
    gamepad: false,
    activePointers: 1,
    windowEvents: true
  },
  scene: [BootScene, PreloadScene, MenuScene, LeaderboardScene, FightScene]
};
