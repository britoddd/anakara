import dataMakanan from "@/data/makanan.json";
import dataConfig from "@/data/isi-piringku.json";

/* Tipe & helper konfigurasi Isi Piringku (Phase 3, D1: berlevel — kini
   level 1-9 + level 10 Mode Tanpa Batas).
   Sumber data: data/makanan.json + data/isi-piringku.json (kontrak §6). */

export type Kelompok = "pokok" | "lauk" | "sayur" | "buah";

export interface Makanan {
  id: string;
  nama: string;
  emoji: string;
  gambar: string;
  kelompok: Kelompok;
  fungsiGizi: string;
  fakta: string;
  level: number;
}

export interface LevelConfig {
  level: number;
  nama: string;
  itemPerRonde: number;
  jumlahRonde: number;
  timerDetik: number | null;
  syaratBuka: { selesaiLevel: number } | null;
  syaratLulus: { minBenarPersen: number };
  bintang: Record<string, number>;
}

/** Config Mode Tanpa Batas (level 10) — blok "endless" di isi-piringku.json. */
export interface EndlessIPConfig {
  level: number;
  nama: string;
  itemPerRonde: number;
  timerAwalDetik: number;
  timerMinDetik: number;
  timerKurangPerRonde: number;
  nyawa: number;
  poinPerBenar: number;
  syaratBuka: { selesaiLevel: number };
}

/* Akar makanan.json = objek { keterangan, kelompok, makanan: [...] } —
   ambil field .makanan (pola sama dengan soal-kuis: data.soal). */
export const MAKANAN = (dataMakanan as unknown as { makanan: Makanan[] }).makanan;
export const LEVELS = dataConfig.levels as unknown as LevelConfig[];
export const ENDLESS_IP = dataConfig.endless as unknown as EndlessIPConfig;
/** Level biasa tertinggi (9); Mode Tanpa Batas = level di atasnya (10). */
export const LEVEL_MAKS_IP = LEVELS[LEVELS.length - 1].level;
export const POIN = dataConfig.poin as {
  benarPerItem: number;
  bonusRondeSempurna: number;
  salah: number;
};

/** Timer ronde endless: menyusut tiap ronde, tak lebih cepat dari batas min. */
export function timerRondeEndless(ronde: number): number {
  return Math.max(
    ENDLESS_IP.timerMinDetik,
    ENDLESS_IP.timerAwalDetik - (ronde - 1) * ENDLESS_IP.timerKurangPerRonde
  );
}

/* Info tampilan 4 kelompok — label & fungsi gizi sesuai mockup MacBook Air - 3
   (Isi Piringku Kemenkes). Warna pastel = dekoratif, teks tetap pakai token.
   Latar kuadran pakai token --kuadran-* (diremap per tema di globals.css) —
   BUKAN varian dark: Tailwind, yang mengikuti preferensi OS bukan toggle
   aplikasi (catatan-restyle-thynk §C: "sudah pernah kejadian"). */
export const KELOMPOK_INFO: Record<
  Kelompok,
  { label: string; fungsi: string; emoji: string; bgKuadran: string }
> = {
  pokok: { label: "Makanan Pokok", fungsi: "Sumber Tenaga", emoji: "🍚", bgKuadran: "bg-[var(--kuadran-pokok)]" },
  lauk: { label: "Lauk-Pauk", fungsi: "Sumber Protein", emoji: "🍗", bgKuadran: "bg-[var(--kuadran-lauk)]" },
  sayur: { label: "Sayuran", fungsi: "Vitamin & Serat", emoji: "🥦", bgKuadran: "bg-[var(--kuadran-sayur)]" },
  buah: { label: "Buah-buahan", fungsi: "Vitamin & Segar", emoji: "🍎", bgKuadran: "bg-[var(--kuadran-buah)]" },
};

export const URUTAN_KELOMPOK: Kelompok[] = ["pokok", "lauk", "sayur", "buah"];

/** Pool makanan sebuah level = semua item ber-level ≤ level tsb (aturan config). */
export function poolLevel(level: number): Makanan[] {
  return MAKANAN.filter((m) => m.level <= level);
}

export function acak<T>(arr: T[]): T[] {
  const hasil = [...arr];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

/** Jumlah bintang (0–3) dari persen benar, sesuai ambang config level. */
export function hitungBintang(cfg: LevelConfig, persen: number): number {
  for (const b of [3, 2, 1]) {
    if (persen >= cfg.bintang[String(b)]) return b;
  }
  return 0;
}
