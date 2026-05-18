## Update Implementasi Terbaru - 2026-05-18

- [x] Refactor pemilihan spritesheet frame dari `FighterRenderer` ke `FighterFrameResolver`.
- [x] Tambah script `npm run assets:sync` untuk copy asset source ke runtime `public/assets`.
- [x] Tambah `CONTEXT.md` sebagai glossary domain tunggal.
- [x] Perbarui docs utama agar mencatat frame resolver, asset sync, dan glossary objective.
- [x] Terapkan spritesheet `skill.png`, `death.png`, dan `victory.png` ke renderer player/enemy.
- [x] Copy runtime asset baru ke `public/assets/images/player`.
- [x] Atur animasi death agar langsung muncul saat serangan terakhir menyebabkan KO.
- [x] Atur animasi victory player sebagai outcome setelah final strike.
- [x] Revisi quest level 3 menjadi `Combo x3`.

## Update Implementasi Terbaru - 2026-05-14

- [x] Sinkronisasi dokumen `docs/project` dengan semua file modified/untracked di working tree.
- [x] Tambah `IntroScene` sebelum `MenuScene`.
- [x] Tambah transisi neon untuk masuk gameplay, ganti level, buka leaderboard, dan muncul result panel.
- [x] Tambah keyboard shortcut untuk menu, leaderboard, dan result panel.
- [x] Tambah hover/focus state pada button.
- [x] Rebuild combo ke `ComboSystem` terpisah dengan count, best, tier, event serial, dan score feedback.
- [x] Buat ulang UI combo `COMBO xN` di bawah objective panel dengan animasi manual agar tidak flicker.
- [x] Tambah player skill `Neon Break` level 3+: unlock dari combo 3x, progress bar, panel dua kata, damage 2x, reset tekanan enemy.
- [x] Skill aktif saat unlocked dan langsung diketik seperti prompt lain.
- [x] Randomisasi dua kata skill player dari pool Inggris.
- [x] Tambah enemy skill level 6+: cooldown 300% attack normal, damage 2x, panel di bawah kaki enemy.
- [x] Sembunyikan jenis serangan enemy skill dari UI; panel hanya menampilkan `Enemy Skill`.
- [x] Perluas prompt pool menjadi `level1` sampai `level10`, semua bahasa Inggris, dan semakin sulit per level.
- [x] Tambah test untuk `ComboSystem`, `SkillSystem`, player skill, enemy skill, dan typing skill guard.
- [x] Tambah SFX `victory`, `defeat`, dan `wrong`.
- [x] Tambah wrong input shake ke panel prompt/skill aktif.
- [x] Refactor tuning combat/skill/dodge/score ke `src/game/content/fightRules.ts`.
- [x] Refactor player spritesheet data ke `src/phaser/assets/playerSpritesheets.ts`.
- [x] Tambah helper audio `src/phaser/audio/GameAudio.ts` untuk preload/play BGM dan SFX.
- [x] Tambah asset SFX source di `assets/Sound` dan runtime copy di `public/assets/sound`.
- [x] Tambah/copy asset player runtime ke `public/assets/images/player`.
- [x] Tambah panduan penulisan kode di `docs/project/CODE_GUIDE.md`.
- [x] Bedakan fungsi tiap limb: punch kanan cepat, punch kiri combo, kick kanan damage/range, kick kiri stagger enemy.
- [x] Bedakan enemy archetype lewat damage, cooldown, dodge chance, dan feint chance.
- [x] Tambah enemy nameplate di atas cooldown attack untuk menandai lawan yang sedang dihadapi.
- [x] Tambah objective kecil per level dengan progress HUD dan score bonus.
- [x] Tambah pacing wave/phase agar pressure berubah dalam round panjang.
- [x] Tambah `vite.config.mjs` untuk split chunk `phaser` dan hilangkan warning build chunk besar.
- [x] Tambah dokumen UI/UX guide di `docs/project/UI_UX_GUIDE.md`.
- [x] Tambah `CombatSystem.wouldHit()` untuk threat check enemy dodge/feint.
- [x] Update `TypingSystem` agar skill prompt punya guard saat belum aktif/unlocked.

## Update Implementasi Terbaru - 2026-05-13

