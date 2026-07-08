import dataMakanan from "@/data/makanan.json";
import dataConfig from "@/data/isi-piringku.json";

/* Tipe & helper konfigurasi Isi Piringku (Phase 3, D1: 3 level).
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

/* Akar makanan.json = objek { keterangan, kelompok, makanan: [...] } —
   ambil field .makanan (pola sama dengan soal-kuis: data.soal). */
export const MAKANAN = (dataMakanan as unknown as { makanan: Makanan[] }).makanan;
export const LEVELS = dataConfig.levels as unknown as LevelConfig[];
export const POIN = dataConfig.poin as {
  benarPerItem: number;
  bonusRondeSempurna: number;
  salah: number;
};

/* Info tampilan 4 kelompok — label & fungsi gizi sesuai mockup MacBook Air - 3
   (Isi Piringku Kemenkes). Warna pastel = dekoratif, teks tetap pakai token. */
export const KELOMPOK_INFO: Record<
  Kelompok,
  { label: string; fungsi: string; emoji: string; bgKuadran: string }
> = {
  pokok: { label: "Makanan Pokok", fungsi: "Sumber Tenaga", emoji: "🍚", bgKuadran: "bg-[#FFF3D6] dark:bg-[#4a3d20]" },
  lauk: { label: "Lauk-Pauk", fungsi: "Sumber Protein", emoji: "🍗", bgKuadran: "bg-[#FFE4D6] dark:bg-[#4a2f20]" },
  sayur: { label: "Sayuran", fungsi: "Vitamin & Serat", emoji: "🥦", bgKuadran: "bg-[#E2F5D9] dark:bg-[#2c4a20]" },
  buah: { label: "Buah-buahan", fungsi: "Vitamin & Segar", emoji: "🍎", bgKuadran: "bg-[#FFDDE4] dark:bg-[#4a2029]" },
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
