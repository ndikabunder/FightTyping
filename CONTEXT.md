# Fight Typing Context

## Domain Glossary

- **Fight Typing**: browser fighting game berbasis typing. Typing prompt adalah input combat, bukan minigame terpisah.
- **Fighter**: entity combat `player` atau `enemy` yang punya HP, state, position, facing, hurtbox, dan visual action serial.
- **Prompt**: kata yang harus diketik pemain. Prompt attack melekat ke limb player; prompt dodge muncul di atas player.
- **Objective**: quest kecil per level yang harus selesai sebelum kemenangan dihitung sah. Jika enemy KO tetapi objective belum selesai, round menjadi `lost` sebagai quest failed.
- **Objective Progress**: label, current, target, dan completed yang ditampilkan HUD. Contoh: `Combo x3`, `Dodge x2`, `Neon Break`, `Reach phase 3`.
- **Combo**: streak prompt sukses. Combo pecah saat miss atau terkena hit tertentu. Combo punya `count`, `best`, `tier`, dan event serial untuk animasi HUD.
- **Neon Break**: player skill level 3+. Unlock setelah combo 3x, memakai prompt dua kata, memberi damage 2x, reset tekanan enemy, dan memakai spritesheet `skill.png`.
- **Enemy Skill**: pressure move level 6+. Cooldown 300% attack normal, damage 2x, UI hanya menampilkan `Enemy Skill` tanpa jenis serangan.
- **Limb Function**: fungsi taktis limb. Right punch cepat, left punch memberi extra combo, right kick damage/range, left kick stagger/delay enemy.
- **Enemy Archetype**: profil lawan data-driven. Mengatur attack sequence, damage multiplier, cooldown multiplier, dodge chance, dan feint chance.
- **Pacing Wave**: penyesuaian tekanan selama round panjang agar fight tidak datar. Bisa menaikkan/menurunkan cooldown/damage efektif berdasarkan performa pemain.
- **Final Strike**: presentasi slow/flash saat hit terakhir membuat KO. Result HUD ditahan sementara agar impact terbaca.
- **Outcome Animation**: animasi setelah hasil round jelas. Death muncul langsung saat `ko`; victory player muncul setelah final strike selesai.
- **Frame Resolver**: module yang menentukan texture/frame spritesheet fighter berdasarkan fighter state, visual action, skill, outcome, dan waktu scene.
- **Runtime Asset**: file di `public/assets/**` yang dibaca Vite/Phaser saat game berjalan.
- **Source Asset**: file di `assets/**` sebagai sumber authoring. Harus disinkronkan ke runtime asset via `npm run assets:sync`.

## Architecture Notes

- Gameplay source of truth berada di `src/game/simulation` dan `src/game/systems`.
- Phaser scene hanya bridge input, render, SFX, camera, dan transition.
- Fighter sprite memakai manual frame control (`setTexture` + `setFrame`), bukan `sprite.play`, karena tiap action punya range impact berbeda.
- Asset manifest player berada di `src/phaser/assets/playerSpritesheets.ts`.
- Audio helper berada di `src/phaser/audio/GameAudio.ts`.
- Tuning lintas combat berada di `src/game/content/fightRules.ts`.
