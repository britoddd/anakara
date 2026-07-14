# FOUNDATION — Anakara ("Fase A" Learning Platform)

> **Dokumen ini adalah satu-satunya sumber kebenaran (single source of truth)** untuk membangun
> website Anakara. Ia menggabungkan tiga input:
> 1. `arsip/prompt.md` — rencana besar per-phase (rencana fitur; diarsipkan setelah 11 phase selesai).
> 2. `arsip/prompt-clarifications.md` — koreksi & keputusan setelah membaca referensi Figma (diarsipkan).
> 3. Tooling image-generation Gemini (`scripts/`) — cara memproduksi asset.
>
> Plus **design system** yang dikodifikasi memakai prinsip Power-Design (20 aturan web) dan
> diverifikasi kontras WCAG. Tampilan hidup dari design system ada di **`design-system.html`**
> (buka di browser).
>
> **Urutan prioritas kalau ada konflik:** `FOUNDATION.md` → `arsip/prompt-clarifications.md` → gambar
> `referensi/` (untuk visual) / `arsip/prompt.md` (untuk fitur). Dokumen ini diperbarui, bukan digantikan.
>
> Status: disusun 2026-07-06. Keputusan kunci sudah dikonfirmasi pemilik project.

---

## 1. Apa itu Anakara

**Anakara** = brand/nama produk. **"Fase A"** = nama pendaftaran PKM (Program Kreativitas Mahasiswa),
mengikuti istilah Kurikulum Merdeka (Fase A = kelas 1–2 SD). Keduanya project yang sama. Pakai
**"Anakara"** untuk judul/tab/branding, boleh subjudul kecil **"Fase A Learning Platform"**.

**Tujuan produk:** website edukasi **gizi & pola hidup sehat** (makanan bergizi + olahraga) untuk
**anak SD kelas 1–2 (usia 6–8 tahun) di Indonesia**, lewat **gamifikasi**. Dipakai di lingkungan
sekolah → asumsikan **koneksi lambat**, desain **ringan**.

**Prioritas #1 (dari catatan penutup prompt):** *pengalaman anak kecil yang menyenangkan, aman, dan
tidak membingungkan* — bukan kecanggihan teknis. Kalau ragu antara "canggih" vs "sederhana & jelas
untuk anak kelas 1–2", **pilih yang sederhana** dan tanyakan.

---

## 2. Prinsip Produk (tak bisa ditawar di semua phase)

1. **Untuk anak yang belum lancar membaca**: ikon besar, ilustrasi, maskot memandu; teks pendek;
   Bahasa Indonesia sederhana sesuai umur.
2. **Mudah di-tap**: target sentuh ≥ 44×44 px, jarak ≥ 8 px (tablet/HP, bukan cuma desktop).
3. **Warna**: biru pastel dominan sebagai **kerangka/UI**; aksen ceria (kuning, oranye, hijau).
   **Pengecualian:** thumbnail kartu game boleh gaya art dramatis/gelap (lihat §4 & referensi Home).
4. **Warna tak pernah sendirian**: benar/salah selalu + ikon + teks (aman buta warna).
5. **Feedback salah menyemangati**, tidak menjatuhkan (maskot "Yuk coba lagi!").
6. **Aman untuk anak**: tanpa kolom komentar, tanpa embed/rekomendasi eksternal (mis. YouTube publik).
7. **Ringan**: animasi playful (bounce/pop/confetti) tapi hemat & bisa dimatikan (`prefers-reduced-motion`).
8. **Component-based & scalable**: fitur terus bertambah antar-phase; jangan hardcode.

---

## 3. Maskot — "Tayo" 🐆

- **Tayo adalah anak macan tutul (cheetah/leopard cub)** kuning bertotol cokelat, gaya **kawaii/chibi**,
  mata besar bulat, pipi merah muda. **BUKAN singa** — semua penyebutan "singa" di `arsip/prompt.md` dibaca
  sebagai Tayo. (Dikonfirmasi 2026-07-06.)
- Nama dalam produk: **"Tayo si Macan Kecil"**.
- **Sumber kebenaran karakter** = 2 sticker sheet di `referensi/` (`WhatsApp ...22.00.31.jpeg` &
  `...22.01.01.jpeg`, 29 ekspresi). Selalu jadikan referensi saat generate asset baru agar konsisten.
- Peran: sapaan Home, feedback game (benar/salah), LoadingSpinner, tokoh cerita, isi Koleksi Stiker.

---

## 4. Design System (ringkas — detail hidup di `design-system.html`)

Dikodifikasi dengan prinsip Power-Design (web). **Komponen hanya memakai token semantik**, bukan hex
mentah. Semua pasangan warna sudah **lolos kontras WCAG** (AAA pada teks badan, AA+ pada tombol/UI),
di mode terang **dan** gelap.

### 4.1 Warna (verified)

| Peran | Terang | Catatan kontras |
|---|---|---|
| `--color-bg` | `#F2F9FE` | biru sangat muda |
| `--color-surface` | `#FFFFFF` | kartu/panel |
| `--color-fg` (teks) | `#21323D` | 13.2:1 di putih (AAA) |
| `--color-muted` | `#5A6B75` | 5.5:1 (AA) |
| `--color-primary` (aksi) | `#0A72B0` | teks putih 5.2:1 ✓ |
| `--color-accent` (kuning) | `#FFD23F` | teks ink 9.2:1 ✓ |
| `--color-success` | `#2F7A33` | teks putih 5.3:1 ✓ |
| `--color-danger` | `#C0392B` | error lembut |
| `--color-border` | `#DCE6EC` | |
| `--color-focus` | `#0B84C4` | ring ≥3:1 |
| **Sky dekoratif** | `#1FA8E8` | **fill besar/ilustrasi saja, bukan pembawa teks** |

