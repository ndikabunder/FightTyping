import { CombatSystem } from "../systems/CombatSystem";
import { ComboSystem, createComboState } from "../systems/ComboSystem";
import { enemyArchetypes, getLevel, levels } from "../content/levels";
import { PromptSystem } from "../systems/PromptSystem";
import { createSkillState, SkillSystem } from "../systems/SkillSystem";
import { createTypingMetrics, TypingSystem } from "../systems/TypingSystem";
import { createFighter } from "./createFighter";
import type { ActionId, CombatFeedback, EnemySkillState, GameSnapshot, HitEvent, LevelRuntimeState } from "../types";

export class FightSimulation {
  private static readonly PLAYER_HOME_X = 430;
  private static readonly ENEMY_HOME_X = 850;
  private static readonly ATTACK_SPACING = 118;
  private static readonly MAX_ATTACK_DASH = 300;
  private static readonly ATTACK_VISUAL_LOCK_MS = 720;
  private readonly promptSystem = new PromptSystem();
  private readonly typingSystem = new TypingSystem();
  private readonly combatSystem = new CombatSystem();
  private readonly comboSystem = new ComboSystem();
  private readonly skillSystem = new SkillSystem();
  private snapshot: GameSnapshot;
  private playerDamageMultiplier = 1;
  private enemySkillDamageMultiplier = 1;
  private enemyAttackClockMs = 0;
  private enemySkillClockMs = 0;
  private enemyAttackIndex = 0;
  private enemySkillIndex = 0;
  private hitStopMs = 0;
  private levelIndex = 0;

  constructor() {
    this.snapshot = this.createInitialSnapshot();
  }

  getSnapshot() {
    return cloneSnapshot(this.snapshot);
  }

  restart() {
    this.typingSystem.reset();
    this.playerDamageMultiplier = 1;
    this.enemySkillDamageMultiplier = 1;
    this.enemyAttackClockMs = 0;
    this.enemySkillClockMs = 0;
    this.enemyAttackIndex = 0;
    this.enemySkillIndex = 0;
    this.hitStopMs = 0;
    this.snapshot = this.createInitialSnapshot();
  }

  nextLevel() {
    this.levelIndex = (this.levelIndex + 1) % levels.length;
    this.restart();
  }

  setLevel(levelNumber: number) {
    this.levelIndex = Math.max(0, Math.min(levels.length - 1, levelNumber - 1));
    this.restart();
  }

  toggleDebug() {
    this.snapshot = { ...this.snapshot, debugEnabled: !this.snapshot.debugEnabled };
  }

  togglePause() {
    if (this.snapshot.roundState === "paused") {
      this.snapshot = { ...this.snapshot, roundState: "fighting" };
      return;
    }
    if (this.snapshot.roundState === "fighting") {
      this.snapshot = { ...this.snapshot, roundState: "paused" };
    }
  }

