/* Utilitas tanggal lokal ramah-anak, dipakai Tantangan Harian (Kuis) & badge
   beruntun di Home. Dipisah dari features/games/kuis/config supaya Home bisa
   memakainya tanpa ikut memuat bank soal (kuota internet sekolah). */

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

/** Apakah beruntun masih "hidup" (bisa dilanjutkan): tanggal terakhir = hari
    ini atau kemarin. Lebih tua dari itu = beruntun sudah putus. */
export function beruntunMasihHidup(tanggalTerakhir: string, hariIni = tanggalHariIni()): boolean {
  return tanggalTerakhir === hariIni || tanggalTerakhir === tanggalKemarin(hariIni);
}