**Aksen tambahan:** oranye `#FF9F43` (ink 6.5:1), hijau ceria `#7DD35B`.
**Maskot (khusus asset, bukan UI):** bulu `#F3B94D`, bulu-terang `#F7D08A`, totol `#8A5A2B`,
pipi `#F7A8B8`, perut `#FBE7C6`.

**Dark mode** (surface diterangi netral, aksen di-desaturasi): bg `#10202B`, surface `#17303F`,
fg `#EAF4FA`, muted `#9DB4C0`, border `#2A4658`, primary `#4DB6E8`, accent `#FBD24E`, success `#6FC06B`.

> Aturan **60-30-10**: netral dominan, biru/teks sekunder, aksen ≤10% ("aksi di sini"). Jangan
> banjiri layar dengan warna brand.

### 4.2 Tipografi
- **Display (judul & tombol):** **Baloo 2** (bulat, tebal, ramah). Fallback: Fredoka.
- **Body:** **Nunito** (sangat terbaca). ≤ 2 famili, `font-display: swap`.
- **Muat hanya weight yang dipakai:** Baloo 2 **700/800** + Nunito **400/700** (4 berkas, bukan 8 —
  hemat transfer untuk koneksi sekolah).
- Skala rasio **1.25**, fluid `clamp()`; **badan minimal 16px** (juga input, agar iOS tak zoom).
- Line-height badan ≥ 1.5; judul 1.1; lebar teks 45–75ch.

### 4.3 Spasi, radius, motion
- **Spasi 8-pt:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 (tak ada nilai di luar skala).
- **Radius (playful, banyak membulat):** sm 10 · md 16 · lg 24 · xl 32 · full 9999. Tombol = pill.
- **Motion:** 150–300ms ease-out; animasikan `transform`/`opacity` saja; efek "pop" tombol (turun 3px
  + bayangan tebal); confetti hanya untuk kemenangan; hormati `prefers-reduced-motion`.

### 4.4 Token siap-pakai (nilai aktual di `app/globals.css`)
Palet **restyle THYNK (D12, 2026-07-08)** — krem + hijau tua + pink + amber; verifikasi
kontras: `node scripts/cek-kontras.mjs` (28 pasangan). Rencana asal: `catatan-restyle-thynk.md`.
```css
:root {
  --bg:#F5F8E7; --surface:#FFFFFF; --surface-2:#EFF5DE;
  --fg:#163A2C; --muted:#52685B; --border:#DCE5CB;
  --primary:#D6336C; --primary-hover:#C22B60; --primary-active:#AD2456;
  --on-primary:#FFFFFF; --accent:#FFC93C; --accent-edge:#D9A91C; --on-accent:#163A2C;
  --success:#2F7D33; --on-success:#FFFFFF; --success-hover:#276B2B;
  --danger:#C0392B; --focus:#B02861; --link:#B02861;
  --sky:#8EC9E8; --orange:#FF9F43; --green-bright:#7DD14D; /* dekoratif */
  --band-pink:#FBDCE8; --band-green:#DDF1C6; --band-blue:#CDE9F6; /* band seksi §C restyle */
  --tim-biru:#4DA3E0; --tim-merah:#E2574C; /* identitas tim battle, tak ikut tema */
  --radius-sm:10px; --radius-md:16px; --radius-lg:24px; --radius-xl:32px; --radius-full:9999px;
  --font-display:"Baloo 2",Fredoka,sans-serif; --font-body:"Nunito",system-ui,sans-serif;
}
/* dark — nama token sama, nilai di-remap (komponen tidak berubah) */
:root[data-theme="dark"]{ --bg:#12271B; --surface:#1A3526; --surface-2:#22412E;
  --fg:#EAF6E8; --muted:#A7BFAC; --border:#2F4A38;
  --primary:#F06A9B; --primary-hover:#F585AC; --primary-active:#F899B9;
  --on-primary:#12271B; --accent:#FBD24E; --accent-edge:#C79F22; --on-accent:#12271B;
  --success:#7DD35B; --on-success:#12271B; --success-hover:#8ADF69;
  --danger:#FF8A80; --focus:#F06A9B; --link:#F48FB1;
  --band-pink:#43222E; --band-green:#22421A; --band-blue:#173648; }
```
> ⚠️ Pasangan `on-*` wajib dipakai bersama warnanya (mis. `success` + `on-success`) — jangan
> hardcode `#fff` di atas token yang nilainya berubah antar-tema (itu sumber bug kontras dark mode).
> ⚠️ `--primary` (pink) **bukan pembawa teks** di atas `bg`/`surface` (4.28 < 4.5) —
> teks/tautan pink berdiri sendiri SELALU pakai `--link`.

### 4.5 Konvensi UI terkunci
- Tombol maju **"Lanjut"**, mundur **"Sebelumnya"**.
- **Kembali/keluar di header halaman = `components/ui/TombolKembali`** (lingkaran ← 44px,
  `bg-fg/text-bg`, aria-label deskriptif; varian `overlay` di atas video). Jangan bikin
  tautan "← Kembali" manual. CTA layar hasil ("Kembali ke Home") tetap `Button` TANPA "←".
- Skor = **⭐ + angka**. Level pemain = badge **"Lv N"** pada chip profil (avatar + nama), pojok kiri-atas.
- Konten terkunci = gembok + redup/grayscale + syarat jelas ("Selesaikan Level 2 untuk buka ini!").

### 4.6 Gate kualitas per halaman (audit power-design) & deviasi sadar

