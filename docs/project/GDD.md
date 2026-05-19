## Update Implementasi Terbaru - 2026-05-19

- Quest panel dipoles ulang menjadi state `IN PROGRESS` dan `CLEAR` dengan progress bar, badge status, glow statis, dan motion `quest clear` sekali jalan; animasi nudge yang membuat status terasa bergetar sudah dihapus.
- Quest complete/incomplete punya treatment visual berbeda: incomplete memakai aksen gold, complete memakai cyan; combo tetap berada di bawah panel objective dan tidak memakai border/background.
- Tutorial ringan level 1-3 ditampilkan di briefing sebagai box `TIP LEVEL X`: L1 membaca prompt limb, L2 menjaga combo dan menghindari wrong key, L3 memakai `Neon Break` setelah combo 3x.
- Replay loop ditambah lewat medal run `S/A/B/C`, badge `PERFECT QUEST ✦`, kolom medal di leaderboard, dan ringkasan `BEST BY LEVEL`.
- Shortcut angka `0-9` untuk pindah level dihapus dari runtime gameplay; progres level normal tetap lewat victory `NEXT`.
- Debug hitbox/hurtbox tidak lagi aktif secara default; box combat hanya muncul jika debug ditoggle dengan tombol `` ` ``.
- Combat feel dipoles: hitstop naik menjadi punch `58ms` dan kick `86ms`, spark/cross impact lokal diperkuat, shake tetap aktif, full-screen flash hit biasa dihapus agar tidak membuat pusing.
- Typing microfeedback ditambah: huruf terakhir yang benar melakukan pop kecil, prompt matching punya glow lebih kuat, SFX typing/attack memakai variasi rate ringan.
- Enemy warning readability ditambah: cooldown attack menampilkan cue `WATCH`, `READY`, atau `DODGE NOW`; enemy skill menampilkan `CHARGING`, `WARNING`, atau `DANGER`.
- Level pacing dituning ke kurva introduce → test → remix → mastery; beberapa HP/cooldown/telegraph/focus level disesuaikan untuk L1, L3-L6, L8-L10.

## Update Implementasi Terbaru - 2026-05-18

- `FighterFrameResolver` menjadi seam khusus untuk memilih frame visual fighter: attack dash, attack impact, skill, death, victory, knockdown, dan idle.
- Asset pipeline manual diganti dengan script `npm run assets:sync` agar source asset dan runtime asset tidak mudah drift.
- `CONTEXT.md` ditambahkan sebagai glossary domain utama untuk menyatukan istilah objective, combo, skill, final strike, outcome animation, dan runtime/source asset.
- Spritesheet `skill.png`, `death.png`, dan `victory.png` sudah masuk ke manifest player dan diload Phaser dari `public/assets/images/player`.
- Animasi death diprioritaskan saat `ko`, sehingga muncul langsung ketika serangan terakhir mengenai target.
- Animasi victory player tampil sebagai outcome menang setelah final strike selesai.
- Objective level 3 diubah dari `Land 1 kick` menjadi `Keep combo x3` / progress `Combo x3` target 3.

## Update Implementasi Terbaru - 2026-05-14

- Sinkronisasi working tree: perubahan code modified/untracked sekarang terdokumentasi, termasuk `fightRules`, audio helper, player spritesheet manifest, asset SFX, dan copy runtime `public/assets`.
- Flow scene sekarang lengkap: `BootScene -> PreloadScene -> IntroScene -> MenuScene -> FightScene`, dengan `LeaderboardScene` dari menu.
- Intro awal dan transisi antar menu, leaderboard, level, victory, dan defeat memakai slash/flash neon agar perpindahan scene terasa arcade.
- Menu dan leaderboard mendukung keyboard-only shortcut: `S`/`Enter` untuk start, `L` untuk leaderboard, `B`/`Esc` untuk back, `C` untuk clear.
- Semua button punya hover/focus state agar nyaman dipakai dengan mouse maupun keyboard.
- Combo system dibangun ulang sebagai `ComboSystem` terpisah. Combo naik saat prompt sukses, pecah saat miss/hit tertentu, punya tier, best combo, serial event, dan feedback `COMBO xN` di bawah objective panel.
- Level 3+ membuka player skill `Neon Break`: panel dua kata muncul di bawah kaki player, terkunci sampai combo 3x, punya progress bar, lalu aktif sebagai damage 2x dan reset tekanan enemy.
- Skill player langsung diketik seperti prompt lain saat unlocked.
- Kata skill player dipilih dari pool Inggris secara dinamis per level, bukan selalu `power strike`.
- Level 6+ membuka enemy skill: panel berada di bawah kaki enemy, cooldown 300% dari cooldown attack normal, damage 2x, dan UI hanya menampilkan `Enemy Skill` tanpa membocorkan jenis serangan.
- Prompt pool diperluas menjadi `level1` sampai `level10`, semuanya bahasa Inggris, dan semakin panjang/sulit seiring naik level.
- Wrong input memberi shake pada panel aktif dan SFX `wrong.mp3`.
- Victory/defeat punya SFX khusus.
- Tuning rule combat, dodge, enemy skill, hitstop, dan scoring dipusatkan di `src/game/content/fightRules.ts`.
- Limb punya fungsi gameplay: punch kanan cepat, punch kiri memberi extra combo, kick kanan untuk damage/range, kick kiri memberi stagger/delay enemy.
- Enemy archetype memakai damage, cooldown, dodge, dan feint chance agar Heavy, Tempo, Trickster, dan Boss terasa beda.
- HUD menampilkan enemy nameplate di atas panel cooldown attack supaya archetype lawan terbaca tanpa membuka objective panel.
- Tiap level punya objective kecil dengan progress HUD dan bonus score.
- Pacing wave menaikkan pressure setiap fight berjalan lama; boss memakai phase pressure sendiri.
- `CombatSystem.wouldHit()` dipakai untuk membaca ancaman aktif sebelum enemy dodge/feint sehingga defense enemy lebih data-driven.
- `TypingSystem` punya guard khusus agar skill prompt hanya menerima input saat skill unlocked/aktif.

## Update Implementasi Terbaru - 2026-05-13

- Main menu punya `START` dan `LEADERBOARD`, dengan idle fighter player/enemy di atas glow biru/merah.
- Transisi `START` ke gameplay memakai gaya neon arcade: slash cyan/pink, flash, dan teks `TYPE TO STRIKE`.
- Leaderboard memakai `localStorage`, sort berdasarkan level terbanyak selesai, waktu tercepat, lalu score tertinggi.
- Victory panel punya `NEXT`, `RETRY`, `MAIN MENU`; Defeat panel hanya `RETRY`, `MAIN MENU`.
- Keyboard `N` hanya berlaku saat Victory.
- Result panel menampilkan Combo, Best, Accuracy, Score, Level, dan Rank; teks rank duplikat sudah dihapus.
- Debug panel HUD gameplay sudah dihilangkan.
- Combo tampil di bawah panel objective sebagai `COMBO xN`, tanpa border/background, dan tidak boleh flicker.
- Tema SFX yang direkomendasikan: `Cyber Martial Typing / Neon Impact`.
- Dokumen project utama berada di `docs/project`; `AGENTS.md` tetap di root.

# Fight Typing - Game Design Document

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

Tanggal: 2026-05-12  
Status: Prototype implemented, design updated  
Target stack: Phaser 4 + TypeScript + Vite + DOM HUD

## 1. High Concept

`Fight Typing` adalah game fighting 2D berbasis typing. Pemain menyerang dengan mengetik teks yang muncul di dekat anggota tubuh player: tangan kanan, tangan kiri, kaki kanan, dan kaki kiri. Zona yang berhasil diketik menentukan serangan yang keluar. Player juga punya prompt `Mundur` di atas karakter untuk menghindari serangan enemy.

Contoh:

- Teks di tangan kanan selesai diketik -> karakter melakukan pukulan tangan kanan.
- Teks di tangan kiri selesai diketik -> karakter melakukan pukulan tangan kiri.
- Teks di kaki kanan selesai diketik -> karakter melakukan tendangan kaki kanan.
- Teks di kaki kiri selesai diketik -> karakter melakukan tendangan kaki kiri.

Tujuan desain: typing tidak terasa seperti minigame terpisah, tetapi menjadi input fighting utama.

### Current Prototype State

Prototype Phaser 4 sudah berjalan dengan spritesheet fighter, DOM HUD, prompt attack dekat limb player, prompt dodge di atas player, cooldown bar enemy di atas nama enemy, dash-in attack movement, combat data-driven, SFX dasar, debug hitbox/hurtbox, unit tests, dan browser smoke test.

## 2. Referensi Riset

### Typing Combat

- [The Typing of the Dead - StrategyWiki](https://strategywiki.org/wiki/The_Typing_of_the_Dead/Gameplay): referensi utama untuk word prompt sebagai target serangan. Game memberi rating berdasarkan cepat/akuratnya pemain mengetik kata.
- [The Typing of the Dead - Fandom](https://thehouseofthedead.fandom.com/wiki/The_Typing_of_the_Dead): referensi konsep mengetik kata/frasa untuk mengalahkan musuh.

Pelajaran untuk project ini:

- Teks harus terbaca cepat.
- Prompt pendek cocok untuk aksi cepat.
- Prompt panjang cocok untuk special move, guard break, atau finisher.
- Feedback typing harus langsung: huruf benar, salah, combo, miss, dan sukses.

### Phaser 4 + Spritesheet

- [MDN Phaser Animations and Tweens](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_breakout_game_Phaser/Animations_and_tweens): Phaser memakai spritesheet untuk animasi frame-by-frame.
- [Phaser example: Create Animation From Sprite Sheet](https://phaser.io/examples-show/338): contoh loading spritesheet dan membuat animation key.
- [Herodom spritesheet generator news](https://phaser.io/news/2020/05/herodom-open-source-spritesheet-generator): referensi workflow generator spritesheet karakter 2D.

Pelajaran untuk project ini:

- Asset asli nanti cukup mengganti spritesheet dan manifest key.
- Animasi harus punya key stabil: `punch_right`, `punch_left`, `kick_right`, `kick_left`, `idle`, `hitstun`, `block`, `ko`.
- Gameplay code tidak boleh tergantung path file langsung.

### Fighting Game Hitbox/Hurtbox

- [UFE hitbox reference](https://ufe3d.com/doku.php/character%3Ahitbox?do=export_pdf): hitbox adalah bahan utama fighting game; hit dikonfirmasi saat hitbox dan hurtbox overlap.
- [Reddit gamedev discussion: classic fighting game hitboxes](https://www.reddit.com/r/gamedev/comments/123xqge/how_would_classic_2d_fighting_game_hitboxes/): fighting game umum memakai collision box per move/per frame.
- [Reddit Godot discussion: hitbox/hurtbox types](https://www.reddit.com/r/godot/comments/c54azn/hitboxeshurtboxes_for_fighting_games/): pola umum: hitbox untuk serangan, hurtbox untuk tubuh yang bisa terkena, collision box untuk posisi karakter.

Pelajaran untuk project ini:

- Jangan bergantung pada pixel-perfect collision.
- Tiap attack punya frame data: startup, active, recovery.
- Tiap attack punya hitbox data yang bisa diganti tanpa mengganti animasi.
- Untuk prototype, pakai rectangle hitbox sederhana dulu.

## 3. Player Fantasy

Pemain merasa seperti petarung yang “mengetik kombo”. Keyboard menjadi kontrol bela diri. Kecepatan, akurasi, dan keputusan memilih prompt menentukan serangan mana yang keluar.

Fantasy pendek: "Keyboard duel. Type fast, strike precise."

## 4. Core Pillars

1. Typing adalah input utama.
2. Setiap limb punya fungsi taktis.
3. Serangan harus terbaca secara visual.
4. Asset harus mudah diganti.
5. Prototype harus playable tanpa asset final.

## 5. Core Loop

1. Musuh masuk range.
2. Game menampilkan 4 prompt attack di dekat limb player:
   - tangan kanan
   - tangan kiri
   - kaki kanan
   - kaki kiri
3. Game menampilkan prompt `Mundur` di atas player untuk dodge.
4. Enemy cooldown bar di atas enemy mengisi secara smooth.
5. Pemain mulai mengetik salah satu prompt.
6. Prompt yang cocok menjadi `active target`.
7. Jika prompt attack selesai:
   - game emit action sesuai limb
   - karakter dash/maju ke arah musuh
   - karakter memainkan animasi attack
   - hitbox aktif pada active frames
   - musuh menerima damage/stun/knockback bila kena
   - karakter kembali ke posisi duel awal saat recovery
8. Jika prompt dodge selesai:
   - player mundur sekitar `94 px`
   - player kebal selama dodge window
   - setelah `0.5s`, player kembali ke posisi duel awal
9. Prompt refresh.
10. Musuh menyerang saat cooldown penuh.
11. Round selesai saat HP salah satu fighter habis.

## 6. Control Model

Input utama: keyboard huruf.

Typing resolver:

- Menyimpan daftar prompt aktif.
- Mencocokkan huruf yang diketik dengan prompt.
- Mengunci prompt pertama yang cocok.
- Menolak atau memberi penalti saat salah input.
- Emit `TypingActionCompleted` saat prompt selesai.

Contoh action map:

| Limb | Prompt Zone | Action | Attack Type |
| --- | --- | --- | --- |
| Tangan kanan | dekat tangan kanan player | `attack.punch.right` | cepat, damage kecil |
| Tangan kiri | dekat tangan kiri player | `attack.punch.left` | cepat, bisa combo |
| Kaki kanan | dekat kaki kanan player | `attack.kick.right` | damage lebih besar, range jauh |
| Kaki kiri | dekat kaki kiri player | `attack.kick.left` | slow/stagger enemy pressure |
| Dodge | atas player | `defense.dodge.back` | mundur, kebal singkat, kembali setelah 0.5s |

## 7. Limb Attack Design

### Tangan Kanan

- Peran: jab cepat.
- Prompt: pendek, 3-5 huruf.
- Damage: rendah.
- Startup: cepat.
- Recovery: pendek.
- Fungsi: interrupt, combo starter.

### Tangan Kiri

- Peran: cross/hook.
- Prompt: pendek-sedang, 4-6 huruf.
- Damage: sedang.
- Startup: sedang.
- Efek: memberi combo gain lebih besar.
- Fungsi: follow-up setelah jab dan mengejar objective combo.

### Kaki Kanan

- Peran: front kick/roundhouse.
- Prompt: sedang, 5-8 huruf.
- Damage: sedang-tinggi.
- Range: jauh.
- Recovery: lebih lama.
- Fungsi: punish musuh dari jarak aman.

### Kaki Kiri

- Peran: low kick/sweep.
- Prompt: sedang, 5-8 huruf.
- Damage: sedang.
- Efek: slow/stagger yang mengurangi clock attack dan skill enemy.
- Fungsi: buka pertahanan musuh.

## 8. Typing Mechanics

### Prompt Generation

Prompt dibagi berdasarkan difficulty:

- Easy: kata 3-4 huruf.
- Normal: kata 5-7 huruf.
- Hard: kata 8+ huruf atau frasa pendek.

Prompt harus:

- mudah dibaca
- tidak terlalu mirip satu sama lain dalam satu batch
- tidak memakai karakter yang membingungkan untuk pemula

### Prompt Kinds

Prototype memakai dua jenis prompt:

- `attack`: 4 prompt limb yang memicu pukulan/tendangan.
- `dodge`: 1 prompt `Mundur` di atas player yang memicu gerak mundur untuk menghindari attack enemy.

Pool dodge saat ini pendek dan mudah dibaca: `evade`, `back`, `avoid`, `shift`, `escape`, `retreat`.

### Prompt Targeting

Saat pemain mengetik huruf pertama:

- Jika hanya satu prompt cocok, prompt itu dikunci.
- Jika beberapa prompt cocok, tunggu huruf berikutnya.
- Jika tidak ada prompt cocok, input dihitung miss.

### Accuracy dan Timing

Stat yang dilacak:

- WPM
- accuracy
- combo count
- miss count
- average completion time

Efek gameplay:

- Completion cepat -> damage bonus kecil.
- Perfect typing -> hit spark / crit chance.
- Banyak salah -> stamina turun atau musuh mendapat tempo.

## 9. Combat System

### Fighter State

State dasar:

- `idle`
- `typing`
- `attack_startup`
- `attack_active`
- `attack_recovery`
- `block`
- `hitstun`
- `knockdown`
- `ko`

### Frame Data

Setiap attack punya data:

```json
{
  "id": "punch_right",
  "limb": "right_hand",
  "damage": 8,
  "startupMs": 90,
  "activeMs": 80,
  "recoveryMs": 160,
  "range": 42,
  "hitstunMs": 220,
  "knockback": 18
}
```

### Hitbox Data

Prototype memakai rectangle hitbox.

```json
{
  "attackId": "punch_right",
  "activeWindows": [
    {
      "fromMs": 90,
      "toMs": 170,
      "box": { "x": 34, "y": -42, "w": 44, "h": 22 }
    }
  ]
}
```

Catatan:

- `x/y` relatif terhadap anchor karakter.
- Anchor standar: bottom-center.
- Saat karakter menghadap kiri, `x` di-flip.

### Knockback and Spacing

Knockback prototype dibuat pendek dan dibatasi. Target yang terkena tidak boleh terdorong terlalu jauh sampai pukulan berikutnya whiff tanpa alasan. Duel spacing dikunci agar serangan beruntun masih bisa menjangkau selama fighter berada dalam range normal.

Current rule:

- world x dibatasi kira-kira `250..1030`
- jarak duel maksimal setelah hit sekitar `172 px`
- velocity defender di-reset setelah hit
- knockback hanya memberi rasa impact, bukan memutus loop combat

### Dash-In Attack Juice

Saat attack dimulai, fighter tidak memukul dari posisi diam. Fighter maju cepat ke attack spot dekat lawan saat `startup`, hit aktif saat sudah dekat, lalu kembali ke `homeX` saat `recovery`.

Current rule:

- player dan enemy punya posisi home masing-masing
- attack spot menjaga jarak sekitar `118 px` dari target
- posisi awal dibuat berjauhan: player sekitar `x=430`, enemy sekitar `x=850`
- dash maksimal sekitar `300 px` dari home agar fighter benar-benar maju dulu sebelum memukul
- gerak maju memakai ease-out, gerak balik memakai ease-in-out
- renderer hanya mengikuti posisi simulation, sehingga nanti spritesheet final tetap bisa memakai logic yang sama

## 10. Enemy Design

MVP enemy:

- Berdiri di depan player.
- Punya HP.
- Punya attack timer.
- Punya cooldown bar di atas nama enemy.
- Jika player lambat mengetik, enemy menyerang.
- Enemy bisa terkena hitstun.

Enemy phase:

1. Idle/approach.
2. Telegraph attack.
3. Attack.
4. Recovery.

Cooldown prototype:

- interval enemy attack: sekitar `3600 ms`
- cooldown bar mengisi smooth, bukan lompat penuh
- saat bar penuh, enemy masuk attack cycle
- player bisa memakai prompt dodge untuk mundur sebelum attack masuk

Typing bisa dipakai untuk:

- menyerang lebih dulu
- interrupt enemy saat telegraph
- mematahkan guard dengan prompt panjang

## 11. UI / HUD

Gunakan DOM overlay untuk prompt dan HUD. Phaser canvas hanya untuk arena, karakter, animasi, FX.

Layout prototype:

```text
              [Enemy Name]
          [Enemy Cooldown Bar]

             ENEMY

          [Dodge / Mundur Prompt]

    [Left Hand] PLAYER [Right Hand]
     [Left Leg]       [Right Leg]