- [x] Main menu dibuat dengan tombol `START` dan `LEADERBOARD`.
- [x] Menu menampilkan idle fighter player/enemy di atas glow biru/merah.
- [x] Transisi neon dari menu ke fight: slash cyan/pink, flash, dan teks `TYPE TO STRIKE`.
- [x] `LeaderboardScene` dibuat dan membaca data dari `localStorage`.
- [x] Leaderboard sort: level terbanyak selesai, waktu tercepat, score tertinggi.
- [x] Victory panel: `NEXT`, `RETRY`, `MAIN MENU`.
- [x] Defeat panel: `RETRY`, `MAIN MENU`.
- [x] Keyboard `N` hanya aktif saat Victory.
- [x] Result panel menampilkan Combo, Best, Accuracy, Score, Level, dan Rank.
- [x] Rank duplikat di atas tombol result dihapus.
- [x] Debug panel HUD gameplay dihapus.
- [x] Combo kecil diposisikan di bawah panel objective, format `COMBO xN`, tanpa border/background.
- [x] Dokumen project dikumpulkan di `docs/project`; `AGENTS.md` tetap di root.

# Fight Typing - Task Plan

## Status Terkini - 2026-05-13

Yang sudah dikerjakan:

- Prototype Phaser 4 + TypeScript + Vite sudah berjalan dengan canvas `1280x720`, `Phaser.Scale.FIT`, dan DOM HUD.
- Flow scene sudah ada: `BootScene`, `PreloadScene`, `MenuScene`, `FightScene`, dan `LeaderboardScene`.
- Core gameplay sudah data-driven: attack data, hitbox data, prompt pool, level data, dan enemy archetype terpisah dari scene Phaser.
- Source of truth gameplay berada di `src/game/simulation` dan `src/game/systems`; Phaser scene menjadi bridge input/render.
- Typing combat sudah mendukung 4 prompt attack limb: tangan kanan, tangan kiri, kaki kanan, kaki kiri.
- Dodge prompt `Mundur` sudah ada di atas player dan terhitung di metrics.
- Combat sudah punya HP, countdown, pause/resume, win/lose, restart, next level, score, rank, combo, feedback, dan leaderboard localStorage.
- Enemy pressure sudah berjalan dengan cooldown, telegraph, variasi attack berurutan, damage multiplier per archetype, dan progression level.
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

Sumber desain: `docs/project/GDD.md`  
Target stack: Phaser 4 + TypeScript + Vite + DOM HUD  
Resolusi default: 1280x720, `Phaser.Scale.FIT`  
Status: Prototype core implemented, roadmap updated with current work

## Implemented Checkpoint - 2026-05-12

Sudah berjalan:

- Phaser 4 + TypeScript + Vite app.
- Logical resolution `1280x720` dengan `Phaser.Scale.FIT`.
- DOM HUD overlay sejajar dengan canvas.
- Sprite-based placeholder/final-hybrid player/enemy, mudah diganti asset final.
- 4 prompt attack dekat limb player.
- Prompt `Mundur` di atas player untuk dodge.
- Dodge mundur lalu kembali ke posisi awal setelah `0.5s`.
- Player/enemy dash maju saat attack lalu kembali ke posisi home.
- Posisi awal fighter berjauhan; jarak dekat hanya terjadi saat dash attack.
- Enemy cooldown bar di atas enemy, update smooth.
- Enemy attack pressure.
- Combat data-driven dengan attack/hitbox.
- Knockback dibatasi agar target tidak terdorong keluar range pukulan berikutnya.
- Debug hitbox/hurtbox overlay.
- Win/lose/restart/pause basic.
- Unit tests dan build pass pada checkpoint terakhir.
- Player spritesheet asli dari `assets/images/player` sudah dipakai di game.
- Player dan enemy saat ini dirender sebagai sprite; enemy sementara memakai spritesheet player dengan tint magenta sampai asset enemy asli tersedia.
- Player diberi tint biru/cyan memakai `Phaser.TintModes.FILL`.
- Animasi attack memakai manual frame control (`setTexture` + `setFrame`) agar frame pukul/tendang pasti keluar.
- Enemy attack sudah bervariasi: tangan kanan, tangan kiri, kaki kanan, kaki kiri.
- Fighter ditahan di titik serang selama animasi pukul/tendang, lalu kembali ke home.
- Prompt attack lebih menyebar dari badan player.
- Lingkaran aura belakang fighter sudah dinaikkan 100px.

## Definition of Done

Game dianggap selesai untuk versi prototype polish bila:

- Game boot di browser tanpa error.
- Canvas Phaser 4 berjalan pada logical resolution `1280x720`.
- DOM HUD/prompt overlay sejajar dengan canvas pada desktop dan mobile landscape.
- Player bisa mengetik 4 prompt limb: tangan kanan, tangan kiri, kaki kanan, kaki kiri.
- Player bisa mengetik prompt dodge `Mundur` untuk menghindar.
- Enemy cooldown terlihat smooth di atas enemy.
- Setiap prompt memicu attack berbeda.
- Combat memakai data attack + hitbox, bukan hardcode di scene.
- Attack punya dash-in movement untuk juice, lalu balik home saat recovery.
- Knockback tidak membuat target keluar dari range serangan lanjutan.
- Enemy bisa menyerang, terkena hitstun, kalah, dan mengalahkan player.
- Enemy punya variasi serangan limb: tangan kanan, tangan kiri, kaki kanan, kaki kiri.
- Animasi player/enemy mengikuti sequence dash -> strike -> return.
- Placeholder asset bisa diganti via manifest tanpa ubah gameplay code.
- Ada debug overlay untuk hitbox/hurtbox dan typing state.
- Ada smoke test/playtest checklist.
- Juice dasar ada: hit spark, screen shake ringan, hit stop, prompt feedback, combo feedback, SFX placeholder.

