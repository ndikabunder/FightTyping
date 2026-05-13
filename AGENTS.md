# AGENTS.md

## Lokasi Dokumen Project

Dokumen project utama sudah dikumpulkan di `docs/project`:

- `docs/project/GDD.md`
- `docs/project/TASK.md`
- `docs/project/POLISH.md`
- `docs/project/LEVEL.md`
- `docs/project/README.md`

`AGENTS.md` tetap berada di root repo agar instruksi agent otomatis terbaca.

Update implementasi terbaru:

- Flow scene: `BootScene -> PreloadScene -> MenuScene -> FightScene`, dan `LeaderboardScene` dari main menu.
- Main menu punya `START`, `LEADERBOARD`, idle fighter player/enemy, dan transisi neon slash ke gameplay.
- Leaderboard memakai `localStorage`, sort berdasarkan level terbanyak selesai, waktu tercepat, lalu score tertinggi.
- Victory panel punya `NEXT`, `RETRY`, `MAIN MENU`; Defeat panel hanya `RETRY`, `MAIN MENU`.
- Keyboard `N` hanya lanjut level saat Victory.
- Combo badge tampil di bawah panel objective sebagai `COMBO xN`, tanpa border/background, dan tidak boleh flicker.
- Debug panel HUD gameplay sudah dihilangkan; jangan kembalikan panel debug permanen kecuali user meminta.
- Tema SFX yang direkomendasikan: `Cyber Martial Typing / Neon Impact`.

Panduan untuk agent yang bekerja di repo ini.

## Bahasa dan Gaya

- Gunakan Bahasa Indonesia saat berinteraksi dengan user, kecuali user meminta bahasa lain.
- Jaga jawaban ringkas, jelas, dan langsung ke inti.
- Saat user meminta mode ringkas, gunakan skill `caveman`.

## Workflow Umum

- Baca konteks repo sebelum mengubah file.
- Gunakan `rg` atau `rg --files` untuk mencari file dan teks.
- Jangan menghapus atau membalik perubahan yang tidak kamu buat sendiri.
- Sebelum mengedit file, jelaskan singkat perubahan yang akan dilakukan.
- Gunakan `apply_patch` untuk edit manual file.
- Setelah mengubah kode, jalankan verifikasi yang relevan bila tersedia.

## Skill Priority

- Selalu cek skill yang relevan sebelum menjawab atau bertindak.
- Untuk membuat game Phaser.js, alur utama adalah: `caveman`, `using-superpowers`, Game Studio `game-studio`, Game Studio `web-game-foundations`, `brainstorming`, Game Studio `phaser-2d-game`, `game-setup-and-config`, Game Studio `game-ui-frontend`, `sprites-and-images`, `input-keyboard-mouse-touch`, `animations`, `audio-and-sound`, `tilemaps`, Game Studio `sprite-pipeline`, Game Studio `game-playtest`, lalu `v4-new-features` bila memakai fitur khusus Phaser 4.
- Skill proses seperti `using-superpowers`, `brainstorming`, `diagnose`, dan `tdd` menentukan cara kerja sebelum implementasi.
- Skill Game Studio diprioritaskan untuk keputusan game lintas domain seperti engine, core loop, UI, asset pipeline, dan playtest.
- Skill implementasi Phaser lokal dipakai untuk detail API Phaser 4 seperti config, input, sprite, animasi, audio, tilemap, dan fitur v4.
- Untuk ide game, fitur baru, mekanik, scene, UI game, komponen, atau perubahan perilaku, gunakan `brainstorming` lebih dulu.
- Untuk bug atau regresi performa, gunakan `diagnose`.
- Untuk permintaan TDD atau test-first, gunakan `tdd`.

## Plugin Game Studio

Plugin Game Studio sudah tersedia di cache lokal:

`C:/Users/ndika/.codex/plugins/cache/openai-curated/game-studio/768f4e75`

Gunakan plugin ini sebagai layer workflow browser-game di project ini. Default route adalah Phaser 2D, kecuali user meminta 3D, Three.js, React Three Fiber, shader-first, atau asset pipeline 3D.

### Skill Game Studio yang Dipakai