```

HUD:

- HP player
- HP enemy
- combo
- accuracy
- timer round
- active prompt highlight
- enemy cooldown bar
- dodge prompt

Prompt states:

- idle: normal
- matching: highlight
- correct chars: green/bright
- wrong input: shake/red flash
- completed: burst/fade

## 12. Phaser 4 Resolution and Scale

Rekomendasi utama: gunakan logical resolution `1280x720` dengan aspect ratio `16:9`.

Alasan:

- Cocok untuk browser desktop dan mudah diskalakan ke 1920x1080.
- Area cukup luas untuk karakter fighting + 4 prompt limb.
- Asset 2D masih masuk akal: karakter 128-192 px tinggi di canvas 720p.
- DOM HUD lebih mudah disejajarkan dengan canvas.
- `16:9` umum untuk game action/fighting.

### Base Resolution

| Item | Value |
| --- | --- |
| Logical width | `1280` |
| Logical height | `720` |
| Aspect ratio | `16:9` |
| Scale mode | `Phaser.Scale.FIT` |
| Center | `Phaser.Scale.CENTER_BOTH` |
| Renderer | `Phaser.AUTO` |
| FPS target | `60` |

### Phaser 4 Config

```ts
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#111111",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
    min: { width: 640, height: 360 },
    max: { width: 1920, height: 1080 }
  },
  fps: {
    target: 60,
    limit: 0,
    smoothStep: true
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: false,
    gamepad: false,
    activePointers: 1,
    windowEvents: true
  },
  scene: [
    BootScene,
    PreloadScene,
    FightScene
  ]
};
```

### Why Not `RESIZE` for MVP

Jangan pakai `Phaser.Scale.RESIZE` untuk MVP.

`RESIZE` membuat canvas berubah mengikuti viewport. Ini bagus untuk UI full responsive, tapi fighting game butuh posisi prompt, karakter, hitbox, dan arena stabil. Untuk MVP, `FIT` lebih aman karena world coordinate tetap `1280x720`.

### Safe Zones

Gunakan safe zone agar HUD tidak terlalu dekat tepi layar. Prompt limb tidak lagi dipasang jauh di sudut layar; prompt sekarang mengikuti posisi player agar mata pemain tetap dekat aksi.

```text
Canvas: 1280x720
Safe margin: 80 px kiri/kanan, 56 px atas/bawah

