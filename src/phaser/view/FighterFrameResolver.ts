import type { ActionId, Fighter, GameSnapshot } from "../../game/types";

export type FighterTextureKey =
  | "idle"
  | "dash"
  | "skill"
  | "death"
  | "victory"
  | "punchRight"
  | "punchLeft"
  | "kickRight"
  | "kickLeft";

export type FighterVisualFrame = {
  textureKey: string;
  frame: number;
};

const PLAYER_LAST_FILLED_FRAME = 28;
const PLAYER_DASH_ANIMATION_MS = 170;
const PLAYER_ATTACK_ANIMATION_MS = 760;
const PLAYER_FRAME_MS = 80;
const SPECIAL_FRAME_MS = 92;
const SPECIAL_ANIMATION_MS = 1400;
export const DEATH_ANIMATION_MS = (PLAYER_LAST_FILLED_FRAME + 1) * SPECIAL_FRAME_MS;

const textureKeys: Record<FighterTextureKey, string> = {
  idle: "player.idle",
  dash: "player.dash",
  skill: "player.skill",
  death: "player.death",
  victory: "player.victory",
  punchRight: "player.punchRight",
  punchLeft: "player.punchLeft",
  kickRight: "player.kickRight",
  kickLeft: "player.kickLeft"
};

type OutcomeAnimation = "victory" | "death" | null;

type AttackAnimation = {
  id: ActionId;
  textureKey: string;
  firstFrame: number;
  lastFrame: number;
  startedAtMs: number;
  dashUntilMs: number;
  attackUntilMs: number;
};

export class FighterFrameResolver {
  private visualActionSerial = 0;
  private attack: AttackAnimation | null = null;
  private specialAnimation: "skill" | null = null;
  private specialStartedAtMs = 0;
  private specialUntilMs = 0;
  private lastSkillFeedbackAt = -1;
  private outcomeAnimation: OutcomeAnimation = null;
  private outcomeStartedAtMs = 0;

  sync(fighter: Fighter, nowMs: number, skillFeedbackAt = -1) {
    this.updateSpecialAnimation(fighter, nowMs, skillFeedbackAt);
    this.updateAttackSequence(fighter, nowMs);
  }

  resolve(fighter: Fighter, roundState: GameSnapshot["roundState"], nowMs: number, suppressOutcome: boolean): FighterVisualFrame {
    const outcome = this.getOutcome(fighter, roundState, suppressOutcome);

    if (outcome !== this.outcomeAnimation) {
      this.outcomeAnimation = outcome;
      this.outcomeStartedAtMs = nowMs;
    }

    if (outcome === "victory") {
      return {
        textureKey: textureKeys.victory,
        frame: loopFrame(nowMs - this.outcomeStartedAtMs, 0, PLAYER_LAST_FILLED_FRAME, SPECIAL_FRAME_MS)
      };
    }

    if (outcome === "death") {
      return {
        textureKey: textureKeys.death,
        frame: clampedFrame(nowMs - this.outcomeStartedAtMs, 0, PLAYER_LAST_FILLED_FRAME, SPECIAL_FRAME_MS)
      };
    }

    if (this.specialAnimation && nowMs < this.specialUntilMs) {
      return {
        textureKey: textureKeys.skill,
        frame: clampedFrame(nowMs - this.specialStartedAtMs, 0, PLAYER_LAST_FILLED_FRAME, SPECIAL_FRAME_MS)
      };
    }

    if (this.specialAnimation && nowMs >= this.specialUntilMs) {
      this.specialAnimation = null;
    }

    if (this.attack && nowMs < this.attack.dashUntilMs) {
      return {
        textureKey: textureKeys.dash,
        frame: loopFrame(nowMs - this.attack.startedAtMs, 0, PLAYER_LAST_FILLED_FRAME, 48)
      };
    }

    if (this.attack && nowMs < this.attack.attackUntilMs) {
      return {
        textureKey: this.attack.textureKey,
        frame: clampedFrame(nowMs - this.attack.dashUntilMs, this.attack.firstFrame, this.attack.lastFrame, PLAYER_FRAME_MS)
      };
    }

    if (fighter.state === "knockdown" || fighter.state === "attack_startup") {
      return {
        textureKey: textureKeys.dash,
        frame: loopFrame(fighter.stateElapsedMs, 0, PLAYER_LAST_FILLED_FRAME, 48)
      };
    }

    return {
      textureKey: textureKeys.idle,
      frame: loopFrame(nowMs, 0, PLAYER_LAST_FILLED_FRAME, 125)
    };
  }

  private updateSpecialAnimation(fighter: Fighter, nowMs: number, skillFeedbackAt: number) {
    if (fighter.id !== "player" || skillFeedbackAt < 0 || skillFeedbackAt === this.lastSkillFeedbackAt) {
      return;
    }
    this.lastSkillFeedbackAt = skillFeedbackAt;
    this.specialAnimation = "skill";
    this.specialStartedAtMs = nowMs;
    this.specialUntilMs = nowMs + SPECIAL_ANIMATION_MS;
  }

  private updateAttackSequence(fighter: Fighter, nowMs: number) {
    if (fighter.visualActionId && fighter.visualActionSerial !== this.visualActionSerial) {
      const frameRange = getAttackFrameRange(fighter.visualActionId);
      this.visualActionSerial = fighter.visualActionSerial;
      this.attack = {
        id: fighter.visualActionId,
        textureKey: getAttackTextureKey(fighter.visualActionId),
        firstFrame: frameRange.first,
        lastFrame: frameRange.last,
        startedAtMs: nowMs,
        dashUntilMs: nowMs + PLAYER_DASH_ANIMATION_MS,
        attackUntilMs: nowMs + PLAYER_DASH_ANIMATION_MS + PLAYER_ATTACK_ANIMATION_MS
      };
      return;
    }

    if (this.attack && nowMs >= this.attack.attackUntilMs) {
      this.attack = null;
    }
  }

  private getOutcome(fighter: Fighter, roundState: GameSnapshot["roundState"], suppressOutcome: boolean): OutcomeAnimation {
    if (fighter.state === "ko") {
      return "death";
    }
    if (suppressOutcome) {
      return null;
    }
    if (fighter.id === "player" && roundState === "won") {
      return "victory";
    }
    return null;
  }
}

function getAttackTextureKey(actionId: ActionId) {
  switch (actionId) {
    case "attack.punch.right":
      return textureKeys.punchRight;
    case "attack.punch.left":
      return textureKeys.punchLeft;
    case "attack.kick.right":
      return textureKeys.kickRight;
    case "attack.kick.left":
      return textureKeys.kickLeft;
    default:
      return textureKeys.punchRight;
  }
}

function getAttackFrameRange(actionId: ActionId) {
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

function loopFrame(elapsedMs: number, firstFrame: number, lastFrame: number, frameMs: number) {
  const frameCount = lastFrame - firstFrame + 1;
  return firstFrame + (Math.floor(Math.max(0, elapsedMs) / frameMs) % frameCount);
}

function clampedFrame(elapsedMs: number, firstFrame: number, lastFrame: number, frameMs: number) {
  return Math.min(lastFrame, firstFrame + Math.floor(Math.max(0, elapsedMs) / frameMs));
}
