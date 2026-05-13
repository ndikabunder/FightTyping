import { describe, expect, it } from "vitest";
import { FightSimulation } from "./FightSimulation";

describe("FightSimulation", () => {
  it("returns player to home position after dodge window", () => {
    const sim = new FightSimulation();
    sim.update(1800, 1800);
    const dodge = sim.getSnapshot().dodgePrompt?.text;
    expect(dodge).toBeTruthy();

    for (const char of dodge!) {
      sim.handleKey(char, 2000);
    }

    const dodgedX = sim.getSnapshot().player.position.x;
    expect(dodgedX).toBeLessThan(430);

    sim.update(500, 2500);
    expect(sim.getSnapshot().player.position.x).toBe(430);
    expect(sim.getSnapshot().player.state).toBe("idle");
  });

  it("advances enemy cooldown smoothly while fighting", () => {
    const sim = new FightSimulation();
    sim.update(1800, 1800);
    sim.update(100, 1900);
    const first = sim.getSnapshot().enemyAttackClockMs;
    sim.update(100, 2000);
    const second = sim.getSnapshot().enemyAttackClockMs;

    expect(first).toBeGreaterThan(0);
    expect(second).toBeGreaterThan(first);
  });

  it("keeps player forward until the strike animation finishes, then returns home", () => {
    const sim = new FightSimulation();
    sim.update(1800, 1800);
    const prompt = sim.getSnapshot().prompts[0];

    for (const char of prompt.text) {
      sim.handleKey(char, 2000);
    }

    expect(sim.getSnapshot().player.position.x).toBe(430);

    sim.update(60, 2060);
    expect(sim.getSnapshot().player.position.x).toBeGreaterThan(430);
    expect(sim.getSnapshot().player.position.x).toBeLessThan(760);

    sim.update(500, 2560);
    expect(sim.getSnapshot().player.position.x).toBeGreaterThan(430);
    expect(sim.getSnapshot().player.state).toBe("attack_recovery");

    sim.update(900, 3460);
    expect(sim.getSnapshot().player.position.x).toBe(430);
    expect(sim.getSnapshot().player.state).toBe("idle");
  });

  it("varies enemy attacks and keeps enemy forward until its strike animation finishes", () => {
    const sim = new FightSimulation();
    sim.update(1800, 1800);

    sim.update(5200, 7000);
    expect(sim.getSnapshot().enemy.visualActionId).toBe("attack.punch.right");
    sim.update(80, 7080);
    expect(sim.getSnapshot().enemy.position.x).toBeLessThan(850);
    expect(sim.getSnapshot().enemy.position.x).toBeGreaterThan(520);

    sim.update(600, 7600);
    expect(sim.getSnapshot().enemy.position.x).toBeLessThan(850);
    expect(sim.getSnapshot().enemy.state).toBe("attack_recovery");

    sim.update(900, 8500);
    expect(sim.getSnapshot().enemy.position.x).toBe(850);
    expect(sim.getSnapshot().enemy.state).toBe("idle");

    sim.update(5200, 13700);
    expect(sim.getSnapshot().enemy.visualActionId).toBe("attack.punch.left");
  });

  it("starts on level data with easy prompts and can advance to the next level", () => {
    const sim = new FightSimulation();
    expect(sim.getSnapshot().level.id).toBe(1);
    expect(sim.getSnapshot().enemy.maxHp).toBe(80);
    expect(sim.getSnapshot().enemyAttackEveryMs).toBe(5200);

    sim.nextLevel();

    expect(sim.getSnapshot().level.id).toBe(2);
    expect(sim.getSnapshot().enemy.maxHp).toBe(95);
    expect(sim.getSnapshot().enemyAttackEveryMs).toBe(4700);
  });
});
