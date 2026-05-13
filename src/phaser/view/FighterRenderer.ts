import Phaser from "phaser";
import type { ActionId, Fighter, FighterState } from "../../game/types";

type FighterPalette = {
  core: number;
  glow: number;
  shadow: number;
  spriteTint: number;
};

const palettes: Record<string, FighterPalette> = {
  player: { core: 0x8eefff, glow: 0x2ee9ff, shadow: 0x064b7a, spriteTint: 0x42d9ff },
  enemy: { core: 0xff78d8, glow: 0xff4d8d, shadow: 0x5f1037, spriteTint: 0xff70c7 }
};

type Pose = {
  lean: number;
  guard: number;
  reachRight: number;
  reachLeft: number;
  kickRight: number;
  kickLeft: number;
};

const idlePose: Pose = {
  lean: -4,
  guard: 1,
  reachRight: 0,
  reachLeft: 0,
  kickRight: 0,
  kickLeft: 0
};

const PLAYER_LAST_FILLED_FRAME = 28;
const FIGHTER_DISPLAY_WIDTH = 1000;
const FIGHTER_DISPLAY_HEIGHT = Math.round(FIGHTER_DISPLAY_WIDTH * (448 / 768));
const AURA_RING_Y = -232;
const PLAYER_DASH_ANIMATION_MS = 170;
const PLAYER_ATTACK_ANIMATION_MS = 760;
const PLAYER_FRAME_MS = 80;

const fighterTextureKeys: Record<string, string> = {
  idle: "player.idle",
  dash: "player.dash",
  punchRight: "player.punchRight",
  punchLeft: "player.punchLeft",
  kickRight: "player.kickRight",
  kickLeft: "player.kickLeft"
};

export class FighterRenderer {
  readonly container: Phaser.GameObjects.Container;
  private readonly aura: Phaser.GameObjects.Graphics;
  private readonly sprite: Phaser.GameObjects.Sprite | null;
  private readonly wire: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly palette: FighterPalette;
  private readonly pose = { ...idlePose };
  private lastState: FighterState = "idle";
  private lastSpriteTextureKey = "";
  private visualAttackId: ActionId | null = null;
  private visualAttackTextureKey: string | null = null;
  private visualActionSerial = 0;
  private visualAttackFirstFrame = 0;
  private visualAttackLastFrame = 0;
  private visualAttackStartedAtMs = 0;
  private visualDashUntilMs = 0;
  private visualAttackUntilMs = 0;

