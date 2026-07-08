# Catatan Restyle — Gaya THYNK (✅ SELESAI DIEKSEKUSI 2026-07-08, keputusan D12)

> Rencana penyesuaian art style Anakara, disetujui user 2026-07-08 dan **sudah dieksekusi
> penuh di hari yang sama** (lihat FOUNDATION.md §9 D12 + §10 status). Keputusan terbuka §H
> diambil sesuai rekomendasi: (1) tim battle = token dekoratif `--tim-biru/--tim-merah`;
> (2) gradien placeholder GameCard dibiarkan dramatis; (3) focus ring pink tua; (4) hero
> tetap ilustrasi/emoji Tayo tanpa foto. Dokumen dipertahankan sebagai arsip rasional desain.
> Referensi: [THYNK Family Card Game — Behance](https://www.behance.net/gallery/246207499/THYNK-Family-Card-Game-Website-Product-Design)
> (desainer Karina Zhaborovska). Cakupan: **seluruh aplikasi**, keempat elemen di bawah.

## Ringkasan gaya referensi

1. **Palet**: hijau rumput + pink permen karet (duo utama), kuning amber, biru langit pastel;
   latar **krem/mint** (bukan putih polos); SEMUA teks **hijau tua pekat** (bukan hitam/abu).
2. **Doodle**: maskot blob/bunga flat bermata kartun + pipi pink, coretan keriting (squiggle),
   awan pikiran, garis marker tangan di bawah kata penting pada judul.
3. **Seksi pastel selang-seling**: band lebar putih → pink muda → hijau → biru per seksi halaman.
4. **Bentuk**: foto di-mask lengkung/pill ("dua kapsul berdempet"), chip pill ber-emoji,
   tombol pill solid, kartu putih membulat dengan bayangan sangat lembut.
5. Tipografi display tebal membulat — **sudah cocok** dengan Baloo/Fredoka; tidak diubah.

---

## A. Palet baru (`app/globals.css` — SATU file, menyebar via token)

Semua kandidat di bawah **sudah lolos cek kontras WCAG** (`node scripts/cek-kontras.mjs`,
28 pasangan; teks 4.5:1, non-teks 3:1) kecuali dicatat lain.

### Tema terang

| Token | Sekarang | Kandidat baru | Kontras |
|---|---|---|---|
| `--bg` | `#f2f9fe` (biru muda) | `#F5F8E7` (krem mint) | fg 11.62 |
| `--surface` | `#ffffff` | `#FFFFFF` (tetap) | fg 12.53 |
| `--surface-2` | `#f4faff` | `#EFF5DE` | — |
| `--fg` | `#21323d` | `#163A2C` (hijau tua) | — |
| `--muted` | `#5a6b75` | `#52685B` | bg 5.58 / surface 6.02 |
| `--border` | `#dce6ec` | `#DCE5CB` | — |
| `--primary` | `#0a72b0` (biru) | `#D6336C` (pink) | on-primary 4.62 |
| `--primary-hover` | `#085e92` | `#C22B60` | 5.51 |
| `--primary-active` | `#084e7a` | `#AD2456` | — |
| `--accent` | `#ffd23f` | `#FFC93C` | on-accent 8.16 |
| `--accent-edge` | `#d9a91c` | tetap | — |
| `--on-accent` | `#21323d` | `#163A2C` | — |
| `--success` | `#2f7a33` | `#2F7D33` (hijau = "sehat", tetap) | on-success 5.12 |
| `--danger` | `#c0392b` | tetap | surface 5.44 |
| `--focus` | `#0b84c4` | `#B02861` (pink tua)¹ | bg 5.86 |
| `--link` | `#085e92` | `#B02861` | bg 5.86 |
| `--sky` | `#1fa8e8` | `#8EC9E8` (pastel; dekoratif) | — |
| `--orange` | `#ff9f43` | tetap (dekoratif) | — |
| `--green-bright` | `#7dd35b` | `#7DD14D` (hijau rumput; dekoratif) | — |
| **BARU** `--band-pink` | — | `#FBDCE8` | fg 9.85 |
| **BARU** `--band-green` | — | `#DDF1C6` | fg 10.43 |
| **BARU** `--band-blue` | — | `#CDE9F6` | fg 9.90 |

### Tema gelap (`[data-theme="dark"]` + blok fallback `prefers-color-scheme`)

| Token | Kandidat baru | Kontras |
|---|---|---|
| `--bg` | `#12271B` | fg 14.15 |
| `--surface` | `#1A3526` | fg 11.92 |
| `--surface-2` | `#22412E` | — |
| `--fg` | `#EAF6E8` | — |
| `--muted` | `#A7BFAC` | bg 8.03 |
| `--border` | `#2F4A38` | — |
| `--primary` / hover / active | `#F06A9B` / `#F585AC` / `#F899B9` | on-primary 5.44 |
| `--on-primary` / `--on-accent` / `--on-success` | `#12271B` | — |
| `--accent` / edge | `#FBD24E` / `#C79F22` (tetap) | on-accent 10.84 |
| `--success` / hover | `#7DD35B` / `#8ADF69` | on-success 8.52 |
| `--danger` | `#FF8A80` (tetap) | bg 6.91 |
| `--focus` | `#F06A9B` | bg 5.44 |
| `--link` | `#F48FB1` | bg 7.07 |
| `--band-pink` / `--band-green` / `--band-blue` | `#43222E` / `#22421A` / `#173648` | fg 12.51 / 10.12 / 11.37 |

**¹ Aturan baru wajib**: `--primary` pink **bukan pembawa teks** di atas `bg`/`surface`
(4.28 < 4.5 — GAGAL). Teks/ikon pink berdiri sendiri SELALU pakai `--link`. (Sama polanya
dengan aturan `--sky` dekoratif-saja yang sudah ada.) Tambahkan komentar ini di globals.css.

**Ikut diubah**: meta `themeColor` di `app/layout.tsx:30-31` (`#F2F9FE`→`#F5F8E7`,
`#10202B`→`#12271B`), dan pemetaan `@theme inline` untuk 3 token band baru.

---

## B. Komponen doodle & squiggle (baru: `components/deko/`)

| Komponen | Isi |
|---|---|
| `BlobMata.tsx` | Blob flat bermata kartun + pipi pink (varian bentuk: `bunga`, `cipratan`, `gumpal`; warna via token) |
| `Squiggle.tsx` | Coretan keriting; `stroke="currentColor"` supaya diwarnai lewat `text-*` |
| `GarisMarker.tsx` | Garis marker bergelombang di bawah kata penting (span `relative` + SVG `absolute` di bawah teks) |
| `AwanPikiran.tsx` | Awan pikiran putih/pastel |
| `TepiGelombang.tsx` | Pembatas gelombang antar band (SVG penuh-lebar, tinggi ±24–32px, `fill` = warna band berikutnya) |

Spesifikasi umum: inline SVG tanpa dependensi; `aria-hidden="true"` (murni dekoratif);
warna HANYA via token; animasi mengambang halus `motion-safe:` saja; `pointer-events-none`;
tidak boleh menutupi/menyempitkan touch target 48px.

**Penempatan** (maks 2–3 dekorasi per layar): landing `/` (hero), `/masuk`, onboarding,
header `/home`, **layar hasil** keempat game (kuis/isi-piringku/battle/cerita — blob merayakan
+ squiggle), CeritaHub, header `/koleksi` `/leaderboard` `/guru`, `/segera-hadir`.
**Larangan**: JANGAN di area soal/permainan aktif — mengganggu fokus anak; hanya header &
layar hasil. `GarisMarker` dipakai di judul H1/H2 (1 kata kunci per judul).

---

## C. Seksi pastel selang-seling

- **Landing `/`**: krem → `band-pink` (pilih peran) → krem (footer).
- **`/home`**: header krem → `band-green` (band kartu game; menggantikan gradien biru
  `from-sky/80 to-primary` di `app/home/page.tsx:106`) → `band-pink` (Menu Lain) → krem.
- **`/masuk`**: band ilustrasi `bg-sky/20` (`app/masuk/page.tsx:145`) → `band-blue`.
- **Leaderboard/Koleksi/Guru**: header `band-blue`, isi krem.
- `TepiGelombang` antar band. Dark mode lewat remap token band (JANGAN pakai varian
  `dark:` Tailwind — tidak mengikuti toggle aplikasi, sudah pernah kejadian).
- `/dev/komponen` (`:128`) memakai band contoh yang sama — ikut diganti sebagai galeri uji.

---

## D. Mask pill/arch & chip

- **`GameCard`**: thumb → mask lengkung ala referensi (radius atas penuh:
  `border-radius: 9999px 9999px 24px 24px` atau clip-path); teks judul tetap di pita bawah.
  ⚠️ **DIBATALKAN (2026-07-08)** atas permintaan user — bentuk kartu game kembali ke spek
  `.game-card` design-system.html (radius-lg 24px, play pojok kanan atas).
- **`BacaCerita` ilustrasi** (aspect 16/9): bingkai "dua kapsul berdempet" (2 kolom
  `rounded-full overflow-hidden`) seperti foto "m" di referensi.
- **`components/ui/Chip.tsx` (baru)**: pill emoji + label, varian warna band — samakan chip
  yang kini tersebar (filter leaderboard, kategori video, counter koleksi, kode kelas guru,
  chip syarat lock).
- **`Button.tsx`**: radius → `rounded-full` (pill penuh); efek tepi 3D accent dipertahankan.
- **`Card.tsx`**: radius tetap, bayangan diperlembut (kecil, warna `fg` alpha rendah).

---

## E. Titik warna hardcode yang wajib disentuh (hasil audit grep 2026-07-08)

| Lokasi | Sekarang | Aksi |
|---|---|---|
| `app/layout.tsx:30-31` | meta themeColor hex lama | ganti hex bg baru (lihat §A) |
| `app/home/page.tsx:106` + `app/dev/komponen/page.tsx:128` | band `from-sky/80 to-primary` | flat `band-green`/`band-blue` + TepiGelombang |
| `features/home/menu.ts:31-75` | 5 gradien placeholder gelap dramatis | keputusan saat eksekusi: selaraskan hue baru ATAU biarkan (teks putih tetap kontras) |
| `features/home/GameCard.tsx:66` | badge kunci `#FFE23F` border hitam | → `bg-accent` + `border-accent-edge` (token) |
| `features/home/GameCard.tsx:79`, `features/games/video/VideoFeed.tsx:105` | overlay gradien hitam di atas foto/video | **BIARKAN** — fungsi keterbacaan, bukan brand |
| `features/games/video/VideoFeed.tsx:201` | tombol suka `#FFD23F`/`#D9A91C` | → `bg-accent` + `border-accent-edge` |
| `features/games/cerita/BacaCerita.tsx:225`, `CeritaHub.tsx:105` | gradien hutan `#9fd898→#ead9a8` | → latar flat `band-green` + BlobMata/AwanPikiran (sampai ilustrasi P2 ada) |
| `app/masuk/page.tsx:131-134` | logo Google warna resmi | **JANGAN DIUBAH** (brand guideline Google) |
| `features/games/battle/ArenaBattle.tsx:395` | tim biru `bg-primary`, merah `#e2574c` | ⚠️ primary jadi pink → "tim biru" ikut pink! Buat token dekoratif `--tim-biru #4DA3E0` / `--tim-merah #E2574C` supaya identitas 🔵🔴 tidak terseret |

---

## F. Dampak aset & `daftar-gambar.md`

- **Update art direction** di `daftar-gambar.md` sebelum generate P1/P2: latar krem
  `#F5F8E7` (bukan putih), flat tanpa gradien/outline, kata kunci tambahan
  "cute flat vector, pastel green pink yellow, hand-drawn squiggle accents".
- 16 file OpenArt yang sudah ada (avatar, Tayo, 2 thumb) berlatar putih — tetap cocok di
  atas `surface` putih; **tidak perlu regenerate** (opsional nanti).
- **Tayo tetap maskot utama** (macan tutul = identitas Anakara). Blob bermata = dekorasi
  "teman-teman", BUKAN pengganti Tayo.

## G. Urutan pengerjaan yang disarankan (±1 sesi)

1. Token palet terang+gelap di `globals.css` + themeColor `layout.tsx` + sapu tabel §E.
2. Komponen `components/deko/` + `Chip.tsx` + contoh di `/dev/komponen`.
3. Band pastel: landing, home, masuk, header halaman daftar.
4. Mask arch GameCard & BacaCerita + Button pill.
5. Verifikasi: `npx tsc --noEmit`, `node scripts/cek-kontras.mjs`, screenshot `/dev/*` +
   halaman utama (cek port 3000 dulu — jangan `next build` saat dev server jalan!),
   update FOUNDATION.md (§4.4 token, tabel keputusan → **D12**, status).

## H. Keputusan terbuka (jawab saat eksekusi)

1. Warna tim battle: rekomendasi token dekoratif tetap biru vs merah (lihat §E).
2. Gradien placeholder GameCard: disamakan hue baru, atau biarkan gelap dramatis.
3. Focus ring: pink tua `#B02861` (serasi, kandidat §A) vs tetap biru (lebih "sistem").
4. Hero landing: referensi pakai foto keluarga — Anakara pakai ilustrasi Tayo saja?
