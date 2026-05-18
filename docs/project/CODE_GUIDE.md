# Fight Typing - Code Guide

Status: 2026-05-14  
Tujuan: membuat codebase mudah dibaca manusia, mudah dinavigasi AI, dan aman diperluas tanpa memecah gameplay.

Update sinkronisasi: guide ini mencatat perubahan working tree terbaru, termasuk `fightRules`, `GameAudio`, player spritesheet manifest, objective, combo, player skill, enemy skill, dodge/feint, dan asset runtime `public/assets`.

Build note: `vite.config.mjs` memisahkan chunk `phaser` dari app code via `manualChunks` dan menaikkan `chunkSizeWarningLimit` karena engine Phaser memang besar.

## Prinsip Utama

- Gameplay source of truth ada di `src/game`, bukan di Phaser scene.
- Phaser scene hanya bridge: input, render, audio, scene transition.
- DOM HUD hanya membaca `GameSnapshot`; jangan simpan aturan combat di HUD.
- Semua tuning angka gameplay masuk data/rules module, bukan tersebar sebagai magic number.
- Setiap fitur baru harus punya seam kecil: data, rule/system, render/audio adapter, lalu test.

## Peta Module

```text
src/game/content/
  attacks.ts          attack frame data
  hitboxes.ts         active hitbox windows
  levels.ts           level + enemy archetype data
  promptPools.ts      word pools + limb labels
  fightRules.ts       tuning combat, dodge, skill, hitstop, score

src/game/systems/
  TypingSystem.ts     prompt lock, typed chars, wrong input
  PromptSystem.ts     prompt generation/replacement
  CombatSystem.ts     attack start, fighter update, hit resolution
  ComboSystem.ts      combo count/tier/serial
  SkillSystem.ts      player skill unlock/type/consume
  LeaderboardStore.ts localStorage leaderboard

src/game/simulation/
  FightSimulation.ts  orchestration of systems into GameSnapshot
  createFighter.ts    fighter factory

src/phaser/
  config.ts
  assets/             Phaser asset metadata
  audio/              Phaser audio keys/helpers
  fx/                 scene transition FX
  scenes/             Boot/Preload/Intro/Menu/Leaderboard/Fight
  view/               FighterRenderer + DebugRenderer

src/ui/hud/
  HudController.ts    DOM HUD rendering + result buttons
```

## Tambah Fitur Baru

1. Definisikan data dulu bila fitur punya angka, path, kata, attack, level, atau tuning.
2. Tambah rule di `src/game/systems` atau `src/game/simulation`, bukan di scene.
3. Ekspose hasil lewat `GameSnapshot`, `CombatFeedback`, `HitEvent`, atau state baru yang jelas.
4. Render/Audio hanya bereaksi pada snapshot/event serial.
5. Tambah test di layer paling rendah yang bisa membuktikan behavior.
6. Jalankan:

```bash
npm.cmd test -- --run
npm.cmd run build
```

## Aturan `FightSimulation`

`FightSimulation` boleh:

- menggabungkan `TypingSystem`, `CombatSystem`, `ComboSystem`, `SkillSystem`, dan `PromptSystem`.
- update `GameSnapshot`.
- memilih kapan enemy attack/skill/dodge terjadi.
- menghitung round state, score, rank, feedback.

`FightSimulation` jangan:

- load asset.
- play audio.
- membuat Phaser object.
- membaca DOM.
- menyimpan CSS/UI state.

Jika file makin besar, pecah kandidat ini:

- `EnemyDirector`: enemy cooldown, telegraph, skill, dodge.
- `FightScoring`: score/rank/metrics after hit.
- `FighterMovement`: attack dash, dodge return, home position.

## Aturan Content/Data

Gunakan `src/game/content/fightRules.ts` untuk angka tuning:

- home position.
- attack dash spacing.
- dodge distance/return.
- enemy skill cooldown/damage.
- enemy dodge chance/window.
- hitstop.
- scoring.
- combat spacing clamp.

