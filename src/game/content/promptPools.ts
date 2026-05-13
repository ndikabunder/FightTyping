import type { Limb } from "../types";
import type { WordPoolTier } from "./levels";

export const promptPools: Record<WordPoolTier, Record<Limb, string[]>> = {
  easy: {
    rightHand: ["jab", "tap", "hit", "snap", "rush", "bolt"],
    leftHand: ["hook", "guard", "shift", "grip", "step", "focus"],
    rightLeg: ["kick", "round", "thrust", "impact"],
    leftLeg: ["sweep", "slide", "break", "ankle"]
  },
  normal: {
    rightHand: ["snap", "quick", "spark", "strike", "follow", "counter"],
    leftHand: ["cross", "guard", "drive", "focus", "anchor", "rhythm"],
    rightLeg: ["round", "thrust", "impact", "launch", "balance", "fracture"],
    leftLeg: ["sweep", "slide", "ankle", "stomp", "footwork", "reaction"]
  },
  hard: {
    rightHand: ["pressure", "precision", "reaction", "decisive", "overload"],
    leftHand: ["momentum", "counter", "fracture", "followup", "guarding"],
    rightLeg: ["footwork", "pressure", "overload", "rotation", "launcher"],
    leftLeg: ["balance", "reaction", "precision", "decisive", "sweeping"]
  }
};

export const limbLabels: Record<Limb, string> = {
  rightHand: "Tangan Kanan",
  leftHand: "Tangan Kiri",
  rightLeg: "Kaki Kanan",
  leftLeg: "Kaki Kiri"
};
