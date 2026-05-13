## Update Implementasi Level Terbaru - 2026-05-14

- Word pool level 1-10 sudah diimplementasikan sebagai pool bahasa Inggris yang makin panjang dan makin teknis.
- Level 3 menjadi titik masuk player skill: pemain belajar menjaga combo 3x untuk membuka `Skill x2`.
- Level 6 menjadi titik masuk enemy skill: enemy mendapat skill dengan cooldown 150% dari attack normal dan damage 2x.
- Skill player memakai dua kata acak dari pool skill, sehingga tiap level tidak selalu menampilkan `power strike`.
- Skill player sengaja butuh Shift/huruf besar untuk input pertama agar tidak mengganggu prompt attack/dodge normal.
- Enemy skill hanya memberi warning `Enemy Skill`; jenis serangan tidak ditampilkan agar pemain membaca timing, bukan bocoran move.
- Shortcut level tetap `1-9` dan `0`, sementara menu/leaderboard/result sekarang bisa dipakai tanpa mouse.

## Update Implementasi Level Terbaru - 2026-05-13

- Game saat ini memiliki 10 level arcade.
- Shortcut level tetap tersedia: `1-9` untuk level 1-9, `0` untuk level 10.
- Victory bisa lanjut ke level berikutnya lewat `NEXT` atau `N`.
- Defeat hanya bisa retry atau kembali ke main menu.
- Leaderboard menyimpan level tertinggi yang berhasil diselesaikan dalam run.
- Result panel menampilkan level dan rank sebagai statistik akhir.

# Fight Typing - Level & Difficulty Design Plan

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

Dokumen ini berisi rencana desain level agar `Fight Typing` tidak terlalu mudah, tidak terlalu sulit, dan tidak cepat membosankan.

Sumber konteks:

- `docs/project/GDD.md`
- `docs/project/TASK.md`
- Core prototype: fighting 2D berbasis typing dengan 4 prompt attack limb, 1 prompt dodge, enemy cooldown, dash attack, dan variasi attack enemy.

## Tujuan Level Design

Level harus mengajarkan skill pemain secara bertahap:

1. Mengetik cepat dan akurat.
2. Memilih prompt yang tepat.
3. Membaca cooldown enemy.
4. Menggunakan dodge pada timing yang benar.
5. Mengelola tempo antara menyerang dan bertahan.

Game tidak boleh hanya menaikkan HP enemy. Kesulitan harus naik lewat kombinasi kata, timing, pola enemy, damage, dan objective.

## Target Session

Untuk prototype polish:

- 1 level: `45-90 detik`.
- 1 run arcade: `8-12 level`.
- 1 boss/mini boss: setiap `4-5 level`.
- Round pendek lebih cocok karena typing combat cepat melelahkan bila terlalu panjang.

## Difficulty Knobs

Gunakan knob ini untuk mengatur level. Jangan menaikkan semua sekaligus.

| Knob | Mudah | Normal | Sulit |
| --- | ---: | ---: | ---: |
| Enemy HP | 80-110 | 120-160 | 170-240 |
| Enemy damage | 8-10 | 11-15 | 16-24 |
| Enemy cooldown | 4.5-5.5s | 3.2-4.2s | 2.4-3.1s |
| Enemy telegraph | 1.2-1.5s | 0.8-1.1s | 0.55-0.75s |
| Prompt attack | 3-5 huruf | 5-7 huruf | 7-10 huruf |
| Prompt dodge | 4-5 huruf | 5-6 huruf | 6-8 huruf |
| Word similarity | rendah | sedang | tinggi tapi fair |
| Attack variety | 1-2 jenis | 3 jenis | 4 jenis + pattern |

Aturan penting:

- Jika enemy cooldown makin cepat, jangan langsung membuat kata terlalu panjang.
- Jika kata makin panjang, beri telegraph enemy sedikit lebih panjang.
- Jika enemy damage tinggi, beri cooldown lebih lambat atau warning lebih jelas.
- Jangan gunakan kata yang terlalu mirip dalam batch prompt yang sama pada level awal.

## Player Skill Curve

### Tahap 1 - Kenal Input

Fokus:

- Tangan kanan dan tangan kiri.
- Prompt pendek.
- Enemy lambat.
- Dodge diperkenalkan tanpa hukuman berat.

Pemain harus paham: ketik kata di dekat limb untuk menyerang.

### Tahap 2 - Kenal Tempo

Fokus:

- Kaki kanan/kiri mulai penting.
- Enemy cooldown lebih cepat.
- Dodge mulai dibutuhkan.
- Prompt mulai 5-7 huruf.

Pemain harus paham: tidak semua waktu cocok untuk menyerang; kadang harus mundur.

### Tahap 3 - Decision Making

Fokus:

- Enemy punya pola.
- Prompt panjang memberi damage lebih besar.
- Prompt pendek memberi tempo/interrupt.
- Dodge harus dipakai pada warning tertentu.

Pemain harus paham: pilih kata berdasarkan situasi, bukan sekadar kata paling mudah.

