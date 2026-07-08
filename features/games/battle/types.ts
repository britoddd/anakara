/* Bentuk data Battle 2v2 di Realtime Database (Phase 6).
   Layout: battle/tim/{KODE}, battle/antrean/{KODE}, battle/ruang/{id}.
   Semua state pertandingan hidup di RTDB; hasil akhir (poin/kartu)
   disimpan ke Firestore users/{uid} lewat api.ts (kontrak §6). */

export interface AnggotaTim {
  nama: string;
  /** id avatar (features/auth/avatars) — bot memakai emoji langsung */
  avatar: string | null;
  /** true = pemain simulasi (D7/D8); di-drive oleh pembuat ruang */
  bot?: boolean;
}

export interface TimBattle {
  dibuat: number;
  /** kumpul = menunggu anggota; mencari = di antrean; main = sudah dapat ruang */
  status: "kumpul" | "mencari" | "main";
  /** uid ketua tim (pembuat) — yang menekan "Cari Lawan" & menjalankan matchmaking */
  ketua: string;
  anggota: Record<string, AnggotaTim>;
  /** diisi saat match ditemukan → semua anggota pindah ke arena */
  ruangId?: string;
}

export type WarnaTim = "biru" | "merah";

export interface TimDiRuang {
  kode: string;
  anggota: Record<string, AnggotaTim>;
}

export interface RuangBattle {
  dibuat: number;
  status: "main" | "selesai";
  /** uid pembuat ruang — satu-satunya klien yang mensimulasikan bot */
  pembuat: string;
  /** id soal (resolve ke data/soal-kuis.json di klien masing-masing) */
  soalIds: string[];
  tim: Record<WarnaTim, TimDiRuang>;
  /** jawaban[uid][indexSoal] = benar? — ditulis pemain masing-masing */
  jawaban?: Record<string, Record<string, boolean>>;
  /** selesai[uid] = timestamp saat pemain menuntaskan semua soal */
  selesai?: Record<string, number>;
}

/** Skor live satu tim (dihitung klien dari node jawaban) */
export interface SkorTim {
  benar: number;
  terjawab: number;
  totalSoal: number;
  semuaSelesai: boolean;
  /** timestamp anggota terakhir selesai (untuk tiebreak tercepat) */
  selesaiPada: number;
}
