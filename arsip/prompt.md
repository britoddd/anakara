# Master Prompt: Website Edukasi "Anakara" (Submission PKM: "Fase A")

Kerjakan setiap tahap dalam setiap kali pengerjaan, dilarang mengerjakan lebih dari 1 tahap dalam 1 kali kerja

---

## 0. KONTEKS PROJECT (WAJIB DIBACA SEBELUM MULAI CODING)

Saya sedang membangun website bernama *Anakara* — nama besar/brand dari project ini. Untuk submission PKM (Program Kreativitas Mahasiswa), project ini didaftarkan dengan nama *"Fase A", mengikuti istilah fase dalam Kurikulum Merdeka (Fase A = kelas 1-2 SD). Jadi kalau kamu perlu menulis nama di README, metadata, judul tab browser, dsb: gunakan *"Anakara"** sebagai brand/nama produk, dan boleh tambahkan subtitle kecil seperti "Fase A Learning Platform" kalau relevan. Jangan bingung, keduanya merujuk ke project yang sama.

*Apa itu Anakara:*
Anakara adalah website edukasi dengan maskot singa, ditujukan untuk anak SD kelas 1-2 (usia 6-8 tahun) di Indonesia, dengan tujuan mengajarkan gizi dan pola hidup sehat (makanan bergizi dan olahraga) melalui gamifikasi.

*Prinsip desain yang WAJIB diikuti di semua phase:*
- Nuansa warna dominan: *biru muda / pastel blue*, dikombinasikan dengan warna-warna ceria (kuning, oranye, hijau muda) sebagai aksen — hindari warna gelap/serius.
- Target user adalah anak kecil (6-8 tahun) yang *belum lancar membaca panjang*, jadi:
  - Gunakan ikon besar, ilustrasi, dan mascot singa di banyak tempat untuk memandu.
  - Font besar, bulat, dan ramah anak (contoh: Baloo 2, Fredoka, Nunito — bukan font formal seperti Times New Roman/Arial biasa).
  - Tombol besar, mudah di-tap (untuk device tablet/HP juga, bukan cuma desktop).
  - Animasi transisi yang playful (bounce, pop, confetti) tapi jangan berlebihan sampai mengganggu.
- Semua teks di dalam produk (UI, instruksi, soal) menggunakan *Bahasa Indonesia* yang sederhana dan sesuai umur anak kelas 1-2 SD.
- Ini adalah aplikasi web yang dipakai di lingkungan sekolah, jadi asumsikan koneksi internet bisa lambat — desain harus tetap ringan.

*Referensi desain (Figma):*
lihat dalam folder 'referensi/'

*Instruksi kerja untuk AI coding assistant:*
1. Kerjakan project ini *per phase sesuai urutan di bawah*. Jangan lompat phase kecuali saya minta.
2. Di setiap phase, sebelum mulai coding, *ringkas dulu pemahamanmu* tentang apa yang akan dibangun dan tanyakan kalau ada yang ambigu — jangan asumsikan sendiri hal-hal penting (misalnya struktur database, alur autentikasi).
3. Gunakan struktur project yang scalable (component-based), karena akan terus ditambah fitur di phase-phase berikutnya.
4. Tulis kode yang rapi dan *beri komentar secukupnya* di bagian logic yang kompleks (misalnya logic drag-and-drop, matching jawaban, sistem level/unlock).
5. Setelah selesai satu phase, buatkan *ringkasan singkat*: file apa saja yang dibuat/diubah, dan bagaimana cara saya test fitur tersebut secara manual.
6. Kalau ada keputusan teknis besar (misalnya pilihan library drag-and-drop, cara simpan skor, dsb), *tanyakan dulu opsinya ke saya*, jangan langsung pilih sendiri tanpa konfirmasi.

*Tech stack (default, boleh didiskusikan ulang dengan AI assistant di Phase 0):*
- Frontend: React (atau Next.js kalau butuh SSR/routing lebih matang)
- Styling: Tailwind CSS
- Backend/Database: bebas didiskusikan (misalnya Firebase untuk cepat, atau Node.js + PostgreSQL kalau butuh lebih robust) — sebutkan trade-off nya ke saya di Phase 0.
- Auth: Google OAuth (khusus untuk role siswa)

---

## PHASE 0 — Setup Project & Design System

*Tujuan:* Menyiapkan fondasi project sebelum masuk ke fitur.

