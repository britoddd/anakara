# Daftar Video Belajar — Prompt Produksi (generate manual)

> **Konteks:** section **Video Belajar** (`/game/video`, Phase 4) memutar 8 video edukasi gaya
> Reels vertikal. Metadata & judul sudah final di **`data/video.json`**; file `.mp4`-nya
> **belum diproduksi** → slide menampilkan panel "sedang disiapkan" sampai file ditaruh di
> `public/assets/videos/`. Dokumen ini berisi **prompt siap-copy** untuk memproduksi ke-8 video
> itu (text-to-video / animasi), selaras art style aplikasi.
>
> **Thumbnail** ke-8 video sudah punya prompt sendiri di
> [`daftar-gambar.md`](daftar-gambar.md) (P2 → "Thumbnail video") — **jangan diduplikasi di sini.**
> Dokumen ini fokus ke **video bergeraknya**.

**Target: 8 video** — semua **potret 9:16**, konten internal 100% (aman anak, tanpa embed/rekomendasi
eksternal). Centang `[x]` di `data/video.json` (`status: "jadi"`) begitu file `.mp4` masuk.

---

## Cara pakai (workflow manual)

1. Pilih tool text-to-video (mis. Higgsfield/OpenArt kalau kredit ada, Kling, Runway, Pika, Sora,
   Veo, dll.) atau animasikan dari gambar (image-to-video pakai frame gaya `daftar-gambar.md`).
2. Copy blok **GAYA-VIDEO** di bawah → tempel sebagai gaya dasar.
3. Untuk tiap video: kerjakan **per-shot** (kolom "Shot"). Kebanyakan model hanya bikin klip
   ~5–8 dtk, jadi generate tiap shot terpisah lalu **sambung** (editor apa saja) sesuai urutan &
   durasi target. Kalau tool mendukung referensi karakter, lampirkan sheet Tayo
   (`referensi/WhatsApp Image 2026-07-06 at 22.00.31.jpeg`) agar Tayo konsisten antar-shot.
4. **Rekam narasi** (kolom "Narasi", Bahasa Indonesia) terpisah — suara manusia **atau** TTS id-ID
   (aplikasi sudah pakai fallback Web Speech id-ID untuk Cerita, jadi TTS id-ID = pilihan aman).
   Tempel di atas visual sesuai timing shot. Tambah musik latar instrumental lembut (volume rendah)
   + SFX ceria (pop/sparkle) di momen kunci.
5. Export **potret 9:16**, `H.264 .mp4`, ringan (koneksi sekolah lambat — target ≲ 5 MB/video,
   ≤ 720×1280, 24–30 fps). **Rename** sesuai kolom File → simpan ke `public/assets/videos/`.
6. Di `data/video.json`, ubah `status` video itu dari `"placeholder"` → `"jadi"` (opsional; kode
   otomatis memutar begitu file ada). Pastikan `durasiDetik` cocok dengan durasi akhir.

**Catatan penting:**
- **Aspek 9:16 wajib.** Pemutar (`VideoFeed.tsx`) memakai `object-contain` — video landscape akan
  tampil kecil dengan pita hitam. Isi subjek di **tengah** dengan sedikit ruang atas (bar judul
  mengambang menutup ~64px atas, tombol aksi menutup kanan-bawah — jangan taruh info penting di sana).
- **Video jalan tanpa suara secara default** (anak menyalakan 🔊 sendiri). Maka **pesan harus jelas
  secara visual**: aksi besar & gamblang, objek jelas. Narasi memperkaya, bukan satu-satunya
  pembawa makna. Boleh sisipkan **1–2 kata kunci** grafis besar (mis. "AIR PUTIH ✓") tapi **hindari
  paragraf teks** — banyak anak kelas 1–2 belum lancar membaca.
- **1 detik pertama = hook.** Mulai dengan Tayo + objek utama langsung terlihat (feed di-scroll cepat).
- **Aman anak:** kuman/gigi berlubang/lelah digambar **lucu & ramah**, JANGAN menakutkan. Tanpa
  kekerasan, tanpa merek dagang nyata, tanpa wajah anak manusia.
- Durasi di bawah = **target** (dari `data/video.json`). Jumlah shot dibuat mendekati target;
  boleh geser ±10 dtk asal terasa pas untuk anak.

---

## GAYA-VIDEO (copy lalu ganti [SHOT])

