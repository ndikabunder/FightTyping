import type { ActionId, AttackData } from "../types";

export const attacks: Record<ActionId, AttackData> = {
  "attack.punch.right": {
    id: "attack.punch.right",
    animationKey: "punch_right",
    limb: "rightHand",
    damage: 8,
    startupMs: 90,
    activeMs: 80,
    recoveryMs: 160,
    range: 54,
    hitstunMs: 220,
    knockback: 22
  },
  "attack.punch.left": {
    id: "attack.punch.left",
    animationKey: "punch_left",
    limb: "leftHand",
    damage: 11,
    startupMs: 120,
    activeMs: 90,
    recoveryMs: 190,
    range: 62,
    hitstunMs: 260,
    knockback: 28,
    effect: {
      comboGain: 2
    }
  },
  "attack.kick.right": {
    id: "attack.kick.right",
    animationKey: "kick_right",
    limb: "rightLeg",
    damage: 15,
    startupMs: 170,
    activeMs: 110,
    recoveryMs: 260,
    range: 96,
    hitstunMs: 320,
    knockback: 44
  },
  "attack.kick.left": {
    id: "attack.kick.left",
    animationKey: "kick_left",
    limb: "leftLeg",
    damage: 13,
    startupMs: 150,
    activeMs: 130,
    recoveryMs: 260,
    range: 86,
    hitstunMs: 380,
    knockback: 34,
    effect: {
      enemyDelayMs: 520
    }
  }
};
