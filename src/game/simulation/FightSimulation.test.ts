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

  it("tracks combo outside typing metrics and resets it on wrong input", () => {
    const sim = new FightSimulation();
    sim.update(1800, 1800);
    const prompt = sim.getSnapshot().prompts[0];

    for (const char of prompt.text) {
      sim.handleKey(char, 2000);
    }

    expect(sim.getSnapshot().combo.count).toBe(1);
    expect(sim.getSnapshot().combo.best).toBe(1);
    expect(sim.getSnapshot().combo.event).toBe("gain");

    sim.handleKey("z", 2200);

    expect(sim.getSnapshot().combo.count).toBe(0);
    expect(sim.getSnapshot().combo.best).toBe(1);
    expect(sim.getSnapshot().combo.event).toBe("break");
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

  it("unlocks skill from level 3 after combo 3 and applies double damage", () => {
    const sim = new FightSimulation();
    sim.setLevel(3);
    sim.update(1800, 1800);

    for (let i = 0; i < 3; i += 1) {
      const prompt = sim.getSnapshot().prompts[0];
      for (const char of prompt.text) {
        sim.handleKey(char, 2000 + i * 120);
      }
    }

    expect(sim.getSnapshot().skill.available).toBe(true);
    expect(sim.getSnapshot().skill.unlocked).toBe(true);
    expect(sim.getSnapshot().skill.progress).toBe(1);

    const skillText = sim.getSnapshot().skill.words.join("");
    for (const [index, char] of [...skillText].entries()) {
      sim.handleKey(index === 0 ? char.toUpperCase() : char, 2600);
    }

    expect(sim.getSnapshot().skill.unlocked).toBe(false);
    expect(sim.getSnapshot().skill.progress).toBe(0);

    sim.update(220, 2820);

    expect(sim.getSnapshot().lastHit?.damage).toBe(30);
  });

  it("enables enemy skill on level 6 with 150 percent normal cooldown and double damage", () => {
    const sim = new FightSimulation();
    sim.setLevel(6);
    sim.update(1800, 1800);

    expect(sim.getSnapshot().enemySkill.available).toBe(true);
    expect(sim.getSnapshot().enemySkill.cooldownMs).toBe(5250);

    sim.update(5250, 7050);

    expect(sim.getSnapshot().enemySkill.usedSerial).toBe(1);
    expect(sim.getSnapshot().enemySkill.clockMs).toBe(0);
    expect(sim.getSnapshot().enemy.visualActionId).toBe("attack.kick.left");

    sim.update(220, 7270);

    expect(sim.getSnapshot().lastHit?.attackerId).toBe("enemy");
    expect(sim.getSnapshot().lastHit?.damage).toBe(25);
  });
});
