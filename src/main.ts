import Phaser from "phaser";
import { gameConfig } from "./phaser/config";
import "./styles/app.css";

const game = new Phaser.Game(gameConfig);

// Hidden input element captures keyboard reliably in iframes (itch.io)
const keySink = document.getElementById("key-sink") as HTMLInputElement;

function focusKeySink() {
  if (keySink && document.activeElement !== keySink) {
    keySink.focus({ preventScroll: true });
  }
}

// Keep key-sink focused at all times
focusKeySink();
document.addEventListener("pointerdown", () => requestAnimationFrame(focusKeySink));
window.addEventListener("focus", focusKeySink);

// Prevent the input from accumulating text
if (keySink) {
  keySink.addEventListener("input", () => { keySink.value = ""; });
}

// Periodically ensure focus (handles edge cases like alert dialogs, devtools)
setInterval(focusKeySink, 1000);

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