`design-system.html` sudah diaudit penuh terhadap 20 aturan web power-design (2026-07-06; termasuk
perbaikan: doctype+`lang="id"`, bug kontras dark-mode, spasi non-8pt, status interaktif lengkap,
spesimen loading/kosong/error + form). **Setiap halaman produk baru (Phase 1+) belum "selesai"
sebelum lolos checklist ini:**

- [ ] `<!doctype html>` + `<html lang="id">`; landmark `<header><nav><main><footer>`; tepat **satu `<h1>`**; skip-link.
- [ ] Fluid tanpa scroll horizontal di **320/390/768/1024/1440**; type & space pakai `clamp()` (ada suku `rem`).
- [ ] Body ≥16px (input juga); tap target ≥44×44 (jarak ≥8); prose ≤75ch; teks kiri (jangan justify).
- [ ] Spasi hanya dari skala 8-pt; radius & shadow dari token.
- [ ] Warna hanya via token semantik; pasangan `on-*` dipatuhi; kontras per §4.1 (uji di **dua tema**).
- [ ] 5 status tiap elemen interaktif + focus ring ≥2px ≥3:1; hover bukan satu-satunya afordans.
- [ ] **3 status tiap region data**: skeleton (ukuran = hasil akhir), kosong (+1 aksi), error (di sebelah penyebab + solusi).
- [ ] Form: label terlihat (placeholder ≠ label), `type` + `autocomplete` benar, validasi on-blur + `aria-invalid`/`aria-describedby`.
- [ ] ≤1 CTA primer per layar; motion 150–300ms `transform`/`opacity` saja + `prefers-reduced-motion`.
- [ ] Media diberi dimensi (anti-CLS); font ≤2 famili & hanya weight terpakai; meta title ≤60ch + description ≤155ch + theme-color + favicon.

**Deviasi sadar** (sengaja, dengan alasan — bukan kelalaian):

| Aturan power-design | Deviasi | Alasan |
|---|---|---|
| #12 token dalam OKLCH | Token ditulis **hex** | Kompatibilitas browser lama perangkat sekolah + portabilitas langsung ke `tailwind.config`; keseragaman ramp digantikan verifikasi kontras numerik per-pasangan |
| #20 `og:image` + JSON-LD | Ditunda | Artefak masih lokal (`file://`); wajib dilengkapi saat halaman produk di-deploy |
| #5 satu CTA primer | Halaman spesimen menampilkan banyak tombol | Sifat style guide; aturan tetap mengikat di halaman produk |
| `color-mix()` modern | Dipakai **dengan fallback** warna datar | Titik kritis (header sticky, opsi terpilih, ghost hover) tetap terbaca di browser lama |

---

## 5. Arsitektur Fitur (11 phase — kerjakan berurutan, 1 phase / 1 kerja)

Ringkasan; detail tugas tetap di `arsip/prompt.md`, koreksi di `arsip/prompt-clarifications.md`.

| Phase | Fitur | Catatan penting / koreksi | Referensi |
|---|---|---|---|
| **0** | Setup + Design System | Init stack, terapkan token §4, komponen dasar (Button pop, Card, Modal, Spinner Tayo, ProgressBar). | `design-system.html` |
| **1** | Landing & Role Selection | Kartu **Siswa \| Guru** (border biru saat aktif) + **Lanjut**. Siswa → Google login → **10 avatar** (grid 2×5) → **langsung join kelas via kode (D5)**. **Guru juga Google OAuth (D6).** Foto Google hanya untuk sapaan, bukan avatar (privasi). | `MacBook Air - 1/4/8.png` |
| **2** | Home Dashboard (Siswa) | Chip "nama + Lv". Kartu menu **gaya art dramatis** (scroll horizontal), judul+subjudul+play. Menu belum jadi → "Segera Hadir". | `MacBook Air - 5/9.png` |
| **3** | **Isi Piringku** (drag) | **BUKAN sehat-vs-tidak-sehat.** Sortir makanan ke **4 kelompok**: Makanan Pokok, Lauk-Pauk, Sayuran, Buah. **3 level (D1).** Konten: `data/makanan.json` + `data/isi-piringku.json`. | `MacBook Air - 3.png` |
| **4** | Video (Reels/Shorts) | Vertikal swipe, autoplay, like/bintang (tanpa komentar), **konten internal saja**. Konten: `data/video.json` (8 judul — placeholder, perlu produksi). | — |
| **5** | Kuis (level & timer) | 10 soal; **timer ~15 dtk**; progress 10 lingkaran; **tanpa mundur (D4)** — jawaban terkunci lalu auto-lanjut (tombol "Sebelumnya" di mockup di-override); 4 opsi ikon+label. Konten: `data/soal-kuis.json` (30 soal, skema dipakai ulang guru). | `MacBook Air - 6.png` |
| **6** | Team Battle 2v2 + Kotak Misteri | Matchmaking tim 2 orang, jawab bersamaan real-time, menang → **kotak misteri** → **kartu ber-rarity (D2)**: Biasa 70% / Langka 25% / Legenda 5%; duplikat → +25⭐. Konten: `data/kartu-koleksi.json`. | `WhatsApp ...21.55.30.jpeg` |
| **7** | Cerita Interaktif | Page-flip; pertanyaan di tengah (bisa drag makanan); **narasi suara = YA** (toggle Audio + "Dengarkan Narasi"); step bab; sidebar sub-mode: **hanya Petualangan (D3)**, lainnya "Segera Hadir". Konten: `data/cerita-bab1.json`. | `MacBook Air - 2.png` |
| **8** | Leaderboard & Koleksi | Ranking (filter per kelas). Album **24 kartu + rarity (D2)**; belum didapat = silhouette; klik kartu → detail (gambar besar, nama, rarity). | `MacBook Air - 2.png` |
| **9** | Progression & Lock | Lock/unlock lintas fitur; **satu store "progress siswa" terpusat** (level tiap fitur), bukan tersebar. | — |
| **10** | Teacher Dashboard | Buat Kelas (kode/link undangan à la Kahoot), daftar siswa + ringkas progress, **Buat Soal Custom** (skema soal identik Phase 5, `sumber:"guru"`), kelola soal. | — |

