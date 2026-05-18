import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

const files = [
  ["assets/images/player/Idle.png", "public/assets/images/player/Idle.png"],
  ["assets/images/player/Dash.png", "public/assets/images/player/Dash.png"],
  ["assets/images/player/skill.png", "public/assets/images/player/skill.png"],
  ["assets/images/player/death.png", "public/assets/images/player/death.png"],
  ["assets/images/player/victory.png", "public/assets/images/player/victory.png"],
  ["assets/images/player/PukulTanganKanan.png", "public/assets/images/player/PukulTanganKanan.png"],
  ["assets/images/player/PukulTanganKiri.png", "public/assets/images/player/PukulTanganKiri.png"],
  ["assets/images/player/TendangKakiKanan.png", "public/assets/images/player/TendangKakiKanan.png"],
  ["assets/images/player/TendangKakiKiri.png", "public/assets/images/player/TendangKakiKiri.png"],
  ["assets/Sound/bgm.mp3", "public/assets/sound/bgm.mp3"],
  ["assets/Sound/typing.mp3", "public/assets/sound/typing.mp3"],
  ["assets/Sound/wrong.mp3", "public/assets/sound/wrong.mp3"],
  ["assets/Sound/punch.mp3", "public/assets/sound/punch.mp3"],
  ["assets/Sound/kick.mp3", "public/assets/sound/kick.mp3"],
  ["assets/Sound/skill.mp3", "public/assets/sound/skill.mp3"],
  ["assets/Sound/transition.mp3", "public/assets/sound/transition.mp3"],
  ["assets/Sound/victory.mp3", "public/assets/sound/victory.mp3"],
  ["assets/Sound/defeat.mp3", "public/assets/sound/defeat.mp3"]
];

let copied = 0;

for (const [source, target] of files) {
  const sourcePath = join(root, source);
  const targetPath = join(root, target);

  if (!existsSync(sourcePath)) {
    throw new Error(`Missing asset: ${source}`);
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
  copied += 1;
  console.log(`${source} -> ${target}`);
}

console.log(`Synced ${copied} assets.`);
