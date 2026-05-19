import { limbActions } from "../input/actions";
import { promptPools } from "../content/promptPools";
import type { WordPoolTier } from "../content/levels";
import type { Limb, PromptState } from "../types";

const limbs: Limb[] = ["leftHand", "rightHand", "leftLeg", "rightLeg"];
const RECENT_WORD_LIMIT = 6;

export class PromptSystem {
  private serial = 0;
  private readonly recentWords = new Map<string, string[]>();

  constructor(private readonly random: () => number = Math.random) {}

  createPrompts(tier: WordPoolTier = "level1"): PromptState[] {
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

  replacePrompt(prompts: PromptState[], promptId: string, tier: WordPoolTier = "level1"): PromptState[] {
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
    const words = ["evade", "back", "avoid", "shift", "escape", "retreat", "sidestep", "withdraw", "reverse", "outstep"];
    const recentKey = "dodge";
    const recent = this.recentWords.get(recentKey) ?? [];
    const candidates = words.filter((word) => !used.some((other) => hasAmbiguousPrefix(word, other)) && !recent.includes(word));
    const fallbackCandidates = words.filter((word) => !used.some((other) => hasAmbiguousPrefix(word, other)));
    const safePool = candidates.length > 0 ? candidates : fallbackCandidates.length > 0 ? fallbackCandidates : words;
    const text = safePool[Math.floor(this.random() * safePool.length)];
    this.remember(recentKey, text);
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
    const recentKey = `${tier}:${limb}`;
    const recent = this.recentWords.get(recentKey) ?? [];
    const candidates = pool.filter((word) => !used.some((other) => hasAmbiguousPrefix(word, other)) && !recent.includes(word));
    const fallbackCandidates = pool.filter((word) => !used.some((other) => hasAmbiguousPrefix(word, other)));
    const safePool = candidates.length > 0 ? candidates : fallbackCandidates.length > 0 ? fallbackCandidates : pool;
    const text = safePool[Math.floor(this.random() * safePool.length)];
    this.remember(recentKey, text);
    return text;
  }

  private remember(key: string, text: string) {
    const recent = this.recentWords.get(key) ?? [];
    this.recentWords.set(key, [text, ...recent.filter((word) => word !== text)].slice(0, RECENT_WORD_LIMIT));
  }
}

function hasAmbiguousPrefix(a: string, b: string) {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  return left[0] === right[0] || left.slice(0, 2) === right.slice(0, 2);
}