---

## 6. Skema Data Kunci & Konten Siap Pakai

> **Konten aplikasi sudah dibuat di `data/`** (lihat `data/README.md`): 32 makanan, 30 soal (3 level),
> 24 kartu ber-rarity, cerita Bab 1 (10 halaman), 8 metadata video, config level Isi Piringku.
> Skema di bawah = **kontrak antar-phase** — jangan diubah sepihak.

**Makanan (Phase 3 & cerita) — `data/makanan.json`:**
```json
{ "id": "apel", "nama": "Apel", "emoji": "🍎", "gambar": "/assets/food/apel.png",
  "kelompok": "buah", "fungsiGizi": "Vitamin & serat",
  "fakta": "Apel renyah membuat gigi ikut sehat.", "level": 1 }
// kelompok ∈ "pokok" | "lauk" | "sayur" | "buah"; level = level minimum kemunculan (D1)
// emoji = placeholder tampilan; kode render gambar jika ada, fallback emoji
```

**Soal kuis (Phase 5 & Phase 10 — WAJIB identik) — `data/soal-kuis.json`:**
```json
{ "id": "q1-01", "level": 1, "kategori": "makanan-sehat",
  "pertanyaan": "Manakah menu makan siang yang paling bergizi?",
  "opsi": ["Keripik kentang", "Mie instan", "Permen", "Pisang"],
  "opsiEmoji": ["🍟", "🍜", "🍭", "🍌"],
  "kunciIndex": 3, "durasiDetik": 15, "sumber": "anakara" }
// sumber ∈ "anakara" | "guru"; opsiEmoji opsional (form guru boleh tanpa)
// D4: jawaban terkunci saat dipilih/waktu habis — tidak ada mundur
```

**Kartu koleksi (Phase 6 & 8, keputusan D2) — `data/kartu-koleksi.json`:**
```json
{ "id": "kartu-22", "nama": "Tayo Sang Penjelajah", "rarity": "legenda",
  "deskripsi": "Tayo menjelajah hutan mencari makanan sehat!",
  "gambar": "/assets/cards/kartu-22.png" }
// rarity ∈ "biasa" (70%) | "langka" (25%) | "legenda" (5%); duplikat gacha → +25 ⭐
```

**Progress siswa (Phase 9 — satu store terpusat):**
```json
{ "userId": "...", "role": "siswa", "avatar": "avatar-03", "level": 4, "poin": 1250,
  "progress": { "kuis": {"levelTerbuka": 2}, "cerita": {"babTerbuka": 1}, "isiPiringku": {"levelTerbuka": 2} },
  "koleksi": ["kartu-01", "kartu-22"], "kelasId": "abc123" }
```

---

## 7. Tech Stack (FINAL — diputuskan di Phase 0, 2026-07-07)

- **Frontend:** **Next.js 15 (App Router) + TypeScript**. **Styling: Tailwind CSS v4** — token §4.4
  dipetakan lewat `@theme inline` di `app/globals.css` (bukan `tailwind.config`, cara v4).
- **Font:** Baloo 2 (700/800) + Nunito (400/700) via `next/font/google` (self-host otomatis, no-FOUC).
- **Auth:** **Google OAuth via Firebase Auth untuk siswa DAN guru (D6)** — satu sistem auth; role
  dipilih di landing dan disimpan di profil. Tidak perlu email/password terpisah. (Setup di Phase 1.)
- **Backend/DB:** **Firebase** — Firestore untuk data, **Realtime Database untuk Battle 2v2 (Phase 6)**.
  Config dibaca dari `.env.local` (template di `.env.example`); stub di `lib/firebase.ts`.
- **Drag-and-drop (Phase 3):** kandidat **dnd-kit** (ringan, mobile-friendly). Konfirmasi di Phase 3.

---

## 8. Pipeline Asset (Image Generation via Gemini)

Tooling siap di `scripts/` (token Higgsfield/OpenArt sudah habis → pindah ke Gemini).

**Setup sekali:**
```bash
cd scripts && npm install && cd ..     # dependency sudah ter-install
# isi GEMINI_API_KEY di file .env (root) — key dari https://aistudio.google.com/app/apikey
```

**Pakai (jalankan dari root):**
```bash
# satu gambar
node scripts/generate-image.mjs -p "Tayo melambai, background transparan" -o public/assets/mascot/tayo-hello.png

# jaga konsistensi Tayo dengan gambar referensi
node scripts/generate-image.mjs -p "Tayo makan apel" \
  -r "referensi/WhatsApp Image 2026-07-06 at 22.00.31.jpeg" -o public/assets/mascot/tayo-apel.png

# batch banyak asset
node scripts/generate-image.mjs --batch scripts/asset-list.example.json
```

- Model default `gemini-2.5-flash-image` (konsisten + bisa pakai referensi). `imagen-4.0-generate-001`
  untuk background lepas kualitas tinggi (`-m`). Cek model tersedia: `node scripts/list-models.mjs image`.
