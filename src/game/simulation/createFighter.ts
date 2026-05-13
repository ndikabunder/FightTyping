import type { Fighter, FighterId, Facing } from "../types";

export function createFighter(id: FighterId, x: number, y: number, facing: Facing): Fighter {
  return {
    id,
    hp: id === "player" ? 120 : 100,
    maxHp: id === "player" ? 120 : 100,
    position: { x, y },
    homeX: x,
    velocity: { x: 0, y: 0 },
    facing,
    state: "idle",
    stateElapsedMs: 0,
    activeAttackId: null,
    hasHitThisAttack: false,
    visualActionId: null,
    visualActionSerial: 0,
    visualLockMs: 0,
    hurtbox: { x: -44, y: -190, w: 88, h: 190 }
  };
}