  constructor(private readonly scene: Phaser.Scene, fighter: Fighter, _baseColor: number, name: string) {
    this.palette = palettes[fighter.id] ?? palettes.player;
    this.container = scene.add.container(fighter.position.x, fighter.position.y).setDepth(12);
    this.aura = scene.add.graphics();
    this.sprite = scene.add
      .sprite(0, 0, "player.idle")
      .setOrigin(0.5, 0.76)
      .setDisplaySize(FIGHTER_DISPLAY_WIDTH, FIGHTER_DISPLAY_HEIGHT)
      .setDepth(1);
    this.wire = scene.add.graphics();
    this.label = scene.add
      .text(0, -266, name, {
        color: fighter.id === "player" ? "#bffcff" : "#ffd1e5",
        fontFamily: "Trebuchet MS, Arial",
        fontSize: "18px",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setShadow(0, 0, fighter.id === "player" ? "#67e8f9" : "#ff4d8d", 10, true, true);

    this.container.add([this.aura, this.sprite, this.wire, this.label]);
    this.sync(fighter);
  }

  sync(fighter: Fighter) {
    this.container.setPosition(fighter.position.x, fighter.position.y);
    this.container.setScale(fighter.facing, 1);
    this.syncSpriteAnimation(fighter);

    if (fighter.state !== this.lastState || fighter.state === "attack_active" || fighter.state === "attack_startup") {
      this.playState(fighter);
      this.lastState = fighter.state;
    }

    const hitFlash = fighter.state === "hitstun" ? 0.74 + Math.sin(fighter.stateElapsedMs * 0.08) * 0.18 : 1;
    this.container.setAlpha(hitFlash);
    this.drawFighter(fighter);
  }

  destroy() {
    this.container.destroy(true);
  }

  private playState(fighter: Fighter) {
    this.scene.tweens.killTweensOf(this.pose);
    Object.assign(this.pose, idlePose);

    if (fighter.state === "ko") {
      this.scene.tweens.add({
        targets: this.container,
        angle: fighter.id === "player" ? -72 : 72,
        y: fighter.position.y + 22,
        duration: 360,
        ease: "Cubic.easeOut"
      });
      return;
    }

    this.container.setAngle(0);

    if (fighter.state === "hitstun") {
      this.scene.tweens.add({ targets: this.pose, lean: fighter.id === "player" ? 10 : -10, duration: 70, yoyo: true, repeat: 2 });
      return;
    }

    switch (fighter.activeAttackId) {
      case "attack.punch.right":
        this.strike({ reachRight: 70, lean: 7 });
        break;
      case "attack.punch.left":
        this.strike({ reachLeft: 62, lean: 5 });
        break;
      case "attack.kick.right":
        this.strike({ kickRight: 84, lean: -10 });
        break;
      case "attack.kick.left":
        this.strike({ kickLeft: 78, lean: -8 });
        break;
    }
  }

  private syncSpriteAnimation(fighter: Fighter) {
    if (!this.sprite) {
      return;
    }

    this.updateAttackSequence(fighter);
    const visualFrame = this.getVisualFrame(fighter);
    if (visualFrame.textureKey !== this.lastSpriteTextureKey) {
      this.sprite.setTexture(visualFrame.textureKey);
      this.lastSpriteTextureKey = visualFrame.textureKey;
    }
    this.sprite.setFrame(visualFrame.frame);

    this.sprite.setVisible(true);
    this.sprite.setTint(this.palette.spriteTint);
    this.sprite.setTintMode(Phaser.TintModes.FILL);
    this.sprite.setAlpha(fighter.id === "player" ? 0.86 : 0.82);
    this.wire.setVisible(false);
  }

  private updateAttackSequence(fighter: Fighter) {
    if (fighter.visualActionId && fighter.visualActionSerial !== this.visualActionSerial) {
      this.visualActionSerial = fighter.visualActionSerial;
      this.visualAttackId = fighter.visualActionId;
      this.visualAttackTextureKey = this.getAttackTextureKey(fighter.visualActionId);
      const frameRange = this.getAttackFrameRange(fighter.visualActionId);
      this.visualAttackFirstFrame = frameRange.first;
      this.visualAttackLastFrame = frameRange.last;
      this.visualAttackStartedAtMs = this.scene.time.now;
      this.visualDashUntilMs = this.scene.time.now + PLAYER_DASH_ANIMATION_MS;
      this.visualAttackUntilMs = this.visualDashUntilMs + PLAYER_ATTACK_ANIMATION_MS;
      return;
    }

    if (this.visualAttackId && this.scene.time.now >= this.visualAttackUntilMs) {
      this.visualAttackId = null;
      this.visualAttackTextureKey = null;
      this.visualAttackFirstFrame = 0;
      this.visualAttackLastFrame = 0;
      this.visualAttackStartedAtMs = 0;
      this.visualDashUntilMs = 0;
      this.visualAttackUntilMs = 0;
    }
  }

  private getVisualFrame(fighter: Fighter): { textureKey: string; frame: number } {
    const nowMs = this.scene.time.now;

    if (this.visualAttackId && this.scene.time.now < this.visualDashUntilMs) {
      return {
        textureKey: fighterTextureKeys.dash,
        frame: this.loopFrame(nowMs - this.visualAttackStartedAtMs, 0, PLAYER_LAST_FILLED_FRAME, 48)
      };
    }

    if (this.visualAttackTextureKey && this.scene.time.now < this.visualAttackUntilMs) {
      return {
        textureKey: this.visualAttackTextureKey,
        frame: this.clampedFrame(nowMs - this.visualDashUntilMs, this.visualAttackFirstFrame, this.visualAttackLastFrame, PLAYER_FRAME_MS)
      };
    }

    if (fighter.state === "knockdown") {
      return {
        textureKey: fighterTextureKeys.dash,
        frame: this.loopFrame(fighter.stateElapsedMs, 0, PLAYER_LAST_FILLED_FRAME, 48)
      };
    }

    if (fighter.state === "attack_startup") {
      return {
        textureKey: fighterTextureKeys.dash,
        frame: this.loopFrame(fighter.stateElapsedMs, 0, PLAYER_LAST_FILLED_FRAME, 48)
      };
    }

    return {
      textureKey: fighterTextureKeys.idle,
      frame: this.loopFrame(this.scene.time.now, 0, PLAYER_LAST_FILLED_FRAME, 125)
    };
  }

  private getAttackTextureKey(actionId: ActionId) {
    switch (actionId) {
      case "attack.punch.right":
        return fighterTextureKeys.punchRight;
      case "attack.punch.left":
        return fighterTextureKeys.punchLeft;
      case "attack.kick.right":
        return fighterTextureKeys.kickRight;
      case "attack.kick.left":
        return fighterTextureKeys.kickLeft;
      default:
        return fighterTextureKeys.punchRight;
    }
  }

  private getAttackFrameRange(actionId: ActionId) {
    switch (actionId) {
      case "attack.punch.right":
        return { first: 10, last: 17 };
      case "attack.punch.left":
        return { first: 13, last: 18 };
      case "attack.kick.right":
        return { first: 8, last: 15 };
      case "attack.kick.left":
        return { first: 6, last: 18 };
      default:
        return { first: 10, last: 17 };
    }
  }

  private loopFrame(elapsedMs: number, firstFrame: number, lastFrame: number, frameMs: number) {
    const frameCount = lastFrame - firstFrame + 1;
    return firstFrame + (Math.floor(Math.max(0, elapsedMs) / frameMs) % frameCount);
  }

  private clampedFrame(elapsedMs: number, firstFrame: number, lastFrame: number, frameMs: number) {
    return Math.min(lastFrame, firstFrame + Math.floor(Math.max(0, elapsedMs) / frameMs));
  }

  private strike(target: Partial<Pose>) {
    this.scene.tweens.add({
      targets: this.pose,
      ...target,
      duration: 110,
      yoyo: true,
      ease: "Back.easeOut"
    });
  }

  private drawFighter(fighter: Fighter) {
    this.aura.clear();
    this.wire.clear();

    const pulse = 0.62 + Math.sin(this.scene.time.now * 0.006) * 0.16;

    if (this.sprite) {
      this.aura.fillStyle(this.palette.shadow, 0.36);
      this.aura.fillEllipse(0, -2, 172, 30);
      this.aura.lineStyle(16, this.palette.glow, 0.12 + pulse * 0.08);
      this.aura.strokeCircle(0, AURA_RING_Y, 96);
      this.aura.lineStyle(4, this.palette.core, 0.18 + pulse * 0.08);
      this.aura.strokeCircle(0, AURA_RING_Y, 108);
      return;
    }

    const xLean = this.pose.lean;

    const hip = new Phaser.Math.Vector2(0, -92);
    const chest = new Phaser.Math.Vector2(xLean, -166);
    const neck = new Phaser.Math.Vector2(xLean + 2, -204);
    const head = new Phaser.Math.Vector2(xLean + 6, -230);
    const leftShoulder = new Phaser.Math.Vector2(xLean - 34, -180);
    const rightShoulder = new Phaser.Math.Vector2(xLean + 38, -178);
    const leftElbow = new Phaser.Math.Vector2(xLean - 70 - this.pose.reachLeft * 0.28, -146 - this.pose.reachLeft * 0.1);
    const rightElbow = new Phaser.Math.Vector2(xLean + 76 + this.pose.reachRight * 0.34, -146);
    const leftHand = new Phaser.Math.Vector2(xLean - 88 - this.pose.reachLeft, -128 - this.pose.reachLeft * 0.14);
    const rightHand = new Phaser.Math.Vector2(xLean + 96 + this.pose.reachRight, -130);
    const leftKnee = new Phaser.Math.Vector2(-42 - this.pose.kickLeft * 0.2, -52 - this.pose.kickLeft * 0.2);
    const rightKnee = new Phaser.Math.Vector2(46 + this.pose.kickRight * 0.18, -54 - this.pose.kickRight * 0.16);
    const leftFoot = new Phaser.Math.Vector2(-62 - this.pose.kickLeft, -4 - this.pose.kickLeft * 0.12);
    const rightFoot = new Phaser.Math.Vector2(72 + this.pose.kickRight, -8 - this.pose.kickRight * 0.08);

    this.aura.fillStyle(this.palette.shadow, 0.36);
    this.aura.fillEllipse(0, -2, 172, 30);
    this.aura.lineStyle(18, this.palette.glow, 0.08 + pulse * 0.06);
    this.drawBodyLines(leftShoulder, rightShoulder, chest, hip, leftElbow, rightElbow, leftHand, rightHand, leftKnee, rightKnee, leftFoot, rightFoot, this.aura);

    this.wire.lineStyle(5, this.palette.glow, 0.36);
    this.drawBodyLines(leftShoulder, rightShoulder, chest, hip, leftElbow, rightElbow, leftHand, rightHand, leftKnee, rightKnee, leftFoot, rightFoot, this.wire);

    this.wire.lineStyle(2, this.palette.core, 0.96);
    this.drawBodyLines(leftShoulder, rightShoulder, chest, hip, leftElbow, rightElbow, leftHand, rightHand, leftKnee, rightKnee, leftFoot, rightFoot, this.wire);
    this.drawWireHead(head, fighter.state === "hitstun");
    this.drawJointDots([neck, leftShoulder, rightShoulder, leftElbow, rightElbow, leftHand, rightHand, hip, leftKnee, rightKnee, leftFoot, rightFoot]);
    this.drawScanLines(chest, hip, leftShoulder, rightShoulder);
  }

  private drawBodyLines(
    leftShoulder: Phaser.Math.Vector2,
    rightShoulder: Phaser.Math.Vector2,
    chest: Phaser.Math.Vector2,
    hip: Phaser.Math.Vector2,
    leftElbow: Phaser.Math.Vector2,
    rightElbow: Phaser.Math.Vector2,
    leftHand: Phaser.Math.Vector2,
    rightHand: Phaser.Math.Vector2,
    leftKnee: Phaser.Math.Vector2,
    rightKnee: Phaser.Math.Vector2,
    leftFoot: Phaser.Math.Vector2,
    rightFoot: Phaser.Math.Vector2,
    graphics: Phaser.GameObjects.Graphics
  ) {
    graphics.lineBetween(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y);
    graphics.lineBetween(chest.x, chest.y, hip.x, hip.y);
    graphics.lineBetween(leftShoulder.x, leftShoulder.y, chest.x, chest.y);
    graphics.lineBetween(rightShoulder.x, rightShoulder.y, chest.x, chest.y);
    graphics.lineBetween(leftShoulder.x, leftShoulder.y, leftElbow.x, leftElbow.y);
    graphics.lineBetween(leftElbow.x, leftElbow.y, leftHand.x, leftHand.y);
    graphics.lineBetween(rightShoulder.x, rightShoulder.y, rightElbow.x, rightElbow.y);
    graphics.lineBetween(rightElbow.x, rightElbow.y, rightHand.x, rightHand.y);
    graphics.lineBetween(hip.x, hip.y, leftKnee.x, leftKnee.y);
    graphics.lineBetween(leftKnee.x, leftKnee.y, leftFoot.x, leftFoot.y);
    graphics.lineBetween(hip.x, hip.y, rightKnee.x, rightKnee.y);
    graphics.lineBetween(rightKnee.x, rightKnee.y, rightFoot.x, rightFoot.y);
  }

  private drawWireHead(center: Phaser.Math.Vector2, hitstun: boolean) {
    const color = hitstun ? 0xffffff : this.palette.core;
    this.wire.lineStyle(5, this.palette.glow, 0.3);
    this.wire.strokeCircle(center.x, center.y, 28);
    this.wire.lineStyle(2, color, 0.96);
    this.wire.strokeCircle(center.x, center.y, 28);
    this.wire.strokeEllipse(center.x, center.y, 18, 56);
    this.wire.strokeEllipse(center.x, center.y, 56, 16);
    this.wire.lineBetween(center.x - 22, center.y - 9, center.x + 22, center.y + 9);
    this.wire.lineBetween(center.x - 20, center.y + 10, center.x + 20, center.y - 10);
  }

  private drawJointDots(points: Phaser.Math.Vector2[]) {
    points.forEach((point) => {
      this.wire.fillStyle(this.palette.glow, 0.94);
      this.wire.fillCircle(point.x, point.y, 4);
      this.wire.fillStyle(0xffffff, 0.52);
      this.wire.fillCircle(point.x, point.y, 1.5);
    });
  }

  private drawScanLines(chest: Phaser.Math.Vector2, hip: Phaser.Math.Vector2, leftShoulder: Phaser.Math.Vector2, rightShoulder: Phaser.Math.Vector2) {
    this.wire.lineStyle(1, this.palette.core, 0.46);
    for (let i = 0; i < 6; i += 1) {
      const t = i / 5;
      const y = Phaser.Math.Linear(chest.y, hip.y, t);
      const half = Phaser.Math.Linear(38, 18, t);
      this.wire.lineBetween(chest.x - half, y, chest.x + half, y);
    }
    this.wire.lineBetween(leftShoulder.x, leftShoulder.y, hip.x, hip.y);
    this.wire.lineBetween(rightShoulder.x, rightShoulder.y, hip.x, hip.y);
  }
}