- **Aturan asset:** PNG untuk karakter/ikon/makanan; **ringan** (koneksi sekolah lambat);
  setiap generate karakter sertakan deskripsi tetap Tayo + sheet referensi.
- **Catatan transparansi:** output Gemini umumnya berlatar putih (bukan alpha) — rencanakan langkah
  *remove background* sebelum asset karakter/makanan dipakai di atas warna lain.
- **Prioritas generate:** logo → 10 avatar → ikon menu → 32 ilustrasi makanan (`data/makanan.json`) →
  thumbnail kartu game → kotak misteri → **24 kartu koleksi, 3 rarity** (`data/kartu-koleksi.json`) →
  ilustrasi cerita Bab 1 (10 halaman + cover) → thumbnail video.

> ⚠️ **STATUS API (dites 2026-07-06):** koneksi & key **valid** — model teks jalan. Tapi SEMUA model
> image (`gemini-2.5-flash-image`, `gemini-3.1-flash-image`, `-lite`) ber-kuota free tier **0** →
> generate gambar via API butuh **billing aktif** di project Google AI Studio
> (aistudio.google.com → Settings → Plan). Alternatif sementara: generate manual di AI Studio web
> (gratis via UI) lalu simpan hasilnya ke folder asset sesuai struktur di bawah.

📋 **Daftar lengkap gambar: [`daftar-gambar.md`](daftar-gambar.md)** — manifest ±105 item dengan
prioritas **P0/P1/P2**, prompt gaya siap-copy (placeholder `[SUBJEK]`), referensi yang harus
dilampirkan, dan nama file tujuan yang cocok dengan id di `data/*.json`. **Alur saat ini: user
men-generate manual** (AI Studio web / tool lain) mengikuti manifest itu, lalu menaruh file sesuai
path & mencentang tabelnya. Kode selalu pakai fallback emoji/SVG sampai user bilang
**"asset P0 sudah masuk"** — baru placeholder ditukar gambar asli.

**Struktur folder asset yang direncanakan:**
```
public/assets/{mascot, avatars, food, icons, cards, backgrounds, stories, audio, videos}/
```

---

## 9. Keputusan Desain (FINAL — D1–D6 diputuskan 2026-07-06, D7–D11 saat phase terkait)

| Kode | Keputusan | Dampak implementasi |
|---|---|---|
| **D1** | Isi Piringku **berlevel** (3 level) | Config `data/isi-piringku.json`; item & syarat naik per level |
| **D2** | Koleksi = **kartu saja, dengan rarity** (Biasa/Langka/Legenda) | `data/kartu-koleksi.json`; gacha 70/25/5%; duplikat → +25⭐ |
| **D3** | Mode Cerita: **hanya Petualangan** dulu | Mewarnai/Belajar/Permainan tampil "Segera Hadir" |
| **D4** | Kuis **tidak bisa kembali** ke soal sebelumnya | Tanpa tombol "Sebelumnya" di kuis (mockup di-override); jawaban terkunci → auto-lanjut |
| **D5** | Siswa **langsung join kelas via kode** saat onboarding | Alur: login Google → pilih avatar → masukkan kode kelas → Home |
| **D6** | Guru login **Google OAuth juga** | Satu sistem auth; role dipilih di landing, disimpan di profil |
| **D7** | Battle: **fallback bot otomatis** setelah 15 dtk tanpa lawan | "Tim Robo" (akurasi ~70%, jeda 4–10 dtk/soal) disimulasikan klien pembuat ruang |
| **D8** | Battle: boleh **"Main Sendiri"** (tim 1 orang + rekan bot) | Alur battle bisa dites/dipakai sendirian; tim ideal tetap 2 siswa via kode |
| **D9** | Unlock **independen per fitur** (tidak lintas fitur) | Kuis/Isi Piringku/Cerita punya jalur level masing-masing; tidak ada rantai antar fitur |
| **D10** | Level siswa = **1 + ⌊poin/150⌋** (naik tiap 150 ⭐) | `hitungLevel()` di `features/auth/types.ts`; tampilan SELALU dari poin; field `level` ditulis ulang tiap simpan; perayaan "🎉 naik Lv" di layar hasil |
| **D11** | Soal buatan guru berlaku untuk **Kuis saja** dulu | Koleksi `soalGuru` (skema §6, `sumber:"guru"`); siswa: `ambilSoalGuruKelas()` → digabung via `soalUntukLevel(level, tambahan)`; Cerita/Battle menyusul kalau dibutuhkan |
| **D12** | **Restyle art style ala THYNK** (referensi Behance) | Palet krem+hijau tua+pink+amber (§4.4), komponen `components/deko/` + `Chip`, band pastel `band-*`, mask pill ilustrasi cerita; aturan `--primary` bukan pembawa teks; tim battle → token `--tim-biru/--tim-merah`; detail `catatan-restyle-thynk.md`. Mask arch GameCard sempat dicoba lalu **dibatalkan** — bentuk kartu game kembali ke spek `.game-card` design system (radius-lg, play kanan-atas) |

---

## 10. Cara Kerja & Peta Berkas

- **Kerjakan 1 phase per sesi**, berurutan (jangan lompat kecuali diminta). Sebelum coding tiap phase:
  ringkas pemahaman + tanyakan yang ambigu. Keputusan teknis besar → tawarkan opsi + trade-off dulu.
- Setelah tiap phase: ringkasan file yang dibuat/diubah + cara test manual.

