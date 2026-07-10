/* Kontrak profil user (FOUNDATION §6 "Progress siswa" — store terpusat).
   Dipakai lintas phase — jangan diubah sepihak. */

export type Role = "siswa" | "guru";

export interface UserProfile {
  userId: string;
  role: Role;
  /** Nama tampilan (username) pilihan siswa. Default: nama depan akun Google
      saat onboarding; bisa diubah di /onboarding/avatar & /profil. Bukan nama
      lengkap Google — inilah yang tampil di Home & Leaderboard. */
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

/* Nama tampilan (username) — dipilih siswa saat onboarding, bisa diubah di
   /profil. Ramah anak SD kelas 1-2: pendek, huruf/angka/spasi saja. */
export const NAMA_MIN = 2;
export const NAMA_MAKS = 16;

/** Rapikan input nama: satukan spasi rangkap + buang spasi tepi. */
export function rapikanNama(nama: string): string {
  return nama.replace(/\s+/g, " ").trim();
}

/** Validasi nama tampilan; null = valid, selain itu pesan galat ramah-anak. */
export function galatNama(nama: string): string | null {
  const rapi = rapikanNama(nama);
  if (rapi.length < NAMA_MIN) return `Nama minimal ${NAMA_MIN} huruf, ya!`;
  if (rapi.length > NAMA_MAKS) return `Nama maksimal ${NAMA_MAKS} huruf, ya!`;
  if (!/^[\p{L}\p{N} ]+$/u.test(rapi)) return "Pakai huruf dan angka saja, ya!";
  return null;
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