Center fight y: 430
Player home x: 430
Enemy home x: 850
Ground y: 590
```

Player-relative prompt offsets:

```text
left hand:  x -112, y -150
right hand: x +122, y -158
left leg:   x -100, y  -48
right leg:  x +112, y  -56
dodge:      above player name/body
enemy cd:   above enemy name/body
```

### Character Size Guide

Untuk canvas `1280x720`:

- Placeholder fighter height: `220-260 px` di layar.
- Sprite source frame: mulai dari `256x256` lebih nyaman daripada `128x128` jika gaya bukan pixel art.
- Pixel art: source frame `128x128`, render scale `2x`.
- HD/vector-ish raster: source frame `256x256`, render scale `1x`.

Rekomendasi project ini:

- MVP placeholder: draw shapes langsung di Phaser atau sprite `256x256`.
- Final asset: `256x256` frame, anchor bottom-center.
- Jika nanti ingin pixel art, turun ke `128x128` frame dan set `pixelArt: true`.

### DOM HUD Alignment

Prompt sebaiknya DOM overlay, bukan Phaser text. Supaya DOM cocok dengan canvas:

- Bungkus canvas dan HUD di `#game-shell`.
- `#game-shell` mempertahankan aspect ratio `16 / 9`.
- Phaser canvas `FIT` ke container.
- DOM overlay `position:absolute; inset:0;`.
- Prompt pakai persentase posisi berdasarkan logical coordinate.

