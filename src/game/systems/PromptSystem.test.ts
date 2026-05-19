import { describe, expect, it } from "vitest";
import { PromptSystem } from "./PromptSystem";

describe("PromptSystem", () => {
  it("creates four limb prompts with unique ids", () => {
    const prompts = new PromptSystem().createPrompts();

    expect(prompts).toHaveLength(4);
    expect(new Set(prompts.map((prompt) => prompt.id)).size).toBe(4);
    expect(new Set(prompts.map((prompt) => prompt.limb)).size).toBe(4);
    expect(new Set(prompts.map((prompt) => prompt.text[0])).size).toBe(4);
  });

  it("does not immediately respawn the same word on a limb", () => {
    const system = new PromptSystem(() => 0);
    let prompts = system.createPrompts("level1");
    const firstRightHand = prompts.find((prompt) => prompt.limb === "rightHand")!;

    prompts = system.replacePrompt(prompts, firstRightHand.id, "level1");
    const nextRightHand = prompts.find((prompt) => prompt.limb === "rightHand")!;

    expect(nextRightHand.text).not.toBe(firstRightHand.text);
  });

  it("keeps dodge prompt distinct from active attack prompts", () => {
    const system = new PromptSystem(() => 0);
    const prompts = system.createPrompts("level1");
    const dodgePrompt = system.createDodgePrompt(prompts.map((prompt) => prompt.text));

    expect(prompts.some((prompt) => prompt.text[0].toLowerCase() === dodgePrompt.text[0].toLowerCase())).toBe(false);
  });
});
