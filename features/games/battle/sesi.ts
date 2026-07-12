/* Sesi battle tersimpan di localStorage — bekal tombol "Lanjutkan" bila
   pemain keluar tak sengaja (tutup tab / refresh) di tengah pertandingan.
   Disimpan saat masuk arena, dihapus saat battle selesai. */

const KUNCI_SESI = "anakara.battle.sesi";

export interface SesiBattle {
  uid: string;
  ruangId: string;
  kodeTim: string;
}

export function simpanSesiBattle(sesi: SesiBattle): void {
  try {
    localStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
  } catch {
    // localStorage bisa gagal (mode privat/penuh) — hanya fitur lanjut yang hilang
  }
}

/** Sesi milik uid ini, atau null bila tak ada / milik akun lain / rusak. */
export function ambilSesiBattle(uid: string): SesiBattle | null {
  try {
    const mentah = localStorage.getItem(KUNCI_SESI);
    if (!mentah) return null;
    const sesi = JSON.parse(mentah) as Partial<SesiBattle>;
    if (sesi.uid !== uid || !sesi.ruangId || !sesi.kodeTim) return null;
    return sesi as SesiBattle;
  } catch {
    return null;
  }
}

export function hapusSesiBattle(): void {
  try {
    localStorage.removeItem(KUNCI_SESI);
  } catch {
    // abaikan
  }
}
