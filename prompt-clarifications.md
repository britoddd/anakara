# Klarifikasi & Tambahan untuk `prompt.md` — Anakara ("Fase A")

> **Cara pakai dokumen ini.** File ini adalah *pendamping* `prompt.md`, bukan pengganti. `prompt.md`
> tetap jadi rencana besar per-phase. Kalau ada **konflik antara teks `prompt.md` dan dokumen ini**,
> **dokumen ini yang menang** (karena sudah disesuaikan dengan gambar referensi + keputusan pemilik project).
> Kalau ada konflik antara teks dan **gambar di folder `referensi/`**, untuk urusan **visual/layout** →
> gambar referensi yang menang; untuk urusan **logika/fitur** → teks yang menang.
>
> Status keputusan: dikonfirmasi pemilik project pada 2026-07-06.

---

## A. KOREKSI GLOBAL (berlaku di SEMUA phase)

### A1. Maskot = macan tutul kecil "Tayo", BUKAN singa ✅ (dikonfirmasi)
Semua tulisan "singa" / "mascot singa" di `prompt.md` harus dibaca sebagai:
> **Tayo — anak macan tutul (cheetah/leopard cub) berwarna kuning bertotol cokelat, gaya chibi/kawaii.**

- Nama panggilan dalam produk: **"Tayo si Macan Kecil"** (lihat scene cerita di `referensi/MacBook Air - 2.png`).
- Ekspresi maskot sudah ada 1 set lengkap di `referensi/WhatsApp Image 2026-07-06 at 22.00.31.jpeg`
  dan `...22.01.01.jpeg` (senang, menangis, marah, malu, kaget, cinta, koki, tidur, mandi, belajar,
  merayakan, dll). **Pakai sheet ini sebagai acuan bentuk & warna karakter** saat generate asset baru
  supaya konsisten.
- Konsekuensi: LoadingSpinner "singa lucu" (Phase 0), sapaan Home, feedback game, dsb → semua pakai Tayo.

### A2. Palet & gaya visual — "pastel UI + art game dramatis untuk thumbnail" ✅ (dikonfirmasi)
Prinsip "pastel biru, hindari gelap" **tetap berlaku untuk kerangka/UI** (background halaman, panel,
tombol, kartu form, header). **TAPI** khusus **thumbnail kartu menu game di Home** (Kuis Asik, 2v2,
Cerita, Video) **boleh/harus bergaya art game gelap-dramatis** seperti di `referensi/MacBook Air - 5.png`
dan `- 9.png` (mirip kartu Clash Royale) untuk kesan "seru".

Aturan praktisnya:
- **Chrome/UI di sekeliling** (navbar, background Home, tombol, badge level) → pastel biru + aksen ceria.
- **Isi thumbnail kartu game** → boleh cinematic/gelap, dengan judul teks putih tebal + subjudul.
- Jadi jangan "menerangkan" thumbnail game jadi pastel; yang pastel adalah bingkai & halaman, bukan
  gambar di dalam kartunya.

### A3. Skor & level ditampilkan konsisten
Dari referensi, konvensi angka reward:
- **Poin/skor** ditandai ikon **bintang** + angka (contoh "⭐ 120" di pojok kanan atas `Isi Piringku`).
- **Level pemain** ditandai badge "**Lv4**" di chip profil (pojok kiri atas Home, `- 5.png` / `- 9.png`).
- Chip profil Home = avatar bulat + nama ("Kenzo") + badge level. Pakai pola ini di semua halaman utama.

### A4. Bahasa & tombol
- Tombol lanjut standar berlabel **"Lanjut"** (bukan "Next"/"Continue") — konsisten dengan semua referensi.
- Tombol kembali berlabel **"Sebelumnya"** atau ikon panah bulat.

---

## B. INDEKS GAMBAR REFERENSI (apa isi tiap file di `referensi/`)