  handleKey(key: string, nowMs: number): HitEvent | null {
    const lower = key.toLowerCase();

    if (lower === "r" && (this.snapshot.roundState === "won" || this.snapshot.roundState === "lost")) {
      this.restart();
      return null;
    }

    if (lower === "n" && this.snapshot.roundState === "won") {
      this.nextLevel();
      return null;
    }

    if (/^[0-9]$/.test(lower)) {
      this.setLevel(lower === "0" ? 10 : Number(lower));
      return null;
    }

    if (lower === "`") {
      this.toggleDebug();
      return null;
    }

    if (lower === "escape") {
      this.togglePause();
      return null;
    }

    if (this.snapshot.roundState !== "fighting") {
      return null;
    }

    const skillResult = this.skillSystem.handleKey(this.snapshot.skill, key, isSkillKey(key));
    if (skillResult.consumed) {
      this.snapshot = {
        ...this.snapshot,
        skill: skillResult.skill,
        player: skillResult.completed
          ? this.startSkillAttack()
          : { ...this.snapshot.player, state: this.snapshot.player.state === "idle" ? "typing" : this.snapshot.player.state },
        lastHit: null,
        feedback: skillResult.completed
          ? { kind: "skill", label: "Skill x2", atMs: nowMs }
          : skillResult.wrong
          ? { kind: "wrong", label: "Skill Miss", atMs: nowMs }
          : { kind: "correct", label: "Charge", atMs: nowMs }
      };

      if (skillResult.completed) {
        this.snapshot = {
          ...this.snapshot,
          skill: this.skillSystem.consume(this.snapshot.skill, this.snapshot.combo.count)
        };
        this.playerDamageMultiplier = 2;
      }

      return null;
    }

    const allPrompts = this.snapshot.dodgePrompt
      ? [...this.snapshot.prompts, this.snapshot.dodgePrompt]
      : this.snapshot.prompts;
    const result = this.typingSystem.handleKey(allPrompts, this.snapshot.metrics, key, nowMs);
    const prompts = result.prompts.filter((prompt) => prompt.kind === "attack");
    const dodgePrompt = result.prompts.find((prompt) => prompt.kind === "dodge") ?? null;
    const completedDodge = result.completedPrompt?.kind === "dodge";
    const completedAttack = result.completedPrompt?.kind === "attack";
    const combo = result.completedPrompt
      ? this.comboSystem.gain(this.snapshot.combo, nowMs)
      : result.wrong
      ? this.comboSystem.break(this.snapshot.combo, nowMs)
      : this.snapshot.combo;
    const skill = this.skillSystem.syncWithCombo(this.snapshot.skill, combo.count);
    const feedback = this.createTypingFeedback(result.wrong, completedDodge, completedAttack, nowMs);
    this.snapshot = {
      ...this.snapshot,
      prompts,
      dodgePrompt,
      metrics: completedDodge ? { ...result.metrics, dodgeSuccesses: result.metrics.dodgeSuccesses + 1 } : result.metrics,
      combo,
      skill,
      player: completedDodge
        ? this.performDodge()
        : result.completedPrompt
        ? this.startAttackWithDash(this.snapshot.player, this.snapshot.enemy.position.x, result.completedPrompt.actionId)
        : { ...this.snapshot.player, state: this.snapshot.player.state === "idle" ? "typing" : this.snapshot.player.state },
      lastHit: null,
      feedback
    };

    if (result.completedPrompt?.kind === "attack") {
      this.snapshot = {
        ...this.snapshot,
        prompts: this.promptSystem.replacePrompt(this.snapshot.prompts, result.completedPrompt.id, this.snapshot.level.wordPoolTier)
      };
    }

    if (completedDodge) {
      this.snapshot = {
        ...this.snapshot,
        dodgePrompt: this.promptSystem.createDodgePrompt(this.snapshot.prompts.map((prompt) => prompt.text))
      };
    }

    if (result.wrong) {
      this.enemyAttackClockMs += 240;
    }

    return null;
  }

  update(deltaMs: number, nowMs: number): HitEvent | null {
    if (this.snapshot.roundState === "paused" || this.snapshot.roundState === "won" || this.snapshot.roundState === "lost") {
      return null;
    }

    if (this.hitStopMs > 0) {
      this.hitStopMs = Math.max(0, this.hitStopMs - deltaMs);
      return null;
    }

    if (this.snapshot.roundState === "countdown") {
      const countdownMs = Math.max(0, this.snapshot.countdownMs - deltaMs);
      this.snapshot = { ...this.snapshot, countdownMs };
      if (countdownMs === 0) {
        this.snapshot = { ...this.snapshot, roundState: "fighting", prompts: this.promptSystem.createPrompts(this.snapshot.level.wordPoolTier) };
      }
      return null;
    }

    const enemyStartedAttack = this.updateEnemyPressure(deltaMs, nowMs);

    let player = this.combatSystem.updateFighter(this.snapshot.player, deltaMs);
    player = this.resolveAttackDash(player, this.snapshot.enemy.position.x);
    player = this.resolveDodgeReturn(player);
    let enemy = this.combatSystem.updateFighter(this.snapshot.enemy, enemyStartedAttack ? 0 : deltaMs);
    enemy = this.resolveAttackDash(enemy, player.position.x);

    const playerHit = this.combatSystem.resolveHit(player, enemy, nowMs, this.playerDamageMultiplier);
    player = playerHit.attacker;
    enemy = playerHit.defender;

    if (playerHit.hit) {
      this.playerDamageMultiplier = 1;
    }

    const enemyHit = this.combatSystem.resolveHit(enemy, player, nowMs, this.currentArchetype().damageMultiplier * this.enemySkillDamageMultiplier);
    enemy = enemyHit.attacker;
    player = enemyHit.defender;

    const hit = playerHit.hit ?? enemyHit.hit;
    if (!player.activeAttackId && this.playerDamageMultiplier > 1) {
      this.playerDamageMultiplier = 1;
    }
    if (enemyHit.hit || (!enemy.activeAttackId && this.enemySkillDamageMultiplier > 1)) {
      this.enemySkillDamageMultiplier = 1;
    }
    const roundState = enemy.hp <= 0 ? "won" : player.hp <= 0 ? "lost" : this.snapshot.roundState;

    if (hit) {
      this.hitStopMs = hit.attackId.includes("kick") ? 68 : 45;
    }

    const metrics = this.updateMetricsForHit(this.snapshot.metrics, hit);
    const level = this.updateLevelRuntime(this.snapshot.level, metrics, this.snapshot.combo, player, enemy, roundState, nowMs);

    this.snapshot = {
      ...this.snapshot,
      player,
      enemy,
      metrics,
      level,
      roundState,
      lastHit: hit,
      feedback: hit ? this.hitFeedback(hit, roundState, nowMs) : this.snapshot.feedback
    };

    return hit;
  }