| Berkas | Peran |
|---|---|
| **`FOUNDATION.md`** (ini) | Sumber kebenaran gabungan. Baca ini dulu. |
| `design-system.html` | Design system hidup (buka di browser). |
| `arsip/prompt.md` | Rencana fitur asli per-phase — **diarsipkan** (11 phase selesai). |
| `arsip/prompt-clarifications.md` | Koreksi & keputusan atas referensi — **diarsipkan**. |
| `referensi/` | Mockup Figma + sticker Tayo (sumber visual). |
| **`daftar-gambar.md`** | **Manifest ±105 gambar** untuk digenerate manual oleh user (prioritas P0/P1/P2, prompt siap-copy). |
| **`daftar-video.md`** | **Prompt produksi 8 video** section Video Belajar (narasi id + storyboard per-shot 9:16). |
| **`catatan-restyle-thynk.md`** | Rencana restyle art style D12 (referensi THYNK di Behance) — ✅ dieksekusi 2026-07-08. |
| **`data/`** | **Konten aplikasi siap-impor** (makanan, soal, kartu, cerita, video) + `data/README.md`. |
| `scripts/` | CLI generate asset (Gemini) + diagnostik `list-models.mjs` + `.env` (API key). |
| `public/assets/` | Output asset (dibuat saat Phase 0+). |

**Status phase:**
- ✅ **Phase 0 SELESAI (2026-07-07)** — Next.js 15 + Tailwind v4 + token §4.4 + 5 komponen dasar
  (`components/ui/`) + galeri test di `/dev/komponen`.
- ✅ **Phase 1 SELESAI (2026-07-07)** — Landing role Siswa/Guru (`/`), login Google (`/masuk`),
  onboarding avatar 2×5 (`/onboarding/avatar`) + join kelas D5 (`/onboarding/kelas`), placeholder
  `/home` (chip profil §4.5) & `/guru`. Modul auth di `features/auth/` (profil = kontrak §6);
  rules Firestore di `firestore.rules`. ⚠️ **Menunggu user:** isi `.env.local`
  (template `.env.example`), aktifkan Auth Google + Firestore, publish rules, buat dokumen
  `kelas/{KODE}` untuk test join.
- ✅ **Phase 2 SELESAI (2026-07-07)** — Home Dashboard siswa: sapaan Tayo, chip profil + ⭐ poin,
  band biru berisi 5 kartu game art dramatis (scroll horizontal + snap; placeholder gradien+emoji
  sampai `thumb-*.png` masuk), tautan Leaderboard/Koleksi, halaman `/segera-hadir` generik.
  Menu config-driven di `features/home/menu.ts` — phase berikutnya cukup flip `status: "aktif"`.
- ✅ **Phase 3 SELESAI (2026-07-07)** — Isi Piringku (`/game/isi-piringku`): **dnd-kit**
  (dikonfirmasi) + mode alternatif "ketuk makanan → ketuk kuadran"; 3 level D1 dengan lock/unlock,
  piring 4 kuadran, feedback Tayo (salah = menyemangati, tanpa minus poin), timer lembut L3,
  layar hasil bintang 0–3, simpan poin + `progress.isiPiringku.levelTerbuka` ke Firestore.
  Modul di `features/games/isi-piringku/`. Audio feedback ("yeay!") ditunda sampai ada asset suara.
- ✅ **Phase 4 SELESAI (2026-07-07)** — Video Belajar (`/game/video`): feed vertikal snap gaya reels,
  autoplay saat terlihat (IntersectionObserver) + pause saat lewat, tombol suka ⭐ per-user
  (`users/{uid}.likesVideo`, update optimis) & toggle suara, kategori+durasi+judul overlay.
  Semua konten internal `data/video.json` (keputusan: video **fix dari tim** untuk versi awal,
  bukan upload guru). File .mp4 belum ada → slide menampilkan panel "sedang disiapkan" dan
  otomatis memutar begitu file ditaruh di `public/assets/videos/`. Modul `features/games/video/`.
- ✅ **Phase 5 SELESAI (2026-07-07)** — Kuis Asik (`/game/kuis`): 3 level lock/unlock
  (lulus L1 ≥6, L2/L3 ≥7 benar), 10 soal diacak per sesi, timer 15 dtk (bar + angka),
  10 lingkaran progres (✓/✗ setelah dijawab), **D4: tanpa tombol Sebelumnya** — jawaban terkunci
  → feedback 1,8 dtk → auto-lanjut; waktu habis = terkunci juga. Poin = benar×10; bintang 9+/8+/lulus
  (konvensi aplikasi, bukan dari JSON). Simpan `progress.kuis.levelTerbuka` + poin. Soal versi
  siswa = sumber "anakara" saja; gabung soal guru menyusul di Phase 10. Modul `features/games/kuis/`.
- ✅ **Phase 6 SELESAI (2026-07-07)** — Team Battle 2v2 (`/game/battle`): tim via kode 4 huruf
  (tanpa I/O/0/1), matchmaking antrean **Firebase RTDB** (transaction anti-race; ketua tim =
  penggerak), **D7** fallback Tim Robo setelah 15 dtk, **D8** tombol "Main Sendiri" (rekan bot).
  Battle: 5 soal level 1-2 (skema kuis §6) dijawab tempo masing-masing, timer 15 dtk/soal, skor
  tim = total benar live (papan skor berhadapan 🔵🔴); menang/seri → **kotak misteri** → gacha D2
  70/25/5%, duplikat +25⭐; semua dapat poin usaha benar×5; kalah = pesan menyemangati (tayo-cheer).
  Bot disimulasikan klien pembuat ruang (catatan: bot berhenti kalau pembuat menutup tab).
  Modul `features/games/battle/` + `lib/firebase-rtdb.ts` (dipisah dari `lib/firebase.ts` supaya
  firebase/database hanya ter-bundle di halaman battle). **Setup yang wajib dilakukan user:**
  (1) Console → Build → Realtime Database → Create Database; (2) publish rules dari
  `database.rules.json`; (3) isi `NEXT_PUBLIC_FIREBASE_DATABASE_URL` di `.env.local`.