Contoh mapping:

```ts
const toPercent = (x: number, y: number) => ({
  left: `${(x / 1280) * 100}%`,
  top: `${(y / 720) * 100}%`
});
```

### Future Resolution Options

Jika target berubah:

- Mobile portrait: buat layout HUD khusus, tetap jalankan world `1280x720`, rotate warning atau responsive prompt stack.
- Pixel art retro: `640x360` logical res + integer zoom.
- HD desktop-only: tetap `1280x720`, scale ke 1080p/1440p via browser.

Default sekarang: `1280x720 FIT`. Jangan ubah sampai prototype terasa sempit.

## 13. Asset Strategy

Project harus playable tanpa asset final. Gunakan placeholder yang punya key sama dengan asset final.

### Prinsip

- Code pakai asset key, bukan file path langsung.
- Semua asset didaftarkan di manifest.
- Placeholder dan asset final memakai frame size dan anchor sama.
- Data animasi/hitbox terpisah dari image.

### Struktur Folder

```text
public/
  assets/
    characters/
      player/
        placeholder/
          player-placeholder.png
          player-placeholder.json
        final/
          player.png
          player.json
      enemy/
        placeholder/
          enemy-placeholder.png
          enemy-placeholder.json
    fx/
    ui/
    audio/
src/
  game/
    data/
      assetManifest.ts
      attackData.ts
      hitboxData.ts
      promptPools.ts
```

