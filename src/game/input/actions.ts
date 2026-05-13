import type { ActionId, Limb } from "../types";

export const limbActions: Record<Limb, ActionId> = {
  rightHand: "attack.punch.right",
  leftHand: "attack.punch.left",
  rightLeg: "attack.kick.right",
  leftLeg: "attack.kick.left"
};
