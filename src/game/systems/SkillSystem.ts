import type { SkillState } from "../types";

const REQUIRED_COMBO = 3;
const SKILL_WORD_POOL = [
  "power",
  "strike",
  "surge",
  "impact",
  "charge",
  "burst",
  "vector",
  "pulse",
  "rocket",
  "blaze",
  "thunder",
  "breaker"
] as const;

export interface SkillInputResult {
  skill: SkillState;
  completed: boolean;
  wrong: boolean;
  consumed: boolean;
}

export function createSkillState(levelId: number): SkillState {
  const available = levelId >= 3;

  return {
    available,
    unlocked: false,
    progress: 0,
    requiredCombo: REQUIRED_COMBO,
    chargeBaseCombo: 0,
    words: pickSkillWords(levelId),
    typed: "",
    status: available ? "locked" : "locked",
    usedSerial: 0
  };
}

export class SkillSystem {
  syncWithCombo(current: SkillState, comboCount: number): SkillState {
    if (!current.available) {
      return current;
    }

    if (current.unlocked) {
      return {
        ...current,
        progress: 1,
        status: current.status === "locked" ? "ready" : current.status
      };
    }

    const chargeBaseCombo = comboCount === 0 ? 0 : current.chargeBaseCombo;
    const progress = Math.min(1, Math.max(0, comboCount - chargeBaseCombo) / current.requiredCombo);
    const unlocked = progress >= 1 || current.unlocked;

    return {
      ...current,
      chargeBaseCombo,
      progress,
      unlocked,
      status: unlocked ? (current.status === "locked" ? "ready" : current.status) : "locked",
      typed: unlocked ? current.typed : ""
    };
  }

  handleKey(current: SkillState, key: string): SkillInputResult {
    const char = normalizeKey(key);

    if (!current.available || !current.unlocked || !char) {
      return { skill: current, completed: false, wrong: false, consumed: false };
    }

    const expected = skillText(current)[current.typed.length];
    const startsSkillTyping = current.typed.length > 0 || char === expected;

    if (!startsSkillTyping) {
      return { skill: current, completed: false, wrong: false, consumed: false };
    }

    if (char !== expected) {
      return {
        skill: { ...current, typed: "", status: "wrong" },
        completed: false,
        wrong: true,
        consumed: true
      };
    }

    const typed = current.typed + char;
    const completed = typed.length === skillText(current).length;

    if (completed) {
      return {
        skill: {
          ...current,
          unlocked: false,
          typed: "",
          status: "completed",
          usedSerial: current.usedSerial + 1
        },
        completed: true,
        wrong: false,
        consumed: true
      };
    }

    return {
      skill: { ...current, typed, status: "matching" },
      completed: false,
      wrong: false,
      consumed: true
    };
  }

  consume(current: SkillState, comboCount: number): SkillState {
    return {
      ...current,
      unlocked: false,
      progress: 0,
      chargeBaseCombo: comboCount,
      typed: "",
      status: "locked"
    };
  }
}

function skillText(skill: SkillState) {
  return skill.words.join("");
}

function pickSkillWords(seed: number): [string, string] {
  const first = SKILL_WORD_POOL[seed % SKILL_WORD_POOL.length];
  const second = SKILL_WORD_POOL[(seed * 5 + 3) % SKILL_WORD_POOL.length];
  return first === second ? [first, SKILL_WORD_POOL[(seed + 7) % SKILL_WORD_POOL.length]] : [first, second];
}

function normalizeKey(key: string) {
  return /^[a-zA-Z]$/.test(key) ? key.toLowerCase() : "";
}