### Asset Manifest

```ts
export const assetManifest = {
  player: {
    textureKey: "fighter_player",
    image: "/assets/characters/player/placeholder/player-placeholder.png",
    atlas: "/assets/characters/player/placeholder/player-placeholder.json",
    frame: {
        width: 256,
        height: 256,
        anchor: { x: 128, y: 236 }
    }
  }
};
```

Saat asset final siap, ubah `image` dan `atlas`, bukan gameplay code.

Catatan implementasi saat ini:

- Player spritesheet path aktif berada di `src/phaser/assets/playerSpritesheets.ts`.
- Audio path aktif berada di `src/phaser/audio/GameAudio.ts`.
- Tuning gameplay aktif berada di `src/game/content/fightRules.ts`.

## 14. Placeholder Asset Plan

Sebelum asset final:

- Pakai silhouette sederhana.
- Warna player dan enemy beda.
- Tangan/kaki diberi warna berbeda agar attack terbaca.
- Animasi bisa sangat sedikit:
  - idle 4 frame
  - punch_right 4 frame
  - punch_left 4 frame
  - kick_right 5 frame
  - kick_left 5 frame
  - hitstun 2 frame
  - ko 4 frame

MVP bisa mulai dengan colored rectangles:

- body: rectangle besar
- head: circle
- hands: small rectangles
- legs: rectangles