## Phase 0 - Project Foundation

### 0.1 Scaffold Project

- [x] Buat project Vite + TypeScript.
- [x] Install Phaser 4.
- [x] Buat `package.json` scripts:
  - [x] `dev`
  - [x] `build`
  - [x] `preview`
  - [x] `test` bila test runner dipasang.
- [x] Buat struktur folder awal:

```text
public/
  assets/
src/
  game/
  phaser/
  ui/
  styles/
docs/
```

Acceptance:

- [x] `npm run dev` membuka halaman game.
- [x] `npm run build` sukses.

### 0.2 Phaser 4 Boot Config

- [x] Buat `src/phaser/config.ts`.
- [x] Set `type: Phaser.AUTO`.
- [x] Set parent `game-container`.
- [x] Set scale:
  - [x] width `1280`
  - [x] height `720`
  - [x] mode `Phaser.Scale.FIT`
  - [x] autoCenter `Phaser.Scale.CENTER_BOTH`
  - [x] min `640x360`
  - [x] max `1920x1080`
- [x] Set FPS target 60.
- [x] Aktifkan keyboard.
- [x] Matikan gamepad/touch untuk MVP.

Acceptance:

- [x] Canvas muncul centered.
- [x] Canvas mempertahankan aspect ratio 16:9.
- [x] Tidak ada stretching.

### 0.3 App Shell and DOM Overlay

- [x] Buat `#game-shell`.
- [x] Buat `#game-container`.
- [x] Buat `#hud-root`.
- [x] CSS `#game-shell` mempertahankan `aspect-ratio: 16 / 9`.
- [x] CSS HUD `position:absolute; inset:0; pointer-events:none`.
- [x] Tambah helper mapping logical coordinate ke percentage.

Acceptance:

- [x] DOM HUD menempel di atas canvas.
- [x] HUD tetap sejajar saat window resize.

## Phase 1 - Architecture Skeleton

### 1.1 Module Boundaries

- [ ] Buat folders:

```text
src/game/simulation/
src/game/systems/
src/game/content/
src/game/input/
src/game/assets/
src/phaser/scenes/
src/phaser/view/
src/phaser/adapters/
src/ui/hud/
src/ui/prompts/
```

- [x] Pastikan scene Phaser tidak menjadi source of truth gameplay.
- [x] Buat boundary scene/simulation; scene hanya render/input bridge.

Acceptance:

- [x] Gameplay systems bisa diimport tanpa Phaser.
- [x] Phaser scene hanya orchestration/render/input bridge.

### 1.2 Data Files

- [x] Buat `src/game/content/attacks.ts`.
- [x] Buat `src/game/content/hitboxes.ts`.
- [x] Buat `src/game/content/promptPools.ts`.
- [x] Buat `src/game/content/fightRules.ts`.
- [x] Buat asset manifest/content boundary.
- [x] Buat action typing/combat mapping.

Acceptance:

- [x] Attack, hitbox, prompt, dan asset key bisa diubah dari data file.
- [x] Tidak ada asset path langsung di scene.

## Phase 2 - Scenes

### 2.1 BootScene

- [x] Buat `BootScene`.
- [x] Init registry/global constants.
- [x] Route ke `PreloadScene`.

Acceptance:

- [x] BootScene berjalan sekali lalu pindah scene.

### 2.2 PreloadScene

- [x] Buat `PreloadScene`.
- [x] Load placeholder/fallback asset flow.
- [x] Tambah loading text sementara.
- [x] Route ke `FightScene`.

Acceptance:

- [x] Placeholder visuals tersedia tanpa asset final.
- [x] Jika asset gagal, fallback tetap playable.

### 2.3 FightScene

- [x] Buat arena background placeholder.
- [x] Tambah ground line pada `y=590`.
- [x] Spawn player di posisi duel home.
- [x] Spawn enemy di posisi duel.
- [x] Hubungkan scene ke simulation state.

Acceptance:

- [x] Player/enemy muncul di posisi benar.
- [x] FightScene tidak berisi combat rules berat.

## Phase 3 - Placeholder Visuals

### 3.1 Shape-Based Fighter