- `game-studio`: umbrella entrypoint untuk klasifikasi stack, core loop, UI, asset workflow, dan playtest.
- `web-game-foundations`: menetapkan batas simulation/rendering/UI/input/assets/save/debug/performance sebelum implementasi.
- `phaser-2d-game`: jalur implementasi utama untuk Phaser + TypeScript + Vite + DOM HUD.
- `game-ui-frontend`: HUD, menu, overlay, layout responsif, dan arah visual UI game yang tidak menutupi playfield.
- `sprite-pipeline`: pembuatan dan normalisasi sprite 2D, termasuk seed frame, strip generation, anchor, scale, dan preview sheet.
- `game-playtest`: smoke test browser game, screenshot review, input checks, HUD review, dan laporan temuan berbasis severity.
- `three-webgl-game`: jalur 3D vanilla Three.js bila user memilih 3D non-React.
- `react-three-fiber-game`: jalur 3D React Three Fiber bila game hidup di aplikasi React.
- `web-3d-asset-pipeline`: GLB/glTF, Blender cleanup, compression, LOD, collision proxies, dan validasi asset 3D.

### Referensi dan Script Game Studio

- Referensi: `C:/Users/ndika/.codex/plugins/cache/openai-curated/game-studio/768f4e75/references`
- Script sprite: `C:/Users/ndika/.codex/plugins/cache/openai-curated/game-studio/768f4e75/scripts`
- Script tersedia: `build_sprite_edit_canvas.py`, `normalize_sprite_strip.py`, `render_sprite_preview_sheet.py`.

### Route Default untuk Project Ini

1. `game-studio`: klasifikasi kebutuhan game.
2. `web-game-foundations`: tetapkan core loop, player verbs, input action map, simulation boundary, asset manifest, HUD, save/debug/perf boundary.
3. `brainstorming`: desain fitur atau mekanik sebelum implementasi.
4. `phaser-2d-game`: susun struktur Phaser 2D dan batas scene/simulation.
5. Skill Phaser lokal: pakai `game-setup-and-config`, `sprites-and-images`, `input-keyboard-mouse-touch`, `animations`, `audio-and-sound`, `tilemaps`, dan `v4-new-features` sesuai area.
6. `game-ui-frontend`: desain DOM HUD/menu/overlay.
7. `sprite-pipeline`: buat dan normalisasi sprite bila asset 2D dibutuhkan.
8. `game-playtest`: verifikasi game lewat browser, input, screenshot, dan visual QA.

## Catatan Implementasi Project Saat Ini

- Dokumentasi project utama berada di `docs/project`, kecuali `AGENTS.md` tetap di root repo.

- Project memakai Phaser 4 + TypeScript + Vite dengan DOM HUD.
- Canvas logical resolution tetap `1280x720` dan `Phaser.Scale.FIT`.
- Gameplay source of truth berada di `src/game/simulation` dan `src/game/systems`; Phaser scene hanya bridge input/render.
- Player asset aktif berasal dari spritesheet di `assets/images/player` dan dicopy ke `public/assets/images/player` agar Vite/Phaser bisa load.
- Spritesheet player berukuran `3072x3584`, dibaca sebagai grid frame `768x448`; frame `29..31` kosong dan tidak boleh dipakai untuk loop.
- `FighterRenderer` memakai manual frame control (`setTexture` + `setFrame`) untuk player/enemy, bukan `sprite.play`, karena tiap spritesheet attack punya frame impact di range berbeda.
- Enemy belum punya asset sendiri; sementara enemy memakai spritesheet player yang sama, di-flip oleh facing dan diberi tint magenta. Player diberi tint biru/cyan dengan `Phaser.TintModes.FILL`.
- Enemy attack bervariasi berurutan: tangan kanan, tangan kiri, kaki kanan, kaki kiri, lalu ulang.
- Attack visual sequence: dash maju, tahan di titik serang selama animasi pukul/tendang, lalu kembali ke home.
- `visualActionId`, `visualActionSerial`, dan `visualLockMs` di `Fighter` dipakai untuk memisahkan timing visual dari state combat.
- Range frame attack saat ini:
  - `attack.punch.right`: `PukulTanganKanan.png` frame `10..17`
  - `attack.punch.left`: `PukulTanganKiri.png` frame `13..18`
  - `attack.kick.right`: `TendangKakiKanan.png` frame `8..15`
  - `attack.kick.left`: `TendangKakiKiri.png` frame `6..18`
- Prompt attack dibuat dekat player tapi sedikit menyebar dari badan. Dodge prompt tetap di atas player.
- Lingkaran aura belakang fighter dinaikkan ke `AURA_RING_Y = -232`.
- Saat mengubah animasi/asset, wajib verifikasi dengan `npm test -- --run`, `npm run build`, dan screenshot/playtest browser bila visual berubah.

## Ringkasan Skill

### 1. `caveman`

Mode komunikasi ultra-ringkas. Dipakai saat user meminta "caveman mode", "be brief", "less tokens", atau `/caveman`.

