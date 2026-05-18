import { CombatSystem } from "../systems/CombatSystem";
import { ComboSystem, createComboState } from "../systems/ComboSystem";
import { enemyArchetypes, getLevel, levels, type EnemyArchetype } from "../content/levels";
import { PromptSystem } from "../systems/PromptSystem";
import { createSkillState, SkillSystem } from "../systems/SkillSystem";
import { createTypingMetrics, TypingSystem } from "../systems/TypingSystem";
import { createFighter } from "./createFighter";
import { attackMovement, dodgeRules, enemyDodgeRules, enemySkillRules, fighterHome, hitStopRules, pacingRules, playerSkillRules, scoringRules } from "../content/fightRules";
import type { ActionId, CombatFeedback, ComboState, EnemySkillState, GameSnapshot, HitEvent, LevelRuntimeState, PromptState, TypingMetrics } from "../types";

export class FightSimulation {
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
  private enemyDodgeWindowAttacks = 0;
  private enemyDodgedInWindow = false;
  private enemyFeintedThisCycle = false;
  private skillBypassesEnemyDodge = false;
  private fightElapsedMs = 0;
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
    this.enemyDodgeWindowAttacks = 0;
    this.enemyDodgedInWindow = false;
    this.enemyFeintedThisCycle = false;
    this.skillBypassesEnemyDodge = false;
    this.fightElapsedMs = 0;
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

    const allPrompts = this.snapshot.dodgePrompt
      ? [...this.snapshot.prompts, this.snapshot.dodgePrompt]
      : this.snapshot.prompts;

    if (this.shouldHandleSkillKey(key, allPrompts)) {
      this.handleSkillKey(key, nowMs);
      return null;
    }

    const result = this.typingSystem.handleKey(allPrompts, this.snapshot.metrics, key, nowMs);
    const prompts = result.prompts.filter((prompt) => prompt.kind === "attack");
    const dodgePrompt = result.prompts.find((prompt) => prompt.kind === "dodge") ?? null;
    const completedDodge = result.completedPrompt?.kind === "dodge";
    const completedAttack = result.completedPrompt?.kind === "attack";
    const combo = result.completedPrompt
      ? this.gainComboForPrompt(this.snapshot.combo, result.completedPrompt, nowMs)
      : result.wrong
      ? this.comboSystem.break(this.snapshot.combo, nowMs)
      : this.snapshot.combo;
    const skill = this.skillSystem.syncWithCombo(this.snapshot.skill, combo.count);
    const feedback = this.createTypingFeedback(result.wrong, completedDodge, completedAttack, nowMs, result.wrongPromptId);
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
        ? this.startPlayerAttack(result.completedPrompt.actionId)
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

  private shouldHandleSkillKey(key: string, prompts: PromptState[]) {
    const char = normalizeKey(key);
    if (!this.snapshot.skill.available || !this.snapshot.skill.unlocked || !char) {
      return false;
    }
    if (this.typingSystem.hasLockedPrompt()) {
      return false;
    }
    if (this.snapshot.skill.typed.length > 0) {
      return true;
    }

    const skillFirstChar = this.snapshot.skill.words.join("")[0];
    const promptCandidate = prompts.some((prompt) => prompt.text[0]?.toLowerCase() === char);
    return char === skillFirstChar && !promptCandidate;
  }