- [x] Buat `FighterRenderer`.
- [x] Render placeholder pakai Phaser Graphics atau simple container:
  - [x] body
  - [x] head
  - [x] right hand
  - [x] left hand
  - [x] right leg
  - [x] left leg
- [x] Warna limb berbeda tipis agar attack terbaca.
- [x] Support facing right/left.

Acceptance:

- [x] Limb mudah dibedakan.
- [x] Anchor visual bottom-center konsisten.

### 3.2 Placeholder Animation States

- [x] Tambah pose/animation methods:
  - [x] `idle`
  - [x] `punchRight`
  - [x] `punchLeft`
  - [x] `kickRight`
  - [x] `kickLeft`
  - [x] `hitstun`
  - [x] `ko`
- [x] Animasi tween/pose sementara.

Acceptance:

- [x] Tiap limb action terlihat beda.
- [x] Serangan kembali ke idle setelah recovery.

### 3.3 Current Sprite Fighter Renderer

- [x] Import player spritesheet ke `public/assets/images/player`.
- [x] Load spritesheet frame `768x448` dari image `3072x3584`.
- [x] Abaikan frame kosong `29..31`.
- [x] Render player dengan sprite sheet asli.
- [x] Render enemy dengan spritesheet sementara yang sama, di-flip dan ditint magenta.
- [x] Tint player menjadi biru/cyan memakai `Phaser.TintModes.FILL`.
- [x] Gunakan manual frame control (`setTexture` + `setFrame`) agar animasi attack tidak ketimpa idle.
- [x] Set ukuran fighter saat ini: width `1000`, height mengikuti aspect ratio `583`.
- [x] Naikkan aura ring belakang fighter ke `AURA_RING_Y = -232`.

Acceptance:

- [x] Idle tidak berkedip karena frame kosong tidak dipakai.
- [x] Pukul/tendang player dan enemy terlihat sesuai action.
- [x] Player terbaca biru dan enemy terbaca magenta.

## Phase 4 - Typing System

### 4.1 Prompt Model

- [x] Buat type `PromptSlot`.
- [ ] Slot:
  - [x] `leftHand`
  - [x] `rightHand`
  - [x] `leftLeg`
  - [x] `rightLeg`
- [x] Buat type `PromptState`:
  - [x] text
  - [x] typed
  - [x] status
  - [x] limb
  - [x] actionId
  - [x] kind (`attack` / `dodge`)

Acceptance:

- [x] 4 prompt attack aktif tersimpan di state.
- [x] 1 prompt dodge aktif tersimpan di state.

### 4.2 Prompt Generation

- [x] Buat `PromptSystem`.
- [x] Generate 4 prompt attack dari pool.
- [x] Generate 1 prompt dodge dari pool.
- [x] Hindari prompt dengan prefix sama 2-3 huruf.
- [ ] Support difficulty:
  - [x] easy 3-4 huruf
  - [x] normal 5-7 huruf
  - [x] hard 8+ huruf via pool level tinggi

Acceptance:

- [x] 4 prompt attack muncul.
- [x] Prompt dodge muncul.
- [x] Prompt tidak ambigu pada huruf awal.

### 4.3 Typing Resolver

- [x] Buat `TypingSystem`.
- [x] Listen keydown dari bridge, bukan langsung dari DOM di system.
- [x] Lock prompt saat input cocok.
- [x] Update typed characters.
- [x] Track miss.
- [x] Emit completed action.
- [x] Refresh prompt setelah completed.

Acceptance:

- [x] Mengetik prompt right hand memicu `attack.punch.right`.
- [x] Mengetik prompt dodge memicu dodge.
- [x] Salah input memberi state miss.
- [x] Prompt completed diganti prompt baru.

### 4.4 Typing Metrics

- [x] Track keystrokes.
- [x] Track correct chars.
- [x] Track wrong chars.
- [x] Track accuracy.
- [x] Track combo.
- [x] Track average completion time.

Acceptance:

- [x] HUD bisa membaca combo dan accuracy.

## Phase 5 - DOM Prompt HUD

### 5.1 Prompt Overlay

- [x] Buat prompt overlay via `HudController`.
- [x] Render 4 prompt dekat limb player, bukan jauh di sudut layar:
  - [x] left hand offset `x=-168,y=-172`
  - [x] right hand offset `x=+184,y=-178`
  - [x] left leg offset `x=-154,y=-26`
  - [x] right leg offset `x=+172,y=-34`
- [x] Convert logical coordinate ke percent dari `1280x720`.

Acceptance:

- [x] Prompt dekat limb tapi tidak menutup karakter utama.
- [x] Prompt sedikit menyebar dari badan player agar sprite besar tidak tertutup penuh.
- [x] Prompt tetap sejajar saat resize.

### 5.1.1 Dodge Prompt Overlay

