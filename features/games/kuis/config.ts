import dataSoal from "@/data/soal-kuis.json";

/* Kuis Asik (Phase 5). Skema soal = kontrak §6 — identik dengan soal buatan
   guru (Phase 10, sumber:"guru"); Phase 10 tinggal menggabungkan sumber soal. */

export interface Soal {
  id: string;
  level: number;
  kategori: string;
  pertanyaan: string;
  opsi: string[];
  opsiEmoji?: string[];
  kunciIndex: number;
  durasiDetik: number;
  sumber: "anakara" | "guru";
}

export interface AturanLevel {
  syaratBuka: { lulusLevel: number } | null;
  syaratLulus: { minBenar: number };
}

const data = dataSoal as unknown as {
  soal: Soal[];
  aturanLevel: Record<string, AturanLevel>;
};

export const SEMUA_SOAL = data.soal;

export const ATURAN: Record<number, AturanLevel> = {
  1: data.aturanLevel.level1,
  2: data.aturanLevel.level2,
  3: data.aturanLevel.level3,
};

export const JUMLAH_SOAL = 10;

/* Poin & bintang (konsisten dengan Isi Piringku: benar = 10 poin) */
export const POIN_PER_BENAR = 10;
export function hitungBintangKuis(level: number, benar: number): number {
  if (benar >= 9) return 3;
  if (benar >= 8) return 2;
  if (benar >= ATURAN[level].syaratLulus.minBenar) return 1;
  return 0;
}

export function soalUntukLevel(level: number, tambahan: Soal[] = []): Soal[] {
  // urutan soal diacak tiap sesi supaya tidak hafalan posisi;
  // `tambahan` = soal buatan guru kelas siswa (Phase 10, sumber:"guru")
  const soal = [...SEMUA_SOAL, ...tambahan].filter((s) => s.level === level);
  const acak = [...soal];
  for (let i = acak.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [acak[i], acak[j]] = [acak[j], acak[i]];
  }
  return acak.slice(0, JUMLAH_SOAL);
}