Tugas:
1. Inisialisasi project dengan stack yang disepakati (React/Next.js + Tailwind).
2. Setup design system dasar: palet warna (biru muda sebagai primary, plus 2-3 warna aksen ceria), font ramah anak, ukuran spacing/border-radius yang konsisten (banyak rounded corners untuk kesan playful).
3. Buat komponen dasar reusable: Button (besar, dengan efek "pop" saat ditekan), Card, Modal, LoadingSpinner (idealnya animasi singa lucu), ProgressBar.
4. Siapkan struktur folder yang jelas untuk memisahkan fitur: auth, home, games (drag-drop, quiz, story, battle), teacher-mode, shared/components.
5. Tanyakan ke saya: apakah saya sudah punya asset (logo singa, ilustrasi makanan, ikon) atau perlu placeholder dulu.

---

## PHASE 1 — Landing Page & Role Selection (Guru vs Siswa)

*Tujuan:* Halaman pertama yang dilihat user, menentukan alur guru atau siswa.

Tugas:
1. Buat landing page dengan mascot singa dan branding Anakara, sebelum ada proses login apapun.
2. Tampilkan pilihan besar dan jelas: *"Saya Guru"* atau *"Saya Siswa"* — desain dua kartu/tombol besar dengan ilustrasi berbeda supaya anak kecil paham secara visual (misalnya ikon buku untuk guru, ikon topi wisuda kecil/ransel untuk siswa).
3. Jika pilih *Siswa*:
   - Lanjut ke proses Google OAuth login.
   - Setelah login berhasil, ambil otomatis nama & foto profil dari akun Google anak tersebut, tampilkan sebagai preview ("Halo, [Nama]!").
   - Lanjut ke halaman *pemilihan avatar* (grid avatar kartun lucu untuk dipilih, bukan foto asli anak yang ditampilkan sebagai avatar utama — ini penting untuk privasi anak).
   - Simpan pilihan avatar ke profil user.
4. Jika pilih *Guru*:
   - Arahkan ke alur login/registrasi guru terpisah (bisa pakai email biasa atau Google juga — diskusikan dengan saya).
   - Setelah berhasil, arahkan ke *Teacher Dashboard* (akan detail di Phase 10).
5. Tanyakan ke saya: apakah setiap siswa perlu di-invite oleh guru dulu (kode kelas) sebelum bisa login, atau siswa bisa langsung daftar bebas lalu join kelas belakangan.

---

## PHASE 2 — Home Dashboard (Siswa)

*Tujuan:* Halaman utama setelah siswa selesai onboarding, sebagai pusat navigasi ke semua fitur belajar.

Tugas:
1. Buat halaman home dengan mascot singa menyapa siswa by name ("Halo, [Nama]! Yuk main hari ini~").
2. Tampilkan avatar siswa dan progress ringkas (misalnya level saat ini, jumlah bintang/poin).
3. Buat navigasi/menu ke fitur-fitur utama dalam bentuk kartu/ikon besar berwarna-warni:
   - Drag Makanan ke Piring (Phase 3)
   - Video Belajar (Phase 4)
   - Kuis Asik (Phase 5)
   - Team Battle 2v2 (Phase 6)
   - Cerita Interaktif (Phase 7)
4. Sediakan ikon *Leaderboard* dan *Koleksi Kartu* yang bisa diklik dari home (detail fungsinya di Phase 8).
5. Struktur layout harus mudah ditambah menu baru untuk phase-phase berikutnya (jangan hardcode).
6. Untuk sekarang, menu yang fiturnya belum dibangun bisa mengarah ke halaman placeholder "Segera Hadir".

---

## PHASE 3 — Fitur Belajar: Drag Makanan ke Piring

*Tujuan:* Game edukatif interaktif drag-and-drop untuk belajar memilih makanan bergizi.

Tugas:
1. Buat game dimana siswa men-drag gambar makanan (dari kumpulan makanan sehat & tidak sehat) ke sebuah piring di tengah layar.
2. Setiap ronde, tampilkan instruksi sederhana (misalnya "Pilih makanan yang mengandung Vitamin C!").
3. Beri feedback visual & audio langsung saat benar (animasi bintang/tepuk tangan, suara "yeay!") dan saat salah (animasi lembut, bukan yang menakutkan/menjatuhkan semangat anak — misalnya mascot singa bilang "Yuk coba lagi!").
4. Simpan skor/progress per sesi.
5. Buat data makanan (nama, gambar, kategori gizi, benar/salah untuk instruksi tertentu) dalam struktur yang mudah ditambah (misalnya file JSON/config terpisah), supaya saya bisa nambah item makanan tanpa ubah kode game.
6. Gunakan library drag-and-drop yang ringan dan mobile-friendly (diskusikan opsi ke saya, misalnya dnd-kit untuk React).
7. Tanyakan ke saya: apakah drag-and-drop ini akan punya banyak level/kategori (misalnya per kelompok makanan) atau cukup satu mode acak.

---