- [x] Tambah prompt `Mundur` di atas player.
- [x] Prompt memakai state typing yang sama dengan attack prompt.
- [x] Completing prompt memicu dodge.
- [x] Setelah dodge, player kembali ke posisi awal setelah `0.5s`.

Acceptance:

- [x] Player bisa tahu kata untuk menghindar tanpa melihat jauh dari karakter.
- [x] Dodge tidak membuat player permanen mundur.

### 5.2 Prompt Visual States

- [x] Idle state.
- [x] Active/matching state.
- [x] Correct char styling.
- [x] Wrong char flash.
- [x] Completed refresh feedback.

Acceptance:

- [x] Pemain tahu prompt mana sedang diketik.
- [x] Salah input terasa jelas.

### 5.3 Combat HUD

- [x] HP player bar.
- [x] HP enemy bar.
- [x] Combo counter.
- [x] Accuracy meter.
- [x] Round timer placeholder.
- [x] Enemy cooldown bar di atas enemy.

Acceptance:

- [x] HUD terbaca di 1280x720.
- [x] HUD tidak mengganggu 4 prompt limb.
- [x] Enemy cooldown update smooth, tidak lompat penuh.

## Phase 6 - Combat Core

### 6.1 Fighter State Machine

- [x] Buat fighter state flow di simulation.
- [ ] States:
  - [x] idle
  - [x] typing/combat input
  - [x] attack_startup
  - [x] attack_active
  - [x] attack_recovery
  - [ ] block
  - [x] hitstun
  - [x] knockdown/dodge window
  - [x] ko
- [x] State transition berbasis time.
- [x] Attack startup memajukan fighter ke attack spot.
- [x] Attack recovery mengembalikan fighter ke home position.
- [x] `visualActionId`, `visualActionSerial`, dan `visualLockMs` memisahkan timing visual dari timing hit/combat.
- [x] Fighter ditahan di titik serang sampai animasi pukul/tendang selesai.

Acceptance:

- [x] Attack tidak bisa spam tanpa recovery.
- [x] Hitstun mengunci fighter sementara.
- [x] Player/enemy tidak pulang sebelum animasi strike selesai.

### 6.2 Attack Data

- [x] Define 4 attacks:
  - [x] `punch_right`
  - [x] `punch_left`
  - [x] `kick_right`
  - [x] `kick_left`
- [x] Isi damage/startup/active/recovery/range/hitstun/knockback.
- [x] Enemy memakai attack data player yang sama untuk variasi limb sementara.

Acceptance:

- [x] Semua attack berasal dari `attacks.ts`.
- [x] Enemy variation tidak lagi hardcode ke satu `enemy.jab` saja.

### 6.3 Hitbox System

- [x] Buat hitbox resolution di `CombatSystem`.
- [x] Rectangle hitbox relatif anchor fighter.
- [x] Flip hitbox saat fighter menghadap kiri.
- [x] Hurtbox sederhana untuk player/enemy.
- [x] Deteksi overlap saat active window.

Acceptance:

- [x] Punch hanya hit saat active window.
- [x] Kick punya range lebih jauh dari punch.

### 6.4 Combat Resolution

- [x] Buat `CombatSystem`.
- [x] Saat attack hit:
  - [x] apply damage
  - [x] apply hitstun
  - [x] apply capped knockback
  - [x] emit hit event
- [x] Prevent multi-hit dari same active window kecuali disetel.
- [x] Clamp duel spacing agar pukulan berikutnya tetap sampai.

Acceptance:

- [x] Enemy HP turun saat kena.
- [x] Hit event bisa dipakai render FX.
- [x] Repeated punch tidak gagal karena target terdorong terlalu jauh.

## Phase 7 - Enemy MVP

### 7.1 Dummy Enemy

- [x] Enemy idle.
- [x] Enemy punya HP.
- [x] Enemy menerima damage/hitstun.
- [x] Enemy KO saat HP 0.

Acceptance:

- [x] Player bisa menang melawan dummy.

### 7.2 Enemy Pressure

- [x] Enemy punya attack timer.
- [x] Enemy cooldown bar terlihat di atas enemy.
- [x] Enemy cooldown smooth per frame/HUD tick.
- [x] Enemy telegraph/pressure sebelum attack.
- [x] Enemy attack jika player lambat.
- [x] Enemy attack bervariasi berurutan:
  - [x] tangan kanan
  - [x] tangan kiri
  - [x] kaki kanan
  - [x] kaki kiri
- [x] Enemy memakai animasi sprite untuk punch/kick sementara.
- [x] Enemy maju, menyelesaikan animasi strike, lalu kembali ke home.
- [x] Player bisa menghindar dengan prompt dodge.

Acceptance:

- [x] Player bisa kalah.
- [x] Typing cepat terasa penting.
- [x] Enemy tidak terlihat hanya memakai satu jenis pukulan.

