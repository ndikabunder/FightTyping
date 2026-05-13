import { describe, expect, it } from "vitest";
import { createTypingMetrics, TypingSystem } from "./TypingSystem";
import type { PromptState } from "../types";

describe("TypingSystem", () => {
  it("locks one prompt and emits completed action", () => {
    const system = new TypingSystem();
    const prompts: PromptState[] = [
      { id: "a", limb: "rightHand", actionId: "attack.punch.right", kind: "attack", text: "jab", typed: "", status: "idle" },
      { id: "b", limb: "leftHand", actionId: "attack.punch.left", kind: "attack", text: "hook", typed: "", status: "idle" }
    ];

    let result = system.handleKey(prompts, createTypingMetrics(), "j", 0);
    result = system.handleKey(result.prompts, result.metrics, "a", 100);
    result = system.handleKey(result.prompts, result.metrics, "b", 200);

    expect(result.completedPrompt?.actionId).toBe("attack.punch.right");
    expect(result.metrics.completedPrompts).toBe(1);
    expect(result.metrics.correctChars).toBe(3);
  });

  it("penalizes wrong input", () => {
    const system = new TypingSystem();
    const prompts: PromptState[] = [
      { id: "a", limb: "rightHand", actionId: "attack.punch.right", kind: "attack", text: "jab", typed: "", status: "idle" }
    ];

    const result = system.handleKey(prompts, createTypingMetrics(), "x", 0);

    expect(result.wrong).toBe(true);
    expect(result.metrics.wrongChars).toBe(1);
  });
});