## PHASE 4 — Fitur Belajar: Video Materi (Gaya Reels/Shorts)

*Tujuan:* Konten video edukasi dengan format scroll vertikal yang adiktif seperti Reels/TikTok, tapi untuk edukasi.

Tugas:
1. Buat tampilan video full-screen vertikal yang bisa di-swipe ke atas/bawah untuk pindah video (mirip pengalaman nonton Reels/YouTube Shorts).
2. Setiap video punya: judul singkat, kategori topik (misalnya "Makanan Sehat", "Olahraga Pagi"), dan tombol like/reaksi sederhana (misalnya jempol atau bintang, bukan comment section — karena user anak-anak).
3. Autoplay video saat muncul di layar, pause saat di-swipe lewat.
4. Sediakan struktur data video (judul, url video/file, thumbnail, kategori) yang mudah dikelola/ditambah dari sisi admin nantinya.
5. Pastikan kontrol video aman untuk anak: tidak ada rekomendasi video eksternal/YouTube asli yang muncul (semua video harus konten internal Anakara, bukan embed YouTube publik yang bisa mengarah ke konten tidak terkurasi).
6. Tanyakan ke saya: video-nya nanti diupload manual oleh admin/guru, atau sudah fix dari tim Anakara saja untuk versi awal ini.

---

## PHASE 5 — Fitur Belajar: Kuis Asik (Level & Timer)

*Tujuan:* Kuis pilihan ganda bertingkat dengan elemen waktu untuk melatih kecepatan & pemahaman.

Tugas:
1. Buat alur kuis: 10 soal pilihan ganda per level, tiap soal punya durasi waktu (misalnya 15-20 detik, tampilkan progress bar/timer visual yang jelas untuk anak).
2. Setelah level selesai, tampilkan hasil (jumlah benar, bintang yang didapat) dengan animasi merayakan (confetti, suara mascot bertepuk tangan).
3. Sistem level: level 2 baru terbuka setelah level 1 selesai dengan syarat tertentu (misalnya minimal benar sekian soal — diskusikan syaratnya ke saya).
4. Buat struktur data soal (pertanyaan, 4 opsi jawaban, kunci jawaban, level, durasi waktu per soal) yang reusable, karena struktur ini juga akan dipakai guru untuk custom soal di Phase 10 — desain skema datanya supaya konsisten dari awal.
5. Tanyakan ke saya: soal-soal di kuis siswa ini soal default dari Anakara, soal buatan guru, atau campuran keduanya (siswa pilih sumber soal)?

---

## PHASE 6 — Team Battle 2v2 + Kotak Misteri + Koleksi Kartu

*Tujuan:* Mode kompetitif online berbasis tim untuk menjawab soal secepat mungkin melawan tim lain, dengan reward berupa kartu koleksi.

Tugas:
1. Buat sistem matchmaking sederhana: siswa bisa membentuk tim 2 orang (ajak teman lewat kode tim/link undangan), lalu tim tersebut di-matchkan melawan tim lain secara online (real-time).
2. Selama battle: kedua tim menjawab soal yang sama secara bersamaan, tim tercepat & terbanyak benar yang menang. Tampilkan progress kedua tim secara live (misalnya progress bar berhadapan, biar berasa seru/kompetitif tapi tetap ramah anak — bukan yang bikin down anak yang kalah).
3. Setelah menang, munculkan animasi *kotak misteri* yang bisa dibuka (klik/tap) untuk mengungkap hadiah kartu secara acak (gacha sederhana, bukan berbayar — murni gamifikasi edukasi).
4. Kartu-kartu ini masuk ke *koleksi* siswa (terhubung ke Phase 8).
5. Diskusikan dengan saya soal teknis real-time: rekomendasi teknologi (misalnya WebSocket/Firebase Realtime Database/Supabase Realtime) beserta trade-off kompleksitasnya, karena ini fitur paling teknis di seluruh project.
6. Tanyakan ke saya: kalau lawan tidak ditemukan (misalnya sepi user), apakah perlu mode fallback (lawan bot/AI sederhana) supaya fitur tetap bisa dites/dipakai.

---

## PHASE 7 — Cerita Interaktif (Gaya Buku Cerita Anak)

*Tujuan:* Belajar melalui cerita bergambar yang bisa dibolak-balik seperti buku, dengan pertanyaan interaktif di tengah cerita.

