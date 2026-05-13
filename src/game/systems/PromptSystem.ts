import { limbActions } from "../input/actions";
import { promptPools } from "../content/promptPools";
import type { WordPoolTier } from "../content/levels";
import type { Limb, PromptState } from "../types";

const limbs: Limb[] = ["leftHand", "rightHand", "leftLeg", "rightLeg"];

export class PromptSystem {
  private serial = 0;

  createPrompts(tier: WordPoolTier = "easy"): PromptState[] {
    const used: string[] = [];

    return limbs.map((limb) => {
      const text = this.pickPrompt(limb, used, tier);
      used.push(text);
      return {
        id: `${limb}-${this.serial++}`,
        limb,
        actionId: limbActions[limb],
        kind: "attack",
        text,
        typed: "",
        status: "idle"
      };
    });
  }

  replacePrompt(prompts: PromptState[], promptId: string, tier: WordPoolTier = "easy"): PromptState[] {
    const used = prompts.filter((prompt) => prompt.id !== promptId).map((prompt) => prompt.text);

    return prompts.map((prompt) => {
      if (prompt.id !== promptId) {
        return prompt;
      }

      return {
        id: `${prompt.limb}-${this.serial++}`,
        limb: prompt.limb,
        actionId: limbActions[prompt.limb],
        kind: "attack",
        text: this.pickPrompt(prompt.limb, used, tier),
        typed: "",
        status: "idle"
      };
    });
  }

  createDodgePrompt(used: string[] = []): PromptState {
    const words = ["evade", "back", "avoid", "shift", "escape", "retreat"];
    const text = words.find((word) => !used.some((other) => hasAmbiguousPrefix(word, other))) ?? "evade";
    return {
      id: `dodge-${this.serial++}`,
      limb: "leftHand",
      actionId: "attack.punch.left",
      kind: "dodge",
      text,
      typed: "",
      status: "idle"
    };
  }

  private pickPrompt(limb: Limb, used: string[], tier: WordPoolTier) {
    const pool = promptPools[tier][limb];
    const candidates = pool.filter((word) => !used.some((other) => hasAmbiguousPrefix(word, other)));
    const safePool = candidates.length > 0 ? candidates : pool;
    return safePool[Math.floor(Math.random() * safePool.length)];
  }
}

function hasAmbiguousPrefix(a: string, b: string) {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  return left[0] === right[0] || left.slice(0, 2) === right.slice(0, 2);
}
