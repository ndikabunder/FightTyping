import Phaser from "phaser";
import { hitboxes } from "../../game/content/hitboxes";
import { toWorldBox } from "../../game/systems/CombatSystem";
import type { Fighter, GameSnapshot, Rect } from "../../game/types";

export class DebugRenderer {
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(50);
  }

  render(snapshot: GameSnapshot) {
    this.graphics.clear();

    if (!snapshot.debugEnabled) {
      return;
    }

    this.drawHurtbox(snapshot.player);
    this.drawHurtbox(snapshot.enemy);
    this.drawAttackBox(snapshot.player);
    this.drawAttackBox(snapshot.enemy);
  }

  destroy() {
    this.graphics.destroy();
  }

  private drawHurtbox(fighter: Fighter) {
    this.drawRect(toWorldBox(fighter.hurtbox, fighter), 0x38bdf8, 0.22, 2);
  }

  private drawAttackBox(fighter: Fighter) {
    if (!fighter.activeAttackId || fighter.state !== "attack_active") {
      return;
    }

    const data = hitboxes[fighter.activeAttackId];
    const activeWindow = data.activeWindows.find(
      (window) => fighter.stateElapsedMs >= window.fromMs && fighter.stateElapsedMs <= window.toMs
    );

    if (activeWindow) {
      this.drawRect(toWorldBox(activeWindow.box, fighter), 0xf43f5e, 0.28, 3);
    }
  }

  private drawRect(rect: Rect, color: number, alpha: number, width: number) {
    this.graphics.fillStyle(color, alpha);
    this.graphics.fillRect(rect.x, rect.y, rect.w, rect.h);
    this.graphics.lineStyle(width, color, 0.9);
    this.graphics.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }
}
