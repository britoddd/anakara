/* Kontrak profil user (FOUNDATION §6 "Progress siswa" — store terpusat).
   Dipakai lintas phase — jangan diubah sepihak. */

export type Role = "siswa" | "guru";

export interface UserProfile {
  userId: string;
  role: Role;
  /** Nama depan dari akun Google — hanya untuk sapaan, bukan identitas publik */
  nama: string;
  /** id avatar kartun pilihan siswa (privasi: bukan foto Google); null = belum pilih */
  avatar: string | null;
  level: number;
  poin: number;
  progress: {
    kuis: { levelTerbuka: number };
    cerita: { babTerbuka: number };
    isiPiringku: { levelTerbuka: number };
  };
  /** id kartu koleksi yang dimiliki */
  koleksi: string[];
  /** kode kelas yang diikuti; null = belum join (siswa wajib join saat onboarding, D5) */
  kelasId: string | null;
  /** id video yang di-like (Phase 4) — opsional, terisi saat pertama like */
  likesVideo?: string[];
}

/* Level siswa (Phase 9, keputusan D10): turunan langsung dari total poin —
   naik 1 level tiap 150 ⭐. Tampilan SELALU pakai hitungLevel(poin); field
   `level` di Firestore ikut diperbarui tiap game menyimpan poin supaya data
   tersimpan tetap konsisten dengan yang tampil. */
export const POIN_PER_LEVEL = 150;

export function hitungLevel(poin: number): number {
  return 1 + Math.floor(Math.max(0, poin) / POIN_PER_LEVEL);
}

/** ⭐ yang masih perlu dikumpulkan menuju level berikutnya */
export function poinMenujuLevelBerikut(poin: number): number {
  return POIN_PER_LEVEL - (Math.max(0, poin) % POIN_PER_LEVEL);
}

export function buatProfilBaru(
  userId: string,
  role: Role,
  nama: string
): UserProfile {
  return {
    userId,
    role,
    nama,
    avatar: null,
    level: 1,
    poin: 0,
    progress: {
      kuis: { levelTerbuka: 1 },
      cerita: { babTerbuka: 1 },
      isiPiringku: { levelTerbuka: 1 },
    },
    koleksi: [],
    kelasId: null,
  };
}