  private updateEnemyPressure(deltaMs: number, nowMs: number) {
    const enemySkill = this.updateEnemySkillClock(deltaMs);

    if (this.snapshot.enemy.state !== "idle") {
      this.snapshot = { ...this.snapshot, enemyTelegraphMs: 0, enemySkill };
      return false;
    }

    this.enemyAttackClockMs += deltaMs;
    const enemyCooldownMs = this.currentEnemyCooldownMs();
    const telegraphStartMs = Math.max(0, enemyCooldownMs - this.currentLevel().enemyTelegraphMs);
    const enemyTelegraphMs = this.enemyAttackClockMs > telegraphStartMs ? this.enemyAttackClockMs - telegraphStartMs : 0;

    if (enemySkill.available && this.enemySkillClockMs >= enemySkill.cooldownMs) {
      const enemyAttack = this.nextEnemySkillAttack();
      this.enemySkillClockMs = 0;
      this.enemySkillDamageMultiplier = 2;
      this.snapshot = {
        ...this.snapshot,
        enemy: this.startAttackWithDash(this.snapshot.enemy, this.snapshot.player.position.x, enemyAttack),
        enemyTelegraphMs: 0,
        enemyAttackClockMs: this.enemyAttackClockMs,
        enemyIncomingAttackId: null,
        enemySkill: {
          ...enemySkill,
          clockMs: 0,
          incomingAttackId: null,
          active: true,
          usedSerial: enemySkill.usedSerial + 1
        },
        feedback: { kind: "skill", label: "Enemy Skill", atMs: nowMs }
      };
      return true;
    }

    if (this.enemyAttackClockMs >= enemyCooldownMs) {
      const enemyAttack = this.nextEnemyAttack();
      this.enemyAttackClockMs = 0;
      this.snapshot = {
        ...this.snapshot,
        enemy: this.startAttackWithDash(this.snapshot.enemy, this.snapshot.player.position.x, enemyAttack),
        enemyTelegraphMs: 0,
        enemyAttackClockMs: 0,
        enemyIncomingAttackId: null,
        enemySkill
      };
      return true;
    }

    this.snapshot = {
      ...this.snapshot,
      enemyTelegraphMs,
      enemyAttackClockMs: this.enemyAttackClockMs,
      enemyAttackEveryMs: enemyCooldownMs,
      enemyIncomingAttackId: enemyTelegraphMs > 0 ? this.peekEnemyAttack() : null,
      enemySkill
    };
    return false;
  }

