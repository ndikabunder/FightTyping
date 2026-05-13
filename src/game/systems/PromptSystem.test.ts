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
});
