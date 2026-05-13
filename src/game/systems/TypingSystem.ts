import type { PromptState, TypingMetrics } from "../types";

export interface TypingResult {
  prompts: PromptState[];
  metrics: TypingMetrics;
  completedPrompt: PromptState | null;
  wrong: boolean;
}

export function createTypingMetrics(): TypingMetrics {
  return {
    keystrokes: 0,
    correctChars: 0,
    wrongChars: 0,
    combo: 0,
    bestCombo: 0,
    completedPrompts: 0,
    totalCompletionMs: 0,
    dodgeSuccesses: 0,
    damageTaken: 0,
    limbHits: {},
    comboJustChangedAtMs: 0,
    comboMilestone: 0
  };
}

export class TypingSystem {
  private lockedPromptId: string | null = null;
  private promptStartedAtMs = 0;

  reset() {
    this.lockedPromptId = null;
    this.promptStartedAtMs = 0;
  }

  handleKey(prompts: PromptState[], metrics: TypingMetrics, key: string, nowMs: number): TypingResult {
    const char = normalizeKey(key);

    if (!char) {
      return { prompts, metrics, completedPrompt: null, wrong: false };
    }

    const nextMetrics = { ...metrics, keystrokes: metrics.keystrokes + 1 };
    const activePrompt = this.lockedPromptId
      ? prompts.find((prompt) => prompt.id === this.lockedPromptId) ?? null
      : this.findLockCandidate(prompts, char);

    if (!activePrompt) {
      nextMetrics.wrongChars += 1;
      nextMetrics.combo = 0;
      nextMetrics.comboJustChangedAtMs = metrics.combo > 0 ? nowMs : metrics.comboJustChangedAtMs;
      nextMetrics.comboMilestone = 0;
      return {
        prompts: markWrong(prompts),
        metrics: nextMetrics,
        completedPrompt: null,
        wrong: true
      };
    }

    if (!this.lockedPromptId) {
      this.lockedPromptId = activePrompt.id;
      this.promptStartedAtMs = nowMs;
    }

    const expected = activePrompt.text[activePrompt.typed.length]?.toLowerCase();

    if (char !== expected) {
      nextMetrics.wrongChars += 1;
      nextMetrics.combo = 0;
      nextMetrics.comboJustChangedAtMs = metrics.combo > 0 ? nowMs : metrics.comboJustChangedAtMs;
      nextMetrics.comboMilestone = 0;
      return {
        prompts: prompts.map((prompt) =>
          prompt.id === activePrompt.id ? { ...prompt, status: "wrong" } : prompt
        ),
        metrics: nextMetrics,
        completedPrompt: null,
        wrong: true
      };
    }

    nextMetrics.correctChars += 1;
    const typed = activePrompt.typed + char;
    const completed = typed.length === activePrompt.text.length;
    const completedPrompt: PromptState = {
      ...activePrompt,
      typed,
      status: completed ? "completed" : "matching",
      completedAtMs: completed ? nowMs : undefined
    };

    if (completed) {
      nextMetrics.combo += 1;
      nextMetrics.bestCombo = Math.max(nextMetrics.bestCombo, nextMetrics.combo);
      nextMetrics.completedPrompts += 1;
      nextMetrics.totalCompletionMs += Math.max(1, nowMs - this.promptStartedAtMs);
      nextMetrics.comboJustChangedAtMs = nowMs;
      nextMetrics.comboMilestone = comboMilestone(nextMetrics.combo);
      this.lockedPromptId = null;
      this.promptStartedAtMs = 0;
    }

    return {
      prompts: prompts.map((prompt) => {
        if (prompt.id === activePrompt.id) {
          return completedPrompt;
        }
        return completed ? { ...prompt, status: "idle" } : prompt;
      }),
      metrics: nextMetrics,
      completedPrompt: completed ? completedPrompt : null,
      wrong: false
    };
  }

  private findLockCandidate(prompts: PromptState[], char: string) {
    const matches = prompts.filter((prompt) => prompt.text[0]?.toLowerCase() === char);
    return matches.length === 1 ? matches[0] : null;
  }
}

function normalizeKey(key: string) {
  return /^[a-zA-Z]$/.test(key) ? key.toLowerCase() : "";
}

function markWrong(prompts: PromptState[]) {
  return prompts.map((prompt) => ({ ...prompt, status: "wrong" as const }));
}

function comboMilestone(combo: number) {
  if (combo > 0 && combo % 10 === 0) {
    return 10;
  }
  if (combo > 0 && combo % 5 === 0) {
    return 5;
  }
  if (combo > 0 && combo % 3 === 0) {
    return 3;
  }
  return 0;
}
