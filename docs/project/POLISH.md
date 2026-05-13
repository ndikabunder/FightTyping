# Fight Typing - Polish & Juice Plan

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

Dokumen ini berisi rencana membuat `Fight Typing` terasa lebih hidup, responsif, dan enak dimainkan setelah core gameplay prototype sudah berjalan.

Sumber konteks:

- `docs/project/GDD.md`
- `docs/project/TASK.md`
- Prototype saat ini: Phaser 4 + TypeScript + Vite + DOM HUD, prompt limb, dodge, enemy cooldown, dash attack, spritesheet player, enemy sementara ditint, hitbox data-driven, dan basic juice.

## Tujuan Polish

Game harus terasa seperti fighting game yang dikendalikan lewat typing, bukan game typing yang ditempeli animasi pukul.

Target rasa:

- Tiap huruf yang benar terasa tajam.
- Tiap salah ketik terasa jelas tapi tidak menghukum berlebihan.
- Serangan punya berat: dash, impact, hitstop, spark, sound, dan recoil.
- Enemy terasa menekan tapi tetap adil.
- HUD membantu membaca combat, tidak menutup arena.
- Asset placeholder tetap mudah diganti dengan asset final.

## Prinsip Utama

1. **Readability dulu, juice kedua.** Prompt, cooldown enemy, HP, dan posisi fighter harus tetap terbaca meski efek visual ramai.
2. **Feedback harus langsung.** Input keyboard, hit, miss, dodge, dan cooldown perlu memberi respons dalam 1 frame.
3. **Juice harus punya fungsi.** Efek visual dipakai untuk menandai danger, reward, timing, dan impact.
4. **Motion jangan mengganggu typing.** Kamera shake, flash, dan partikel tidak boleh membuat kata sulit dibaca.
5. **Semua polish harus bisa di-toggle/debug.** Penting untuk tuning dan aksesibilitas.

## Priority Roadmap

### P0 - Combat Feel Wajib

Kerjakan dulu karena langsung memengaruhi rasa game.

- Tambah hitstop berbeda per attack:
  - jab/tangan kanan: `35-45 ms`
  - tangan kiri: `45-55 ms`
  - tendangan: `55-75 ms`
  - finisher/KO: `90-120 ms`
- Tambah camera shake ringan:
  - pukulan: kecil dan cepat
  - tendangan: sedikit lebih besar
  - enemy hit player: arah shake mengikuti sumber hit
- Tambah hit spark di titik impact:
  - tangan kanan/kiri: spark pendek warna cyan/magenta
  - kaki kanan/kiri: arc/slash rendah atau horizontal
  - blocked/dodge: spark kecil atau afterimage miss
- Tambah impact flash singkat pada target:
  - player biru-putih
  - enemy pink-putih
- Tambah dust/trail saat dash maju dan kembali home.
- Pastikan fighter tetap ditahan di titik serang sampai animasi strike selesai, lalu return cepat dan bersih.

Acceptance:

- Serangan terasa punya impact meski tanpa sound.
- Prompt tetap terbaca saat efek muncul.
- Camera shake tidak membuat pemain kehilangan target typing.
- Tidak ada efek yang menutup karakter terlalu lama.

### P1 - Typing Feel

Typing adalah input utama, jadi ini harus terasa premium.

- Per-character feedback:
  - huruf benar berubah warna dan sedikit naik/pop.
  - huruf salah shake pendek dan memberi flash merah.
  - prompt aktif lebih terang, prompt lain sedikit redup.
- Completion feedback:
  - prompt yang selesai meledak kecil atau dissolve ke arah limb.
  - refresh prompt memakai animasi slide/fade singkat.
- Combo feedback:
  - combo naik memberi pulse kecil pada angka combo.
  - combo tinggi menambah glow pada prompt aktif.
  - miss memecah glow, bukan hanya reset angka.
- Accuracy feedback:
  - tampilkan perubahan accuracy halus.
  - beri feedback "clean", "fast", atau "perfect" secara transient, bukan panel permanen.
