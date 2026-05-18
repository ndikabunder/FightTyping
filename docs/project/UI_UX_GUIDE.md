# Fight Typing - UI/UX Guide

Status: 2026-05-14  
Scope: panduan visual, layout, typography, spacing, button, HUD, motion, dan implementasi UI untuk prototype Phaser 4 + DOM HUD.

## Prinsip Visual

- Tema utama: `Cyber Martial Typing / Neon Impact`.
- Rasa UI: arcade neon, martial arts, cepat, tajam, readable saat gameplay intens.
- Prioritas: gameplay readability dulu, neon polish kedua.
- UI tidak boleh menutup prompt utama, fighter, hitbox visual, atau enemy telegraph.
- Hindari panel debug permanen di gameplay kecuali diminta.

## Canvas dan Layout Dasar

- Logical resolution: `1280x720`.
- Aspect ratio: `16 / 9`.
- Phaser scale: `Phaser.Scale.FIT`.
- Shell: `#game-shell` maksimal `1280px`, centered, punya border neon tipis.
- App padding luar: `18px` desktop.
- Safe zone HUD utama: sekitar `4%` kiri/kanan dan `3%` atas.
- Semua overlay DOM memakai koordinat percentage dari logical canvas agar tetap sejajar saat resize.

## Layering dan Z-Index

- Phaser canvas: base layer.
- `#hud-root`: `z-index: 2`, absolut `inset: 0`.
- Prompt/card penting: absolute DOM di atas canvas.
- Combo readout: `z-index: 8`.
- Enemy nameplate: `z-index: 9`.
- Result overlay: layer interaktif, boleh menerima pointer event.
- Elemen HUD gameplay default `pointer-events: none` agar tidak mengganggu input typing.

## Typography

- Font stack utama: `"Trebuchet MS", Arial, sans-serif`.
- Semua label gameplay pendek memakai uppercase.
- Gunakan font-weight besar untuk info penting: `800` atau `900`.
- Body/UI color default: `#e8fbff`.
- Text rendering: `optimizeLegibility`.

### Skala Font

- HP label: `clamp(11px, 1.4vw, 15px)`.
- Round state: `clamp(15px, 2vw, 24px)`.
- Metrics chip: `clamp(10px, 1.2vw, 14px)`.
- Objective/level small text: `clamp(9px, 1vw, 12px)`.
- Prompt word: `clamp(17px, 2vw, 26px)`.
- Combo readout: `clamp(14px, 1.45vw, 20px)`.
- Enemy nameplate title: `clamp(13px, 1.35vw, 18px)`.
- Enemy skill title: `clamp(16px, 1.65vw, 23px)`.

## Color Tokens

- Background page: `#030711`.
- Game shell background: `#050914`.
- Text primary: `#e8fbff`.
- Player/cyan: `#7cf7ff`, `#2ec4b6`.
- Enemy/magenta: `#ff4d8d`, `#ef476f`, `#ff78d8`.
- Objective/gold: `#fff3b0`, `#ffd166`.
- Purple accent: `#a855f7`, `#e7d7ff`.
- Panel dark cyan: `rgba(8, 25, 38, 0.88)`.
- Panel dark magenta: `rgba(46, 8, 32, 0.92)`.
- Avoid pure white for main UI; use `#e8fbff` for softer neon readability.

## Spacing Rules

- Shell outer padding: `18px`.
- Top HUD margin: `3.2%` from top.
- HUD side margin: `4%` left/right.
- HUD bar grid gap: `28px`.
- HP wrap gap: `6px`.
- Level status gap: `12px`.
- Prompt card padding: `10px 13px`.
- Level chip padding: `8px 13px`.
- Enemy cooldown padding: `8px 11px`.
- Enemy nameplate padding: `7px 12px 8px`.
- Skill panel padding: `9px 13px 11px`.
- Button padding minimum: `10px 16px`, larger for menu/result CTA.

## Shape dan Border

- Standard panel border: `2px solid` dengan alpha neon `0.5-0.76`.
- Small rectangular panels: `border-radius: 3px-6px`.
- Enemy nameplate: pill `border-radius: 999px`.
- Prompt cards memakai clipped cyber-corner polygon.
- HP bars memakai radius `4px`, tinggi `27px`.
- Progress bars kecil memakai tinggi `8px`.

## Buttons

- Button harus readable dengan mouse dan keyboard.
- State wajib: default, hover, focus, active/pressed, disabled bila tidak tersedia.
- Focus keyboard harus terlihat jelas, minimal glow/border cyan atau gold.
- Menu primary action memakai teks besar uppercase: `START`, `LEADERBOARD`, `NEXT`, `RETRY`, `MAIN MENU`.
- Button result kontekstual: Victory punya `NEXT`, `RETRY`, `MAIN MENU`; Defeat hanya `RETRY`, `MAIN MENU`.
- Shortcut keyboard wajib tetap sinkron dengan label UI.
- Jangan pakai hover-only affordance; keyboard-only flow harus tetap jelas.