### 7.3 Enemy Difficulty

- [ ] Easy: attack interval lambat.
- [ ] Normal: attack interval sedang.
- [ ] Hard: attack interval cepat + HP lebih besar.

Acceptance:

- [ ] Difficulty bisa diganti dari data.

## Phase 8 - Asset Pipeline Ready

### 8.1 Asset Manifest

- [x] Manifest punya stable keys awal:
  - [x] `fighter_player`
  - [x] `fighter_enemy`
  - [ ] `fx_hit_spark`
  - [ ] `sfx_hit`
  - [ ] `sfx_type_correct`
  - [ ] `sfx_type_wrong`
- [x] Path placeholder dan final dipisah di data manifest awal.

Acceptance:

- [ ] Ganti semua asset final cukup ubah manifest path.

### 8.2 Placeholder Sprite Option

- [x] Sprite flow awal dipakai dengan asset player real.
- [x] Frame keys mengikuti naming action final:
  - [x] idle
  - [x] dash
  - [x] punchRight
  - [x] punchLeft
  - [x] kickRight
  - [x] kickLeft
- [x] Enemy memakai sprite placeholder dari player sheet sampai asset enemy asli tersedia.

Acceptance:

- [x] Animation/texture key final sudah stabil walau enemy asset masih placeholder.

### 8.3 Final Asset Prep Checklist

- [ ] Seed idle frame facing right.
- [ ] Transparent background.
- [ ] Frame size `256x256`.
- [ ] Anchor bottom-center `x=128,y=236`.
- [ ] Strip per animation.
- [ ] Normalize scale/anchor.
- [ ] Preview sheet.
- [ ] Import ke Phaser.
- [ ] Tune hitbox data.

Acceptance:

- [ ] Artist/generator bisa mengikuti checklist tanpa ubah design.

## Phase 9 - Debug Tools

### 9.1 Hitbox Debug Overlay

- [x] Toggle/show hitbox/hurtbox dengan key/debug mode.
- [x] Draw:
  - [x] attack hitbox red
  - [x] hurtbox blue
  - [ ] collision/body box green
- [x] Tampilkan active frame state.

Acceptance:

- [x] Tuning combat bisa dilakukan visually.

### 9.2 Typing Debug Panel

- [ ] Show active prompt id.
- [ ] Show locked limb.
- [ ] Show miss count.
- [ ] Show current action event.

Acceptance:

- [ ] Typing bug mudah dilacak.

### 9.3 Combat Debug Panel

- [ ] Show player/enemy state.
- [ ] Show timers startup/active/recovery.
- [ ] Show last hit data.

Acceptance:

- [ ] Combat frame timing mudah dituning.

## Phase 10 - Game Flow

### 10.1 Round Start

- [ ] Start countdown: 3, 2, 1, Fight.
- [ ] Lock input sebelum fight.
- [ ] Generate prompts saat fight mulai.

Acceptance:

- [ ] Round start jelas.

### 10.2 Win/Lose State

- [x] Detect player KO.
- [x] Detect enemy KO.
- [x] Show result overlay.
- [x] Add restart key/button.

Acceptance:

- [x] Game bisa restart tanpa reload page.

### 10.3 Pause

- [x] Add pause action.
- [x] Freeze simulation.
- [x] Pause input resolver except resume.
- [x] Show pause overlay.

Acceptance:

- [x] Pause tidak merusak prompt state.

## Phase 11 - Balance Pass

### 11.1 Attack Balance

- [x] Jab: cepat, low damage.
- [x] Cross/hook: medium damage.
- [x] Kick right: long range, slower.
- [x] Kick left: low/sweep utility.
- [ ] Tune startup/recovery.

Acceptance:

- [x] Tiap limb punya alasan dipilih.

### 11.2 Prompt Balance

- [ ] Limb cepat pakai kata lebih pendek.
- [ ] Limb kuat pakai kata lebih panjang.
- [ ] Hindari prompt terlalu mirip.
- [ ] Tambah word pools Indonesia/English later.

Acceptance:

- [ ] Typing choice punya tradeoff.

### 11.3 Enemy Balance

- [ ] Tune attack interval.
- [ ] Tune telegraph length.
- [ ] Tune damage enemy.
- [ ] Tune HP.

Acceptance:

- [ ] Round MVP berdurasi 30-90 detik.

## Phase 12 - Juice Pass 1

### 12.1 Hit Feedback

- [ ] Hit spark pada impact point.
- [ ] Small screen shake on hit.
- [ ] Hit stop 40-80 ms.
- [x] Enemy flash saat hit.
- [ ] Damage number optional.

Acceptance:

- [x] Hit terasa jelas tanpa mengganggu typing.

### 12.2 Typing Feedback

