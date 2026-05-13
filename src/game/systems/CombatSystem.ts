import { attacks } from "../content/attacks";
import { hitboxes } from "../content/hitboxes";
import type { ActionId, Fighter, HitEvent, Rect } from "../types";

const MIN_X = 250;
const MAX_X = 1030;
const MAX_DUEL_SPACING = 172;
const HITSTUN_SLIDE_MS = 420;

export class CombatSystem {
  getAttack(actionId: ActionId) {
    return attacks[actionId];
  }

  startAttack(fighter: Fighter, actionId: ActionId): Fighter {
    if (!canStartAttack(fighter)) {
      return fighter;
    }

    return {
      ...fighter,
      state: "attack_startup" as const,
      stateElapsedMs: 0,
      activeAttackId: actionId,
      hasHitThisAttack: false,
      velocity: { x: 0, y: 0 }
    };
  }

  updateFighter(fighter: Fighter, deltaMs: number): Fighter {
    if (fighter.state === "ko") {
      return fighter;
    }

    const elapsed = fighter.stateElapsedMs + deltaMs;

    if (fighter.state === "knockdown") {
      if (elapsed >= 520) {
        return { ...fighter, state: "idle", stateElapsedMs: 0 };
      }

      return { ...fighter, stateElapsedMs: elapsed };
    }

    if (fighter.state === "hitstun") {
      const nextX = fighter.position.x + fighter.velocity.x * (deltaMs / 1000);
      const decayedVelocity = fighter.velocity.x * 0.88;

      if (elapsed >= HITSTUN_SLIDE_MS) {
        return {
          ...fighter,
          position: { ...fighter.position, x: clamp(nextX, MIN_X, MAX_X) },
          velocity: { x: 0, y: 0 },
          state: "idle",
          stateElapsedMs: 0
        };
      }

      return {
        ...fighter,
        position: { ...fighter.position, x: clamp(nextX, MIN_X, MAX_X) },
        velocity: { x: Math.abs(decayedVelocity) < 2 ? 0 : decayedVelocity, y: 0 },
        stateElapsedMs: elapsed
      };
    }

    if (!fighter.activeAttackId) {
      return { ...fighter, stateElapsedMs: elapsed };
    }

    const attack = attacks[fighter.activeAttackId];
    const visualLockMs = Math.max(0, fighter.visualLockMs);

    if (elapsed >= attack.startupMs + attack.activeMs + visualLockMs + attack.recoveryMs) {
      return { ...fighter, state: "idle", stateElapsedMs: 0, activeAttackId: null, hasHitThisAttack: false, visualLockMs: 0 };
    }

    if (elapsed >= attack.startupMs + attack.activeMs) {
      return { ...fighter, state: "attack_recovery", stateElapsedMs: elapsed };
    }

    if (elapsed >= attack.startupMs) {
      return { ...fighter, state: "attack_active", stateElapsedMs: elapsed };
    }

    return { ...fighter, stateElapsedMs: elapsed };
  }

  resolveHit(attacker: Fighter, defender: Fighter, nowMs: number, damageMultiplier = 1): { attacker: Fighter; defender: Fighter; hit: HitEvent | null } {
    if (
      attacker.state !== "attack_active" ||
      !attacker.activeAttackId ||
      attacker.hasHitThisAttack ||
      defender.state === "ko" ||
      defender.state === "knockdown"
    ) {
      return { attacker, defender, hit: null };
    }

    const attack = attacks[attacker.activeAttackId];
    const windows = hitboxes[attacker.activeAttackId].activeWindows;
    const localTime = attacker.stateElapsedMs;
    const activeWindow = windows.find((window) => localTime >= window.fromMs && localTime <= window.toMs);

    if (!activeWindow) {
      return { attacker, defender, hit: null };
    }

    const attackBox = toWorldBox(activeWindow.box, attacker);
    const hurtbox = toWorldBox(defender.hurtbox, defender);

    if (!intersects(attackBox, hurtbox)) {
      return { attacker, defender, hit: null };
    }

    const damage = Math.max(1, Math.round(attack.damage * damageMultiplier));
    const nextHp = Math.max(0, defender.hp - damage);
    const ko = nextHp <= 0;
    const knockDirection = attacker.facing;
    const hit: HitEvent = {
      attackerId: attacker.id,
      defenderId: defender.id,
      attackId: attack.id,
      damage,
      impact: {
        x: attackBox.x + attackBox.w / 2,
        y: attackBox.y + attackBox.h / 2
      },
      atMs: nowMs
    };

    const nextAttacker = { ...attacker, hasHitThisAttack: true };
    const rawTargetX = defender.position.x + knockDirection * attack.knockback;
    const targetX = clampToDuelSpacing(rawTargetX, nextAttacker.position.x, knockDirection);
    const knockbackVelocityX = ((targetX - defender.position.x) / HITSTUN_SLIDE_MS) * 1000;

    return {
      attacker: nextAttacker,
      defender: {
        ...defender,
        hp: nextHp,
        state: ko ? "ko" : "hitstun",
        stateElapsedMs: 0,
        activeAttackId: null,
        hasHitThisAttack: false,
        velocity: { x: knockbackVelocityX, y: 0 }
      },
      hit
    };
  }
}

export function toWorldBox(box: Rect, fighter: Fighter): Rect {
  const x = fighter.facing === 1 ? fighter.position.x + box.x : fighter.position.x - box.x - box.w;
  return {
    x,
    y: fighter.position.y + box.y,
    w: box.w,
    h: box.h
  };
}

export function intersects(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function canStartAttack(fighter: Fighter) {
  return fighter.state === "idle" || fighter.state === "typing";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clampToDuelSpacing(rawDefenderX: number, attackerX: number, knockDirection: number) {
  const arenaClamped = clamp(rawDefenderX, MIN_X, MAX_X);
  const maxX = attackerX + MAX_DUEL_SPACING;
  const minX = attackerX - MAX_DUEL_SPACING;

  if (knockDirection > 0) {
    return clamp(arenaClamped, attackerX + 92, maxX);
  }

  return clamp(arenaClamped, minX, attackerX - 92);
}