### Tahap 4 - Mastery

Fokus:

- Enemy mixup.
- Boss phase.
- Kata lebih panjang.
- Timing lebih ketat.
- Reward untuk akurasi tinggi.

Pemain harus paham: menang lewat akurasi, rhythm, dan prioritas target.

## Enemy Archetype

### 1. Basic Striker

Peran: tutorial enemy.

- Serangan dominan tangan.
- Cooldown lambat.
- Damage rendah.
- Cocok level 1-2.

Tujuan: pemain nyaman dengan prompt tangan.

### 2. Kicker

Peran: mengajarkan range dan timing.

- Serangan kaki lebih sering.
- Damage sedang.
- Telegraph lebih jelas.
- Cocok level 3-4.

Tujuan: pemain melihat variasi serangan enemy.

### 3. Tempo Fighter

Peran: menekan typing speed.

- Cooldown lebih cepat.
- Damage rendah-sedang.
- HP sedang.
- Cocok level 5-6.

Tujuan: pemain belajar menjaga flow dan combo.

### 4. Heavy Fighter

Peran: mengajarkan dodge.

- Cooldown lebih lambat.
- Damage tinggi.
- Telegraph jelas.
- HP tinggi.

Tujuan: pemain tidak bisa brute force; harus mundur saat bahaya.

### 5. Trickster

Peran: menguji fokus.

- Pattern berubah.
- Word pool sedikit mirip.
- Banyak feint visual ringan.
- Damage sedang.

Tujuan: pemain belajar membaca cooldown dan prompt aktif dengan teliti.

### 6. Boss

Peran: ujian semua mekanik.

- Punya phase.
- Phase 1: basic.
- Phase 2: cooldown lebih cepat.
- Phase 3: damage naik tapi telegraph tetap fair.

Tujuan: klimaks run tanpa terasa tidak adil.

## Rencana Level Arcade 10 Level

| Level | Enemy | Fokus | Enemy HP | Cooldown | Telegraph | Word Length | Catatan |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | Basic Striker | Tutorial tangan | 80 | 5.2s | 1.5s | 3-4 | Enemy sangat lambat, dodge opsional |
| 2 | Basic Striker+ | Dua tangan | 95 | 4.7s | 1.4s | 3-5 | Mulai combo sederhana |
| 3 | Kicker | Perkenalan kaki | 110 | 4.3s | 1.3s | 4-6 | Tendangan player diberi reward damage |
| 4 | Kicker+ | Dodge pertama | 120 | 4.0s | 1.2s | 4-6 | Enemy kick lebih sakit, dodge diajarkan |
| 5 | Heavy Mini Boss | Timing dodge | 160 | 4.2s | 1.25s | 5-7 | Damage besar, cooldown tidak terlalu cepat |
| 6 | Tempo Fighter | Kecepatan typing | 130 | 3.5s | 1.0s | 5-7 | Enemy sering menyerang tapi damage sedang |
| 7 | Tempo Fighter+ | Prioritas prompt | 145 | 3.2s | 0.9s | 5-8 | Prompt pendek untuk punch, panjang untuk kick |
| 8 | Trickster | Fokus dan akurasi | 150 | 3.4s | 0.85s | 6-8 | Kata mulai mirip, tapi tidak menipu |
| 9 | Heavy Trickster | Tekanan campuran | 190 | 3.1s | 0.8s | 6-9 | Dodge wajib, damage tinggi |
| 10 | Boss | Ujian penuh | 240 | 3.6s -> 2.7s | 1.1s -> 0.7s | 5-10 | 3 phase, pattern berubah tiap phase |

## Boss Design

Boss harus punya phase yang jelas, bukan hanya stat besar.

### Phase 1 - Readable

- Cooldown normal.
- Attack pattern mudah dibaca.
- Word length sedang.
- Tujuan: pemain memahami boss.

### Phase 2 - Pressure

- Cooldown lebih cepat.
- Attack type lebih bervariasi.
- Dodge mulai sering dibutuhkan.
- Tujuan: pemain mulai merasa tertekan.

### Phase 3 - Finish

- HP rendah boss.
- Damage boss naik.
- Telegraph lebih pendek tapi tetap terlihat.
- Prompt player bisa memberi bonus jika perfect.
- Tujuan: klimaks cepat, bukan perang HP panjang.

## Word Pool Progression

### Easy Pool

Kata pendek 3-4 huruf:

- jab
- snap
- rush
- grip
- step
- guard
- focus
- shift

### Normal Pool

Kata 5-7 huruf:

- strike
- follow
- anchor
- rhythm
- counter
- evade
- balance
- impact

### Hard Pool

Kata 7-10 huruf:

- pressure
- momentum
- precision
- overload
- reaction
- footwork
- fracture
- decisive

Aturan batch prompt:

- Hindari semua prompt mulai dari huruf yang sama pada level awal.
- Level sulit boleh punya 2 prompt dengan prefix mirip, tapi jangan 4 sekaligus.
- Dodge prompt sebaiknya berbeda jelas dari attack prompt.
- Kata enemy warning jangan bersaing dengan kata player.