Namun data key tetap sama seperti sprite final.

## 15. Final Asset Pipeline

Rekomendasi: 2D spritesheet/atlas, bukan skeletal animation dulu.

Alur:

1. Buat 1 seed frame karakter:
   - pose idle
   - facing right
   - transparent background
   - frame 256x256 untuk gaya HD sederhana, atau 128x128 untuk pixel art
   - anchor bottom-center
2. Approve style.
3. Generate full animation strip per action:
   - idle
   - punch_right
   - punch_left
   - kick_right
   - kick_left
   - hitstun
   - block
   - ko
4. Normalize semua frame:
   - ukuran sama
   - anchor sama
   - scale sama
   - no background
5. Pack ke atlas atau spritesheet.
6. Update manifest.
7. Review in-engine.

### Naming Convention

```text
fighter_player_idle_0001
fighter_player_punch_right_0001
fighter_player_punch_left_0001
fighter_player_kick_right_0001
fighter_player_kick_left_0001
fighter_player_hitstun_0001
fighter_player_ko_0001
```

### Frame Budget

| Animation | Frames | Notes |
| --- | ---: | --- |
| idle | 4-6 | loop |
| punch_right | 4-6 | fast |
| punch_left | 4-6 | fast |
| kick_right | 6-8 | more readable |
| kick_left | 6-8 | low/sweep |
| hitstun | 2-4 | short |
| block | 2-4 | hold frame allowed |
| ko | 6-10 | non-loop |

