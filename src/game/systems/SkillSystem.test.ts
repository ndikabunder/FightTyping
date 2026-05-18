import { describe, expect, it } from "vitest";
import { createSkillState, SkillSystem } from "./SkillSystem";

describe("SkillSystem", () => {
  it("stays unavailable before level 3", () => {
    const system = new SkillSystem();
    const skill = system.syncWithCombo(createSkillState(2), 3);

    expect(skill.available).toBe(false);
    expect(skill.unlocked).toBe(false);
    expect(skill.progress).toBe(0);
  });

  it("unlocks after three combo points on level 3+", () => {
    const system = new SkillSystem();
    const skill = system.syncWithCombo(createSkillState(3), 3);

    expect(skill.available).toBe(true);
    expect(skill.unlocked).toBe(true);
    expect(skill.progress).toBe(1);
    expect(skill.status).toBe("ready");
  });

  it("completes the two-word skill by typing letters in sequence", () => {
    const system = new SkillSystem();
    let skill = system.syncWithCombo(createSkillState(3), 3);
    let completed = false;
    const text = skill.words.join("");

    for (const [index, char] of [...text].entries()) {
      const result = system.handleKey(skill, char);
      skill = result.skill;
      completed = result.completed;
    }

    expect(completed).toBe(true);
    expect(skill.usedSerial).toBe(1);
    expect(skill.status).toBe("completed");
  });

  it("starts skill typing without requiring Shift when skill is ready", () => {
    const system = new SkillSystem();
    const skill = system.syncWithCombo(createSkillState(3), 3);
    const firstSkillChar = skill.words.join("")[0];

    const result = system.handleKey(skill, firstSkillChar);

    expect(result.consumed).toBe(true);
    expect(result.skill.typed).toBe(firstSkillChar);
  });

  it("requires three fresh combo points after a skill is consumed", () => {
    const system = new SkillSystem();
    const consumed = system.consume(system.syncWithCombo(createSkillState(3), 3), 3);

    expect(system.syncWithCombo(consumed, 5).unlocked).toBe(false);
    expect(system.syncWithCombo(consumed, 6).unlocked).toBe(true);
  });
});