- ✅ **Phase 7 SELESAI (2026-07-07)** — Cerita Interaktif (`/game/cerita`): hub Mode Cerita
  (sidebar sub-mode mockup `- 2.png` — hanya Petualangan aktif per **D3**, Mewarnai/Belajar/
  Permainan 🔒 → segera-hadir; counter Koleksi Kartu asli dari `profil.koleksi`) + tampilan buku:
  efek balik halaman (rotateY+perspective, hormat reduced-motion), titik progres 10 halaman,
  **narasi suara dua lapis** — file audio dari data (belum direkam) → fallback **Web Speech API
  TTS id-ID** (toggle 🔊 di header, autoplay saat pindah halaman, + tombol "Dengarkan Narasi");
  pertanyaan di tengah cerita: salah = boleh pilih lagi (opsi salah diredupkan, tanpa hukuman),
  Lanjut terkunci sampai benar (+10⭐/pertanyaan); tamat bab = +50⭐ & buka bab berikutnya
  (`progress.cerita.babTerbuka`). Konten `data/cerita-bab1.json`; bab baru = tambah file data +
  entri `BAB_LIST` tanpa ubah kode. Ilustrasi halaman = fallback gradien hutan + emoji scene
  sampai asset P2 digenerate. Halaman uji tanpa login: `/dev/cerita` (`?tampil=hub`, `?hal=N`).
  Modul `features/games/cerita/`.
- ✅ **Phase 8 SELESAI (2026-07-07)** — Leaderboard (`/leaderboard`): ranking ⭐poin siswa,
  podium 🥇🥈🥉 + daftar (baris sendiri disorot "(kamu)"), filter 🏫 Kelasku / 🌍 Semua; query
  satu klausa `where` + sortir klien (sengaja, agar TANPA composite index Firestore).
  **Rules diperbarui:** `users` kini `read: auth != null` (perlu **publish ulang
  `firestore.rules`** di console!). Album Koleksi (`/koleksi`): grid 24 kartu D2, bingkai warna
  rarity, ringkasan per-rarity, belum didapat = silhouette ❔ + label rarity + 🔒, klik kartu
  dimiliki → Modal detail (gambar besar/emoji, nama, rarity, deskripsi). MENU_LAIN Home aktif;
  tautan koleksi di CeritaHub → `/koleksi`. Halaman uji: `/dev/phase8`. Modul
  `features/leaderboard/` + `features/koleksi/`.