- Default mode: `full`.
- Level tersedia: `lite`, `full`, `ultra`, `wenyan-lite`, `wenyan-full`, `wenyan-ultra`.
- Kurangi filler, basa-basi, dan hedging, tapi pertahankan detail teknis, code block, symbol, nama API, dan pesan error secara tepat.
- Turun ke prosa normal untuk peringatan keamanan, konfirmasi aksi irreversible, atau instruksi multi-langkah yang bisa ambigu.
- File pendukung: `README.md`.

### 2. `using-superpowers`

Aturan dasar pemilihan skill. Dipakai saat memulai percakapan atau sebelum respons ketika ada kemungkinan skill relevan.

- User instruction selalu prioritas tertinggi.
- Jika skill mungkin relevan, baca dan ikuti skill tersebut sebelum bertindak.
- Skill proses didahulukan dari skill implementasi.
- File pendukung memetakan tool untuk Codex, Copilot, dan Gemini.

### 3. `brainstorming`

Proses desain sebelum kerja kreatif, fitur baru, komponen, atau perubahan perilaku.

- Alur: eksplor konteks, tanya klarifikasi satu per satu, tawarkan 2-3 pendekatan, presentasikan desain, tulis spec, review, lalu transisi ke rencana implementasi.
- Jangan implementasi sebelum desain disetujui.
- Untuk pembahasan visual, dapat memakai visual companion berbasis browser.
- File pendukung: script server visual companion, template reviewer spec, dan panduan visual companion.

### 4. `game-setup-and-config`

Panduan membuat dan mengonfigurasi `new Phaser.Game` di Phaser 4.

- Mencakup renderer, canvas, scaling, pixel art, FPS, boot sequence, callbacks, input config, dan lifecycle game.
- Perhatikan prioritas config nested seperti `scale` dan `render`.
- Cocok untuk setup awal game atau perubahan `GameConfig`.

### 5. `frontend-design`

Panduan membuat UI web yang distinctive dan production-grade.

- Pilih arah estetika yang jelas sesuai konteks, audiens, dan tujuan.
- Hindari tampilan generik, layout template, dan palet klise.
- Fokus pada tipografi, warna, motion, komposisi, aksesibilitas, dan detail visual.
- Ikuti lisensi di `LICENSE.txt`.

### 6. `sprites-and-images`

Panduan membuat dan mengatur Sprite/Image Phaser 4.

- Mencakup `this.add.sprite`, `this.add.image`, texture/frame, transform, scale, rotation, tint, alpha, flip, origin, depth, destroy, NineSlice, dan TileSprite.
- Ingat perbedaan Sprite yang mendukung animasi dan Image yang lebih murah.
- File referensi memuat API komponen, gotcha, dan source file map.

### 7. `input-keyboard-mouse-touch`

Panduan input Phaser 4.

- Mencakup keyboard, mouse, pointer, touch, drag/drop, hit area, interactive object, key combo, dan gamepad.
- Gunakan event atau polling sesuai kebutuhan gameplay.
- File referensi memuat signature event, API quick reference, urutan dispatch pointer, dan config `setInteractive`.

### 8. `animations`

Panduan animasi sprite Phaser 4.

- Mencakup spritesheet, atlas, `AnimationManager`, `AnimationState`, local/global animation, frame callbacks, events, chaining, reverse, yoyo, repeat, timeScale, dan Aseprite.
- Gunakan global animation untuk animasi bersama, local animation untuk variasi spesifik sprite.

### 9. `audio-and-sound`

Panduan audio Phaser 4.

- Mencakup loading audio, playback, music loop, volume, rate, detune, seek, stereo pan, audio sprite, spatial audio, mute, decode runtime, dan Web Audio API.
- Bedakan kemampuan WebAudio dan HTML5 audio.

### 10. `tilemaps`

Panduan tilemap Phaser 4.

- Mencakup Tiled JSON, tileset, layer, collision, physics Arcade, tile properties, callbacks, query, edit runtime, koordinat tile/world, object layer, dan `TilemapGPULayer`.
- Cocok untuk map, level, collision berbasis tile, dan rendering tilemap besar.

### 11. `v4-new-features`

Ringkasan fitur baru Phaser 4.

- Mencakup Filters, RenderNodes, CaptureFrame, Gradient, Noise, SpriteGPULayer, TilemapGPULayer, Lighting, RenderSteps, dan tint modes baru.
- Catat perubahan besar dari v3: Pipeline menjadi RenderNode, FX/BitmapMask menjadi Filters, beberapa objek lama dihapus.
- File referensi memuat tint modes, catatan migrasi, dan source map.

