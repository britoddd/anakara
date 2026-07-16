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

/* Log jawaban Kuis (Phase 10+): satu entri per soal dalam sebuah percobaan
   level, disimpan ke koleksi `logKuis` agar guru bisa memantau jawaban
   benar/salah tiap siswa (self-contained — teks disimpan langsung supaya tak
   perlu join ke soal, yang bisa saja sudah dihapus/diedit guru). */
export interface LogSoalKuis {
  pertanyaan: string;
  benar: boolean;
  /** teks opsi yang dipilih siswa; "(waktu habis)" bila tak sempat menjawab */
  jawabanSiswa: string;
  /** teks opsi kunci (jawaban benar) */
  jawabanBenar: string;
}

const data = dataSoal as unknown as {
  soal: Soal[];
  aturanLevel: Record<string, AturanLevel>;
};

export const SEMUA_SOAL = data.soal;

/* Aturan level 1..N dibaca dinamis dari JSON (kunci "levelN"; "catatan"
   dilewati) — menambah level = menambah blok aturan + soal di data saja. */
export const ATURAN: Record<number, AturanLevel> = Object.fromEntries(
  Object.entries(data.aturanLevel)
    .filter(([kunci]) => /^level\d+$/.test(kunci))
    .map(([kunci, aturan]) => [Number(kunci.slice(5)), aturan])
);

/** Level biasa tertinggi. Level di atasnya = Mode Tanpa Batas (endless). */
export const LEVEL_MAKS = Math.max(...Object.keys(ATURAN).map(Number));
export const LEVEL_ENDLESS = LEVEL_MAKS + 1;

/* Mode Tanpa Batas (level 10): soal terus mengalir dari SEMUA level (urut
   naik = makin lama makin sulit), ❤️ 3 nyawa — salah/waktu habis = -1.
   Timer menyusut tiap beberapa jawaban benar supaya makin menantang. */
export const ENDLESS_KUIS = {
  nyawa: 3,
  poinPerBenar: 5, // lebih kecil dari mode biasa (10) — sesi endless tak terbatas
  timerMinDetik: 8,
  /** tiap N benar, durasi tiap soal berkurang 1 detik (sampai timerMinDetik) */
  benarPerPercepatan: 5,
} as const;

/** Durasi soal endless: menyusut seiring skor, tak lebih cepat dari batas min. */
export function durasiSoalEndless(durasiAsli: number, benarSejauhIni: number): number {
  return Math.max(
    ENDLESS_KUIS.timerMinDetik,
    durasiAsli - Math.floor(benarSejauhIni / ENDLESS_KUIS.benarPerPercepatan)
  );
}

export const JUMLAH_SOAL = 10;

/* Poin & bintang (konsisten dengan Isi Piringku: benar = 10 poin) */
export const POIN_PER_BENAR = 10;
export function hitungBintangKuis(level: number, benar: number): number {
  if (benar >= 9) return 3;
  if (benar >= 8) return 2;
  if (benar >= ATURAN[level].syaratLulus.minBenar) return 1;
  return 0;
}

export function acakSoal(soal: Soal[]): Soal[] {
  const acak = [...soal];
  for (let i = acak.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [acak[i], acak[j]] = [acak[j], acak[i]];
  }
  return acak;
}

export function soalUntukLevel(level: number, tambahan: Soal[] = []): Soal[] {
  // urutan soal diacak tiap sesi supaya tidak hafalan posisi;
  // `tambahan` = soal buatan guru kelas siswa (Phase 10, sumber:"guru")
  const soal = [...SEMUA_SOAL, ...tambahan].filter((s) => s.level === level);
  return acakSoal(soal).slice(0, JUMLAH_SOAL);
}

/** Antrean soal Mode Tanpa Batas: SEMUA soal (anakara + guru), diacak di
    dalam levelnya lalu diurutkan naik — mulai mudah, makin sulit. Saat
    antrean habis, panggil lagi untuk putaran baru. */
export function soalUntukEndless(tambahan: Soal[] = []): Soal[] {
  return acakSoal([...SEMUA_SOAL, ...tambahan]).sort((a, b) => a.level - b.level);
}
