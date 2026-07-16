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

/* ============================================================================
   Tantangan Harian (daily challenge) — bagian Kuis yang berganti tiap hari &
   kesulitannya menyesuaikan progres tiap anak. Set soalnya DETERMINISTIK per
   (tanggal, anak, level): sama sepanjang hari, ganti otomatis tengah malam,
   dan tidak menyentuh syarat-lulus/levelTerbuka — murni latihan harian + poin.
   ========================================================================== */

/** Soal per tantangan harian — ringkas (sekali sehari), bukan 10 seperti level. */
export const JUMLAH_SOAL_HARIAN = 5;

/** Poin per jawaban benar di tantangan harian (setara level biasa). */
export const POIN_PER_BENAR_HARIAN = 10;

/** Bonus poin penjaga "beruntun" (streak) — makin panjang makin besar, dibatasi
    agar sehari tantangan tak jauh melampaui satu level biasa (maks +25). */
export function bonusBeruntun(beruntun: number): number {
  return Math.min(Math.max(0, beruntun), 5) * 5; // 0..25
}

/** Status Tantangan Harian seorang siswa (dokumen `kuisHarian/{uid}`). */
export interface KuisHarian {
  userId: string;
  /** tanggal terakhir menyelesaikan tantangan — "YYYY-MM-DD" (waktu lokal) */
  tanggalTerakhir: string;
  /** jumlah hari berturut-turut menyelesaikan tantangan */
  beruntun: number;
  /** beruntun terpanjang yang pernah dicapai */
  beruntunTerbaik: number;
  /** total tantangan harian yang pernah diselesaikan */
  totalSelesai: number;
  /** jumlah benar tantangan terakhir (untuk tampilan) */
  benarTerakhir: number;
}

/** Tanggal lokal "YYYY-MM-DD" — kunci harian; berganti tengah malam waktu anak. */
export function tanggalHariIni(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const t = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${t}`;
}

/** Tanggal kemarin (format sama) — untuk mengecek beruntun masih nyambung. */
export function tanggalKemarin(hariIni: string): string {
  const [y, m, t] = hariIni.split("-").map(Number);
  return tanggalHariIni(new Date(y, m - 1, t - 1));
}

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** Tanggal ramah-baca Indonesia, mis. "Kamis, 16 Juli". */
export function tanggalRamah(hariIni: string): string {
  const [y, m, t] = hariIni.split("-").map(Number);
  const d = new Date(y, m - 1, t);
  return `${NAMA_HARI[d.getDay()]}, ${t} ${NAMA_BULAN[m - 1]}`;
}

/** Level kesulitan soal yang cocok untuk siswa: mengikuti progres Kuis-nya
    (levelTerbuka), dibatasi 1..LEVEL_MAKS. Naik level → tantangan besok naik. */
export function levelKesulitanAnak(levelTerbuka: number): number {
  return Math.min(Math.max(1, levelTerbuka), LEVEL_MAKS);
}

/** Label kesulitan ramah-anak dari level soal. */
export function labelKesulitan(lv: number): string {
  if (lv <= 3) return "Mudah";
  if (lv <= 6) return "Sedang";
  return "Seru";
}

/* RNG deterministik: hash string (FNV-1a) → benih generator mulberry32, supaya
   set soal harian SAMA sepanjang hari tapi beda tiap tanggal & tiap anak. */
function benihDariString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function acakDenganRng<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Susun soal Tantangan Harian: deterministik per (tanggal, anak, level), campur
    beberapa level di sekitar level anak supaya adaptif — 1 pemanasan (level di
    bawah), inti di levelnya, 1 tantangan (level di atas). `tambahan` = soal guru
    kelas. Selalu mengembalikan JUMLAH_SOAL_HARIAN soal (di-backfill bila kurang). */
export function soalHarian(
  levelAnak: number,
  tanggal: string,
  userId: string,
  tambahan: Soal[] = []
): Soal[] {
  const lv = levelKesulitanAnak(levelAnak);
  const rng = mulberry32(benihDariString(`${tanggal}|${userId}|${lv}`));
  const semua = [...SEMUA_SOAL, ...tambahan];
  const dariLevel = (n: number) => acakDenganRng(semua.filter((s) => s.level === n), rng);

  const bawah = Math.max(1, lv - 1);
  const atas = Math.min(LEVEL_MAKS, lv + 1);
  const rencana: Array<[number, number]> = [
    [bawah, 1],
    [lv, JUMLAH_SOAL_HARIAN - 2],
    [atas, 1],
  ];

  const dipilih: Soal[] = [];
  const terpakai = new Set<string>();
  const ambil = (kandidat: Soal[], jml: number) => {
    for (const s of kandidat) {
      if (jml <= 0 || dipilih.length >= JUMLAH_SOAL_HARIAN) break;
      if (terpakai.has(s.id)) continue;
      dipilih.push(s);
      terpakai.add(s.id);
      jml--;
    }
  };
  for (const [n, jml] of rencana) ambil(dariLevel(n), jml);

  // backfill kalau ada band yang kurang soal — dari seluruh rentang bawah..atas
  if (dipilih.length < JUMLAH_SOAL_HARIAN) {
    ambil(
      acakDenganRng(semua.filter((s) => s.level >= bawah && s.level <= atas), rng),
      JUMLAH_SOAL_HARIAN - dipilih.length
    );
  }
  // acak urutan akhir supaya posisi pemanasan/tantangan tak selalu di tempat sama
  return acakDenganRng(dipilih, rng);
}