  private handleSkillKey(key: string, nowMs: number) {
    const skillResult = this.skillSystem.handleKey(this.snapshot.skill, key);
    if (!skillResult.consumed) {
      return;
    }

    this.snapshot = {
      ...this.snapshot,
      skill: skillResult.skill,
      player: skillResult.completed
        ? this.startSkillAttack()
        : { ...this.snapshot.player, state: this.snapshot.player.state === "idle" ? "typing" : this.snapshot.player.state },
      lastHit: null,
      feedback: skillResult.completed
        ? { kind: "skill", label: playerSkillRules.label, atMs: nowMs }
        : skillResult.wrong
        ? { kind: "wrong", label: "Skill Miss", atMs: nowMs, targetId: "skill" }
        : { kind: "correct", label: "Charge", atMs: nowMs }
    };

    if (skillResult.completed) {
      this.snapshot = {
        ...this.snapshot,
        skill: this.skillSystem.consume(this.snapshot.skill, this.snapshot.combo.count)
      };
      this.playerDamageMultiplier = playerSkillRules.damageMultiplier;
      this.enemyAttackClockMs = playerSkillRules.enemyCooldownResetMs;
      this.enemySkillClockMs = playerSkillRules.enemySkillResetMs;
      this.skillBypassesEnemyDodge = true;
    }
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

    this.fightElapsedMs += deltaMs;
    const enemyStartedAttack = this.updateEnemyPressure(deltaMs, nowMs);

    let player = this.combatSystem.updateFighter(this.snapshot.player, deltaMs);
    player = this.resolveAttackDash(player, this.snapshot.enemy.position.x);
    player = this.resolveDodgeReturn(player);
    let enemy = this.combatSystem.updateFighter(this.snapshot.enemy, enemyStartedAttack ? 0 : deltaMs);
    enemy = this.resolveAttackDash(enemy, player.position.x);
    enemy = this.resolveDodgeReturn(enemy);

    const enemyDodge = this.resolveEnemyDodge(player, enemy);
    player = enemyDodge.player;
    enemy = enemyDodge.enemy;

    const playerHit = enemyDodge.dodged
      ? { attacker: player, defender: enemy, hit: null }
      : this.combatSystem.resolveHit(player, enemy, nowMs, this.playerDamageMultiplier);
    player = playerHit.attacker;
    enemy = playerHit.defender;

    if (playerHit.hit) {
      this.playerDamageMultiplier = 1;
      this.skillBypassesEnemyDodge = false;
      this.applyPlayerHitEffect(playerHit.hit);
    }

    const enemyHit = this.combatSystem.resolveHit(
      enemy,
      player,
      nowMs,
      this.currentArchetype().damageMultiplier * this.enemySkillDamageMultiplier * this.pacingDamageMultiplier()
    );
    enemy = enemyHit.attacker;
    player = enemyHit.defender;

    const hit = playerHit.hit ?? enemyHit.hit;
    if (!player.activeAttackId && this.playerDamageMultiplier > 1) {
      this.playerDamageMultiplier = 1;
    }
    if (enemyHit.hit || (!enemy.activeAttackId && this.enemySkillDamageMultiplier > 1)) {
      this.enemySkillDamageMultiplier = 1;
    }
    if (hit) {
      this.hitStopMs = hit.attackId.includes("kick") ? hitStopRules.kickMs : hitStopRules.punchMs;
    }

    const metrics = this.updateMetricsForHit(this.snapshot.metrics, hit);
    const interruptedByEnemyHit = Boolean(enemyHit.hit);
    const combo = interruptedByEnemyHit ? this.comboSystem.break(this.snapshot.combo, nowMs) : this.snapshot.combo;
    const skill = interruptedByEnemyHit ? this.interruptSkill(this.snapshot.skill) : this.snapshot.skill;
    const prompts = interruptedByEnemyHit ? this.interruptPrompts(this.snapshot.prompts) : this.snapshot.prompts;
    const dodgePrompt = interruptedByEnemyHit && this.snapshot.dodgePrompt ? this.interruptPrompt(this.snapshot.dodgePrompt) : this.snapshot.dodgePrompt;
    if (interruptedByEnemyHit) {
      this.typingSystem.reset();
    }
    const objectiveProgress = this.createObjectiveProgress(metrics, combo, enemy);
    const roundState = enemy.hp <= 0 ? (objectiveProgress.completed ? "won" : "lost") : player.hp <= 0 ? "lost" : this.snapshot.roundState;
    const level = this.updateLevelRuntime(this.snapshot.level, metrics, combo, player, enemy, roundState, nowMs);

    this.snapshot = {
      ...this.snapshot,
      player,
      enemy,
      prompts,
      dodgePrompt,
      metrics,
      combo,
      skill,
      level,
      roundState,
      lastHit: hit,
      feedback: enemyDodge.dodged ? { kind: "dodge", label: "Enemy Evade", atMs: nowMs } : hit ? this.hitFeedback(hit, roundState, level, player, enemy, nowMs) : this.snapshot.feedback
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

    if (this.shouldEnemyFeint(enemyTelegraphMs)) {
      this.enemyFeintedThisCycle = true;
      this.enemyAttackClockMs = Math.max(0, Math.round(telegraphStartMs * 0.45));
      this.snapshot = {
        ...this.snapshot,
        enemyTelegraphMs: 0,
        enemyAttackClockMs: this.enemyAttackClockMs,
        enemyAttackEveryMs: enemyCooldownMs,
        enemyIncomingAttackId: null,
        enemySkill,
        feedback: { kind: "dodge", label: "Feint", atMs: nowMs }
      };
      return false;
    }

    if (enemySkill.available && this.enemySkillClockMs >= enemySkill.cooldownMs) {
      const enemyAttack = this.nextEnemySkillAttack();
      this.enemySkillClockMs = 0;
      this.enemySkillDamageMultiplier = enemySkillRules.damageMultiplier;
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
      this.enemyFeintedThisCycle = false;
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
    const available = level.id >= enemySkillRules.unlockLevel;
    const cooldownMs = Math.round(this.currentEnemyCooldownMs() * enemySkillRules.cooldownMultiplier);
    const telegraphWindowMs = Math.round(level.enemyTelegraphMs * enemySkillRules.telegraphMultiplier);

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
        x: Math.max(dodgeRules.playerMinX, this.snapshot.player.position.x - dodgeRules.playerBackstep)
      },
      state: "knockdown" as const,
      stateElapsedMs: 0,
      activeAttackId: null,
      hasHitThisAttack: false,
      velocity: { x: 0, y: 0 }
    };
  }

