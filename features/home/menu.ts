/* Daftar menu Home (Phase 2) — config-driven agar phase berikutnya cukup
   mengubah data ini (flip `status` + isi `href`) tanpa menyentuh layout.
   Thumbnail dramatis dari daftar-gambar.md (GAYA-THUMB): isi-piringku & kuis
   sudah ada (.jpg, hasil OpenArt); sisanya masih placeholder gradien+emoji. */

export interface MenuGame {
  id: string;
  judul: string;
  subjudul: string;
  /** halaman fitur; dipakai saat status = "aktif" */
  href: string;
  /** "aktif" = fitur sudah dibangun; "segera" = placeholder Segera Hadir */
  status: "aktif" | "segera";
  phase: number;
  thumbnail: string;
  /** placeholder sebelum asset: emoji besar + gradien gelap dramatis */
  emoji: string;
  gradien: string;
}

export const MENU_GAME: MenuGame[] = [
  {
    id: "isi-piringku",
    judul: "Isi Piringku",
    subjudul: "Susun makanan bergizi di piringmu",
    href: "/game/isi-piringku",
    status: "aktif",
    phase: 3,
    thumbnail: "/assets/icons/thumb-isi-piringku.jpeg",
    emoji: "🍽️",
    gradien: "from-[#3d2a12] via-[#7a4a12] to-[#2a1a08]",
  },
  {
    id: "video",
    judul: "Video Belajar",
    subjudul: "Belajar sambil menonton video kartun",
    href: "/game/video",
    status: "aktif",
    phase: 4,
    thumbnail: "/assets/icons/thumb-video.jpeg",
    emoji: "📺",
    gradien: "from-[#3a1a4d] via-[#6a2a8a] to-[#22102e]",
  },
  {
    id: "kuis",
    judul: "Kuis Asik",
    subjudul: "Jawab pertanyaan dan dapatkan hadiah menarik",
    href: "/game/kuis",
    status: "aktif",
    phase: 5,
    thumbnail: "/assets/icons/thumb-kuis.jpeg",
    emoji: "❓",
    gradien: "from-[#2b1145] via-[#4a1e78] to-[#160825]",
  },
  {
    id: "battle",
    judul: "2 vs 2",
    subjudul: "Team up dengan temanmu untuk menjawab kuis",
    href: "/game/battle",
    status: "aktif",
    phase: 6,
    thumbnail: "/assets/icons/thumb-battle.jpeg",
    emoji: "⚔️",
    gradien: "from-[#0a2a5e] via-[#5e1020] to-[#300810]",
  },
  {
    id: "cerita",
    judul: "Cerita Interaktif",
    subjudul: "Belajar sambil membaca kisah-kisah seru",
    href: "/game/cerita",
    status: "aktif",
    phase: 7,
    thumbnail: "/assets/icons/thumb-cerita.jpeg",
    emoji: "📖",
    gradien: "from-[#101c4a] via-[#25357a] to-[#0a1130]",
  },
];

/* Tautan sekunder (Phase 8) — tampil sebagai kartu kecil pastel, bukan art dramatis */
export interface MenuLain {
  id: string;
  judul: string;
  emoji: string;
  /** ikon asli (opsional); fallback ke emoji kalau file belum ada */
  gambar?: string;
  href: string;
  status: "aktif" | "segera";
}

export const MENU_LAIN: MenuLain[] = [
  { id: "kelas", judul: "Kelasku", emoji: "🏫", href: "/kelas", status: "aktif" },
  { id: "leaderboard", judul: "Leaderboard", emoji: "🏆", gambar: "/assets/icons/icon-leaderboard.png", href: "/leaderboard", status: "aktif" },
  { id: "koleksi", judul: "Koleksi Kartu", emoji: "🃏", gambar: "/assets/icons/icon-koleksi.png", href: "/koleksi", status: "aktif" },
];
