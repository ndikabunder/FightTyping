import Phaser from "phaser";
import { gameConfig } from "./phaser/config";
import "./styles/app.css";

const game = new Phaser.Game(gameConfig);

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
