# Anakara — Tooling Scripts

CLI untuk generate asset gambar (maskot Tayo, avatar, ilustrasi makanan, thumbnail, dll)
lewat **Google Gemini API**. Terpisah dari project React (yang belum di-setup) supaya tidak bentrok.

## 1. Setup (sekali saja)

```bash
# dari root project
cd scripts
npm install
cd ..
```

Lalu isi API key di file `.env` (root project):

```
GEMINI_API_KEY=isi_key_kamu_disini
```

> Ambil API key gratis di https://aistudio.google.com/app/apikey
> File `.env` sudah di-ignore git — aman, tidak akan ke-commit.

## 2. Generate satu gambar

```bash
# Jalankan dari ROOT project
node scripts/generate-image.mjs \
  --prompt "logo Anakara, maskot macan tutul kecil kuning lucu, gaya kawaii, warna biru pastel" \
  --out public/assets/logo.png
```

## 3. Generate dengan gambar referensi (jaga konsistensi Tayo)

Model default `gemini-2.5-flash-image` bisa "melihat" gambar referensi supaya karakter tetap konsisten:

```bash
node scripts/generate-image.mjs \
  -p "Tayo si macan kecil sedang makan apel, background transparan" \
  -r "referensi/WhatsApp Image 2026-07-06 at 22.00.31.jpeg" \
  -o public/assets/mascot/tayo-apel.png \
  -n 2
```

## 4. Generate banyak asset sekaligus (batch)

Edit / salin `scripts/asset-list.example.json`, lalu:

```bash
node scripts/generate-image.mjs --batch scripts/asset-list.example.json
```

## Opsi lengkap

```bash
node scripts/generate-image.mjs --help
```

| Opsi | Arti |
|------|------|
| `-p, --prompt` | Teks prompt |
| `--prompt-file` | Baca prompt dari file |
| `-o, --out` | Path output gambar |
| `-r, --ref` | Gambar referensi (boleh diulang), khusus model `gemini-*-image` |
| `-n, --count` | Jumlah gambar |
| `-m, --model` | Ganti model (`gemini-2.5-flash-image` atau `imagen-4.0-generate-001`) |
| `--aspect` | Rasio untuk Imagen: `1:1`, `3:4`, `9:16`, dll |
| `--batch` | File JSON daftar asset |

## Catatan model

- **`gemini-2.5-flash-image`** (default, "Nano Banana") — terbaik untuk **konsistensi karakter** &
  bisa pakai gambar referensi. Cocok untuk semua asset Tayo.
- **`imagen-4.0-generate-001`** — text-to-image kualitas tinggi, TIDAK pakai referensi. Cocok untuk
  background / ilustrasi lepas. Ganti via `-m imagen-4.0-generate-001`.