  private updateEnemySkillClock(deltaMs: number): EnemySkillState {
    const level = this.currentLevel();
    const available = level.id >= 6;
    const cooldownMs = Math.round(this.currentEnemyCooldownMs() * 1.5);
    const telegraphWindowMs = Math.round(level.enemyTelegraphMs * 1.25);

    if (!available) {
      this.enemySkillClockMs = 0;
      return {
        available: false,
        clockMs: 0,
        cooldownMs,
        telegraphMs: 0,
        incomingAttackId: null,
        active: false,
        usedSerial: this.snapshot.enemySkill.usedSerial
      };
    }

    this.enemySkillClockMs = Math.min(cooldownMs, this.enemySkillClockMs + deltaMs);
    const telegraphStartMs = Math.max(0, cooldownMs - telegraphWindowMs);
    const telegraphMs = this.enemySkillClockMs > telegraphStartMs ? this.enemySkillClockMs - telegraphStartMs : 0;

    return {
      ...this.snapshot.enemySkill,
      available,
      clockMs: this.enemySkillClockMs,
      cooldownMs,
      telegraphMs,
      incomingAttackId: telegraphMs > 0 ? this.peekEnemySkillAttack() : null,
      active: false
    };
  }

  private performDodge() {
    return {
      ...this.snapshot.player,
      position: {
        ...this.snapshot.player.position,
        x: Math.max(330, this.snapshot.player.position.x - 94)
      },
      state: "knockdown" as const,
      stateElapsedMs: 0,
      activeAttackId: null,
      hasHitThisAttack: false,
      velocity: { x: 0, y: 0 }
    };
  }

  private createInitialSnapshot(): GameSnapshot {
    const level = this.currentLevel();
    const enemy = createFighter("enemy", FightSimulation.ENEMY_HOME_X, 590, -1);
    enemy.hp = level.enemyHp;
    enemy.maxHp = level.enemyHp;

    return {
      player: createFighter("player", FightSimulation.PLAYER_HOME_X, 590, 1),
      enemy,
      prompts: [],
      dodgePrompt: this.promptSystem.createDodgePrompt(),
      metrics: createTypingMetrics(),
      combo: createComboState(),
      skill: createSkillState(level.id),
      enemySkill: this.createEnemySkillState(level.id),
      roundState: "countdown",
      countdownMs: 1800,
      enemyTelegraphMs: 0,
      enemyAttackClockMs: 0,
      enemyAttackEveryMs: this.currentEnemyCooldownMs(),
      enemyIncomingAttackId: null,
      debugEnabled: true,
      lastHit: null,
      level: this.createLevelRuntime(),
      feedback: { kind: "complete", label: level.objective, atMs: 0 }
    };
  }

  private resolveDodgeReturn(player: GameSnapshot["player"]) {
    if (player.state !== "knockdown") {
      return player;
    }

    const progress = Math.min(1, player.stateElapsedMs / 500);
    const x = player.position.x + (player.homeX - player.position.x) * Math.max(0, progress - 0.75) * 0.35;

    if (player.stateElapsedMs >= 500) {
      return {
        ...player,
        position: { ...player.position, x: player.homeX },
        state: "idle" as const,
        stateElapsedMs: 0
      };
    }

    return { ...player, position: { ...player.position, x } };
  }

  private startAttackWithDash(fighter: GameSnapshot["player"], targetX: number, actionId: ActionId) {
    const started = this.combatSystem.startAttack(fighter, actionId);
    if (started === fighter) {
      return fighter;
    }

    return {
      ...started,
      homeX: fighter.homeX,
      visualActionId: actionId,
      visualActionSerial: fighter.visualActionSerial + 1,
      visualLockMs: FightSimulation.ATTACK_VISUAL_LOCK_MS
    };
  }

  private startSkillAttack() {
    return this.startAttackWithDash(
      {
        ...this.snapshot.player,
        state: "idle",
        stateElapsedMs: 0,
        activeAttackId: null,
        hasHitThisAttack: false,
        velocity: { x: 0, y: 0 }
      },
      this.snapshot.enemy.position.x,
      "attack.kick.right"
    );
  }

  private nextEnemyAttack() {
    const attacks = this.currentArchetype().attacks;
    const attack = attacks[this.enemyAttackIndex % attacks.length];
    this.enemyAttackIndex += 1;
    return attack;
  }

  private nextEnemySkillAttack() {
    const attacks = this.currentArchetype().attacks;
    const attack = attacks[(this.enemySkillIndex + 2) % attacks.length];
    this.enemySkillIndex += 1;
    return attack;
  }

  private peekEnemyAttack() {
    const attacks = this.currentArchetype().attacks;
    return attacks[this.enemyAttackIndex % attacks.length];
  }