| File | Layar / fitur | Phase terkait | Detail penting |
|------|---------------|---------------|----------------|
| `MacBook Air - 1.png` | Pemilihan role "Selamat datang di Anakara / Pilih mode anda" — kartu **Siswa** & **Guru** + tombol Lanjut | Phase 1 | Kartu terpilih diberi border biru tebal. Ilustrasi anak (siswa) vs orang berjas (guru). |
| `MacBook Air - 4.png` | **Login dengan Google** (satu akun ditampilkan) + Lanjut | Phase 1 | Login pakai 1 akun Google terdeteksi, konfirmasi via "Lanjut". |
| `MacBook Air - 8.png` | **"Pilih avatar anda"** — grid 10 avatar bulat + Lanjut | Phase 1 | Avatar = 10 pilihan (2 baris × 5). Placeholder abu-abu sekarang → perlu asset avatar kartun. |
| `MacBook Air - 5.png` | **Home** — chip "Kenzo Lv4" + kartu **Kuis asik**, **2 vs 2** | Phase 2, 5, 6 | Kartu bergaya art game, ada tombol play kuning bulat. |
| `MacBook Air - 9.png` | **Home** — kartu **Cerita Interaktif**, **Video belajar** | Phase 2, 4, 7 | Idem, thumbnail cinematic. |
| `MacBook Air - 3.png` | **"Isi Piringku!"** — game seret makanan ke 4 kelompok di piring | Phase 3 | 4 kelompok: Makanan Pokok (tenaga), Lauk-Pauk (protein), Sayuran (vitamin&serat), Buah-buahan (vitamin&gula). ⭐120. |
| `MacBook Air - 6.png` | **"Kuis makanan sehat"** — 10 soal, timer 15 dtk, 4 opsi, Sebelumnya/Lanjut | Phase 5 | Progress soal berupa 10 lingkaran bernomor; timer visual + label "ini waktu"; bisa mundur ke soal sebelumnya. |
| `MacBook Air - 2.png` | **"Mode Cerita"** lengkap — sidebar + scene Tayo & kelinci piknik | Phase 7 (+8) | Lihat B-detail di bawah. |
| `WhatsApp ...21.55.30.jpeg` | **Kotak misteri / peti hadiah** (referensi gaya "gacha") | Phase 6, 8 | Acuan visual peti hadiah + confetti saat menang. |
| `WhatsApp ...22.00.31.jpeg` | **Sticker sheet Tayo** (20 ekspresi) | semua (maskot) | Acuan karakter + kandidat isi "Koleksi Stiker". |
| `WhatsApp ...22.01.01.jpeg` | **Sticker sheet Tayo** (9 ekspresi aktivitas) | semua (maskot) | Idem. |

### B-detail — Mode Cerita (`MacBook Air - 2.png`) memuat lebih banyak dari Phase 7:
- **Sidebar kiri** dengan sub-mode: **Petualangan, Mewarnai, Belajar, Permainan**.
- **Progress Petualangan** (mis. "Bab 1: Piknik di Hutan — 40%").
- **Koleksi Stiker** (mis. "12/24") — album stiker Tayo yang dikumpulkan.
- **Hadiah Harian** + tombol **Klaim** (daily reward).
- **Header** dengan judul bab + step chapter (1-2-3-4) + toggle **Audio**.
- **Scene**: Tayo + kelinci, teks narasi dalam balon, panel kanan "**Pilih Makanan untuk Piknik**"
  (pertanyaan interaktif menyeret makanan), tombol **Ayo mulai!**.
- **Footer**: "Kembali ke Daftar Cerita", "**Dengarkan Narasi**", "Lanjut".

> ⚠️ Implikasi: "Mode Cerita" di referensi adalah **hub** yang tumpang-tindih dengan beberapa phase
> (Koleksi Stiker↔Phase 8, sub-mode Permainan↔Phase 3/5, Mewarnai=fitur baru yang belum ada di prompt).
> Lihat pertanyaan terbuka **D2** & **D3**.

---

## C. KLARIFIKASI & TAMBAHAN PER-PHASE