## HUD Components

### HP Bars

- Player HP kiri, enemy HP kanan.
- Player fill: gradient cyan `#2ec4b6 -> #e8fbff -> #fff3b0`.
- Enemy fill: gradient gold/magenta `#ffd166 -> #ff78d8 -> #ef476f`.
- Bar width berubah dengan transition `160ms ease`.

### Round State

- Posisi tengah atas antara HP bars.
- Text uppercase besar: `TYPE TO STRIKE`, `ENEMY WINDUP`, pause/result labels.
- Background transparan agar tidak menambah noise.

### Level dan Objective Panel

- Posisi tengah atas, sekitar `18.5%` dari top.
- Tampilkan level name, enemy/phase info, objective, progress objective.
- Objective completed memakai cyan glow.
- Panel tidak boleh lebih lebar dari `360px` agar tidak menutup fight.

### Combo Readout

- Posisi di bawah objective panel.
- Format: `COMBO xN`.
- Tanpa border/background.
- Tidak boleh flicker; animasi manual hanya saat combo serial berubah.
- Tier color: fresh/gold, chain/cyan, power/gold kuat, mega/magenta.

### Prompt Cards

- Attack prompt dekat limb player.
- Dodge prompt tetap di atas player.
- Prompt active/matching harus lebih terang dari idle.
- Wrong input memberi shake pada panel aktif.
- Completed prompt boleh flash singkat, lalu diganti oleh prompt baru.

### Enemy Nameplate

- Posisi: di atas enemy cooldown attack.
- Isi: `Opponent`, nama archetype, phase/focus label.
- Tujuan: pemain langsung tahu lawan seperti apa tanpa membaca panel objective.
- Style: pill magenta, neon glow, tidak terlalu besar.

### Enemy Cooldown

- Posisi: di atas kepala enemy, di bawah nameplate.
- Label attack: nama incoming attack bila diketahui, fallback `Enemy Attack`.
- State warna:
  - safe: magenta normal.
  - warning: gold/cyan saat mendekati serangan.
  - danger: magenta/gold pulse saat hampir menyerang.

### Skill Panels

- Player skill muncul level 3+ di bawah kaki player.
- Enemy skill muncul level 6+ di bawah kaki enemy.
- Player skill menampilkan charge, lock/ready state, dan dua kata skill.
- Enemy skill hanya menampilkan warning `Enemy Skill`, tidak membocorkan attack detail.

## Motion dan Feedback

- Transition scene: slash/flash neon, cepat, arcade, tidak lebih lama dari rasa gameplay.
- Width transition bar: `90-160ms`.
- Prompt/card state transition: `120ms`.
- Danger pulse: gunakan animasi singkat berulang untuk enemy cooldown/skill.
- Wrong input: shake hanya target panel aktif, jangan shake seluruh HUD.
- Combo pop: scale/glow singkat, no flicker.
- Hit feedback: SFX + screen shake ringan + hit stop, bukan UI berlebihan.

## Audio UX

- Typing correct ringan dan tidak melelahkan.
- Wrong input lebih gelap/glitch, durasi pendek.
- Punch/kick berbeda karakter: punch tajam, kick lebih berat.
- Skill punya SFX lebih besar dari attack biasa.
- Victory/defeat jelas, tapi tidak menutupi result input.
- BGM volume rendah agar typing tetap terdengar.

## Accessibility dan Readability

- Semua aksi menu/result bisa dilakukan keyboard.
- Focus state harus terlihat.
- Jangan mengandalkan warna saja untuk status: kombinasikan label, progress, pulse, atau text.
- Font minimal untuk gameplay text: jangan lebih kecil dari `9px` via clamp.
- Hindari panel semi-transparan terlalu rendah alpha di atas arena ramai.
- Pastikan prompt tetap terbaca pada desktop dan mobile landscape.

## Do / Don't

### Do

- Pakai CSS class existing sebelum membuat variasi baru.
- Simpan magic number gameplay di `src/game/content/fightRules.ts`.
- Simpan HUD display logic di `src/ui/hud/HudController.ts`.
- Update guide ini bila menambah komponen UI baru.
- Jalankan `npm.cmd test -- --run` dan `npm.cmd run build` setelah perubahan UI/UX besar.

### Don't

- Jangan menaruh aturan combat di CSS/HUD.
- Jangan mengembalikan debug panel permanen.
- Jangan membuat prompt card terlalu besar sampai menutup fighter.
- Jangan membuat enemy skill membocorkan jenis serangan.
- Jangan membuat transition terlalu lama sampai menghambat retry/next loop.

## Checklist Komponen Baru

- Apakah komponen tidak menutup prompt/fighter?
- Apakah readable di `1280x720` dan saat `FIT` resize?
- Apakah punya warna state jelas?
- Apakah keyboard-only flow tetap bisa dipakai?
- Apakah motion tidak flicker?
- Apakah docs `README.md`, `TASK.md`, atau guide ini perlu update?