  private peekEnemySkillAttack() {
    const attacks = this.currentArchetype().attacks;
    return attacks[(this.enemySkillIndex + 2) % attacks.length];
  }

  private createEnemySkillState(levelId: number): EnemySkillState {
    const level = getLevel(levelId - 1);
    const cooldownMs = Math.round(level.enemyCooldownMs * 1.5);

    return {
      available: level.id >= 6,
      clockMs: 0,
      cooldownMs,
      telegraphMs: 0,
      incomingAttackId: null,
      active: false,
      usedSerial: 0
    };
  }

  private currentLevel() {
    return getLevel(this.levelIndex);
  }

  private currentArchetype() {
    return enemyArchetypes[this.currentLevel().enemyArchetype];
  }

  private currentEnemyCooldownMs() {
    const base = this.currentLevel().enemyCooldownMs;
    const metrics = this.snapshot?.metrics;
    if (!metrics || metrics.keystrokes < 20) {
      return base;
    }

    const total = metrics.correctChars + metrics.wrongChars;
    const accuracy = total === 0 ? 100 : (metrics.correctChars / total) * 100;
    const struggling = accuracy < 75 || metrics.damageTaken >= 30;
    const dominant = accuracy >= 95 && this.snapshot.combo.count >= 12;

    if (struggling) {
      return base + 300;
    }
    if (dominant) {
      return Math.max(2400, base - 150);
    }
    return base;
  }

  private createLevelRuntime(): LevelRuntimeState {
    const level = this.currentLevel();
    const archetype = enemyArchetypes[level.enemyArchetype];
    return {
      index: this.levelIndex,
      id: level.id,
      name: level.name,
      focus: level.focus,
      enemyName: archetype.name,
      objective: level.objective,
      arenaTheme: level.arenaTheme,
      wordPoolTier: level.wordPoolTier,
      score: 0,
      rank: "-",
      phase: 1,
      phaseLabel: level.enemyArchetype === "boss" ? "Phase 1" : level.focus
    };
  }

  private createTypingFeedback(wrong: boolean, completedDodge: boolean, completedAttack: boolean, nowMs: number): CombatFeedback {
    if (wrong) {
      return { kind: "wrong", label: "Miss", atMs: nowMs };
    }
    if (completedDodge) {
      return { kind: "dodge", label: "Evade", atMs: nowMs };
    }
    if (completedAttack) {
      return { kind: "complete", label: "Strike", atMs: nowMs };
    }
    return { kind: "correct", label: "Clean", atMs: nowMs };
  }

  private hitFeedback(hit: HitEvent, roundState: GameSnapshot["roundState"], nowMs: number): CombatFeedback {
    if (roundState === "won" || roundState === "lost") {
      return { kind: "ko", label: "KO", atMs: nowMs };
    }
    return { kind: "hit", label: `${hit.damage}`, atMs: nowMs };
  }

  private updateMetricsForHit(metrics: GameSnapshot["metrics"], hit: HitEvent | null) {
    if (!hit) {
      return metrics;
    }

    if (hit.defenderId === "player") {
      return { ...metrics, damageTaken: metrics.damageTaken + hit.damage };
    }

    const attack = this.combatSystem.getAttack(hit.attackId);
    const limb = attack.limb === "enemy" ? null : attack.limb;
    return limb
      ? { ...metrics, limbHits: { ...metrics.limbHits, [limb]: (metrics.limbHits[limb] ?? 0) + 1 } }
      : metrics;
  }

  private updateLevelRuntime(level: LevelRuntimeState, metrics: GameSnapshot["metrics"], combo: GameSnapshot["combo"], player: GameSnapshot["player"], enemy: GameSnapshot["enemy"], roundState: GameSnapshot["roundState"], nowMs: number): LevelRuntimeState {
    const comboBonus = metrics.completedPrompts * Math.min(260, combo.best * 12);
    const baseScore = metrics.completedPrompts * 125 + combo.count * 18 + combo.best * 35 + comboBonus + metrics.dodgeSuccesses * 90;
    const damagePenalty = metrics.damageTaken * 9;
    const clearBonus = roundState === "won" ? Math.max(0, 9000 - Math.floor(nowMs / 10)) : 0;
    const score = Math.max(0, baseScore + clearBonus - damagePenalty);
    const rank = roundState === "won" ? rankFor(metrics, score, player.maxHp - player.hp) : level.rank;
    const bossPhase = this.currentLevel().enemyArchetype === "boss" ? bossPhaseFor(enemy.hp / enemy.maxHp) : 1;

    return {
      ...level,
      score,
      rank,
      phase: bossPhase,
      phaseLabel: this.currentLevel().enemyArchetype === "boss" ? `Phase ${bossPhase}` : level.focus
    };
  }