- ✅ **Phase 9 SELESAI (2026-07-07)** — Progression: store terpusat `users/{uid}.progress` memang
  sudah dipakai semua fitur sejak Phase 3 (audit ✓: kuis & isi-piringku 🔒+redup+"Selesaikan
  Level X untuk buka ini!", bab cerita terkunci kini bertuliskan "Selesaikan Bab N dulu").
  **D9**: unlock independen per fitur. **D10**: level = 1+⌊poin/150⌋ (`hitungLevel` di
  `features/auth/types.ts`) — chip Home & leaderboard menghitung dari poin, keempat api simpan
  (kuis/isi-piringku/battle/cerita) menulis ulang field `level`, keempat layar hasil menampilkan
  "🎉 Kamu naik ke Lv N!" (battle memakai poin final termasuk bonus duplikat), Home menampilkan
  teaser "Kumpulkan ⭐ X lagi untuk naik ke Lv N+1".
- ✅ **Phase 10 SELESAI (2026-07-08)** — Teacher Dashboard (`/guru`, guard role guru): dua tab.
  **Tab Kelas 🏫**: Buat Kelas (kode undangan 5 huruf otomatis, charset tanpa I/O/0/1), tombol
  📋 Salin kode, 👥 daftar siswa per kelas dengan ringkas progress (`TabelSiswa`: Lv D10, ⭐poin,
  level kuis/piring, bab cerita, jumlah kartu; urut poin), hapus kelas (confirm). **Tab Bank
  Soal 📝**: buat/edit/hapus soal custom skema §6 `sumber:"guru"` (koleksi Firestore `soalGuru`)
  via `FormSoal` — pertanyaan, 4 opsi + emoji opsional, kunci, level 1–3, kategori, durasi
  10/15/20 dtk. Sisi siswa (**D11**: Kuis saja dulu): `ambilSoalGuruKelas(kelasId)` mengambil
  soal guru kelasnya → digabung ke pool lewat `soalUntukLevel(level, tambahan)`; gagal/tanpa
  kelas → kuis tetap jalan dengan soal anakara. Query tetap satu `where` + sortir klien (tanpa
  composite index). **`firestore.rules` diperluas** (kelas: create/update/delete oleh guru
  pemilik; koleksi `soalGuru` baru) → **wajib publish ulang di console**. Halaman uji tanpa
  login: `/dev/guru`. Modul `features/guru/` (`api.ts`, `DashboardGuru.tsx`, `FormSoal.tsx`).
- 🏁 **Semua phase 0–10 selesai.** Backlog non-blokir: asset gambar P0 sisa/P1/P2
  (`daftar-gambar.md`), rekaman audio narasi cerita, file video `.mp4`.
- ✅ **Restyle THYNK SELESAI (2026-07-08, D12)** — keempat elemen dieksekusi sesuai
  `catatan-restyle-thynk.md`: (1) palet token baru terang+gelap di `globals.css` +
  themeColor `layout.tsx` (§4.4 diperbarui; validator `node scripts/cek-kontras.mjs`);
  (2) komponen dekorasi `components/deko/` (BlobMata/Squiggle/GarisMarker/AwanPikiran/
  TepiGelombang) + `components/ui/Chip.tsx`, dipasang di landing, home, masuk, header
  leaderboard/koleksi/guru, dan blob perayaan di 4 layar hasil game; (3) band pastel
  `band-pink/green/blue` (landing, home, masuk, header halaman); (4) ilustrasi cerita flat
  `band-green`+awan; mask arch GameCard sempat dicoba lalu dibatalkan atas permintaan user
  (2026-07-08) — kembali ke spek `.game-card` design system.
  Sapuan hardcode §E tuntas (badge play & tombol suka → token accent; bar tim battle →
  `--tim-biru/--tim-merah`; logo Google & overlay keterbacaan sengaja dibiarkan; gradien
  placeholder GameCard dibiarkan dramatis). `daftar-gambar.md` diberi art direction baru.
  Utilitas uji baru: `/dev/tema?set=light|dark&ke=<path>` (paksa tema untuk screenshot).
  Verifikasi: tsc bersih + screenshot dua tema (landing, masuk, /dev/komponen, /dev/cerita).
- ✅ **Penyempurnaan pasca-restyle (2026-07-08):** (a) semua navigasi kembali diseragamkan
  ke `components/ui/TombolKembali` (konvensi §4.5) — 12 titik, termasuk varian `overlay`
  untuk video; (b) fix CSS: aturan `a{color}` dipindah ke `@layer base` (CSS tanpa layer
  menang atas utility Tailwind — panah `text-bg` tertimpa warna link) + `isolation: isolate`
  di `body` (lapisan `-z-10` tadinya tertelan background body); (c) **`LatarDoodle`** —
  doodle samar (bentuk polos `wajah={false}`, warna `band-*`) di latar `/home`, pratinjau
  di `/dev/komponen`; (d) `prompt.md` & `prompt-clarifications.md` **diarsipkan ke
  `arsip/`** (11 phase selesai; semua rujukan diperbarui).
- ✅ **Level 1-10 + Mode Tanpa Batas (2026-07-12)** — Kuis Asik & Isi Piringku diperluas dari
  3 → **10 level**: level 4-9 baru (kuis: 72 soal baru `data/soal-kuis.json`, total 102;
  piring: 16 makanan baru `data/makanan.json` total 48, config `data/isi-piringku.json`),
  **level 10 = Mode Tanpa Batas** (endless): soal/ronde terus mengalir makin cepat, ❤️ 3
  nyawa, poin 5/benar (lebih kecil dari mode biasa — sesi tak terbatas), **papan rekor
  sendiri** koleksi Firestore `rekorEndless` (dok `game_uid` = skor terbaik; satu `where` +
  sortir klien, tanpa composite index) via modul bersama `features/games/endless/`
  (`api.ts` + `PapanRekorEndless`). Aturan level kuis kini dibaca dinamis dari JSON
  (`ATURAN`/`LEVEL_MAKS`); D1 "3 level" digantikan jalur 10 level (D9 tetap: unlock
  independen per fitur). Halaman uji tanpa login: `/dev/level?game=kuis|piring&buka=N`.
  ⚠️ **Wajib publish ulang `firestore.rules`** (koleksi `rekorEndless` baru). Asset baru
  yang disarankan (tidak memblokir — fallback emoji jalan): 16 ilustrasi makanan baru di
  `daftar-gambar.md`. Battle/Cerita/Video tidak berlevel (PvP/bab/feed) — di luar jalur ini.

- ✅ **Panduan pemain baru — TutorialOverlay Home (2026-07-13)** — tur sorotan di `/home`:
  layar diredupkan, elemen asli disorot bergantian lewat atribut `data-tutorial`
  (sambutan Tayo → chip profil → ⭐ poin → menu lain → grid game → tombol ?), kartu Tayo
  per langkah + titik progres + Lanjut/Sebelumnya/Lewati, Esc menutup, fokus terkunci di
  kartu, hormat `prefers-reduced-motion`, sorotan mengikuti scroll/resize. Muncul otomatis
  sekali per perangkat untuk pemain baru (localStorage `anakara-tutorial-home`, pola
  riwayat); **tombol ? kuning di kanan chip profil** (gaya tombol Cara Main battle)
  membukanya lagi kapan saja. Langkah config-driven di `features/home/tutorial.ts`;
  komponen `features/home/TutorialOverlay.tsx`. Halaman uji tanpa login:
  `/dev/tutorial` (`?langkah=1..6` → lompat langkah).

Untuk asset gambar: user generate manual mengikuti `daftar-gambar.md` (atau aktifkan billing
Gemini, lihat §8) — bisa berjalan paralel, tidak memblokir.

**Asset via OpenArt (2026-07-07):** 16 file P0 masuk memakai 40 kredit OpenArt (kling-3-omni,
4 generasi multi-subjek dipotong lokal; saldo kini 0): 10 avatar
(`public/assets/avatars/avatar-01..10.png` — urutan hewan baru di `features/auth/avatars.ts`),
4 pose Tayo (`public/assets/mascot/tayo-{hello,happy,cheer,run}.png` — sapaan Home, layar hasil
game, LoadingSpinner), 2 thumbnail (`thumb-isi-piringku.jpg` & `thumb-kuis.jpg` — **JPEG** demi
<150 KB). Semua berlatar **putih (belum transparan)** → di UI dibingkai lingkaran putih via
`components/ui/GambarEmoji.tsx` (img + fallback emoji). Sisa P0 manual: `logo.png`,
`thumb-video/battle/cerita`, 2 ikon kecil.