- Wrong input policy:
  - salah ketik memberi penalti kecil pada combo/tempo.
  - jangan mengunci pemain terlalu lama.

Acceptance:

- Pemain tahu huruf mana yang sudah diketik.
- Pemain tahu prompt mana yang sedang dikunci.
- Salah input jelas terlihat tanpa membuat game terasa kasar.

### P2 - Enemy Telegraph dan Fairness

Enemy harus menekan, tapi pemain harus merasa serangan bisa dibaca.

- Cooldown bar enemy:
  - tetap smooth.
  - ubah warna bertahap: aman -> waspada -> bahaya.
  - beri pulse pada `0.8s` terakhir.
- Telegraph limb:
  - sebelum enemy menyerang, tampilkan icon/label kecil attack type.
  - contoh: `Kanan`, `Kiri`, `Kick`, atau limb marker.
  - jangan terlalu panjang agar tidak bersaing dengan prompt player.
- Warning timing:
  - level mudah: warning lebih lama.
  - level sulit: warning lebih pendek tapi tetap fair.
- Dodge readability:
  - saat dodge berhasil, tampilkan afterimage/ghost dan "evade" feedback.
  - saat dodge gagal, tampilkan hit spark jelas di player.

Acceptance:

- Pemain bisa melihat kapan enemy akan menyerang.
- Pemain bisa belajar kapan harus mengetik prompt `Mundur`.
- Serangan enemy yang mengenai player terasa karena pemain terlambat, bukan karena UI menipu.

### P3 - Movement Juice

Gerak maju-pukul-balik adalah identitas visual combat saat ini.

- Dash maju:
  - gunakan easing cepat: `Cubic.Out` atau `Quart.Out`.
  - tambah trail 2-4 ghost frame.
  - dust kecil di kaki saat mulai dash.
- Strike hold:
  - tahan hanya selama frame impact penting.
  - jangan terlalu lama agar pacing tetap cepat.
- Return home:
  - lebih cepat dari dash maju, memakai easing smooth.
  - tambah skid/dust kecil saat berhenti.
- Idle:
  - idle harus loop tanpa flicker.
  - breathing/bob kecil boleh, tapi jangan menggeser anchor prompt.
- Knockback:
  - tetap dibatasi agar tidak merusak jarak serangan berikutnya.

Acceptance:

- Posisi awal fighter tetap berjauhan.
- Saat menyerang, fighter maju ke range pukul/tendang lalu kembali.
- Tidak ada drift posisi setelah beberapa serangan.

### P4 - Audio Juice

Audio membuat game terasa selesai, tapi harus bisa dimute.

Sound groups:

- `typing`
- `combat`
- `enemy`
- `ui`
- `music`

SFX yang dibutuhkan:

- key correct: klik pendek, ringan.
- key wrong: tick kasar atau low blip.
- prompt complete: shimmer pendek.
- dash: whoosh pendek.
- punch hit: impact tajam.
- kick hit: impact lebih berat.
- dodge success: air swipe.
- enemy cooldown danger: beep/pulse rendah.
- KO: impact besar + tail.
- UI confirm/restart/pause.

Music:

- loop pendek tempo sedang.
- intensitas bisa naik saat HP rendah atau enemy cooldown cepat.
- jangan terlalu ramai di frekuensi yang mengganggu typing SFX.

Acceptance:

- Game tetap nyaman dimainkan dengan sound on.
- Semua audio bisa dimute.
- SFX tidak overlap berlebihan saat typing cepat.

### P5 - Arena dan Visual Presentation

Arena harus mendukung cyber fighting fantasy tanpa mengganggu prompt.

- Background:
  - parallax matrix/grid gelap.
  - light streak horizontal tipis.
  - floor glow di bawah fighter.
- Fighter aura:
  - ring biru/player dan merah-pink/enemy sudah ada; lanjutkan sebagai identity.
  - ring jangan terlalu terang di belakang prompt.
- Foreground:
  - partikel ringan hanya di tepi layar.
  - hindari partikel di tengah prompt.
