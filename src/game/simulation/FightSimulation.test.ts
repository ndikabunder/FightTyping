import { afterEach, describe, expect, it, vi } from "vitest";
import { FightSimulation } from "./FightSimulation";
import { countdownRules, enemySkillRules, fighterHome } from "../content/fightRules";
import { attacks } from "../content/attacks";

describe("FightSimulation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function skipToFighting(sim: FightSimulation) {
    sim.handleKey(" ", 0);
    sim.update(countdownRules.totalMs, countdownRules.totalMs);
  }

  it("returns player to home position after dodge window", () => {
    const sim = new FightSimulation();
    skipToFighting(sim);
    const dodge = sim.getSnapshot().dodgePrompt?.text;
    expect(dodge).toBeTruthy();

    for (const char of dodge!) {
      sim.handleKey(char, 2000);
    }

    const dodgedX = sim.getSnapshot().player.position.x;
    expect(dodgedX).toBeLessThan(fighterHome.playerX);

    sim.update(500, 2500);
    expect(sim.getSnapshot().player.position.x).toBe(fighterHome.playerX);
    expect(sim.getSnapshot().player.state).toBe("idle");
  });

  it("advances enemy cooldown smoothly while fighting", () => {
    const sim = new FightSimulation();
    skipToFighting(sim);
    sim.update(100, 1900);
    const first = sim.getSnapshot().enemyAttackClockMs;
    sim.update(100, 2000);
    const second = sim.getSnapshot().enemyAttackClockMs;

    expect(first).toBeGreaterThan(0);
    expect(second).toBeGreaterThan(first);
  });

  it("tracks combo outside typing metrics and resets it on wrong input", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const sim = new FightSimulation();
    skipToFighting(sim);
    const prompt = sim.getSnapshot().prompts[0];

    for (const char of prompt.text) {
      sim.handleKey(char, 2000);
    }

    const comboGain = attacks[prompt.actionId].effect?.comboGain ?? 1;
    expect(sim.getSnapshot().combo.count).toBe(comboGain);
    expect(sim.getSnapshot().combo.best).toBe(comboGain);
    expect(sim.getSnapshot().combo.event).toBe("gain");

    sim.handleKey("z", 2200);

    expect(sim.getSnapshot().combo.count).toBe(0);
    expect(sim.getSnapshot().combo.best).toBe(comboGain);
    expect(sim.getSnapshot().combo.event).toBe("break");
  });

  it("gives left punch extra combo and left kick delays enemy pressure", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const sim = new FightSimulation();
    skipToFighting(sim);

    const leftPunch = sim.getSnapshot().prompts.find((prompt) => prompt.actionId === "attack.punch.left");
    expect(leftPunch).toBeTruthy();
    for (const char of leftPunch!.text) {
      sim.handleKey(char, 2000);
    }

    expect(sim.getSnapshot().combo.count).toBe(2);

    sim.update(1200, 3200);
    const beforeKickClock = sim.getSnapshot().enemyAttackClockMs;
    const leftKick = sim.getSnapshot().prompts.find((prompt) => prompt.actionId === "attack.kick.left");
    expect(leftKick).toBeTruthy();
    for (const char of leftKick!.text) {
      sim.handleKey(char, 3300);
    }
    advanceUntilImpact(sim, 3300);

    expect(sim.getSnapshot().lastHit?.attackId).toBe("attack.kick.left");
    expect(sim.getSnapshot().enemyAttackClockMs).toBeLessThan(beforeKickClock + 520);
  });

  it("keeps player forward until the strike animation finishes, then returns home", () => {
    const sim = new FightSimulation();
    skipToFighting(sim);
    const prompt = sim.getSnapshot().prompts[0];

    for (const char of prompt.text) {
      sim.handleKey(char, 2000);
    }

    expect(sim.getSnapshot().player.position.x).toBe(fighterHome.playerX);

    sim.update(60, 2060);
    expect(sim.getSnapshot().player.position.x).toBeGreaterThan(fighterHome.playerX);
    expect(sim.getSnapshot().player.position.x).toBeLessThan(760);

    sim.update(500, 2560);
    expect(sim.getSnapshot().player.position.x).toBeGreaterThan(fighterHome.playerX);
    expect(sim.getSnapshot().player.state).toBe("attack_recovery");

    sim.update(900, 3460);
    expect(sim.getSnapshot().player.position.x).toBe(fighterHome.playerX);
    expect(sim.getSnapshot().player.state).toBe("idle");
  });

  it("varies enemy attacks and keeps enemy forward until its strike animation finishes", () => {
    const sim = new FightSimulation();
    skipToFighting(sim);

    sim.update(5600, 7400);
    expect(sim.getSnapshot().enemy.visualActionId).toBe("attack.punch.right");
    sim.update(80, 7480);
    expect(sim.getSnapshot().enemy.position.x).toBeLessThan(fighterHome.enemyX);
    expect(sim.getSnapshot().enemy.position.x).toBeGreaterThan(520);

    sim.update(600, 8000);
    expect(sim.getSnapshot().enemy.position.x).toBeLessThan(fighterHome.enemyX);
    expect(sim.getSnapshot().enemy.state).toBe("attack_recovery");

    sim.update(900, 8900);
    expect(sim.getSnapshot().enemy.position.x).toBe(fighterHome.enemyX);
    expect(sim.getSnapshot().enemy.state).toBe("idle");

    sim.update(5600, 14500);
    expect(sim.getSnapshot().enemy.visualActionId).toBe("attack.punch.left");
  });

  it("starts on level data with easy prompts and can advance to the next level", () => {
    const sim = new FightSimulation();
    expect(sim.getSnapshot().level.id).toBe(1);
    expect(sim.getSnapshot().enemy.maxHp).toBe(80);
    expect(sim.getSnapshot().enemyAttackEveryMs).toBe(5600);

    sim.nextLevel();

    expect(sim.getSnapshot().level.id).toBe(2);
    expect(sim.getSnapshot().enemy.maxHp).toBe(95);
    expect(sim.getSnapshot().enemyAttackEveryMs).toBe(4700);
  });

  it("does not change levels from number keys", () => {
    const sim = new FightSimulation();

    sim.handleKey("7", 1000);
    sim.handleKey("0", 1000);

    expect(sim.getSnapshot().level.id).toBe(1);
  });

  it("applies archetype pacing and tracks level objectives", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const sim = new FightSimulation();
    sim.setLevel(7);
    skipToFighting(sim);

    expect(sim.getSnapshot().enemyAttackEveryMs).toBe(Math.round(3200 * 0.82));
    expect(sim.getSnapshot().level.objectiveProgress.label).toBe("Combo x8");

    let guard = 0;
    while (!sim.getSnapshot().level.objectiveProgress.completed && guard < 8) {
      const nowMs = 2000 + guard * 2100;
      sim.update(0, nowMs);
      const prompt = sim.getSnapshot().prompts.find((p) => p.status !== "cooldown")!;
      for (const char of prompt.text) {
        sim.handleKey(char, nowMs);
      }
      guard += 1;
    }

    sim.update(0, 2000 + guard * 2100);

    expect(sim.getSnapshot().level.objectiveProgress.completed).toBe(true);
    expect(sim.getSnapshot().level.objectiveProgress.current).toBe(8);
  });

  it("unlocks skill from level 3 after combo 3 and applies double damage", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const sim = new FightSimulation();
    sim.setLevel(3);
    skipToFighting(sim);

    let guard = 0;
    while (!sim.getSnapshot().skill.unlocked && guard < 6) {
      const nowMs = 2000 + guard * 2100;
      sim.update(0, nowMs);
      const prompt = sim.getSnapshot().prompts.find((p) => p.status !== "cooldown")!;
      for (const char of prompt.text) {
        sim.handleKey(char, nowMs);
      }
      guard += 1;
    }

    expect(sim.getSnapshot().skill.available).toBe(true);
    expect(sim.getSnapshot().skill.unlocked).toBe(true);
    expect(sim.getSnapshot().skill.progress).toBe(1);

    const skillText = sim.getSnapshot().skill.words.join("");
    for (const char of skillText) {
      sim.handleKey(char, 2600);
    }

    expect(sim.getSnapshot().skill.unlocked).toBe(false);
    expect(sim.getSnapshot().skill.progress).toBe(0);

    sim.update(220, 2820);

    expect(sim.getSnapshot().lastHit?.damage).toBe(30);
  });

  it("enables enemy skill on level 6 with triple normal cooldown and double damage", () => {
    const sim = new FightSimulation();
    sim.setLevel(6);
    skipToFighting(sim);

    expect(sim.getSnapshot().enemySkill.available).toBe(true);
    expect(sim.getSnapshot().enemySkill.cooldownMs).toBe(Math.round(3600 * 0.82 * enemySkillRules.cooldownMultiplier));

    const enemySkillCooldownMs = sim.getSnapshot().enemySkill.cooldownMs;
    sim.update(enemySkillCooldownMs, countdownRules.totalMs + enemySkillCooldownMs);

    expect(sim.getSnapshot().enemySkill.usedSerial).toBe(1);
    expect(sim.getSnapshot().enemySkill.clockMs).toBe(0);
    expect(sim.getSnapshot().enemy.visualActionId).toBe("attack.kick.left");

    sim.update(220, 2020 + enemySkillCooldownMs);

    expect(sim.getSnapshot().lastHit?.attackerId).toBe("enemy");
    expect(sim.getSnapshot().lastHit?.damage).toBe(21);
  });

  it("turns enemy KO into defeat when the level quest is unfinished", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const sim = new FightSimulation();
    sim.setLevel(1);
    skipToFighting(sim);

    let guard = 0;
    while (sim.getSnapshot().roundState === "fighting" && guard < 20) {
      const nowMs = 2200 + guard * 2200;
      sim.update(0, nowMs);
      const prompt = sim.getSnapshot().prompts.find((candidate) => candidate.status !== "cooldown" && candidate.actionId === "attack.kick.right");
      if (!prompt) { guard += 1; continue; }
      for (const char of prompt.text) {
        sim.handleKey(char, nowMs);
      }
      advanceUntilImpact(sim, nowMs);
      sim.update(380, nowMs + 400);
      guard += 1;
    }

    const snapshot = sim.getSnapshot();
    expect(snapshot.enemy.hp).toBeLessThanOrEqual(0);
    expect(snapshot.level.objectiveProgress.completed).toBe(false);
    expect(snapshot.roundState).toBe("lost");
    expect(snapshot.feedback?.label).toBe("Quest Failed");
  });

  it("resets partial typing progress when an enemy hit interrupts the player", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const sim = new FightSimulation();
    skipToFighting(sim);
    const prompt = sim.getSnapshot().prompts[0];

    sim.handleKey(prompt.text[0], 2000);
    expect(sim.getSnapshot().prompts[0].typed).toBe(prompt.text[0]);

    forceEnemyHit(sim, 2200);

    expect(sim.getSnapshot().lastHit?.attackerId).toBe("enemy");
    expect(sim.getSnapshot().prompts.every((candidate) => candidate.typed === "" && candidate.status === "idle")).toBe(true);
    expect(sim.getSnapshot().dodgePrompt?.typed).toBe("");
  });

  it("breaks combo when an enemy hit lands", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const sim = new FightSimulation();
    skipToFighting(sim);
    const prompt = sim.getSnapshot().prompts[0];

    for (const char of prompt.text) {
      sim.handleKey(char, 2000);
    }

    expect(sim.getSnapshot().combo.count).toBeGreaterThan(0);
    sim.update(900, 2900);
    forceEnemyHit(sim, 3100);

    expect(sim.getSnapshot().lastHit?.attackerId).toBe("enemy");
    expect(sim.getSnapshot().combo.count).toBe(0);
    expect(sim.getSnapshot().combo.event).toBe("break");
  });

  it("lets enemy dodge at most once in a four player attack window", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const sim = new FightSimulation();
    skipToFighting(sim);

    const completeAvailablePrompt = (nowMs: number) => {
      sim.update(0, nowMs);
      const prompt = sim.getSnapshot().prompts.find((p) => p.status !== "cooldown")!;
      for (const char of prompt.text) {
        sim.handleKey(char, nowMs);
      }
    };

    completeAvailablePrompt(2000);
    advanceUntilImpact(sim, 2160);

    expect(sim.getSnapshot().feedback?.label).toBe("Enemy Evade");
    expect(sim.getSnapshot().lastHit).toBeNull();
    expect(sim.getSnapshot().enemy.hp).toBe(80);

    sim.update(2200, 4360);

    completeAvailablePrompt(4500);
    advanceUntilImpact(sim, 4660);

    expect(sim.getSnapshot().lastHit?.attackerId).toBe("player");
    expect(sim.getSnapshot().enemy.hp).toBeLessThan(80);
  });
});

function forceEnemyHit(sim: FightSimulation, startMs: number) {
  sim.update(5200, startMs + 5200);
  for (let elapsed = 20; elapsed <= 1200; elapsed += 20) {
    sim.update(20, startMs + 5200 + elapsed);
    const snapshot = sim.getSnapshot();
    if (snapshot.lastHit?.attackerId === "enemy") {
      return;
    }
  }
}

function advanceUntilImpact(sim: FightSimulation, startMs: number) {
  for (let elapsed = 20; elapsed <= 1200; elapsed += 20) {
    sim.update(20, startMs + elapsed);
    const snapshot = sim.getSnapshot();
    if (snapshot.lastHit || (snapshot.feedback?.label === "Enemy Evade" && snapshot.feedback.atMs >= startMs)) {
      return;
    }
  }
}