## 16. Data-Driven Replacement

Semua hal berikut harus data-driven:

- asset path
- animation key
- frame rate
- attack damage
- startup/active/recovery
- hitbox position
- prompt pool
- difficulty values

Jangan hardcode:

- `/assets/...` di scene
- damage langsung di animation callback
- prompt text di UI component
- hitbox ukuran langsung di sprite code

## 17. Phaser Architecture

Recommended modules:

```text
src/
  game/
    main.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      FightScene.ts
    systems/
      TypingSystem.ts
      CombatSystem.ts
      PromptSystem.ts
      FighterStateMachine.ts
    render/
      FighterRenderer.ts
      HitboxDebugRenderer.ts
      FxRenderer.ts
    ui/
      HudController.ts
      PromptOverlay.ts
    data/
      assetManifest.ts
      animations.ts
      attacks.ts
      hitboxes.ts
      promptPools.ts
```

Boundary:

- `systems/` = rules, deterministic, testable.
- `render/` = Phaser sprites, animations, hit sparks, camera shake.
- `ui/` = DOM prompt/HUD.
- `data/` = replaceable content.

## 18. MVP Scope

### MVP 1: Typing to Attack

- 1 player - implemented
- 1 dummy enemy - implemented
- 4 prompt zones near player limbs - implemented
- 4 attacks - implemented
- placeholder visuals - implemented
- HP bars - implemented
- hit confirmation - implemented