> Selaras restyle THYNK (D12) & aturan A2 — sama seperti **GAYA-CERITA** di `daftar-gambar.md`,
> tapi untuk **video vertikal**. Sisipkan deskripsi Tayo utuh (sudah termuat) kalau tool tak
> menerima gambar referensi.

```
[SHOT]. 2D flat cartoon animation for a children's nutrition & healthy-habits app, hand-drawn picture-book / sticker style — NOT 3D, NOT photorealistic, NOT cinematic. Main character Tayo, a kawaii chibi cheetah cub mascot with toddler proportions (big head ~40% of height, small round body, stubby paws): soft golden-yellow fur with rounded dark-brown spots, cream muzzle and belly, big round black eyes each with one white sparkle, tiny brown triangle nose, rosy pink blush cheeks, small round ears with cream inner ear, short brown-tipped tail. Keep Tayo's design IDENTICAL in every shot (attach the Tayo reference sheet if the tool allows). Clean 2D flat style: soft thin outlines slightly darker than each fill, simple two-tone cel shading, no gradients on shapes, no texture noise. Cheerful bright palette: fresh grass green #7DD14D, bubblegum pink #D6336C, warm amber #FFC93C, pastel sky blue #8EC9E8, on soft cream #F5F8E7 backgrounds. Gentle bouncy playful motion, smooth simple movements, soft ease-in-out, warm daylight, wholesome friendly mood. Vertical 9:16 full-frame, subject centered with headroom and safe margins. Stable camera, clean loop-friendly motion.
Negative: text, captions, watermark, logo, UI elements, 3D render, photorealistic, painterly, dark or scary mood, dramatic lighting, glow bloom, gradient background, extra characters unless specified, distorted anatomy, extra limbs, flickering, warping, morphing artifacts, jitter, low quality.
```

**Panduan narasi (semua video):** Bahasa Indonesia sederhana, kalimat pendek, hangat & ceria.
Suara ramah (perempuan dewasa lembut atau anak), tempo lambat–sedang (~2–2,5 kata/dtk). id-ID.
Akhiri banyak video dengan ajakan positif ("Yuk, …!") dan sapaan Tayo.

---

## 1. `vid-01.mp4` — "Kenapa Harus Sarapan?"  ·  Makanan Sehat  ·  🎯 ~60 dtk
**Tujuan:** sarapan memberi energi untuk belajar & bermain setelah semalam berpuasa tidur.

**Narasi:**
> "Selamat pagi! Aku Tayo. Tahukah kamu? Pagi hari, perut kita masih kosong. Semalaman kita tidur,
> jadi tubuh butuh tenaga baru. Itulah kenapa kita harus **sarapan**! Sarapan sehat — nasi, telur,
> dan buah — memberi kita energi. Jadi kita kuat belajar dan semangat bermain. Jangan lupa minum
> air putih juga, ya. Yuk, mulai hari dengan sarapan sehat!"

| Shot | ⏱ | Prompt visual [SHOT] |
|---|---|---|
| 1 | ~7s | Tayo waking up in a cozy bedroom, stretching his paws with a big yawn, warm morning sunlight through the window, cheerful |
| 2 | ~7s | Close-up of Tayo's round tummy with a small cute "empty" sparkle and a tiny rumble, he looks down curiously |
| 3 | ~9s | Simple sky transition from night with a crescent moon and stars to a bright rising sun, Tayo small in frame greeting the morning |
| 4 | ~13s | Tayo sitting at a breakfast table happily eating a healthy breakfast: a bowl of rice, a boiled egg and a red apple, steam curls, cozy kitchen |
| 5 | ~11s | Energized Tayo bouncing with sparkles and little stars of energy, then briefly reading a book and running — full of pep |
| 6 | ~7s | Tayo drinking a clear glass of water, refreshing splash, satisfied smile |
| 7 | ~6s | Tayo waving goodbye holding up a balanced breakfast plate, confetti dots, warm cheerful ending |

---

## 2. `vid-02.mp4` — "Isi Piringku, Yuk!"  ·  Makanan Sehat  ·  🎯 ~75 dtk
**Tujuan:** kenalkan piring seimbang 4 kelompok (sinkron game Isi Piringku: Pokok/Lauk/Sayur/Buah).