  private resolveAttackDash(fighter: GameSnapshot["player"], targetX: number) {
    if (!fighter.activeAttackId) {
      return fighter.state === "idle" && Math.abs(fighter.position.x - fighter.homeX) > 0.1
        ? { ...fighter, position: { ...fighter.position, x: fighter.homeX } }
        : fighter;
    }

    const attack = this.combatSystem.getAttack(fighter.activeAttackId);
    const totalMs = attack.startupMs + attack.activeMs + attack.recoveryMs;
    const elapsed = Math.min(fighter.stateElapsedMs, totalMs);
    const spotX = this.attackSpotX(fighter, targetX);
    let x = spotX;
    const visualLockMs = Math.max(0, fighter.visualLockMs);

    if (fighter.state === "attack_startup") {
      const progress = easeOutCubic(Math.min(1, elapsed / attack.startupMs));
      x = lerp(fighter.homeX, spotX, progress);
    } else if (fighter.state === "attack_recovery") {
      const recoveryElapsed = Math.max(0, elapsed - attack.startupMs - attack.activeMs);
      const returnElapsed = Math.max(0, recoveryElapsed - visualLockMs);
      const progress = easeInOutCubic(Math.min(1, returnElapsed / attack.recoveryMs));
      x = lerp(spotX, fighter.homeX, progress);
    }

    return { ...fighter, position: { ...fighter.position, x } };
  }

  private attackSpotX(fighter: GameSnapshot["player"], targetX: number) {
    const desired = targetX - fighter.facing * FightSimulation.ATTACK_SPACING;
    const maxForward = fighter.homeX + fighter.facing * FightSimulation.MAX_ATTACK_DASH;

    if (fighter.facing > 0) {
      return Math.min(maxForward, desired);
    }

    return Math.max(maxForward, desired);
  }
}

function isSkillKey(key: string) {
  return key.length === 1 && key !== key.toLowerCase();
}

function cloneSnapshot(snapshot: GameSnapshot): GameSnapshot {
  return {
    ...snapshot,
    player: { ...snapshot.player, position: { ...snapshot.player.position }, velocity: { ...snapshot.player.velocity } },
    enemy: { ...snapshot.enemy, position: { ...snapshot.enemy.position }, velocity: { ...snapshot.enemy.velocity } },
    prompts: snapshot.prompts.map((prompt) => ({ ...prompt })),
    dodgePrompt: snapshot.dodgePrompt ? { ...snapshot.dodgePrompt } : null,
    metrics: { ...snapshot.metrics },
    combo: { ...snapshot.combo },
    skill: { ...snapshot.skill, words: [...snapshot.skill.words] as [string, string] },
    enemySkill: { ...snapshot.enemySkill },
    lastHit: snapshot.lastHit ? { ...snapshot.lastHit, impact: { ...snapshot.lastHit.impact } } : null,
    level: { ...snapshot.level },
    feedback: snapshot.feedback ? { ...snapshot.feedback } : null
  };
}

function rankFor(metrics: GameSnapshot["metrics"], score: number, damageTaken: number) {
  const total = metrics.correctChars + metrics.wrongChars;
  const accuracy = total === 0 ? 100 : (metrics.correctChars / total) * 100;

  if (accuracy >= 95 && damageTaken <= 20 && score >= 6500) {
    return "S";
  }
  if (accuracy >= 90 && damageTaken <= 45) {
    return "A";
  }
  if (accuracy >= 80) {
    return "B";
  }
  return "C";
}

function bossPhaseFor(enemyHpPct: number) {
  if (enemyHpPct <= 0.34) {
    return 3;
  }
  if (enemyHpPct <= 0.67) {
    return 2;
  }
  return 1;
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