Gunakan file lain:

- attack stats: `attacks.ts`.
- hitbox shape/timing: `hitboxes.ts`.
- word pools: `promptPools.ts`.
- level/archetype: `levels.ts`.

Jangan hardcode angka tuning baru langsung di `FightSimulation`, `CombatSystem`, `HudController`, atau `FightScene`.

## Aturan Phaser Scene

Scene boleh:

- menerima keyboard/pointer input.
- memanggil `simulation.handleKey()` dan `simulation.update()`.
- sink renderer/HUD dari snapshot.
- memainkan SFX/FX berdasarkan feedback/event serial.
- pindah scene.

Scene jangan:

- menghitung damage.
- memilih prompt.
- menentukan enemy AI.
- memodifikasi HP/metrics/combo langsung.

## Aturan HUD

`HudController` harus pure-ish terhadap snapshot:

- input: `GameSnapshot`.
- output: DOM HTML + button handler.
- tidak memanggil simulation langsung kecuali command callback (`retry`, `next`, `menu`).
- wrong/complete/skill/dodge state harus berasal dari snapshot/feedback.

Saat tambah panel HUD:

- hindari nested card.
- pakai logical coordinate -> percent helper.
- pastikan text tidak menutupi prompt aktif.
- update hash di `FightScene` jika HUD perlu rerender saat field baru berubah.

## Aturan Audio

Audio key/path tinggal di `src/phaser/audio/GameAudio.ts`.

Pattern:

- preload semua audio via `PreloadScene`.
- scene pakai `playSfx(scene, key, volume)`.
- jangan pakai raw Web Audio beep bila asset SFX sudah ada.
- sound result (`victory`, `defeat`) hanya main sekali per round state.

Asset aktif sekarang:

- `bgm`
- `typing`
- `punch`
- `kick`
- `skill`
- `transition`
- `victory`
- `defeat`
- `wrong`

## Aturan Asset

Player spritesheet path/frame:

- `src/phaser/assets/playerSpritesheets.ts`
- frame source: `768x448`
- frame kosong `29..31` jangan masuk idle loop.

Renderer:

- `FighterRenderer` pakai manual `setTexture` + `setFrame`.
- Jangan pindah ke `sprite.play` tanpa verifikasi attack frame impact.

Enemy:

- sementara memakai spritesheet player, flipped, tint magenta.
- bila enemy asset final masuk, buat metadata asset baru, jangan ubah combat rule.

## Testing

Prioritas test:

- system pure: `TypingSystem`, `PromptSystem`, `ComboSystem`, `SkillSystem`.
- combat rule: `CombatSystem`.
- integration behavior: `FightSimulation`.

Test jangan rapuh terhadap detail render. Test harus mengunci behavior:

- skill unlock/consume.
- enemy skill cooldown/damage.
- wrong input target feedback.
- dodge return.
- hit damage once.
- combo gain/break.

Untuk visual/audio change:

- run unit test + build.
- lakukan browser smoke bila visual berubah besar.

## Naming

Gunakan nama domain:

- `fighter`, `player`, `enemy`.
- `prompt`, `dodgePrompt`.
- `attack`, `hit`, `hitbox`, `hurtbox`.
- `combo`, `skill`, `enemySkill`.
- `telegraph`, `cooldown`, `feedback`.

Hindari nama generik:

- `manager` untuk semua hal.
- `handler` tanpa konteks.
- `data` sebagai variable utama.
- `temp`, `stuff`, `thing`.

## Review Checklist

Sebelum selesai:

- Tidak ada rule gameplay baru di Phaser scene.
- Tidak ada asset path baru di scene.
- Tidak ada magic number tuning besar di system; pindah ke `fightRules.ts`.
- Snapshot clone aman bila state baru object/array.
- HUD rerender hash mencakup field baru.
- Scene shutdown membersihkan listener/object.
- `npm.cmd test -- --run` pass.
- `npm.cmd run build` pass.