**Narasi:**
> "Hai! Ini piringku. Piring yang sehat punya **empat bagian**. Pertama, **makanan pokok** — seperti
> nasi, jagung, atau kentang. Ini sumber tenaga. Kedua, **lauk-pauk** — telur, ikan, tempe, dan
> tahu. Ini untuk tumbuh kuat. Ketiga, **sayuran** — wortel, bayam, dan brokoli. Penuh vitamin!
> Keempat, **buah** — pisang, apel, dan jeruk. Segar dan manis alami. Isi piringmu dengan keempatnya,
> seimbang. Jangan lupa minum air putih. Piring sehat, tubuh kuat!"

| Shot | ⏱ | Prompt visual [SHOT] |
|---|---|---|
| 1 | ~9s | Tayo cheerfully presenting a big empty round plate divided into four equal sections by thin lines, tada gesture |
| 2 | ~12s | The "makanan pokok" section fills up with cute smiling foods hopping in: a rice bowl, a corn cob, a potato |
| 3 | ~12s | The "lauk-pauk" section fills with cute foods: a boiled egg, a fish, tempeh slices, tofu cubes, each with tiny happy faces |
| 4 | ~12s | The "sayuran" section fills with a carrot, spinach leaves and a broccoli floret, little vitamin sparkles popping |
| 5 | ~12s | The "buah" section fills with a banana, a red apple and an orange, fresh juicy sparkle |
| 6 | ~11s | Camera pulls to show the full balanced four-section plate complete, Tayo standing proudly beside it with a thumbs up |
| 7 | ~7s | A clear glass of water hops next to the plate, Tayo winks and gives a cheerful double thumbs up, confetti dots |

---

## 3. `vid-03.mp4` — "Ayo Cuci Tangan!"  ·  Kebiasaan Baik  ·  🎯 ~45 dtk
**Tujuan:** langkah cuci tangan pakai sabun sebelum makan.

**Narasi:**
> "Tangan kita menyentuh banyak benda. Kuman bisa menempel, lho! Sebelum makan, ayo **cuci tangan**.
> Basahi tangan dengan air, lalu beri sabun. Gosok telapak, punggung tangan, dan sela-sela jari.
> Jangan lupa ibu jari dan kuku. Bilas sampai bersih, lalu keringkan. Tangan bersih, badan sehat!"

| Shot | ⏱ | Prompt visual [SHOT] |
|---|---|---|
| 1 | ~6s | Tayo playfully touching a ball, a door and a table; a few tiny cute smiling germ blobs (friendly, harmless) float onto his paws |
| 2 | ~5s | Tayo walking up to a sink, a small thought bubble showing a plate of food (about to eat) |
| 3 | ~7s | Tayo wetting his paws under a running tap, then pumping soap, foamy white bubbles forming |
| 4 | ~9s | Close-up of Tayo scrubbing: palms together, then back of paws, then between fingers, lots of soft bubbles, the tiny germs washing away |
| 5 | ~6s | Tayo scrubbing his thumbs and around the little claws, thorough and cheerful |
| 6 | ~7s | Tayo rinsing under clear water, bubbles rinse off, then drying paws with a soft towel |
| 7 | ~5s | Tayo holds up clean sparkling paws with a big proud smile and a thumbs up, sparkles |

---

## 4. `vid-04.mp4` — "Wortel, Sahabat Mata"  ·  Makanan Sehat  ·  🎯 ~60 dtk
**Tujuan:** wortel (vitamin A) baik untuk mata; sebut juga bayam & pepaya.

**Narasi:**
> "Kenalkan, ini **wortel**! Warnanya oranye cerah. Wortel punya **vitamin A**. Vitamin A baik untuk
> **mata** kita. Dengan mata sehat, kita bisa melihat dengan jelas. Wortel enak dimakan mentah,
> direbus, atau jadi sup. Selain wortel, ada juga **bayam** dan **pepaya** yang baik untuk mata.
> Yuk, makan sayur dan buah setiap hari!"

