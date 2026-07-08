# Daftar Gambar Anakara — Manifest Asset (generate manual)

> **Konteks:** API image generation butuh billing (lihat `FOUNDATION.md` §8), jadi untuk sekarang
> gambar di-generate **manual oleh user** di [Google AI Studio](https://aistudio.google.com)
> (model gambar / "Nano Banana" — gratis via web UI), lalu disimpan ke path yang tertulis di sini.
> Kalau nanti billing aktif, daftar ini bisa dieksekusi otomatis (`scripts/generate-image.mjs --batch`)
> — **jangan hapus file ini**.

**Total: ±105 gambar** — P0: 22 · P1: 60 · P2: 23. Kerjakan per prioritas; centang `[x]` yang selesai.

---

## Cara pakai (workflow manual)

1. Buka **aistudio.google.com** → pilih model image generation.
2. Lihat kolom **Ref** pada item: kalau ada, **upload gambar referensi** itu dulu (path di bawah).
3. Copy **Gaya Dasar** yang sesuai (blok di bawah) → ganti `[SUBJEK]` dengan teks di kolom Subjek → kirim.
4. Download PNG → **rename sesuai kolom File** → simpan ke foldernya (buat folder kalau belum ada).
   Path fisik = `public/assets/...` (di kode nanti dipanggil sebagai `/assets/...`).
5. Centang item di daftar ini.

**Kode referensi:**
- `SHEET` = `referensi/WhatsApp Image 2026-07-06 at 22.00.31.jpeg` (sticker sheet Tayo — WAJIB untuk semua gambar Tayo)
- `SCENE` = `referensi/MacBook Air - 2.png` (gaya scene cerita hutan)
- `CHEST` = `referensi/WhatsApp Image 2026-07-06 at 21.55.30.jpeg` (gaya kotak misteri)

**Catatan penting:**
- Hasil biasanya berlatar **putih, bukan transparan** → untuk sticker/karakter/makanan, jalankan
  *remove background* (mis. remove.bg, atau fitur di AI Studio kalau ada) sebelum dipakai.
- Rasio: sticker/makanan/avatar/ikon = **1:1** · kartu & thumbnail game = **potret 3:4** ·
  halaman cerita & background = **lanskap 16:10**. Tulis rasio di prompt kalau model melenceng.
- Kompres PNG (mis. tinypng.com) — target < 150 KB per file (koneksi sekolah lambat).
- Thumbnail game & kartu: **tanpa teks di dalam gambar** (judul dirender aplikasi).

---

## Gaya Dasar (copy lalu ganti [SUBJEK])

**GAYA-TAYO** — semua pose Tayo & Momo (lampirkan `SHEET`):
```
[SUBJEK]. Tayo the cheetah cub mascot, kawaii chibi style exactly matching the attached reference sticker sheet: yellow fur with brown spots, big round black eyes with white sparkle, pink blush cheeks, cream belly, small round ears, soft thin outline. Full body, plain white background, clean sticker style for a children's education app. Square 1:1.
```

**GAYA-MAKANAN** — 32 item makanan:
```
[SUBJEK]. Cute kawaii food sticker for a kids nutrition game, simple rounded shapes, soft thin outline, bright cheerful colors, a tiny happy smiling face on the food, flat pastel shading, plain white background. Square 1:1.
```

**GAYA-AVATAR** — 10 avatar hewan:
```
[SUBJEK] head avatar inside a circle, cute kawaii cartoon style for a kids app, big friendly eyes, soft pastel colors, simple flat shading, plain white background. Square 1:1.
```

**GAYA-KARTU** — 24 kartu koleksi (bingkai rarity dirender aplikasi, jangan digambar):
```
[SUBJEK], heroic cute pose, collectible card character illustration for a kids nutrition game, kawaii chibi style, sparkling magical background, vibrant colors, no frame, no border, no text. Portrait 3:4.
```

**GAYA-THUMB** — 5 thumbnail kartu game Home (gaya art dramatis, aturan A2):
```
[SUBJEK], dramatic cinematic mobile-game menu card art, rich saturated colors, glowing highlights, epic but kid-friendly (no scary faces), no text, no logo. Portrait 3:4.
```

**GAYA-CERITA** — halaman cerita Bab 1 (lampirkan `SHEET` + `SCENE`):
```
Children storybook illustration, landscape 16:10: [SUBJEK]. Characters in kawaii chibi style matching the attached references: Tayo (yellow spotted cheetah cub) and Momo (soft white-grey bunny). Lush friendly forest, warm daylight, soft rounded shapes, gentle colors like the attached scene reference. No text.
```

**GAYA-IKON** — ikon UI pastel:
```
[SUBJEK] icon, rounded kawaii style, pastel blue (#1FA8E8) and warm yellow (#FFD23F) palette, thick soft outline, simple flat shading, plain white background. Square 1:1.
```

---

## P0 — Fondasi & Home (22 gambar, untuk Phase 0–2)

### Logo — folder `public/assets/`
| ✔ | File | Gaya | Ref | Subjek [SUBJEK] |
|---|---|---|---|---|
| [ ] | `logo.png` | GAYA-TAYO | SHEET | App logo: Tayo the cheetah cub head smiling next to nothing else, clean mascot logo mark, horizontal composition |

### Maskot Tayo inti — folder `public/assets/mascot/`
| ✔ | File | Gaya | Ref | Subjek | Dipakai untuk |
|---|---|---|---|---|---|
| [x] | `tayo-hello.png` | GAYA-TAYO | SHEET | Tayo waving hello with a big happy smile | Sapaan Home |
| [x] | `tayo-happy.png` | GAYA-TAYO | SHEET | Tayo jumping with joy, confetti around, celebrating | Jawaban benar / menang |
| [x] | `tayo-cheer.png` | GAYA-TAYO | SHEET | Tayo cheering encouragingly with small fist up, warm supportive smile | Jawaban salah ("Yuk coba lagi!") |
| [x] | `tayo-run.png` | GAYA-TAYO | SHEET | Tayo running fast to the side, motion lines | LoadingSpinner |

> ✅ 4 pose Tayo digenerate via **OpenArt (kling-3-omni)** 2026-07-07, satu sheet 2×2 lalu dipotong.
> Latar **putih, belum transparan** — di UI ditampilkan dalam lingkaran putih; kalau mau transparan, remove.bg dulu.

### Avatar siswa (hewan) — folder `public/assets/avatars/`
| ✔ | File | Gaya | Subjek |
|---|---|---|---|
| [x] | `avatar-01.png` | GAYA-AVATAR | An orange tabby cat |
| [x] | `avatar-02.png` | GAYA-AVATAR | A white bunny |
| [x] | `avatar-03.png` | GAYA-AVATAR | A panda |
| [x] | `avatar-04.png` | GAYA-AVATAR | A red fox |
| [x] | `avatar-05.png` | GAYA-AVATAR | A honey bear |
| [x] | `avatar-06.png` | GAYA-AVATAR | A wise little owl |
| [x] | `avatar-07.png` | GAYA-AVATAR | A baby penguin |
| [x] | `avatar-08.png` | GAYA-AVATAR | A green frog |
| [x] | `avatar-09.png` | GAYA-AVATAR | A sleepy koala |
| [x] | `avatar-10.png` | GAYA-AVATAR | A cheerful puppy |

> ✅ 10 avatar digenerate via **OpenArt** 2026-07-07 (satu sheet 2×5, dipotong 256×256).
> Latar putih (belum transparan) — di UI dipakai `object-cover` di dalam lingkaran, jadi aman.

### Thumbnail kartu game Home (art dramatis) — folder `public/assets/icons/`
| ✔ | File | Gaya | Ref | Subjek |
|---|---|---|---|---|
| [x] | `thumb-isi-piringku.jpg` | GAYA-THUMB | — | A glowing plate divided into four food-group sections, healthy foods floating around it, magical warm kitchen light — ✅ OpenArt 2026-07-07, disimpan **JPEG** 480×637 (<150 KB) |
| [ ] | `thumb-video.png` | GAYA-THUMB | CHEST | An opened wooden treasure chest projecting a glowing screen with a play button, purple celebration burst background |
| [x] | `thumb-kuis.jpg` | GAYA-THUMB | — | A giant glowing mystery card with a question mark among scattered cards, deep purple magical theme — ✅ OpenArt 2026-07-07, disimpan **JPEG** 480×637 (<150 KB) |
| [ ] | `thumb-battle.png` | GAYA-THUMB | — | Blue team energy versus red team energy clashing with a lightning split down the middle, epic team battle |
| [ ] | `thumb-cerita.png` | GAYA-THUMB | — | An open magical storybook at night with a paper castle and stars popping out of the pages, dreamy dark blue |

### Ikon kecil — folder `public/assets/icons/`
| ✔ | File | Gaya | Subjek |
|---|---|---|---|
| [ ] | `icon-leaderboard.png` | GAYA-IKON | A golden trophy with a small star |
| [ ] | `icon-koleksi.png` | GAYA-IKON | A neat stack of collectible cards with sparkles |

---

## P1 — Game Isi Piringku, Kuis & Battle (60 gambar, untuk Phase 3–6)

### Maskot tambahan — folder `public/assets/mascot/`
| ✔ | File | Gaya | Ref | Subjek | Dipakai untuk |
|---|---|---|---|---|---|
| [ ] | `tayo-chef.png` | GAYA-TAYO | SHEET | Tayo wearing a white chef hat, holding a wooden spoon proudly | Header Isi Piringku |
| [ ] | `tayo-point.png` | GAYA-TAYO | SHEET | Tayo pointing to the side with one paw, explaining cheerfully | Instruksi/tutorial |

### Makanan (32) — folder `public/assets/food/` — id HARUS sama dengan `data/makanan.json`
| ✔ | File | Subjek (pakai GAYA-MAKANAN) |
|---|---|---|
| [ ] | `nasi.png` | A small bowl of steamed white rice |
| [ ] | `jagung.png` | A corn cob with green husk |
| [ ] | `kentang.png` | A brown potato |
| [ ] | `roti.png` | A soft bread loaf with one slice |
| [ ] | `ubi.png` | A purple-skinned sweet potato |
| [ ] | `singkong.png` | Cassava roots with light brown skin |
| [ ] | `mie.png` | A bowl of wavy noodles with chopsticks |
| [ ] | `sagu.png` | Papeda (sago porridge) in a small bowl |
| [ ] | `ayam.png` | A roasted chicken drumstick |
| [ ] | `telur.png` | A boiled egg, one whole and one half showing yolk |
| [ ] | `ikan.png` | A cute whole cooked fish on a small plate |
| [ ] | `tempe.png` | Sliced tempeh pieces on a small plate |
| [ ] | `tahu.png` | White tofu cubes |
| [ ] | `daging.png` | A slice of cooked beef |
| [ ] | `udang.png` | A curled orange shrimp |
| [ ] | `kacang-merah.png` | Red kidney beans in a small bowl |
| [ ] | `wortel.png` | A carrot with leafy green top |
| [ ] | `bayam.png` | A fresh bunch of spinach leaves |
| [ ] | `brokoli.png` | A broccoli floret like a tiny tree |
| [ ] | `tomat.png` | A round red tomato |
| [ ] | `kangkung.png` | A bunch of water spinach with long stems |
| [ ] | `buncis.png` | A few green beans |
| [ ] | `terong.png` | A purple eggplant |
| [ ] | `labu.png` | A slice of yellow pumpkin |
| [ ] | `pisang.png` | A yellow banana |
| [ ] | `apel.png` | A shiny red apple |
| [ ] | `jeruk.png` | A bright orange |
| [ ] | `semangka.png` | A triangle watermelon slice |
| [ ] | `mangga.png` | A ripe yellow mango |
| [ ] | `pepaya.png` | A papaya half with tiny black seeds |
| [ ] | `anggur.png` | A small bunch of purple grapes |
| [ ] | `alpukat.png` | An avocado half with round seed |

### Kotak misteri — folder `public/assets/cards/`
| ✔ | File | Gaya | Ref | Subjek |
|---|---|---|---|---|
| [ ] | `kotak-misteri-tutup.png` | GAYA-THUMB | CHEST | A closed wooden treasure chest with golden lock, purple magical glow around it, centered |
| [ ] | `kotak-misteri-buka.png` | GAYA-THUMB | CHEST | The same wooden treasure chest bursting open with golden light rays and confetti, a glowing card rising from inside |

### Kartu koleksi (24) — folder `public/assets/cards/` — id sesuai `data/kartu-koleksi.json`
Rarity TIDAK digambar (bingkai dirender aplikasi). Semua pakai **GAYA-KARTU**; dua kartu Tayo lampirkan `SHEET`.

| ✔ | File | Ref | Subjek |
|---|---|---|---|
| [ ] | `kartu-01.png` | — | A rice bowl character wearing a captain's hat, saluting |
| [ ] | `kartu-02.png` | — | A cheerful corn cob character laughing |
| [ ] | `kartu-03.png` | — | A strong potato character flexing tiny arms |
| [ ] | `kartu-04.png` | — | A warm smiling bread loaf character |
| [ ] | `kartu-05.png` | — | A chicken drumstick character wearing a champion medal |
| [ ] | `kartu-06.png` | — | A fast swimming fish character with speed lines |
| [ ] | `kartu-07.png` | — | A heroic egg character with a tiny cape |
| [ ] | `kartu-08.png` | — | A mighty tempeh character flexing proudly |
| [ ] | `kartu-09.png` | — | A spinach superhero character with a flowing cape |
| [ ] | `kartu-10.png` | — | A bright carrot character with sparkling eyes |
| [ ] | `kartu-11.png` | — | An agile banana character running joyfully |
| [ ] | `kartu-12.png` | — | A fresh apple character winking |
| [ ] | `kartu-13.png` | — | A sweet smiling orange character |
| [ ] | `kartu-14.png` | — | A clear glass of water character with a calm smile |
| [ ] | `kartu-15.png` | — | An armored broccoli knight character with a small shield |
| [ ] | `kartu-16.png` | — | A tough tofu character wearing a martial arts headband |
| [ ] | `kartu-17.png` | — | A lightning-fast shrimp character dashing with electric sparks |
| [ ] | `kartu-18.png` | — | A golden glowing avocado character |
| [ ] | `kartu-19.png` | — | A giant friendly watermelon character |
| [ ] | `kartu-20.png` | — | A milk glass character with a small rainbow above it |
| [ ] | `kartu-21.png` | — | An energetic soccer ball character mid-bounce |
| [ ] | `kartu-22.png` | SHEET | Tayo the cheetah cub wearing an explorer hat and tiny backpack, adventuring in a jungle |
| [ ] | `kartu-23.png` | SHEET | Tayo the cheetah cub wearing a chef hat, proudly presenting a balanced healthy meal plate |
| [ ] | `kartu-24.png` | — | A legendary golden plate filled with balanced healthy Indonesian food, radiant glow, floating sparkles |

---

## P2 — Cerita, Video & Pelengkap (23 gambar, untuk Phase 4 & 7+)

### Maskot pelengkap — folder `public/assets/mascot/`
| ✔ | File | Gaya | Ref | Subjek | Dipakai untuk |
|---|---|---|---|---|---|
| [ ] | `tayo-read.png` | GAYA-TAYO | SHEET | Tayo sitting and reading an open storybook, curious happy face | Mode Cerita |
| [ ] | `momo-happy.png` | GAYA-TAYO | SCENE | Momo the soft white-grey bunny standing and smiling sweetly (match the bunny in the attached scene) | Karakter cerita |

### Cerita Bab 1 (11) — folder `public/assets/stories/bab1/` — sinkron dengan `data/cerita-bab1.json`
Semua pakai **GAYA-CERITA** + lampirkan `SHEET` & `SCENE`.

| ✔ | File | Subjek (scene) |
|---|---|---|
| [ ] | `cover.png` | Tayo and Momo having a picnic in a sunny forest clearing with a woven basket, title-free cover composition |
| [ ] | `hal-01.png` | Bright morning sky, Tayo happily setting off for a picnic carrying an empty basket |
| [ ] | `hal-02.png` | Tayo meets Momo the bunny on a forest path, both waving excitedly |
| [ ] | `hal-03.png` | Tayo opens the picnic basket and it is empty, both looking curious |
| [ ] | `hal-04.png` | Tayo and Momo thinking hard about which foods to bring, a thought bubble with food silhouettes |
| [ ] | `hal-05.png` | The basket now full with rice, chicken, apples and a water bottle, both cheering |
| [ ] | `hal-06.png` | Tayo and Momo eating together under a big shady tree |
| [ ] | `hal-07.png` | Tayo and Momo playing catch with a ball in a sunny meadow |
| [ ] | `hal-08.png` | Tayo happily sweating after playing, wondering what to drink, small question sparkles |
| [ ] | `hal-09.png` | Tayo drinking a glass of fresh water, early sunset colors |
| [ ] | `hal-10.png` | Tayo and Momo walking home at sunset waving goodbye, warm happy ending |

### Thumbnail video (8) — folder `public/assets/videos/thumb/` — sinkron dengan `data/video.json`
Pakai **GAYA-CERITA** (tanpa Momo bila tak disebut); lampirkan `SHEET` untuk yang ada Tayo.

| ✔ | File | Subjek |
|---|---|---|
| [ ] | `vid-01.png` | Tayo eating breakfast at a table with bread, egg and milk, morning light |
| [ ] | `vid-02.png` | A colorful plate divided into four food group sections shown proudly by Tayo |
| [ ] | `vid-03.png` | Tayo washing paws with soap and bubbles at a sink |
| [ ] | `vid-04.png` | A giant friendly carrot and Tayo pointing at his sparkling eyes |
| [ ] | `vid-05.png` | Tayo doing cheerful morning gymnastics in a park |
| [ ] | `vid-06.png` | A glass of clear water and a sugary soda side by side, water glowing like a hero |
| [ ] | `vid-07.png` | Tayo brushing teeth with a big toothbrush, foam bubbles |
| [ ] | `vid-08.png` | Tayo sleeping soundly in bed with a crescent moon outside the window |

### Background (2) — folder `public/assets/backgrounds/`
| ✔ | File | Gaya | Subjek |
|---|---|---|---|
| [ ] | `bg-hutan.png` | GAYA-CERITA | Wide empty friendly forest clearing background with soft pastel greens and blue sky, no characters, space for UI in the middle, landscape 16:9 |
| [ ] | `bg-pola.png` | GAYA-IKON | Seamless tileable pattern of tiny stars, plates and fruits on pastel blue background |

---

## Setelah semua P0 selesai

Beri tahu AI assistant ("asset P0 sudah masuk") supaya placeholder emoji/SVG di aplikasi & design system
diganti dengan file asli. Kompres dulu, cek nama file persis (huruf kecil semua, strip `-`).
