export type FighterId = "player" | "enemy";

export type Limb = "rightHand" | "leftHand" | "rightLeg" | "leftLeg";

export type ActionId = "attack.punch.right" | "attack.punch.left" | "attack.kick.right" | "attack.kick.left";

export type FighterState =
  | "idle"
  | "typing"
  | "attack_startup"
  | "attack_active"
  | "attack_recovery"
  | "block"
  | "hitstun"
  | "knockdown"
  | "ko";

export type Facing = 1 | -1;

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AttackData {
  id: ActionId;
  animationKey: string;
  limb: Limb | "enemy";
  damage: number;
  startupMs: number;
  activeMs: number;
  recoveryMs: number;
  range: number;
  hitstunMs: number;
  knockback: number;
}

export interface HitboxWindow {
  fromMs: number;
  toMs: number;
  box: Rect;
}

export interface HitboxData {
  attackId: ActionId;
  activeWindows: HitboxWindow[];
}

export interface Fighter {
  id: FighterId;
  hp: number;
  maxHp: number;
  position: Vec2;
  homeX: number;
  velocity: Vec2;
  facing: Facing;
  state: FighterState;
  stateElapsedMs: number;
  activeAttackId: ActionId | null;
  hasHitThisAttack: boolean;
  visualActionId: ActionId | null;
  visualActionSerial: number;
  visualLockMs: number;
  hurtbox: Rect;
}

export type PromptStatus = "idle" | "matching" | "wrong" | "completed";

export interface PromptState {
  id: string;
  limb: Limb;
  actionId: ActionId;
  kind: "attack" | "dodge";
  text: string;
  typed: string;
  status: PromptStatus;
  completedAtMs?: number;
}

export interface TypingMetrics {
  keystrokes: number;
  correctChars: number;
  wrongChars: number;
  combo: number;
  bestCombo: number;
  completedPrompts: number;
  totalCompletionMs: number;
  dodgeSuccesses: number;
  damageTaken: number;
  limbHits: Partial<Record<Limb, number>>;
  comboJustChangedAtMs: number;
  comboMilestone: number;
}

export interface LevelRuntimeState {
  index: number;
  id: number;
  name: string;
  focus: string;
  enemyName: string;
  objective: string;
  arenaTheme: string;
  wordPoolTier: "easy" | "normal" | "hard";
  score: number;
  rank: "S" | "A" | "B" | "C" | "-";
  phase: number;
  phaseLabel: string;
}

export interface CombatFeedback {
  kind: "correct" | "wrong" | "complete" | "dodge" | "hit" | "whiff" | "ko" | "combo" | "comboBreak";
  label: string;
  atMs: number;
}

export interface GameSnapshot {
  player: Fighter;
  enemy: Fighter;
  prompts: PromptState[];
  metrics: TypingMetrics;
  roundState: "countdown" | "fighting" | "won" | "lost" | "paused";
  countdownMs: number;
  enemyTelegraphMs: number;
  enemyAttackClockMs: number;
  enemyAttackEveryMs: number;
  enemyIncomingAttackId: ActionId | null;
  dodgePrompt: PromptState | null;
  debugEnabled: boolean;
  lastHit: HitEvent | null;
  level: LevelRuntimeState;
  feedback: CombatFeedback | null;
}

export interface HitEvent {
  attackerId: FighterId;
  defenderId: FighterId;
  attackId: ActionId;
  damage: number;
  impact: Vec2;
  atMs: number;
}
