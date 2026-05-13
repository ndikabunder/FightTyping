export const assetManifest = {
  player: {
    textureKey: "fighter_player",
    placeholder: "shape-renderer",
    finalImage: "/assets/characters/player/final/player.png",
    finalAtlas: "/assets/characters/player/final/player.json",
    frame: {
      width: 256,
      height: 256,
      anchor: { x: 128, y: 236 }
    }
  },
  enemy: {
    textureKey: "fighter_enemy",
    placeholder: "shape-renderer",
    finalImage: "/assets/characters/enemy/final/enemy.png",
    finalAtlas: "/assets/characters/enemy/final/enemy.json",
    frame: {
      width: 256,
      height: 256,
      anchor: { x: 128, y: 236 }
    }
  },
  fx: {
    hitSpark: "shape-hit-spark"
  },
  audio: {
    hit: "placeholder-hit",
    typeCorrect: "placeholder-type-correct",
    typeWrong: "placeholder-type-wrong"
  }
} as const;
