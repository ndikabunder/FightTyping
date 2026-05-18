## Update Terbaru - 2026-05-18

- Asset spritesheet tambahan sudah diterapkan: `skill.png`, `death.png`, dan `victory.png` dari `assets/images/player` ke runtime `public/assets/images/player`.
- `FighterRenderer` tetap memakai manual frame control; animasi death langsung keluar saat fighter terkena serangan terakhir/KO.
- Animasi victory player memakai spritesheet `victory.png` setelah final strike/result reveal selesai.
- Objective level 3 direvisi menjadi `Keep combo x3` dengan progress `Combo x3` agar urutan quest lebih mudah.

## Update Terbaru - 2026-05-14

- Sinkronisasi working tree: semua perubahan code modified/untracked per `git status` sudah dicatat di dokumen `docs/project`.
- Scene flow sekarang: `BootScene -> PreloadScene -> IntroScene -> MenuScene -> FightScene`, dengan `LeaderboardScene` dari menu.
- Transisi neon tersedia untuk intro/menu, start gameplay, leaderboard, pergantian level, victory, dan defeat.
- Menu, leaderboard, dan result panel bisa dipakai dengan keyboard shortcut dan tetap punya hover/focus mouse.
- Combo system sudah rebuilt dan tampil sebagai `COMBO xN` di bawah objective panel.
- Level 3+ punya player skill `Neon Break`: unlock setelah combo 3x, panel dua kata di bawah kaki player, langsung diketik seperti prompt lain, damage 2x dan reset tekanan enemy.
- Level 6+ punya enemy skill: cooldown 300% attack normal, damage 2x, panel hanya menampilkan `Enemy Skill`.
- Tiap limb sekarang punya fungsi taktis: punch kanan cepat, punch kiri +combo, kick kanan damage/range, kick kiri delay tekanan enemy.
- Enemy archetype makin beda lewat damage, cooldown, dodge chance, dan feint chance.
- Enemy punya nameplate di atas panel cooldown attack agar pemain tahu archetype lawan saat fight.
- Tiap level punya objective kecil dengan progress HUD dan bonus score saat menang.
- Round punya pacing wave; enemy pressure naik saat fight berjalan lama.
- Prompt pool level 1-10 sudah diperluas, semua kata bahasa Inggris, dan semakin sulit per level.
- SFX aktif: `bgm`, typing, punch, kick, skill, transition, victory, defeat, dan wrong input.
- Asset SFX source ada di `assets/Sound`, runtime copy ada di `public/assets/sound`, dan loader/audio helper ada di `src/phaser/audio/GameAudio.ts`.
- Asset player source ada di `assets/images/player`; runtime Phaser memakai `public/assets/images/player` dan manifest `src/phaser/assets/playerSpritesheets.ts`.
- Tuning utama combat/skill/dodge/score dipusatkan di `src/game/content/fightRules.ts`.
- Player spritesheet loading dipusatkan di `src/phaser/assets/playerSpritesheets.ts`.
- Build Vite memakai `vite.config.mjs` untuk memisahkan chunk `phaser` dari app code dan menaikkan batas warning bundle sesuai ukuran engine.
- Panduan penulisan kode ada di `docs/project/CODE_GUIDE.md`.
- Panduan UI/UX ada di `docs/project/UI_UX_GUIDE.md`.

## Update Terbaru - 2026-05-13

- Dokumen project utama berada di `docs/project`.
- `AGENTS.md` tetap berada di root repo.
- Scene flow: `BootScene -> PreloadScene -> MenuScene -> FightScene`, dengan `LeaderboardScene` dari menu.
- Main menu: `START`, `LEADERBOARD`, idle fighter, dan transisi neon ke gameplay.
- Victory: `NEXT`, `RETRY`, `MAIN MENU`.
- Defeat: `RETRY`, `MAIN MENU`.
- Leaderboard memakai `localStorage`.
- Combo tampil di bawah panel objective sebagai `COMBO xN`.
- Debug panel HUD gameplay sudah dihilangkan.

# Fight Typing

## Status Terkini - 2026-05-14

Yang sudah dikerjakan:

- Prototype Phaser 4 + TypeScript + Vite sudah berjalan dengan canvas `1280x720`, `Phaser.Scale.FIT`, dan DOM HUD.
- Flow scene sudah ada: `BootScene`, `PreloadScene`, `IntroScene`, `MenuScene`, `FightScene`, dan `LeaderboardScene`.
- Core gameplay sudah data-driven: attack data, hitbox data, prompt pool, level data, dan enemy archetype terpisah dari scene Phaser.
- Source of truth gameplay berada di `src/game/simulation` dan `src/game/systems`; Phaser scene menjadi bridge input/render.
- Typing combat sudah mendukung 4 prompt attack limb: tangan kanan, tangan kiri, kaki kanan, kaki kiri.
- Dodge prompt `Mundur` sudah ada di atas player dan terhitung di metrics.
- Combat sudah punya HP, countdown, pause/resume, win/lose, restart, next level, score, rank, combo, objective, player skill, enemy skill, feedback, dan leaderboard localStorage.
- Enemy pressure sudah berjalan dengan cooldown, telegraph, variasi attack berurutan, skill level 6+, dodge/feint chance, damage/cooldown multiplier per archetype, pacing wave, dan progression level.
- Player asset aktif memakai spritesheet di `assets/images/player`, diload dari `public/assets/images/player`.
- `FighterRenderer` memakai manual frame control (`setTexture` + `setFrame`), bukan `sprite.play`, supaya tiap attack bisa memakai range frame berbeda.
- Player diberi tint biru/cyan, enemy sementara memakai spritesheet player yang sama dengan flip facing dan tint magenta.
- Attack visual sudah berupa dash maju, hold saat animasi pukul/tendang, lalu kembali ke home.
- Prompt attack sudah ditempatkan dekat limb player; dodge prompt tetap di atas player.
- Debug overlay hitbox/hurtbox bisa ditoggle dengan tombol `` ` ``.
- Unit test tersedia untuk typing, prompt, combat, dan simulation.
- Build produksi pernah tersedia di `dist/`; validasi berikut tetap wajib dijalankan setelah perubahan gameplay/visual.

Range frame attack aktif:

- `attack.punch.right`: `PukulTanganKanan.png` frame `10..17`
- `attack.punch.left`: `PukulTanganKiri.png` frame `13..18`
- `attack.kick.right`: `TendangKakiKanan.png` frame `8..15`
- `attack.kick.left`: `TendangKakiKiri.png` frame `6..18`

Dokumen project sekarang dikumpulkan di folder `docs/project`, kecuali `AGENTS.md` tetap di root repo.

Phaser 4 typing-fighting prototype. Type limb prompts to trigger attacks.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Controls

- Type prompt text: attack with matching limb.
- Type dodge prompt: move back and avoid enemy attack.
- Level 3+ `Neon Break`: build combo 3x, then type the two-word skill prompt directly.
- `Esc`: pause/resume.
- `` ` ``: toggle hitbox/debug overlay.
- Menu: `S`/`Enter` start, `L` leaderboard.
- Leaderboard: `B`/`Esc` back, `S`/`Enter` start, `C` clear.
- Result: `R` retry, `M`/`Esc` main menu, `N` next on victory only.
- Level shortcut: `1-9` for level 1-9, `0` for level 10.

## Asset Swap

Current prototype uses spritesheet player assets from `assets/images/player`, copied to `public/assets/images/player` for Vite/Phaser loading. Enemy still uses the player sheet as a flipped magenta placeholder until true enemy assets exist.

Replace final asset paths there, keep frame metadata consistent:

- frame size: `256x256`
- anchor: bottom-center, `x=128,y=236`
- animation keys: `punch_right`, `punch_left`, `kick_right`, `kick_left`, `idle`, `hitstun`, `ko`

Gameplay data lives outside Phaser scene code:

- attacks: `src/game/content/attacks.ts`
- hitboxes: `src/game/content/hitboxes.ts`
- prompts: `src/game/content/promptPools.ts`
- rules/tuning: `src/game/content/fightRules.ts`
- player spritesheets: `src/phaser/assets/playerSpritesheets.ts`

## Developer Docs

- Code guide: `docs/project/CODE_GUIDE.md`
- GDD: `docs/project/GDD.md`
- Task plan: `docs/project/TASK.md`
- Polish plan: `docs/project/POLISH.md`
- Level design: `docs/project/LEVEL.md`
- SFX style: `docs/project/SFX_STYLE_GUIDE.md`
