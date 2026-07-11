/* Riwayat game yang dimainkan (per perangkat, localStorage) — dipakai Home
   untuk kartu unggulan "Main lagi ▶" dan badge "Baru!". Bukan data penting:
   gagal baca/tulis cukup diam-diam kembali ke default. */

const KEY = "anakara-riwayat-main";
const MAKS = 10;

/** id game terurut dari yang terakhir dimainkan; [] di server / saat gagal */
export function bacaRiwayat(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** catat game dibuka — id pindah ke urutan terdepan */
export function catatMain(id: string) {
  try {
    const baru = [id, ...bacaRiwayat().filter((x) => x !== id)].slice(0, MAKS);
    localStorage.setItem(KEY, JSON.stringify(baru));
  } catch {}
}