| Shot | ⏱ | Prompt visual [SHOT] |
|---|---|---|
| 1 | ~8s | A big friendly smiling carrot with a leafy green top bounces into frame, bright orange, Tayo waves hello beside it |
| 2 | ~8s | The carrot glows softly with warm amber sparkles labelled by tiny star icons (vitamin), Tayo looks impressed |
| 3 | ~10s | Close-up of Tayo's big round eyes twinkling brightly and clearly, tiny sparkles, healthy happy gaze |
| 4 | ~8s | Point-of-view style: Tayo looking out at a crisp clear sunny scene (flowers, butterflies) seen sharply |
| 5 | ~12s | Quick friendly montage of the carrot eaten three ways: raw crunchy stick, boiled in a bowl, and floating in a pot of vegetable soup |
| 6 | ~8s | A smiling spinach bunch and a papaya half hop in next to the carrot, all cheering together as eye-friendly foods |
| 7 | ~6s | Tayo happily eating a carrot stick with a crunch, waves goodbye, cheerful sparkles |

---

## 5. `vid-05.mp4` — "Senam Pagi Bersama Tayo"  ·  Olahraga  ·  🎯 ~90 dtk
**Tujuan:** senam pagi ikut-gerak (follow-along) — Tayo menghadap penonton, gerakan jelas & mudah ditiru.

**Narasi:**
> "Selamat pagi! Ayo **senam** bersama Tayo! Berdiri tegak. Tarik napas... hembuskan. Pertama, putar
> kepala pelan-pelan. Kanan... kiri. Sekarang angkat kedua tangan ke atas, regangkan tubuh. Ayo
> **lompat**! Satu, dua, tiga, empat! Putar lengan seperti baling-baling. Jalan di tempat, angkat
> lutut tinggi-tinggi. Terakhir, tarik napas dalam... dan hembuskan. Hebat! Badan jadi segar dan
> semangat. Sampai jumpa!"

> **Catatan:** karena ini follow-along, Tayo **menghadap kamera** dan gerakan **berulang jelas** biar
> anak bisa menirukan. Boleh tampilkan hitungan besar "1 · 2 · 3 · 4" saat melompat (pengecualian
> angka besar, bukan paragraf).

| Shot | ⏱ | Prompt visual [SHOT] |
|---|---|---|
| 1 | ~8s | Tayo standing in a sunny green park facing the viewer, morning light, waving and inviting to exercise, bouncy |
| 2 | ~10s | Tayo standing tall facing viewer, breathing in (chest up, paws rising) then out (paws lowering), calm and clear |
| 3 | ~12s | Tayo slowly rotating his head to the right then to the left, gentle repeated motion, facing viewer |
| 4 | ~12s | Tayo raising both arms straight up and stretching tall on tiptoes, then relaxing, repeated |
| 5 | ~14s | Tayo doing cheerful jumping jacks facing the viewer, arms and legs out and in, energetic repeated bounce |
| 6 | ~12s | Tayo swinging both arms in big forward circles like windmills, playful repeated motion |
| 7 | ~12s | Tayo marching in place lifting knees up high, arms pumping, happy and rhythmic |
| 8 | ~10s | Tayo taking a big deep calming breath, arms up then slowly down, relaxed happy cooldown, then a wave goodbye |

---

## 6. `vid-06.mp4` — "Air Putih vs Minuman Manis"  ·  Kebiasaan Baik  ·  🎯 ~60 dtk
**Tujuan:** air putih lebih sehat daripada minuman manis (gula → gigi berlubang & lemas).

**Narasi:**
> "Coba tebak, mana yang lebih sehat? **Air putih**... atau minuman manis? Minuman manis punya banyak
> **gula**. Terlalu banyak gula bisa membuat gigi berlubang dan badan lemas. Air putih tidak punya
> gula — air putih menyegarkan tubuh. Air putih membantu kita berpikir dan bermain. Jadi, pilih
> **air putih**, ya! Minum yang cukup setiap hari."

| Shot | ⏱ | Prompt visual [SHOT] |
|---|---|---|
| 1 | ~8s | Two cute cups side by side facing viewer: a clear glass of water (calm smile) on the left, a fizzy sugary soda cup on the right, Tayo in the middle |
| 2 | ~6s | Tayo tilting his head with a big question mark above him, thinking which one is healthier |
| 3 | ~12s | The soda cup with a growing pile of cute sugar cubes stacking up beside it, the soda looks a little worried, playful not scary |
| 4 | ~10s | A friendly cartoon tooth with a small cute cavity spot, and Tayo drooping sleepily/low-energy — gentle and non-frightening |
| 5 | ~12s | The water glass glows softly like a gentle hero with a fresh splash and cool sparkles, radiant and refreshing |
| 6 | ~8s | Tayo bright-eyed and lively, thinking clearly (lightbulb sparkle) then playfully hopping, full of energy |
| 7 | ~6s | Tayo drinking the glass of water happily and giving a big thumbs up, cheerful sparkles |