### Phase 0 — Setup
- **Asset sudah sebagian ada** (jawaban untuk task #5 Phase 0): sticker maskot Tayo & mockup layar sudah
  ada di `referensi/`. Yang **masih perlu di-generate**: logo Anakara, ikon menu, avatar (10), ilustrasi
  makanan untuk game, thumbnail kartu game, peti hadiah, kartu/stiker koleksi. → lihat **Bagian E**
  (pipeline image generation).
- LoadingSpinner: animasi **Tayo** (mis. Tayo berlari/melambai dari sticker sheet), bukan singa.

### Phase 1 — Landing & Role Selection
- Layout mengikuti `- 1.png`: judul "Selamat datang di Anakara / Pilih mode anda", **2 kartu (Siswa | Guru)**,
  kartu aktif diberi **border biru tebal**, lalu tombol **Lanjut** (jadi pemilihan role dikonfirmasi via
  tombol, bukan langsung klik-lompat).
- Login siswa: `- 4.png` — layar "**Login dengan**" menampilkan akun Google + **Lanjut**.
- Pilih avatar: `- 8.png` — **tepat 10 avatar** dalam grid 2×5. Foto asli Google **tidak** dipakai sebagai
  avatar utama (privasi) — hanya untuk sapaan "Halo, [Nama]!".

### Phase 2 — Home Dashboard
- Chip profil kiri-atas: avatar + nama + **badge level** ("Lv4").
- Kartu menu: gaya art game (lihat A2), tiap kartu punya **judul + subjudul singkat** + tombol play.
  Contoh dari referensi: "Kuis asik — Jawab pertanyaan dan dapatkan hadiah menarik", "2 vs 2 — Team up
  dengan temanmu untuk menjawab kuis", "Cerita Interaktif — Belajar sambil membaca kisah seru",
  "Video belajar — Belajar sambil menonton video kartun".
- Layout kartu **scrollable horizontal** (di referensi kartu terpotong di tepi → ada geser samping).

### Phase 3 — Game Piring = "ISI PIRINGKU" (4 kelompok) ✅ (dikonfirmasi)
Ganti konsep "makanan sehat vs tidak sehat ke satu piring" menjadi **penyortiran ke 4 kelompok** sesuai
`- 3.png`:
- Piring dibagi **4 kuadran**: **Makanan Pokok** (sumber tenaga), **Lauk-Pauk** (sumber protein),
  **Sayuran** (vitamin & serat), **Buah-buahan** (vitamin & gula/energi).
- Panel kiri = legenda **Kelompok Makanan** (nama + fungsi gizi). Panel kanan = **Pilih Makanan**
  (kumpulan stiker makanan untuk diseret).
- Tugas anak: seret tiap makanan ke **kuadran kelompok yang benar** (bukan sekadar buang yang tidak sehat).
- Feedback benar/salah tetap lembut & pakai Tayo (mis. "Yuk coba lagi!").
- Skor "⭐ + angka" di kanan atas.
- Struktur data makanan (JSON) minimal: `{ id, nama, gambar, kelompok: "pokok|lauk|sayur|buah",
  fungsiGizi, catatan? }` — mudah ditambah tanpa ubah kode.
- **Masih perlu ditanya** (tetap): apakah ada banyak level/varian ronde, atau satu mode. → **D1**.

### Phase 4 — Video Reels
- Kartu masuk dari Home ("Video belajar"). Semua video = **konten internal** (bukan embed YouTube publik).
- Reaksi: **like/bintang** saja, tanpa kolom komentar.

### Phase 5 — Kuis (ikuti `- 6.png`)
- **10 soal per level**, ditampilkan sebagai **10 lingkaran bernomor** di atas (yang aktif ter-highlight).
- **Timer per soal ≈ 15 detik**, dengan **progress bar horizontal** + label "ini waktu".
- **Ada navigasi "Sebelumnya" & "Lanjut"** → anak boleh mundur meninjau soal sebelumnya (klarifikasi:
  konfirmasikan apakah timer di-reset saat mundur atau timer total per-soal berjalan sekali saja → **D4**).
- Opsi jawaban = **4 kartu** dengan **ikon + label** (contoh: Keripik kentang / Mie instan / Permen / Pisang);
  kartu terpilih diberi border biru.
- Skema data soal (dipakai ulang oleh guru di Phase 10):
  `{ id, level, kategori, pertanyaan, opsi: [4], kunciIndex, durasiDetik, sumber: "anakara|guru" }`.

### Phase 6 — Team Battle 2v2 + Kotak Misteri
- Referensi hadiah: peti/kotak misteri (`WhatsApp ...21.55.30.jpeg`). Animasi buka peti → reveal hadiah acak.
- **Isi hadiah**: perlu diselaraskan — apakah "**kartu**" (istilah prompt) atau "**stiker Tayo**" (istilah
  referensi "Koleksi Stiker")? → **D2**.

### Phase 7 — Cerita Interaktif (ikuti `- 2.png`, lebih kaya dari prompt)
- **Narasi suara = YA, dibutuhkan** (jawaban untuk pertanyaan Phase 7 tentang voice-over): referensi punya
  toggle **Audio** + tombol **"Dengarkan Narasi"**. Siapkan asset audio per halaman/narasi.
- Pertanyaan interaktif di tengah cerita bisa berupa **menyeret makanan** (bukan hanya pilihan ganda),
  contoh panel "Pilih Makanan untuk Piknik".
- Ada **step chapter** (1-4) + progress "Bab X — %".
- **Sub-mode sidebar** (Petualangan / Mewarnai / Belajar / Permainan) → lihat **D3** (scope).

### Phase 8 — Leaderboard & Koleksi
- Istilah koleksi di referensi = **"Koleksi Stiker"** dengan counter "12/24" (bukan/atau selain "Kartu").
  Selaraskan penamaan dengan Phase 6 → **D2**.
- Stiker/kartu yang belum didapat → tampil **silhouette/terkunci**.

### Phase 9 — Progression
- Konvensi kunci visual: gembok + warna redup; syarat unlock ditulis jelas ("Selesaikan Level 2 untuk
  buka ini!"). Konsisten dengan badge level di chip profil.

### Phase 10 — Teacher Mode
- Skema soal guru **wajib identik** dengan skema Phase 5 (field `sumber: "guru"`), supaya soal guru
  langsung terpakai di kuis siswa.

---

## D. PERTANYAAN TERBUKA — ✅ SEMUA SUDAH DIPUTUSKAN (2026-07-06)

Jawaban final (dampak implementasi lengkap di `FOUNDATION.md` §9):

- **D1:** Isi Piringku **berlevel** — 3 level (`data/isi-piringku.json`).
- **D2:** Koleksi = **kartu saja, dengan rarity** Biasa/Langka/Legenda (`data/kartu-koleksi.json`).
- **D3:** Mode Cerita: **hanya Petualangan** dulu; Mewarnai/Belajar/Permainan = "Segera Hadir".
- **D4:** Kuis **tidak bisa kembali** ke soal sebelumnya — tombol "Sebelumnya" pada mockup kuis
  (`MacBook Air - 6.png`) **di-override**; jawaban terkunci lalu otomatis lanjut.
- **D5:** Siswa **langsung join kelas via kode** saat onboarding (login → avatar → kode kelas → Home).
- **D6:** Guru juga login **Google OAuth** — satu sistem auth, role disimpan di profil.

---

## E. PIPELINE ASSET (IMAGE GENERATION)

Karena akan ada akses image generation (mis. Gemini) selama pengerjaan, siapkan alur asset berikut supaya
konsisten:

1. **Sumber kebenaran karakter** = 2 sticker sheet Tayo di `referensi/`. Setiap generate karakter baru,
   sertakan deskripsi tetap: *"anak macan tutul kuning bertotol cokelat, chibi/kawaii, mata besar bulat,
   pipi merah muda, outline lembut"* + sheet sebagai referensi gaya, agar tidak berubah wujud antar-asset.
2. **Daftar asset yang perlu di-generate** (prioritas awal):
   - Logo Anakara (+ subjudul kecil "Fase A Learning Platform").
   - 10 avatar kartun bulat (Phase 1) — gaya seragam.
   - Ikon menu Home + tombol play.
   - Ilustrasi makanan untuk "Isi Piringku" & kuis (dikelompokkan: pokok/lauk/sayur/buah).
   - Thumbnail kartu game (gaya art dramatis — lihat A2).
   - Peti/kotak misteri + animasi buka (Phase 6).
   - Kartu/stiker koleksi (tunggu keputusan D2).
   - Background scene cerita (hutan piknik, dll) + karakter pendukung (kelinci).
3. **Konvensi teknis asset**: PNG transparan untuk karakter/ikon/makanan; ukuran ringan (project harus
   tetap enteng untuk internet sekolah yang lambat — lihat prinsip di `prompt.md`); simpan terorganisir,
   mis. `public/assets/{mascot,avatars,food,icons,cards,backgrounds}/`.
4. **Placeholder dulu bila perlu**: kalau asset final belum siap, pakai placeholder ber-nuansa benar
   supaya layout tidak menunggu asset.

---

## F. RINGKASAN "APA YANG BERUBAH" dari `prompt.md` asli
1. Maskot singa → **macan tutul "Tayo"** (semua tempat).
2. Phase 3 "sehat vs tidak sehat" → **"Isi Piringku" 4 kelompok gizi**.
3. Ditambah aturan gaya visual: **UI pastel, thumbnail game boleh art dramatis**.
4. Phase 7 dapat konfirmasi: **narasi suara = YA**, plus struktur Mode Cerita yang lebih kaya.
5. Konvensi UI terkunci: label "Lanjut/Sebelumnya", skor "⭐+angka", chip profil "nama + Lv".
6. Ditambah indeks referensi, pipeline asset, dan daftar pertanyaan terbuka (D1–D6).