### 12. `diagnose`

Loop disiplin untuk bug sulit dan regresi performa.

- Alur: bangun feedback loop, reproduksi, buat 3-5 hipotesis, instrumentasi, fix + regression test, cleanup + post-mortem.
- Jangan menebak tanpa loop reproduksi yang bisa dipercaya.
- Debug log sementara harus diberi prefix unik seperti `[DEBUG-...]` dan dibersihkan.
- File pendukung: template HITL reproduction loop.

### 13. `tdd`

Workflow test-driven development.

- Gunakan red-green-refactor.
- Mulai dari tracer bullet kecil, lalu tambah perilaku secara vertikal dan bertahap.
- Test harus mengunci behavior nyata, bukan detail implementasi rapuh.
- File pendukung membahas deep modules, interface design, mocking, refactoring, dan good/bad tests.

### 14. `zoom-out`

Mode untuk naik satu level abstraksi saat area kode belum familiar.

- Berikan peta modul, caller, dan hubungan konsep memakai glossary domain proyek.
- Skill ini menonaktifkan model invocation dan hanya meminta perspektif tingkat tinggi.

### 15. `grill-me`

Mode wawancara intens untuk stress-test rencana atau desain.

- Tanyakan satu pertanyaan per giliran.
- Jelajahi codebase bila pertanyaan bisa dijawab dari kode.
- Sertakan rekomendasi jawaban untuk tiap pertanyaan.

### 16. `grill-with-docs`

Versi grilling yang memakai dokumentasi domain.

- Tantang rencana terhadap `CONTEXT.md`, glossary, dan ADR.
- Perjelas istilah domain, cek konflik dengan kode, dan update `CONTEXT.md` inline saat istilah disepakati.
- Tawarkan ADR hanya untuk keputusan yang sulit dibalik, mengejutkan tanpa konteks, dan lahir dari trade-off nyata.
- File pendukung: format `CONTEXT.md` dan ADR.

### 17. `improve-codebase-architecture`

Panduan mencari peluang refactor arsitektur.

- Fokus pada deepening modules, interface, seam, adapter, leverage, dan locality.
- Baca `CONTEXT.md` dan ADR sebelum menilai arsitektur.
- Presentasikan kandidat refactor dulu, lalu lanjut grilling loop setelah user memilih.
- File pendukung membahas bahasa arsitektur, interface design, dan deepening.

### 18. `triage`

Workflow triage issue.

- Mengelola issue lewat state machine dan role triage.
- Bisa menampilkan yang perlu perhatian, triage issue spesifik, override state, membuat needs-info, dan menulis triage notes.
- File pendukung berisi cara menulis agent brief dan knowledge base out-of-scope.

### 19. `to-prd`

Mengubah konteks percakapan menjadi PRD dan mempublikasikannya ke issue tracker.

- Struktur PRD: problem statement, solution, user stories, implementation decisions, testing decisions, out of scope, dan further notes.
- Dipakai saat user meminta PRD dari konteks yang sedang dibahas.

### 20. `find-skills`

Panduan mencari dan memasang skill baru.

- Dipakai saat user bertanya apakah ada skill untuk kemampuan tertentu.
- Gunakan `npx skills find`, cek leaderboard `skills.sh`, dan verifikasi kualitas sebelum merekomendasikan.
- Nilai install count, reputasi source, dan GitHub stars.

### 21. `write-a-skill`

Panduan membuat skill baru.

- Kumpulkan kebutuhan, buat `SKILL.md`, pisahkan referensi bila panjang, dan tambahkan script untuk operasi deterministik.
- Description harus jelas, punya trigger, dan maksimal 1024 karakter.
- Review checklist: trigger jelas, ringkas, tidak time-sensitive, terminologi konsisten, contoh konkret.

## Catatan File Pendukung

- `brainstorming/scripts/*` menjalankan visual companion lokal untuk mockup, diagram, dan opsi visual.
- `brainstorming/spec-document-reviewer-prompt.md` membantu review spec.
- `diagnose/scripts/hitl-loop.template.sh` membantu reproduksi bug yang membutuhkan manusia.
- `tdd/*.md` memperdalam strategi test, mocking, refactor, dan desain interface.
- `triage/AGENT-BRIEF.md` dan `triage/OUT-OF-SCOPE.md` membantu issue siap dikerjakan agent.
- `grill-with-docs/CONTEXT-FORMAT.md` dan `ADR-FORMAT.md` menentukan format dokumentasi domain dan keputusan.
- Referensi Phaser di folder `references/` dipakai saat butuh detail API lebih lengkap.
