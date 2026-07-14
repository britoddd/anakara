import dataBab1 from "@/data/cerita-bab1.json";

/* Cerita Interaktif (Phase 7). Struktur bab modular — menambah cerita baru =
   menambah file data + entri di BAB_LIST, tanpa mengubah kode inti.
   D3: hanya sub-mode Petualangan; Mewarnai/Belajar/Permainan = Segera Hadir. */

export interface HalamanNarasi {
  no: number;
  tipe: "narasi";
  teks: string;
  gambar: string;
  audio: string;
  hadiahSelesai?: { poin: number };
}

export interface HalamanPertanyaan {
  no: number;
  tipe: "pertanyaan";
  pertanyaan: string;
  opsi: string[];
  opsiEmoji: string[];
  kunciIndex: number;
  feedbackBenar: string;
  feedbackSalah: string;
  gambar: string;
  audio: string;
  /* narasi feedback (opsional): diputar saat anak menjawab; kalau file tak ada,
     putarNarasi() otomatis jatuh ke TTS membacakan feedbackBenar/feedbackSalah */
  audioBenar?: string;
  audioSalah?: string;
}

export type HalamanCerita = HalamanNarasi | HalamanPertanyaan;

export interface BabCerita {
  id: string;
  judul: string;
  deskripsi: string;
  cover: string;
  syaratBuka: { selesaiBab: number } | null;
  halaman: HalamanCerita[];
}

export const BAB_LIST: BabCerita[] = [dataBab1 as unknown as BabCerita];

export function getBab(nomor: number): BabCerita | undefined {
  return BAB_LIST[nomor - 1];
}

export const POIN_PER_PERTANYAAN = 10; // konsisten dengan kuis: benar = 10 ⭐

/* Sub-mode sidebar (mockup MacBook Air - 2): hanya Petualangan dibangun (D3) */
export const SUB_MODE = [
  { id: "petualangan", judul: "Petualangan", emoji: "🗺️", aktif: true },
  { id: "mewarnai", judul: "Mewarnai", emoji: "🎨", aktif: false },
  { id: "belajar", judul: "Belajar", emoji: "📚", aktif: false },
  { id: "permainan", judul: "Permainan", emoji: "🎮", aktif: false },
] as const;

/* Emoji scene per halaman bab 1 — fallback sebelum ilustrasi P2 digenerate
   (daftar-gambar.md → stories/bab1/), di atas gradien hutan pastel. */
export const EMOJI_SCENE_BAB1: Record<number, string> = {
  1: "🐆🌤️",
  2: "🐆👋🐰",
  3: "🧺❔",
  4: "🐆🤔🐰",
  5: "🧺🍚🍗🍎",
  6: "🌳🐆🐰🍱",
  7: "🐆⚽🐰",
  8: "💦🐆❔",
  9: "🐆💧🌇",
  10: "🌅🐆🐰",
};
