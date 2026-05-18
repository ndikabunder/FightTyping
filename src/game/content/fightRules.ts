export const fighterHome = {
  playerX: 430,
  enemyX: 850,
  y: 590
} as const;

export const attackMovement = {
  spacing: 118,
  maxDash: 300,
  visualLockMs: 720
} as const;

export const dodgeRules = {
  playerBackstep: 94,
  playerMinX: 330,
  enemyBackstep: 132,
  enemyMaxX: 980,
  returnMs: 500,
  returnDelayPct: 0.75,
  returnEase: 0.35
} as const;

export const enemyDodgeRules = {
  attacksPerWindow: 4
} as const;

export const enemySkillRules = {
  unlockLevel: 6,
  cooldownMultiplier: 3,
  telegraphMultiplier: 1.25,
  damageMultiplier: 2,
  attackOffset: 2
} as const;

export const playerSkillRules = {
  damageMultiplier: 2,
  enemyCooldownResetMs: 0,
  enemySkillResetMs: 0,
  label: "Neon Break"
} as const;

export const pacingRules = {
  wave2Ms: 30000,
  wave3Ms: 60000,
  wave2CooldownMultiplier: 0.92,
  wave3CooldownMultiplier: 0.84,
  bossPhase2CooldownMultiplier: 0.9,
  bossPhase3CooldownMultiplier: 0.78,
  bossPhase3DamageMultiplier: 1.12
} as const;

export const combatRules = {
  minX: 250,
  maxX: 1030,
  maxDuelSpacing: 172,
  minDuelSpacing: 92,
  hitstunSlideMs: 420
} as const;

export const hitStopRules = {
  punchMs: 45,
  kickMs: 68
} as const;

export const scoringRules = {
  promptScore: 125,
  currentComboScore: 18,
  bestComboScore: 35,
  comboBonusPerPrompt: 12,
  maxComboBonusPerPrompt: 260,
  dodgeScore: 90,
  damagePenalty: 9,
  clearBonus: 9000,
  clearBonusTimeDivisor: 10,
  objectiveBonus: 650
} as const;