  private performEnemyDodge(enemy: GameSnapshot["enemy"]) {
    return {
      ...enemy,
      position: {
        ...enemy.position,
        x: Math.min(dodgeRules.enemyMaxX, enemy.position.x + dodgeRules.enemyBackstep)
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
    const enemy = createFighter("enemy", fighterHome.enemyX, fighterHome.y, -1);
    enemy.hp = level.enemyHp;
    enemy.maxHp = level.enemyHp;

    return {
      player: createFighter("player", fighterHome.playerX, fighterHome.y, 1),
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

    const progress = Math.min(1, player.stateElapsedMs / dodgeRules.returnMs);
    const x =
      player.position.x +
      (player.homeX - player.position.x) * Math.max(0, progress - dodgeRules.returnDelayPct) * dodgeRules.returnEase;

    if (player.stateElapsedMs >= dodgeRules.returnMs) {
      return {
        ...player,
        position: { ...player.position, x: player.homeX },
        state: "idle" as const,
        stateElapsedMs: 0
      };
    }

    return { ...player, position: { ...player.position, x } };
  }

  private startPlayerAttack(actionId: ActionId) {
    const started = this.startAttackWithDash(this.snapshot.player, this.snapshot.enemy.position.x, actionId);
    if (started !== this.snapshot.player) {
      this.registerEnemyDodgeWindowAttack();
    }
    return started;
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
      visualLockMs: attackMovement.visualLockMs
    };
  }

  private startSkillAttack() {
    const started = this.startAttackWithDash(
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
    if (started.activeAttackId) {
      this.registerEnemyDodgeWindowAttack();
    }
    return started;
  }

  private registerEnemyDodgeWindowAttack() {
    if (this.enemyDodgeWindowAttacks >= enemyDodgeRules.attacksPerWindow) {
      this.enemyDodgeWindowAttacks = 0;
      this.enemyDodgedInWindow = false;
    }
    this.enemyDodgeWindowAttacks += 1;
  }

  private resolveEnemyDodge(player: GameSnapshot["player"], enemy: GameSnapshot["enemy"]) {
    if (
      this.skillBypassesEnemyDodge ||
      !this.combatSystem.wouldHit(player, enemy) ||
      this.enemyDodgedInWindow ||
      Math.random() >= this.currentArchetype().dodgeChance
    ) {
      return { player, enemy, dodged: false };
    }

    this.enemyDodgedInWindow = true;
    return {
      player: { ...player, hasHitThisAttack: true },
      enemy: this.performEnemyDodge(enemy),
      dodged: true
    };
  }

  private nextEnemyAttack() {
    const attacks = this.currentArchetype().attacks;
    const attack = attacks[this.enemyAttackIndex % attacks.length];
    this.enemyAttackIndex += 1;
    return attack;
  }

  private nextEnemySkillAttack() {
    const attacks = this.currentArchetype().attacks;
    const attack = attacks[(this.enemySkillIndex + enemySkillRules.attackOffset) % attacks.length];
    this.enemySkillIndex += 1;
    return attack;
  }

  private peekEnemyAttack() {
    const attacks = this.currentArchetype().attacks;
    return attacks[this.enemyAttackIndex % attacks.length];
  }

  private peekEnemySkillAttack() {
    const attacks = this.currentArchetype().attacks;
    return attacks[(this.enemySkillIndex + enemySkillRules.attackOffset) % attacks.length];
  }

  private createEnemySkillState(levelId: number): EnemySkillState {
    const level = getLevel(levelId - 1);
    const cooldownMs = Math.round(level.enemyCooldownMs * enemyArchetypes[level.enemyArchetype].cooldownMultiplier * enemySkillRules.cooldownMultiplier);

    return {
      available: level.id >= enemySkillRules.unlockLevel,
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

  private interruptPrompts(prompts: PromptState[]) {
    return prompts.map((prompt) => this.interruptPrompt(prompt));
  }

  private interruptPrompt(prompt: PromptState): PromptState {
    return { ...prompt, typed: "", status: "idle" };
  }

  private interruptSkill(skill: GameSnapshot["skill"]) {
    if (!skill.available) {
      return skill;
    }

    const status: GameSnapshot["skill"]["status"] = skill.unlocked ? "ready" : "locked";
    return { ...skill, typed: "", status, progress: 0, chargeBaseCombo: 0 };
  }

  private gainComboForPrompt(combo: ComboState, prompt: PromptState, nowMs: number) {
    const attack = prompt.kind === "attack" ? this.combatSystem.getAttack(prompt.actionId) : null;
    const gain = attack?.effect?.comboGain ?? 1;
    let next = combo;

    for (let i = 0; i < gain; i += 1) {
      next = this.comboSystem.gain(next, nowMs);
    }

    return next;
  }

  private applyPlayerHitEffect(hit: HitEvent) {
    const attack = this.combatSystem.getAttack(hit.attackId);
    const enemyDelayMs = attack.effect?.enemyDelayMs ?? 0;
    if (enemyDelayMs > 0) {
      this.enemyAttackClockMs = Math.max(0, this.enemyAttackClockMs - enemyDelayMs);
      this.enemySkillClockMs = Math.max(0, this.enemySkillClockMs - Math.round(enemyDelayMs * 0.5));
    }
  }

  private shouldEnemyFeint(enemyTelegraphMs: number) {
    const archetype = this.currentArchetype();
    if (archetype.feintChance <= 0 || this.enemyFeintedThisCycle || enemyTelegraphMs <= this.currentLevel().enemyTelegraphMs * 0.55) {
      return false;
    }

    return Math.random() < archetype.feintChance;
  }

  private pacingCooldownMultiplier() {
    if (this.currentLevel().enemyArchetype === "boss") {
      const phase = this.snapshot?.level.phase ?? 1;
      if (phase >= 3) {
        return pacingRules.bossPhase3CooldownMultiplier;
      }
      if (phase >= 2) {
        return pacingRules.bossPhase2CooldownMultiplier;
      }
    }

    if (this.fightElapsedMs >= pacingRules.wave3Ms) {
      return pacingRules.wave3CooldownMultiplier;
    }
    if (this.fightElapsedMs >= pacingRules.wave2Ms) {
      return pacingRules.wave2CooldownMultiplier;
    }
    return 1;
  }

  private pacingDamageMultiplier() {
    if (this.currentLevel().enemyArchetype === "boss" && (this.snapshot?.level.phase ?? 1) >= 3) {
      return pacingRules.bossPhase3DamageMultiplier;
    }
    return 1;
  }

  private currentEnemyCooldownMs() {
    const base = this.currentLevel().enemyCooldownMs;
    const archetypeAdjusted = Math.round(base * this.currentArchetype().cooldownMultiplier * this.pacingCooldownMultiplier());
    const metrics = this.snapshot?.metrics;
    if (!metrics || metrics.keystrokes < 20) {
      return archetypeAdjusted;
    }

    const total = metrics.correctChars + metrics.wrongChars;
    const accuracy = total === 0 ? 100 : (metrics.correctChars / total) * 100;
    const struggling = accuracy < 75 || metrics.damageTaken >= 30;
    const dominant = accuracy >= 95 && this.snapshot.combo.count >= 12;

    if (struggling) {
      return archetypeAdjusted + 300;
    }
    if (dominant) {
      return Math.max(2400, archetypeAdjusted - 150);
    }
    return archetypeAdjusted;
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
      phaseLabel: level.enemyArchetype === "boss" ? "Phase 1" : level.focus,
      objectiveProgress: createObjectiveProgress(level.id, createTypingMetrics(), createComboState(), null, 0)
    };
  }

  private createObjectiveProgress(metrics: TypingMetrics, combo: ComboState, enemy: GameSnapshot["enemy"]) {
    const bossPhase = this.currentLevel().enemyArchetype === "boss" ? bossPhaseFor(enemy.hp / enemy.maxHp) : 1;
    return createObjectiveProgress(this.currentLevel().id, metrics, combo, bossPhase, this.snapshot.skill.usedSerial);
  }

  private createTypingFeedback(wrong: boolean, completedDodge: boolean, completedAttack: boolean, nowMs: number, wrongPromptId: string | null): CombatFeedback {
    if (wrong) {
      return { kind: "wrong", label: "Miss", atMs: nowMs, targetId: wrongPromptId ?? "all-prompts" };
    }
    if (completedDodge) {
      return { kind: "dodge", label: "Evade", atMs: nowMs };
    }
    if (completedAttack) {
      return { kind: "complete", label: "Strike", atMs: nowMs };
    }
    return { kind: "correct", label: "Clean", atMs: nowMs };
  }

  private hitFeedback(hit: HitEvent, roundState: GameSnapshot["roundState"], level: LevelRuntimeState, player: GameSnapshot["player"], enemy: GameSnapshot["enemy"], nowMs: number): CombatFeedback {
    if (roundState === "won") {
      return { kind: "ko", label: "KO", atMs: nowMs };
    }
    if (roundState === "lost") {
      const label = enemy.hp <= 0 && !level.objectiveProgress.completed ? "Quest Failed" : player.hp <= 0 ? "Player KO" : "Defeat";
      return { kind: "ko", label, atMs: nowMs };
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
    const comboBonus = metrics.completedPrompts * Math.min(scoringRules.maxComboBonusPerPrompt, combo.best * scoringRules.comboBonusPerPrompt);
    const baseScore =
      metrics.completedPrompts * scoringRules.promptScore +
      combo.count * scoringRules.currentComboScore +
      combo.best * scoringRules.bestComboScore +
      comboBonus +
      metrics.dodgeSuccesses * scoringRules.dodgeScore;
    const damagePenalty = metrics.damageTaken * scoringRules.damagePenalty;
    const clearBonus = roundState === "won" ? Math.max(0, scoringRules.clearBonus - Math.floor(nowMs / scoringRules.clearBonusTimeDivisor)) : 0;
    const bossPhase = this.currentLevel().enemyArchetype === "boss" ? bossPhaseFor(enemy.hp / enemy.maxHp) : 1;
    const objective = this.createObjectiveProgress(metrics, combo, enemy);
    const objectiveBonus = roundState === "won" && objective.completed ? scoringRules.objectiveBonus : 0;
    const score = Math.max(0, baseScore + clearBonus + objectiveBonus - damagePenalty);
    const rank = roundState === "won" ? rankFor(metrics, score, player.maxHp - player.hp) : level.rank;

    return {
      ...level,
      score,
      rank,
      phase: bossPhase,
      phaseLabel: this.currentLevel().enemyArchetype === "boss" ? `Phase ${bossPhase}` : pacingPhaseLabel(level.focus, this.fightElapsedMs),
      objectiveProgress: objective
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
    const desired = targetX - fighter.facing * attackMovement.spacing;
    const maxForward = fighter.homeX + fighter.facing * attackMovement.maxDash;

    if (fighter.facing > 0) {
      return Math.min(maxForward, desired);
    }

    return Math.max(maxForward, desired);
  }
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
    level: { ...snapshot.level, objectiveProgress: { ...snapshot.level.objectiveProgress } },
    feedback: snapshot.feedback ? { ...snapshot.feedback } : null
  };
}

function createObjectiveProgress(levelId: number, metrics: TypingMetrics, combo: ComboState, bossPhase: number | null, skillUsedSerial: number) {
  const limbHits = metrics.limbHits;
  const hitCount = (limb: keyof typeof limbHits) => limbHits[limb] ?? 0;
  const allLimbs = (["rightHand", "leftHand", "rightLeg", "leftLeg"] as const).filter((limb) => hitCount(limb) > 0).length;
  const kickHits = hitCount("rightLeg") + hitCount("leftLeg");
  const punchTypes = (hitCount("rightHand") > 0 ? 1 : 0) + (hitCount("leftHand") > 0 ? 1 : 0);

  switch (levelId) {
    case 1:
      return objective("Both punches", punchTypes, 2);
    case 2:
      return objective("Combo x5", combo.best, 5);
    case 3:
      return objective("Combo x3", combo.best, 3);
    case 4:
      return objective("Dodge x2", metrics.dodgeSuccesses, 2);
    case 5:
      return objective("All limbs", allLimbs, 4);
    case 6:
      return objective("Neon Break", skillUsedSerial, 1);
    case 7:
      return objective("Combo x8", combo.best, 8);
    case 8: {
      const remaining = Math.max(0, 3 - metrics.wrongChars);
      return { label: "Miss limit", current: remaining, target: 3, completed: metrics.wrongChars < 3 };
    }
    case 9:
      return objective("Dodge x2", metrics.dodgeSuccesses, 2);
    case 10:
      return objective("Reach phase 3", bossPhase ?? 1, 3);
    default:
      return objective("Clear", 0, 1);
  }
}

function objective(label: string, current: number, target: number) {
  const capped = Math.min(target, Math.max(0, current));
  return {
    label,
    current: capped,
    target,
    completed: capped >= target
  };
}

function pacingPhaseLabel(focus: string, fightElapsedMs: number) {
  if (fightElapsedMs >= pacingRules.wave3Ms) {
    return `${focus} - Wave 3`;
  }
  if (fightElapsedMs >= pacingRules.wave2Ms) {
    return `${focus} - Wave 2`;
  }
  return focus;
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

function normalizeKey(key: string) {
  return /^[a-zA-Z]$/.test(key) ? key.toLowerCase() : "";
}
