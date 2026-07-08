# `data/` — Konten Aplikasi Anakara (siap-impor)

Semua konten edukasi dalam JSON murni, terpisah dari kode game (sesuai instruksi `arsip/prompt.md`:
"struktur yang mudah ditambah tanpa ubah kode"). Bahasa Indonesia sederhana untuk kelas 1–2 SD.
Fakta gizi mengikuti pedoman **"Isi Piringku"** (Kemenkes).

| File | Isi | Dipakai Phase |
|---|---|---|
| `makanan.json` | 32 makanan, 4 kelompok gizi, `level` kemunculan, fakta seru per item | 3 (Isi Piringku), 7 |
| `isi-piringku.json` | Konfigurasi 3 level game piring (D1), poin & bintang | 3, 9 |
| `soal-kuis.json` | 30 soal (3 level × 10) + aturan buka level; skema identik soal guru | 5, 9, 10 |
| `kartu-koleksi.json` | 24 kartu, 3 rarity (Biasa/Langka/Legenda) + peluang gacha (D2) | 6, 8 |
| `cerita-bab1.json` | Bab 1 "Piknik di Hutan": 10 halaman, 2 pertanyaan, path audio narasi | 7, 9 |
| `video.json` | 8 metadata video internal (placeholder — perlu produksi) | 4 |

## Aturan skema (jangan dilanggar antar-phase)

- **Soal kuis**: `{ id, level, kategori, pertanyaan, opsi[4], opsiEmoji[4]?, kunciIndex, durasiDetik, sumber }`
  — `sumber ∈ "anakara" | "guru"`. Form guru (Phase 10) menghasilkan objek yang SAMA (tanpa `opsiEmoji` boleh).
- **Makanan**: `kelompok ∈ "pokok" | "lauk" | "sayur" | "buah"`.
- **Kartu**: `rarity ∈ "biasa" | "langka" | "legenda"`; peluang gacha total = 1.0; duplikat → +25 ⭐.
- **Cerita halaman**: `tipe ∈ "narasi" | "pertanyaan"`; setiap halaman punya `audio` (narasi suara = wajib).
- `emoji`/`opsiEmoji` = placeholder tampilan sampai asset PNG final di-generate — kode harus render
  gambar jika ada, fallback ke emoji.

## Yang masih perlu diproduksi (bukan teks)

- Gambar: makanan (32), kartu (24), ilustrasi cerita (10+cover), thumbnail video (8), maskot,
  avatar, ikon, dll. → **daftar lengkap + prompt siap-copy ada di `daftar-gambar.md`** (prioritas
  P0/P1/P2). Digenerate **manual oleh user** (API image butuh billing — lihat `FOUNDATION.md` §8);
  `scripts/generate-image.mjs` tetap tersedia jika billing nanti aktif.
- Audio narasi cerita (10 file) → rekaman atau TTS Bahasa Indonesia.
- Video edukasi (8) → produksi tim.