## Anti-Bosan

Tambahkan variasi tanpa mengubah core loop terlalu cepat.

Setiap 2 level, minimal satu hal terasa baru:

- enemy archetype baru.
- arena color shift.
- word pool baru.
- objective bonus.
- boss/mini boss.
- pattern enemy baru.

Contoh objective bonus:

- Menang dengan accuracy `90%+`.
- Gunakan dodge sukses `3x`.
- Menang tanpa combo putus lebih dari `2x`.
- Kalahkan enemy sebelum `60s`.
- Gunakan semua limb minimal sekali.

Reward bisa berupa:

- score bonus.
- visual rank.
- unlock word pool.
- cosmetic aura.
- leaderboard lokal.

## Adaptive Difficulty

Adaptive difficulty dipakai halus agar pemain tidak frustrasi.

Jika pemain kesulitan:

- accuracy di bawah `75%` selama 20 detik:
  - turunkan word length batch berikutnya.
  - tambah enemy cooldown `+0.3s`.
- player terkena hit 3x berturut-turut:
  - perpanjang telegraph enemy `+0.15s`.
  - munculkan dodge prompt lebih sering.
- combo selalu putus di bawah 3:
  - kurangi prompt yang mirip prefix.

Jika pemain terlalu dominan:

- accuracy di atas `95%` dan combo di atas `12`:
  - naikkan reward score.
  - sedikit percepat enemy cooldown `-0.15s`.
  - jangan langsung menaikkan damage enemy.
- level selesai terlalu cepat:
  - next level tambah HP atau variasi pattern, bukan langsung kata sangat panjang.

Aturan fairness:

- Adaptive difficulty tidak boleh berubah di tengah prompt aktif.
- Perubahan dilakukan saat prompt refresh atau round berikutnya.
- Pemain tidak perlu diberitahu secara eksplisit; cukup terasa smooth.

## Level State Machine

Struktur level yang disarankan:

1. `intro`
   - tampilkan enemy name, archetype, dan objective singkat.
2. `ready`
   - countdown pendek.
3. `fight`
   - core loop berjalan.
4. `danger`
   - aktif saat HP player rendah atau boss phase.
5. `finish`
   - KO, rank, reward, next level.

Untuk boss:

1. `phase_intro`
2. `fight_phase_1`
3. `phase_transition`
4. `fight_phase_2`
5. `phase_transition`
6. `fight_phase_3`
7. `finish`

## Rank dan Score

Rank membuat pemain ingin replay tanpa memaksa grind.

Faktor score:

- clear time.
- accuracy.
- max combo.
- damage taken.
- dodge success.
- limb variety.

Rank:

- `S`: accuracy 95%+, clear cepat, damage rendah.
- `A`: accuracy 90%+, combo baik.
- `B`: menang stabil.
- `C`: menang dengan banyak damage/miss.

Rank tidak boleh mengunci progress utama untuk prototype. Gunakan sebagai replay incentive.

## Balancing Checklist

Sebelum level dianggap selesai:

- Pemain baru bisa menyelesaikan level 1-3 setelah 1-2 percobaan.
- Pemain normal bisa menyelesaikan level 4-7 dengan beberapa hit.
- Level 8-10 menantang tapi tidak bergantung pada hafalan kata.
- Dodge selalu punya waktu reaksi yang manusiawi.
- Tidak ada prompt yang terlalu panjang saat enemy cooldown sangat cepat.
- Tidak ada batch prompt yang semua katanya terlalu mirip.
- Enemy tidak menyerang lagi sebelum pemain punya peluang input yang masuk akal.
- Level tidak lebih lama karena HP sponge.

## Implementation Order

1. Buat data level:
   - `id`
   - `name`
   - `enemyArchetype`
   - `enemyHp`
   - `enemyDamageMultiplier`
   - `enemyCooldown`
   - `enemyTelegraph`
   - `wordPoolTier`
   - `objective`
   - `arenaTheme`
2. Buat enemy archetype data.
3. Hubungkan level data ke `FightSimulation`.
4. Tambah level select/debug quick start.
5. Tambah round intro dan finish summary.
6. Tambah scoring dan rank.
7. Tambah adaptive difficulty ringan.
8. Playtest setiap level dengan target:
   - pemain lambat
   - pemain sedang
   - pemain cepat
9. Tuning angka berdasarkan hasil playtest.

## Definition of Done Level Design

Level design dianggap siap bila:

- Minimal 10 level arcade terdefinisi dalam data.
- Setiap level punya fokus belajar atau tantangan berbeda.
- Minimal 5 archetype enemy tersedia.
- Boss punya 3 phase.
- Word pool punya easy, normal, hard.
- Adaptive difficulty dasar tersedia.
- Level 1-3 ramah pemula.
- Level 8-10 tetap fair untuk pemain cepat.
- Tidak ada level yang hanya mengandalkan HP besar sebagai tantangan.