Tugas:
1. Buat tampilan seperti buku cerita fisik: ada efek "membalik halaman" (page flip animation) saat pindah ke halaman berikutnya, bukan sekadar scroll biasa.
2. Setiap beberapa halaman, cerita berhenti sejenak dan menampilkan pertanyaan pilihan ganda terkait isi cerita (misalnya "Menurutmu, apa yang harus dimakan Singa supaya kuat?").
3. Jawaban siswa memengaruhi kelanjutan cerita atau minimal memberi feedback (benar/salah) sebelum lanjut ke halaman berikutnya.
4. Buat struktur data cerita (halaman, gambar ilustrasi, teks narasi, pertanyaan opsional di halaman tertentu) yang modular supaya mudah menambah cerita baru tanpa ubah kode inti.
5. Tanyakan ke saya: apakah butuh narasi suara (voice over/audio membacakan cerita) untuk anak yang belum lancar membaca, karena ini akan memengaruhi kompleksitas asset yang perlu disiapkan.

---

## PHASE 8 — Leaderboard & Koleksi Kartu Hadiah

*Tujuan:* Halaman yang menampilkan pencapaian siswa untuk mendorong motivasi bermain.

Tugas:
1. Buat halaman *Leaderboard*: ranking siswa berdasarkan poin/bintang yang dikumpulkan dari semua aktivitas (kuis, drag-drop, battle, dsb). Bisa difilter per kelas (kalau siswa tergabung di kelas guru tertentu).
2. Buat halaman *Koleksi Kartu*: menampilkan semua kartu yang sudah didapat siswa dari kotak misteri (Phase 6) dalam bentuk grid album, kartu yang belum didapat ditampilkan silhouette/terkunci supaya siswa penasaran mengumpulkan semua.
3. Tambahkan sedikit detail kartu saat diklik (gambar besar, nama, rarity/kelangkaan kartu kalau ada sistem rarity — diskusikan ke saya apakah perlu rarity seperti common/rare/legendary).
4. Kedua halaman ini diakses dari ikon yang sudah disiapkan di Home (Phase 2).

---

## PHASE 9 — Sistem Progression & Konten Terkunci

*Tujuan:* Membuat mekanisme "unlock" supaya anak termotivasi terus bermain untuk membuka level/konten baru.

Tugas:
1. Terapkan sistem lock/unlock di seluruh fitur yang punya level (terutama Kuis di Phase 5, dan bisa diperluas ke cerita di Phase 7).
2. Tampilkan secara visual konten yang masih terkunci (misalnya ikon gembok, warna redup/grayscale) dengan syarat unlock yang jelas ditampilkan ke siswa (misalnya "Selesaikan Level 2 untuk buka ini!").
3. Buat sistem penyimpanan progress per siswa yang konsisten dan bisa diakses lintas fitur (misalnya satu koleksi data "progress siswa" yang menyimpan level tiap fitur, bukan tersebar sendiri-sendiri per fitur) — ini penting supaya gampang dikembangkan lebih lanjut.
4. Tanyakan ke saya: apakah syarat unlock antar fitur saling terkait (misalnya nonton video dulu baru kuis level 2 kebuka) atau progress tiap fitur independen satu sama lain.

---

## PHASE 10 — Mode Guru (Teacher Dashboard)

*Tujuan:* Alat bantu guru untuk mengelola kelas dan membuat soal kuis custom.

Tugas:
1. Buat fitur *Buat Kelas* (mirip konsep Kahoot/Google Classroom): guru bisa membuat kelas baru dengan nama kelas, lalu sistem generate kode/link undangan unik untuk dibagikan ke siswa join kelas tersebut.
2. Tampilkan daftar siswa yang sudah join di tiap kelas, beserta ringkasan progress belajar mereka (opsional tapi bagus untuk value guru — diskusikan detail metrik apa saja yang mau ditampilkan).
3. Buat fitur *Buat Soal Kuis Custom*: form untuk guru menulis pertanyaan, 4 opsi jawaban, tandai kunci jawaban yang benar, dan pilih level/kategori soal tersebut — gunakan struktur data soal yang sama dengan yang sudah didesain di Phase 5 supaya soal buatan guru bisa langsung dipakai di fitur Kuis siswa.
4. Sediakan halaman daftar soal yang sudah dibuat guru (bisa edit/hapus).
5. Tanyakan ke saya: apakah guru hanya bisa membuat soal untuk fitur Kuis, atau nanti diperluas juga untuk isi soal di Cerita Interaktif (Phase 7) dan Team Battle (Phase 6).

---

## CATATAN PENUTUP UNTUK AI ASSISTANT

Ingat: prioritas utama project ini adalah *pengalaman anak kecil yang menyenangkan, aman, dan tidak membingungkan* — bukan kompleksitas teknis untuk dipamerkan. Kalau ada trade-off antara "teknis lebih canggih" vs "lebih sederhana tapi jelas dipakai anak SD kelas 1-2", selalu pilih yang lebih sederhana dan tanyakan ke saya dulu kalau ragu.