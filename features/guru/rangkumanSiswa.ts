import { SEMUA_SOAL } from "@/features/games/kuis/config";
import { KATEGORI_SOAL } from "./FormSoal";
import type { LogKuis } from "./api";

/* Rangkuman "AI-like" pemahaman siswa (dibaca guru di Kelola Kelas).
   DETERMINISTIK & on-device: kalimat dirakit dari riwayat jawaban Kuis
   (koleksi `logKuis`), dikelompokkan per materi (kategori soal). Tak memanggil
   layanan/LLM luar — gratis, jalan offline, dan hasilnya sama untuk data yang
   sama (mudah diuji). Nadanya menyesuaikan akurasi tiap materi + ketekunan. */

/** Peta pertanyaan → kategori dari soal bawaan — untuk log LAMA yang belum
    menyimpan `kategori` per soal. Soal buatan guru di log lama (tak ada di
    bank bawaan) tak terpetakan → hanya masuk hitungan keseluruhan. */
const KATEGORI_DARI_PERTANYAAN = new Map(
  SEMUA_SOAL.map((s) => [s.pertanyaan, s.kategori] as const)
);

const LABEL_KATEGORI: Record<string, string> = Object.fromEntries(
  KATEGORI_SOAL.map((k) => [k.id, k.label])
);

function labelMateri(id: string): string {
  return LABEL_KATEGORI[id] ?? id;
}

/** Minimal soal terjawab per materi agar akurasinya cukup bermakna disebut
    (menghindari klaim dari 1–2 soal saja). */
const MIN_SOAL_MATERI = 3;

export interface StatMateri {
  kategori: string;
  label: string;
  benar: number;
  total: number;
  /** akurasi 0..1 */
  akurasi: number;
}

export interface RangkumanSiswa {
  /** kalimat rangkuman siap tampil (satu paragraf ramah guru) */
  teks: string;
  /** jumlah percobaan level Kuis yang tercatat */
  percobaan: number;
  /** total soal terjawab (lintas percobaan) */
  totalSoal: number;
  /** total jawaban benar */
  totalBenar: number;
  /** akurasi keseluruhan 0..1 */
  akurasi: number;
  /** materi dengan cukup data, akurasi menurun (terkuat lebih dulu) */
  materi: StatMateri[];
  /** materi terkuat & terlemah (null bila data belum cukup) */
  terkuat: StatMateri | null;
  terlemah: StatMateri | null;
}

/** Frasa tingkat pemahaman dari akurasi 0..1 (ramah, tidak menghakimi). */
function frasaPemahaman(akurasi: number): string {
  if (akurasi >= 0.85) return "sudah sangat baik";
  if (akurasi >= 0.7) return "sudah cukup baik";
  if (akurasi >= 0.5) return "lumayan, tinggal diperkuat";
  return "masih perlu latihan";
}

/** Frasa ketekunan dari jumlah percobaan. */
function frasaRajin(percobaan: number): string {
  if (percobaan >= 5) return "rajin berlatih";
  if (percobaan >= 2) return "sudah mulai rajin berlatih";
  return "baru mulai berlatih";
}

/** Kalimat penutup penyemangat, dipilih dari akurasi keseluruhan. */
function penutupSemangat(akurasi: number): string {
  if (akurasi >= 0.85) return "Pertahankan, ya! 🌟";
  if (akurasi >= 0.6) return "Terus semangat! 💪";
  return "Semangat terus, pasti bisa! 🌱";
}

/** Susun satu paragraf ringkas: gambaran materi terkuat → materi yang perlu
    perhatian → ketekunan + penyemangat. Sengaja singkat & positif. */
function susunKalimat(
  nama: string,
  percobaan: number,
  totalBenar: number,
  totalSoal: number,
  akurasi: number,
  terkuat: StatMateri | null,
  terlemah: StatMateri | null
): string {
  const bagian: string[] = [];

  if (terkuat) {
    bagian.push(
      `Pemahaman ${nama} tentang ${terkuat.label} ${frasaPemahaman(terkuat.akurasi)} ` +
        `(${terkuat.benar} dari ${terkuat.total} soal benar).`
    );
  } else {
    // belum ada satu materi pun dengan cukup data — pakai gambaran keseluruhan
    bagian.push(
      `Secara keseluruhan pemahaman ${nama} ${frasaPemahaman(akurasi)} ` +
        `(${totalBenar} dari ${totalSoal} soal benar).`
    );
  }

  // materi yang paling perlu perhatian — hanya bila berbeda dari terkuat &
  // memang belum tuntas, supaya tidak mengada-ada saat semua materi bagus
  if (terlemah && terlemah.kategori !== terkuat?.kategori && terlemah.akurasi < 0.7) {
    bagian.push(
      `Untuk ${terlemah.label} ${frasaPemahaman(terlemah.akurasi)} — ` +
        `ajak ia berlatih materi ini lagi, ya.`
    );
  }

  bagian.push(
    `${nama} ${frasaRajin(percobaan)} (${percobaan} percobaan Kuis). ` +
      penutupSemangat(akurasi)
  );

  return bagian.join(" ");
}

/** Rakit rangkuman pemahaman seorang siswa dari riwayat Kuis-nya.
    null bila belum ada riwayat sama sekali (tak ada yang bisa dirangkum). */
export function rangkumSiswa(nama: string, log: LogKuis[]): RangkumanSiswa | null {
  if (log.length === 0) return null;

  const per = new Map<string, { benar: number; total: number }>();
  let totalBenar = 0;
  let totalSoal = 0;

  for (const l of log) {
    for (const d of l.detail) {
      totalSoal++;
      if (d.benar) totalBenar++;
      const kat = d.kategori ?? KATEGORI_DARI_PERTANYAAN.get(d.pertanyaan);
      if (!kat) continue; // soal guru di log lama — hanya masuk keseluruhan
      const agg = per.get(kat) ?? { benar: 0, total: 0 };
      agg.total++;
      if (d.benar) agg.benar++;
      per.set(kat, agg);
    }
  }

  const materi: StatMateri[] = [...per.entries()]
    .filter(([, v]) => v.total >= MIN_SOAL_MATERI)
    .map(([kategori, v]) => ({
      kategori,
      label: labelMateri(kategori),
      benar: v.benar,
      total: v.total,
      akurasi: v.total ? v.benar / v.total : 0,
    }))
    // akurasi menurun; seri → yang lebih banyak soalnya lebih "mapan" di atas
    .sort((a, b) => b.akurasi - a.akurasi || b.total - a.total);

  const akurasi = totalSoal ? totalBenar / totalSoal : 0;
  const terkuat = materi[0] ?? null;
  const terlemah = materi.length > 1 ? materi[materi.length - 1] : null;

  const teks = susunKalimat(
    nama,
    log.length,
    totalBenar,
    totalSoal,
    akurasi,
    terkuat,
    terlemah
  );

  return {
    teks,
    percobaan: log.length,
    totalSoal,
    totalBenar,
    akurasi,
    materi,
    terkuat,
    terlemah,
  };
}