- State presentation:
  - round start: countdown singkat.
  - win/lose: pose fighter + overlay ringkas.
  - pause/debug: jelas tapi tidak permanen menutup playfield.

Acceptance:

- Screenshot langsung terbaca sebagai game fighting typing neon.
- Prompt dan cooldown tetap prioritas visual.

### P6 - UI Polish

HUD harus ringkas, tematik, dan tidak terasa seperti panel debug.

- HP bar:
  - tambah delayed damage bar.
  - flash saat damage.
  - danger state saat HP rendah.
- Combo/best/accuracy:
  - ukuran compact.
  - update dengan tween kecil.
  - jangan terlalu banyak box.
- Debug:
  - pindahkan ke toggle.
  - jangan tampil default di build normal.
- Prompt boxes:
  - pakai warna per kategori:
    - punch: cyan/blue.
    - kick: violet.
    - dodge: white/blue.
    - enemy warning: red/pink.
  - pastikan kontras tinggi.

Acceptance:

- HUD membantu keputusan cepat.
- Debug tidak mengganggu normal play.

## Tuning Values Awal

Nilai ini titik awal, bukan final.

| Area | Nilai Awal | Catatan |
| --- | ---: | --- |
| Hitstop punch | 45 ms | Cukup terasa tanpa memutus typing |
| Hitstop kick | 65 ms | Lebih berat dari punch |
| Camera shake punch | 2-3 px | Durasi 80-110 ms |
| Camera shake kick | 4-6 px | Durasi 110-150 ms |
| Dash trail count | 3 | Jangan lebih agar tidak ramai |
| Prompt completion burst | 180 ms | Cepat dan bersih |
| Wrong input shake | 120 ms | Harus langsung selesai |
| Enemy danger pulse | 800 ms terakhir | Sinkron dengan cooldown |
| Dodge success feedback | 250 ms | Cukup untuk terbaca |

## Implementation Order

1. Buat `JuiceSystem` atau module setara untuk hitstop, camera shake, flash, dan particles.
2. Tambah event combat yang jelas:
   - `attackStarted`
   - `dashStarted`
   - `hitConfirmed`
   - `attackWhiffed`
   - `dodgeSucceeded`
   - `fighterDamaged`
   - `fighterKnockedOut`
3. Hubungkan `FighterRenderer` ke event tanpa memindahkan aturan combat ke renderer.
4. Polish prompt di `HudController` dengan state aktif, typed chars, wrong char, dan completion burst.
5. Tambah enemy cooldown danger state dan telegraph limb.
6. Tambah audio manager ringan dengan volume group.
7. Tambah setting/debug toggle untuk:
   - screen shake
   - particles
   - audio
   - reduced motion
   - debug hitbox
8. Playtest 3 sesi:
   - pemula typing lambat
   - pemain typing cepat
   - pemain yang sengaja spam/miss

## Playtest Checklist

- Apakah prompt tetap terbaca saat semua efek aktif?
- Apakah pemain langsung tahu serangan mana yang keluar?
- Apakah enemy cooldown terasa fair?
- Apakah dodge terasa berguna, bukan tombol panik yang tidak jelas?
- Apakah animasi attack selesai sebelum fighter kembali?
- Apakah hitstop terasa enak atau terlalu memutus flow?
- Apakah camera shake membuat typing terganggu?
- Apakah game masih enak dimainkan tanpa audio?
- Apakah debug overlay bisa dimatikan?
- Apakah performa tetap stabil di 60 FPS?

## Definition of Done Polish

Polish tahap ini dianggap selesai bila:

- Minimal ada feedback visual untuk correct key, wrong key, prompt complete, hit, whiff, dodge success, damage, dan KO.
- Hitstop dan camera shake sudah berbeda antara punch dan kick.
- Enemy cooldown punya state aman/waspada/bahaya.
- Audio dasar tersedia dan bisa dimute.
- HUD tidak menutup area penting combat.
- Semua efek dapat diturunkan atau dimatikan untuk aksesibilitas/debug.
- Build dan test tetap pass.
