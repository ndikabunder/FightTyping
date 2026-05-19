import Phaser from "phaser";
import type { ActionId } from "../../game/types";

export const audioAssets = {
  bgm: "assets/sound/bgm.mp3",
  kick: "assets/sound/kick.mp3",
  punch: "assets/sound/punch.mp3",
  typing: "assets/sound/typing.mp3",
  skill: "assets/sound/skill.mp3",
  transition: "assets/sound/transition.mp3",
  victory: "assets/sound/victory.mp3",
  defeat: "assets/sound/defeat.mp3",
  wrong: "assets/sound/wrong.mp3"
} as const;

export type AudioKey = keyof typeof audioAssets;

const AUDIO_PREFIX = "audio.";
const BGM_KEY = `${AUDIO_PREFIX}bgm`;

export function audioKey(key: AudioKey) {
  return `${AUDIO_PREFIX}${key}`;
}

export function playSfx(scene: Phaser.Scene, key: Exclude<AudioKey, "bgm">, volume = 0.72, rate = 1) {
  const fullKey = audioKey(key);
  if (!scene.cache.audio.exists(fullKey)) {
    return;
  }

  scene.sound.play(fullKey, { volume, rate });
}

export function playTransitionSfx(scene: Phaser.Scene) {
  playSfx(scene, "transition", 0.78);
}

export function ensureBgm(scene: Phaser.Scene) {
  if (!scene.cache.audio.exists(BGM_KEY)) {
    return;
  }

  const existing = scene.sound.get(BGM_KEY);
  if (existing?.isPlaying) {
    return;
  }

  if (existing) {
    existing.play({ loop: true, volume: 0.28 });
    return;
  }

  const bgm = scene.sound.add(BGM_KEY, { loop: true, volume: 0.28 });
  bgm.play();
}

export function sfxForAttack(actionId: ActionId): "kick" | "punch" {
  return actionId.includes("kick") ? "kick" : "punch";
}
