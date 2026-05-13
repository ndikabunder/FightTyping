# Fight Typing - SFX Style Guide

Tanggal: 2026-05-13  
Status: Draft awal  
Tema rekomendasi: `Cyber Dojo`

## Tujuan

SFX harus membuat typing terasa seperti input fighting, bukan UI biasa. Tiap tombol yang benar terasa seperti energi terkumpul; prompt selesai langsung berubah menjadi serangan fisik.

## Arah Tema

`Cyber Dojo` = martial arts + arena neon + typing digital.

- Bunyi utama: synth punch, digital click, glitch pendek, whoosh cepat, bass impact.
- Rasa visual: neon cyan/magenta, energi arcade, arena latihan futuristik.
- Hindari: SFX realistis penuh, gore, suara kartun lucu, musik terlalu ramai.

## Referensi Mood

- `Katana ZERO`: synth combat tajam, hit pendek, momentum cepat.
- `Tron Legacy`: neon elektronik, pulse rendah, arena digital.
- `Street Fighter III`: impact jelas, timing punch/kick mudah dibaca.
- `Typing of the Dead`: typing sebagai aksi utama.
- `Into the Breach`: UI beep bersih, tidak menutupi gameplay.

## Palette SFX

| Event | Karakter Bunyi | Durasi | Catatan |
| --- | --- | ---: | --- |
| Key correct | mechanical click + sparkle kecil | 40-90ms | harus ringan, sering diputar |
| Key wrong | muted clack + glitch pendek | 80-140ms | tidak terlalu menyakitkan telinga |
| Prompt progress | tiny synth tick naik pitch | 40-90ms | opsional, bisa pakai variasi correct |
| Prompt complete | rising digital blip + charge | 180-320ms | transisi ke attack |
| Punch hit | tight thud + synth snap | 120-220ms | cepat, tajam, mid punchy |
| Kick hit | deeper thud + wide whoosh | 180-300ms | lebih berat dari punch |
| Attack whiff | air swipe pendek | 120-220ms | tanpa bass impact |
| Dash forward | fast whoosh + foot slide | 120-180ms | sinkron dash visual |
| Return home | soft reverse whoosh | 100-160ms | lebih kecil dari dash |
| Dodge success | clean air slice + blink | 140-240ms | terasa aman/cepat |
| Enemy telegraph | warning pulse beep | 300-600ms | harus readable, tidak panik berlebihan |
| Player hit taken | bass thump + static crack | 180-320ms | lebih gelap dari enemy hit |
| Combo milestone | bright arpeggio stab | 250-450ms | hanya tiap milestone supaya tidak spam |
| KO enemy | deep boom + power-down | 600-1200ms | reward besar |
| Player lose | low impact + system fail | 700-1300ms | gelap, tidak terlalu panjang |
| Menu confirm | short neon click | 70-130ms | UI ringan |
| Pause | soft digital stop | 120-240ms | jelas tapi tidak dramatis |

## Keyword Search Pixabay

Gunakan keyword Inggris agar hasil lebih banyak:

### Typing / UI

- `keyboard click`
- `mechanical keyboard`
- `computer beep`
- `digital click`
- `interface beep`
- `sci fi button`
- `error glitch`

### Combat

- `punch impact`
- `fight punch`
- `kick whoosh`
- `martial arts whoosh`
- `hit impact`
- `body hit`
- `swoosh attack`

### Cyber / Energy

- `sci fi impact`
- `energy hit`
- `laser whoosh`
- `cyberpunk glitch`
- `electric zap`
- `power up`
- `digital charge`

### Result / Feedback

- `success beep`
- `arcade win`
- `level complete`
- `game over`
- `power down`
- `warning alarm`

## Naming Convention Asset

Simpan final asset di:

`public/assets/audio/sfx/`

Nama file disarankan:

- `ui_key_correct_01.ogg`
- `ui_key_wrong_01.ogg`
- `ui_prompt_complete_01.ogg`
- `combat_dash_forward_01.ogg`
- `combat_dash_return_01.ogg`
- `combat_punch_hit_01.ogg`
- `combat_kick_hit_01.ogg`
- `combat_attack_whiff_01.ogg`
- `combat_dodge_success_01.ogg`
- `enemy_telegraph_01.ogg`
- `player_hit_taken_01.ogg`
- `feedback_combo_01.ogg`
- `round_enemy_ko_01.ogg`
- `round_player_lose_01.ogg`
- `ui_menu_confirm_01.ogg`
- `ui_pause_01.ogg`

## Format Teknis

- Format utama: `.ogg`.
- Fallback jika perlu: `.mp3`.
- Volume source: normalize sekitar `-12 LUFS` sampai `-16 LUFS`, jangan clipping.
- Trim silence awal/akhir.
- Untuk SFX sering diputar, durasi ideal di bawah `250ms`.
- Hindari reverb panjang pada key SFX.

## Mix Awal Phaser

Target volume relatif:

- Key correct: `0.25`
- Key wrong: `0.28`
- Prompt complete: `0.45`
- Punch hit: `0.55`
- Kick hit: `0.62`
- Dash/whiff: `0.35`
- Dodge: `0.45`
- Enemy telegraph: `0.38`
- KO/result: `0.65`

## Seleksi Asset

Pilih asset yang:

- pendek dan langsung punya attack transient.
- tetap jelas saat diputar cepat.
- tidak punya noise floor besar.
- tidak mengandung musik panjang.
- lisensi aman untuk project.
- bisa dipitch/trim tanpa terdengar rusak.

## Prioritas Implementasi

1. Key correct / wrong.
2. Prompt complete.
3. Punch hit / kick hit / whiff.
4. Dash / dodge.
5. Enemy telegraph.
6. KO / lose / menu.

## Definition of Done

- Minimal 10 SFX masuk folder audio.
- Semua event gameplay utama punya sound cue.
- Tidak ada SFX yang menutupi prompt atau feedback visual.
- Volume tiap kategori terasa konsisten.
- Browser autoplay aman: audio mulai setelah input user pertama.