---

## 7. `vid-07.mp4` — "Gosok Gigi Setelah Makan"  ·  Kebiasaan Baik  ·  🎯 ~45 dtk
**Tujuan:** gosok gigi (pagi & malam) supaya gigi tidak berlubang.

**Narasi:**
> "Setelah makan, ada sisa makanan di gigi kita. Kalau dibiarkan, gigi bisa **berlubang**. Ayo
> **gosok gigi** — pagi dan malam sebelum tidur. Ambil sikat gigi dan sedikit pasta gigi. Gosok
> perlahan: depan, belakang, atas, dan bawah. Kumur dengan air, lalu senyum! Gigi bersih dan kuat.
> Berkilau!"

| Shot | ⏱ | Prompt visual [SHOT] |
|---|---|---|
| 1 | ~7s | Tayo smiling after a meal, a couple of tiny food bits stuck on his teeth, he notices with a curious look |
| 2 | ~6s | A friendly cartoon tooth with a small cute cavity forming, gentle warning, non-scary |
| 3 | ~7s | Simple split of a bright sun (pagi) and a crescent moon (malam) with Tayo pointing — brush twice a day |
| 4 | ~6s | Tayo picking up a toothbrush and squeezing a small dab of toothpaste onto it, cheerful |
| 5 | ~9s | Tayo brushing his teeth: front, back, top and bottom, lots of soft white foam, bouncy scrubbing motion |
| 6 | ~6s | Tayo rinsing with a small cup of water, spit into sink, then a big bright smile |
| 7 | ~4s | Close-up of Tayo's sparkling clean white teeth with a shiny "ting" sparkle and a thumbs up |

---

## 8. `vid-08.mp4` — "Tidur Cukup, Badan Kuat"  ·  Kebiasaan Baik  ·  🎯 ~60 dtk
**Tujuan:** tidur cukup (±9–10 jam) supaya tubuh tumbuh & segar; rutinitas sebelum tidur.

**Narasi:**
> "Setelah bermain seharian, tubuh kita lelah. Tubuh butuh istirahat — caranya? **Tidur yang cukup**!
> Anak-anak sebaiknya tidur sekitar **sembilan sampai sepuluh jam**. Sebelum tidur, gosok gigi dan
> matikan lampu. Simpan gawai, biar mata bisa istirahat. Saat tidur, tubuh tumbuh dan menyimpan
> tenaga. Besok pagi, kita bangun segar dan kuat. Selamat tidur!"

| Shot | ⏱ | Prompt visual [SHOT] |
|---|---|---|
| 1 | ~8s | Tayo looking tired and sleepy after a day of play, a big yawn and droopy ears, evening light |
| 2 | ~8s | Tayo walking to his cozy little bed as a crescent moon and stars rise in the window, calm dusk |
| 3 | ~10s | A friendly round clock showing the passing hours with soft "Zzz" and stars, indicating a long good sleep (~9–10 hours) |
| 4 | ~10s | Tayo brushing his teeth briefly, then reaching up to switch off a bedside lamp, the room dimming softly and cozily |
| 5 | ~8s | Tayo placing a small tablet/phone face-down on the table and snuggling under the blanket, closing his eyes |
| 6 | ~8s | Tayo sleeping peacefully, gentle breathing, soft sparkles rising (body resting and growing), moon glowing softly |
| 7 | ~8s | Bright morning: Tayo waking up fresh, stretching strong with a big happy smile, sunny, waving to the viewer |

---

## Setelah video jadi

1. Taruh `.mp4` di `public/assets/videos/` (nama persis kolom **File**: `vid-01.mp4` … `vid-08.mp4`).
2. Pastikan **thumbnail** padanannya juga ada (`public/assets/videos/thumb/vid-0N.png` —
   prompt di `daftar-gambar.md`). Thumbnail = frame poster sebelum autoplay.
3. Cek di `/game/video`: geser vertikal, autoplay saat terlihat, tombol ⭐ suka & 🔊 suara.
4. (Opsional) Update `data/video.json`: `status: "jadi"` + samakan `durasiDetik` dengan durasi final.
5. Beri tahu ("video sudah masuk") supaya panel "sedang disiapkan" tak lagi relevan.
