import type { ActionId } from "../types";

export type WordPoolTier =
  | "level1"
  | "level2"
  | "level3"
  | "level4"
  | "level5"
  | "level6"
  | "level7"
  | "level8"
  | "level9"
  | "level10";

export type EnemyArchetypeId = "basicStriker" | "kicker" | "tempoFighter" | "heavyFighter" | "trickster" | "boss";

export type ArenaTheme = "cyanGrid" | "violetRing" | "redPressure" | "goldFinale";

export interface EnemyArchetype {
  id: EnemyArchetypeId;
  name: string;
  attacks: ActionId[];
  damageMultiplier: number;
  cooldownMultiplier: number;
  dodgeChance: number;
  feintChance: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  focus: string;
  enemyArchetype: EnemyArchetypeId;
  enemyHp: number;
  enemyCooldownMs: number;
  enemyTelegraphMs: number;
  wordPoolTier: WordPoolTier;
  objective: string;
  arenaTheme: ArenaTheme;
}

export const enemyArchetypes: Record<EnemyArchetypeId, EnemyArchetype> = {
  basicStriker: {
    id: "basicStriker",
    name: "Basic Striker",
    attacks: ["attack.punch.right", "attack.punch.left"],
    damageMultiplier: 0.85,
    cooldownMultiplier: 1,
    dodgeChance: 0.12,
    feintChance: 0
  },
  kicker: {
    id: "kicker",
    name: "Kicker",
    attacks: ["attack.kick.right", "attack.punch.right", "attack.kick.left"],
    damageMultiplier: 1,
    cooldownMultiplier: 1,
    dodgeChance: 0.18,
    feintChance: 0
  },
  tempoFighter: {
    id: "tempoFighter",
    name: "Tempo Fighter",
    attacks: ["attack.punch.right", "attack.punch.left", "attack.kick.left", "attack.punch.right"],
    damageMultiplier: 0.82,
    cooldownMultiplier: 0.82,
    dodgeChance: 0.2,
    feintChance: 0
  },
  heavyFighter: {
    id: "heavyFighter",
    name: "Heavy Fighter",
    attacks: ["attack.kick.right", "attack.punch.left", "attack.kick.left"],
    damageMultiplier: 1.35,
    cooldownMultiplier: 1.22,
    dodgeChance: 0.08,
    feintChance: 0
  },
  trickster: {
    id: "trickster",
    name: "Trickster",
    attacks: ["attack.punch.left", "attack.kick.left", "attack.punch.right", "attack.kick.right"],
    damageMultiplier: 0.95,
    cooldownMultiplier: 0.96,
    dodgeChance: 0.42,
    feintChance: 0.22
  },
  boss: {
    id: "boss",
    name: "Neon Champion",
    attacks: ["attack.punch.right", "attack.kick.right", "attack.punch.left", "attack.kick.left"],
    damageMultiplier: 1.18,
    cooldownMultiplier: 1,
    dodgeChance: 0.28,
    feintChance: 0.08
  }
};

export const levels: LevelDefinition[] = [
  { id: 1, name: "Warm-Up Guard", focus: "Hand tutorial", enemyArchetype: "basicStriker", enemyHp: 80, enemyCooldownMs: 5200, enemyTelegraphMs: 1500, wordPoolTier: "level1", objective: "Hit both punches.", arenaTheme: "cyanGrid" },
  { id: 2, name: "Twin Jab", focus: "Both hands", enemyArchetype: "basicStriker", enemyHp: 95, enemyCooldownMs: 4700, enemyTelegraphMs: 1400, wordPoolTier: "level2", objective: "Keep combo x5.", arenaTheme: "cyanGrid" },
  { id: 3, name: "First Kick", focus: "Leg intro", enemyArchetype: "kicker", enemyHp: 110, enemyCooldownMs: 4300, enemyTelegraphMs: 1300, wordPoolTier: "level3", objective: "Keep combo x3.", arenaTheme: "violetRing" },
  { id: 4, name: "Backstep Lesson", focus: "First dodge", enemyArchetype: "kicker", enemyHp: 120, enemyCooldownMs: 4000, enemyTelegraphMs: 1200, wordPoolTier: "level4", objective: "Dodge 2 attacks.", arenaTheme: "violetRing" },
  { id: 5, name: "Heavy Check", focus: "Timing dodge", enemyArchetype: "heavyFighter", enemyHp: 160, enemyCooldownMs: 4200, enemyTelegraphMs: 1250, wordPoolTier: "level5", objective: "Use all limbs.", arenaTheme: "redPressure" },
  { id: 6, name: "Tempo Break", focus: "Typing speed", enemyArchetype: "tempoFighter", enemyHp: 130, enemyCooldownMs: 3500, enemyTelegraphMs: 1000, wordPoolTier: "level6", objective: "Trigger Neon Break.", arenaTheme: "cyanGrid" },
  { id: 7, name: "Priority Drill", focus: "Prompt priority", enemyArchetype: "tempoFighter", enemyHp: 145, enemyCooldownMs: 3200, enemyTelegraphMs: 900, wordPoolTier: "level7", objective: "Keep combo x8.", arenaTheme: "violetRing" },
  { id: 8, name: "Mirror Focus", focus: "Focus and accuracy", enemyArchetype: "trickster", enemyHp: 150, enemyCooldownMs: 3400, enemyTelegraphMs: 850, wordPoolTier: "level8", objective: "Avoid 3 misses.", arenaTheme: "redPressure" },
  { id: 9, name: "Pressure Mix", focus: "Mixed pressure", enemyArchetype: "heavyFighter", enemyHp: 190, enemyCooldownMs: 3100, enemyTelegraphMs: 800, wordPoolTier: "level9", objective: "Dodge 2 heavy hits.", arenaTheme: "redPressure" },
  { id: 10, name: "Neon Champion", focus: "Final exam", enemyArchetype: "boss", enemyHp: 240, enemyCooldownMs: 3600, enemyTelegraphMs: 1100, wordPoolTier: "level10", objective: "Reach phase 3.", arenaTheme: "goldFinale" }
];

export function getLevel(index: number) {
  return levels[Math.max(0, Math.min(levels.length - 1, index))];
}
