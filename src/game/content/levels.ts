import type { ActionId } from "../types";

export type WordPoolTier = "easy" | "normal" | "hard";

export type EnemyArchetypeId = "basicStriker" | "kicker" | "tempoFighter" | "heavyFighter" | "trickster" | "boss";

export type ArenaTheme = "cyanGrid" | "violetRing" | "redPressure" | "goldFinale";

export interface EnemyArchetype {
  id: EnemyArchetypeId;
  name: string;
  attacks: ActionId[];
  damageMultiplier: number;
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
    damageMultiplier: 0.85
  },
  kicker: {
    id: "kicker",
    name: "Kicker",
    attacks: ["attack.kick.right", "attack.punch.right", "attack.kick.left"],
    damageMultiplier: 1
  },
  tempoFighter: {
    id: "tempoFighter",
    name: "Tempo Fighter",
    attacks: ["attack.punch.right", "attack.punch.left", "attack.kick.left", "attack.punch.right"],
    damageMultiplier: 0.95
  },
  heavyFighter: {
    id: "heavyFighter",
    name: "Heavy Fighter",
    attacks: ["attack.kick.right", "attack.punch.left", "attack.kick.left"],
    damageMultiplier: 1.22
  },
  trickster: {
    id: "trickster",
    name: "Trickster",
    attacks: ["attack.punch.left", "attack.kick.left", "attack.punch.right", "attack.kick.right"],
    damageMultiplier: 1.05
  },
  boss: {
    id: "boss",
    name: "Neon Champion",
    attacks: ["attack.punch.right", "attack.kick.right", "attack.punch.left", "attack.kick.left"],
    damageMultiplier: 1.18
  }
};

export const levels: LevelDefinition[] = [
  { id: 1, name: "Warm-Up Guard", focus: "Tutorial tangan", enemyArchetype: "basicStriker", enemyHp: 80, enemyCooldownMs: 5200, enemyTelegraphMs: 1500, wordPoolTier: "easy", objective: "Gunakan tangan kanan dan kiri untuk menang.", arenaTheme: "cyanGrid" },
  { id: 2, name: "Twin Jab", focus: "Dua tangan", enemyArchetype: "basicStriker", enemyHp: 95, enemyCooldownMs: 4700, enemyTelegraphMs: 1400, wordPoolTier: "easy", objective: "Bangun combo tanpa banyak salah ketik.", arenaTheme: "cyanGrid" },
  { id: 3, name: "First Kick", focus: "Perkenalan kaki", enemyArchetype: "kicker", enemyHp: 110, enemyCooldownMs: 4300, enemyTelegraphMs: 1300, wordPoolTier: "normal", objective: "Gunakan minimal satu tendangan.", arenaTheme: "violetRing" },
  { id: 4, name: "Backstep Lesson", focus: "Dodge pertama", enemyArchetype: "kicker", enemyHp: 120, enemyCooldownMs: 4000, enemyTelegraphMs: 1200, wordPoolTier: "normal", objective: "Hindari serangan enemy dengan prompt Mundur.", arenaTheme: "violetRing" },
  { id: 5, name: "Heavy Check", focus: "Timing dodge", enemyArchetype: "heavyFighter", enemyHp: 160, enemyCooldownMs: 4200, enemyTelegraphMs: 1250, wordPoolTier: "normal", objective: "Jangan tukar damage dengan heavy attack.", arenaTheme: "redPressure" },
  { id: 6, name: "Tempo Break", focus: "Kecepatan typing", enemyArchetype: "tempoFighter", enemyHp: 130, enemyCooldownMs: 3500, enemyTelegraphMs: 1000, wordPoolTier: "normal", objective: "Jaga tempo dan combo.", arenaTheme: "cyanGrid" },
  { id: 7, name: "Priority Drill", focus: "Prioritas prompt", enemyArchetype: "tempoFighter", enemyHp: 145, enemyCooldownMs: 3200, enemyTelegraphMs: 900, wordPoolTier: "normal", objective: "Pilih prompt pendek saat enemy hampir menyerang.", arenaTheme: "violetRing" },
  { id: 8, name: "Mirror Focus", focus: "Fokus dan akurasi", enemyArchetype: "trickster", enemyHp: 150, enemyCooldownMs: 3400, enemyTelegraphMs: 850, wordPoolTier: "hard", objective: "Jangan terkecoh prompt yang mirip.", arenaTheme: "redPressure" },
  { id: 9, name: "Pressure Mix", focus: "Tekanan campuran", enemyArchetype: "heavyFighter", enemyHp: 190, enemyCooldownMs: 3100, enemyTelegraphMs: 800, wordPoolTier: "hard", objective: "Dodge heavy hit, punish dengan kick.", arenaTheme: "redPressure" },
  { id: 10, name: "Neon Champion", focus: "Ujian penuh", enemyArchetype: "boss", enemyHp: 240, enemyCooldownMs: 3600, enemyTelegraphMs: 1100, wordPoolTier: "hard", objective: "Kalahkan boss 3 phase.", arenaTheme: "goldFinale" }
];

export function getLevel(index: number) {
  return levels[Math.max(0, Math.min(levels.length - 1, index))];
}