- [ ] Correct key small pop.
- [ ] Wrong key shake/red flash.
- [ ] Completed prompt burst.
- [ ] Combo number pulse.
- [ ] Perfect prompt badge.

Acceptance:

- [ ] Typing sukses terasa memuaskan.

### 12.3 Camera and Motion

- [ ] Camera shake only on confirmed hit.
- [ ] Tiny zoom punch optional.
- [ ] No constant camera movement.
- [ ] Respect readability.

Acceptance:

- [ ] Prompt tetap mudah dibaca saat FX terjadi.

## Phase 13 - Audio Pass

### 13.1 Placeholder SFX

- [x] type correct
- [x] type wrong
- [ ] prompt complete
- [x] punch hit
- [x] kick hit
- [ ] enemy hit
- [x] victory
- [x] defeat

Acceptance:

- [ ] Semua major feedback punya suara.

### 13.2 Mix

- [ ] Volume groups:
  - [ ] typing
  - [ ] hit
  - [ ] UI
  - [ ] music
- [ ] Add mute toggle.

Acceptance:

- [ ] Typing SFX tidak melelahkan.

## Phase 14 - UI Polish

### 14.1 Visual Direction

- [ ] Pilih tone visual:
  - [ ] arcade martial arts
  - [ ] neon training room
  - [ ] anime sparring dojo
  - [ ] pixel brawler
- [ ] Set CSS variables:
  - [ ] colors
  - [ ] prompt states
  - [ ] HP bars
  - [ ] font scale

Acceptance:

- [ ] UI terasa game, bukan dashboard.

### 14.2 Responsive HUD

- [ ] Desktop landscape.
- [ ] Tablet landscape.
- [ ] Mobile landscape.
- [ ] Portrait warning or compact prompt layout.

Acceptance:

- [ ] Prompt tidak overlap pada viewport utama.

### 14.3 Accessibility Basics

- [ ] High contrast prompt text.
- [ ] Reduced motion CSS path.
- [ ] Font size readable.
- [ ] No color-only feedback for wrong/correct.

Acceptance:

- [ ] Game masih playable dengan reduced motion.

## Phase 15 - Testing

### 15.1 Unit Tests

- [x] `PromptSystem` avoids ambiguous prefix.
- [x] `TypingSystem` locks prompt correctly.
- [x] `TypingSystem` handles miss.
- [x] `CombatSystem` applies damage once.
- [x] `CombatSystem` caps knockback so repeated punches stay in range.
- [x] `FightSimulation` advances enemy cooldown smoothly.
- [x] `FightSimulation` returns player after dodge delay.
- [x] `FighterStateMachine`/simulation transitions correctly.

Acceptance:

- [x] Core rules testable without Phaser.

### 15.2 Browser Smoke Test

- [x] Game boots.
- [x] Player can complete each limb prompt.
- [x] Each limb triggers correct attack.
- [x] Dodge prompt moves player back then returns.
- [x] Enemy cooldown bar changes smoothly.
- [x] Enemy HP changes.
- [x] Enemy can attack player.
- [x] Player/enemy dash in during attack and return home.
- [x] Player/enemy stay forward until strike animation finishes, then return home.
- [x] Enemy cycles varied attacks instead of one repeated jab.
- [x] Player blue tint and enemy magenta tint render.
- [x] Win screen appears.
- [x] Lose screen appears.
- [x] Restart works.

Acceptance:

- [x] Smoke test passes in browser.

### 15.3 Screenshot Review

- [x] Capture idle state.
- [x] Capture active typing state.
- [x] Capture hit impact / prompt placement.
- [x] Capture enemy cooldown.
- [x] Capture dodge movement.
- [ ] Capture win/lose overlay.

Acceptance:

- [x] HUD readable.
- [x] Playfield not covered.
- [x] Hit effects visible.

## Phase 16 - Performance and Stability

### 16.1 Runtime Stability

- [ ] No unbounded event listeners.
- [ ] Scene restart cleans old DOM listeners.
- [ ] Destroy/dispose renderer objects on scene shutdown.
- [ ] Prompt overlay cleanup works.

Acceptance:

- [ ] Restart round 10x no duplicate input.

### 16.2 Performance Budget

- [ ] 60 FPS target desktop.
- [ ] No heavy DOM re-render per frame.
- [ ] Update HUD only when state changes.
- [ ] FX objects pooled or short-lived with cleanup.

Acceptance:

- [ ] Stable frame pacing on normal browser.

## Phase 17 - Content Expansion

### 17.1 More Prompt Pools

- [ ] Add Indonesian short words, bila nanti mode bahasa Indonesia dipilih.
- [x] Add English short words.
- [x] Add fighting-themed words.
- [x] Add difficulty pools level 1-10.

Acceptance:

- [ ] Prompt repetition reduced.

### 17.2 More Enemy Types

- [ ] Slow heavy enemy.
- [ ] Fast light enemy.
- [ ] Guard enemy.
- [ ] Boss prototype.

Acceptance:

- [ ] Enemy data can create different fights.

### 17.3 Special Moves

- [x] Two-word skill prompt triggers special attack from level 3+.
- [x] Skill unlocks after 3 combo points.
- [x] Skill deals 2x damage and then locks again until recharged.
- [x] Skill input langsung diketik saat unlocked.
- [ ] Perfect chain triggers combo finisher.
- [ ] Guard break prompt.

Acceptance:

- [ ] Special move expands typing depth, not random power.

## Phase 18 - Final Asset Swap

### 18.1 Player Asset

- [x] Import player idle.
- [x] Import player punch right.
- [x] Import player punch left.
- [x] Import player kick right.
- [x] Import player kick left.
- [x] Import player dash.
- [ ] Import final hitstun.
- [ ] Import final KO.
- [x] Tune scale/display size sementara: width `1000`, height auto `583`.
- [x] Tune visible attack frame ranges:
  - [x] punch right `10..17`
  - [x] punch left `13..18`
  - [x] kick right `8..15`
  - [x] kick left `6..18`
- [ ] Tune anchor final.
- [ ] Tune hitboxes final.

Acceptance:

- [x] Player asset works in-game with current loader/manual frame renderer.

### 18.2 Enemy Asset

- [x] Same animation set as player minimum, currently via tinted player placeholder.
- [ ] Import true enemy idle/punch/kick/dash sheets.
- [ ] Tune enemy scale.
- [ ] Tune enemy hurtbox.
- [ ] Tune telegraph readability.

Acceptance:

- [x] Enemy placeholder asset readable.
- [ ] Enemy final asset readable.

### 18.3 FX and UI Assets

- [ ] Hit spark.
- [ ] Prompt burst.
- [ ] HP bar styling.
- [ ] KO overlay.
- [ ] Round start overlay.

Acceptance:

- [ ] Placeholder visuals no longer dominate.

## Phase 19 - Polish and Juice Pass 2

### 19.1 Combat Feel Polish

- [ ] Tune hit stop per attack.
- [ ] Tune knockback.
- [ ] Tune camera shake strength.
- [ ] Add impact pause only on real hit.
- [ ] Add whiff animation recovery clarity.

Acceptance:

- [ ] Attacks feel weighty but responsive.

### 19.2 Typing Feel Polish

- [ ] Add key rhythm feedback.
- [ ] Add combo escalation.
- [ ] Add near-miss forgiveness decision if needed.
- [ ] Add backspace behavior if chosen.
- [ ] Add prompt spawn animation.

Acceptance:

- [ ] Player understands mistakes instantly.

### 19.3 Presentation Polish

- [ ] Better arena background.
- [ ] Foreground dust/impact particles.
- [ ] Round transition.
- [ ] Victory pose.
- [ ] Defeat pose.

Acceptance:

- [ ] 30-sec clip communicates game fantasy clearly.

## Phase 20 - Release Candidate

### 20.1 Build Check

- [ ] `npm run build`.
- [ ] `npm run preview`.
- [ ] Browser smoke test.
- [ ] Screenshot pass.

Acceptance:

- [ ] Build output playable.

### 20.2 Documentation

- [x] Update `docs/project/README.md` with:
  - [x] install
  - [x] dev command
  - [x] controls
  - [x] asset replacement guide
  - [x] debug keys
- [x] Add `docs/project/CODE_GUIDE.md`.
- [ ] Update `docs/project/GDD.md` if design changed.
- [ ] Keep `docs/project/TASK.md` checked off.

Acceptance:

- [ ] New contributor can run and understand project.

### 20.3 Backlog After Prototype

- [ ] Online leaderboard.
- [ ] Training mode.
- [ ] Multiple characters.
- [ ] Story/arcade ladder.
- [ ] More languages.
- [ ] Input accessibility options.
- [ ] Full sprite pipeline automation.

## Suggested Next Build Order

1. Tune enemy cooldown, damage, HP, and dodge timing after playtest.
2. Import true enemy spritesheet set so enemy no longer uses tinted player placeholder.
3. Tune player/enemy display scale, prompt spread, and aura placement after visual playtest.
4. Tune hitboxes against current visible attack frames.
5. Add stronger typing juice: key pop, wrong flash, prompt burst, combo pulse.
6. Add placeholder SFX and mute toggle.
7. Expand prompt pools, especially Indonesian and fighting-themed words.
8. Add round-start countdown and cleaner win/lose screenshot coverage.
9. Harden restart/performance cleanup.
10. Polish arena, FX, camera, and release build.