### MVP 2: Enemy Pressure

- enemy attack timer - implemented
- smooth enemy cooldown bar - implemented
- dodge prompt for avoidance - implemented
- player can interrupt/pressure through attacks
- hitstun/knockback - implemented with spacing cap
- lose condition - implemented

### MVP 3: Juice and Skill

- combo
- accuracy bonus
- screen shake / hit stop - basic implemented
- hit sparks / impact FX - basic placeholder implemented
- prompt difficulty scaling - backlog

### MVP 4: Asset Swap

- replace placeholder with actual spritesheet
- tune hitbox data
- add animation preview/debug overlay

## 19. Risks

### Prompt Ambiguity

Problem: multiple prompt share same prefix.  
Mitigation: prompt generator avoids same starting 2-3 letters in one batch.

### Visual Readability

Problem: player watches text, misses fight.  
Mitigation: prompt zones placed near body limbs, not far from action.

### Asset Drift

Problem: generated frames inconsistent.  
Mitigation: seed frame + full strip generation + normalization + anchor lock.

### Fighting Feel

Problem: typing completion delay makes attacks feel late.  
Mitigation: preview/charge animation while typing, then instant strike on completion.

## 20. Open Design Questions

1. Word language: Indonesian, English, or mixed?
2. Tone: serious martial arts, arcade comedy, anime, or pixel brawler?
3. Typing strictness: typo resets prompt, penalizes only, or allows backspace?
4. Defense expansion: add block/parry prompt, or keep dodge-only?
5. Progression: single duel prototype, arcade ladder, or training mode first?

## 21. Recommended Next Step

Prototype base sudah dibuat. Next step: polish feel, tune balance, then prepare real asset swap.

Implementation order:

1. Tune enemy cooldown interval and damage.
2. Tune dodge distance/window after playtest.
3. Add stronger hit/prompt juice.
4. Add placeholder SFX.
5. Expand prompt pools.
6. Replace shape fighter with real spritesheet through manifest.
7. Tune animation frame data and hitboxes against final art.

This lets gameplay prove itself before art cost starts.
