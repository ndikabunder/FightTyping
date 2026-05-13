import { describe, expect, it } from "vitest";
import { CombatSystem } from "./CombatSystem";
import { createFighter } from "../simulation/createFighter";

describe("CombatSystem", () => {
  it("applies damage once during an active hit window", () => {
    const combat = new CombatSystem();
    let player = createFighter("player", 530, 590, 1);
    let enemy = createFighter("enemy", 690, 590, -1);

    player = combat.startAttack(player, "attack.punch.right");
    player = combat.updateFighter(player, 100);

    const first = combat.resolveHit(player, enemy, 100);
    const second = combat.resolveHit(first.attacker, first.defender, 120);

    expect(first.hit?.damage).toBe(8);
    expect(first.defender.hp).toBe(92);
    expect(second.hit).toBeNull();
    expect(second.defender.hp).toBe(92);
  });

  it("keeps defender close enough for next punch after knockback", () => {
    const combat = new CombatSystem();
    let player = createFighter("player", 530, 590, 1);
    let enemy = createFighter("enemy", 690, 590, -1);

    for (let i = 0; i < 3; i += 1) {
      player = combat.startAttack(player, "attack.punch.right");
      player = combat.updateFighter(player, 100);
      const result = combat.resolveHit(player, enemy, 100 + i);
      expect(result.hit).not.toBeNull();

      player = {
        ...result.attacker,
        state: "idle",
        stateElapsedMs: 0,
        activeAttackId: null,
        hasHitThisAttack: false
      };
      enemy = combat.updateFighter(result.defender, 420);
    }

    expect(enemy.hp).toBe(76);
  });

  it("pushes hit defenders backward over hitstun instead of snapping instantly", () => {
    const combat = new CombatSystem();
    let player = createFighter("player", 530, 590, 1);
    const enemy = createFighter("enemy", 690, 590, -1);

    player = combat.startAttack(player, "attack.kick.right");
    player = combat.updateFighter(player, 180);

    const result = combat.resolveHit(player, enemy, 180);
    const impactX = result.defender.position.x;
    const sliding = combat.updateFighter(result.defender, 80);
    const settled = combat.updateFighter(sliding, 420);

    expect(result.hit).not.toBeNull();
    expect(result.defender.position.x).toBe(impactX);
    expect(result.defender.velocity.x).toBeGreaterThan(0);
    expect(sliding.position.x).toBeGreaterThan(impactX);
    expect(settled.velocity.x).toBe(0);
    expect(settled.state).toBe("idle");
  });
});
