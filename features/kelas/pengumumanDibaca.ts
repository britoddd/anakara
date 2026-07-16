/* Penanda pengumuman guru yang sudah "dibaca" (ditutup) siswa — per user,
   di localStorage. Dipakai PopupPengumuman supaya notifikasi tak muncul lagi
   setelah anak menekan tombol tutup, tapi pengumuman BARU tetap muncul di
   login berikutnya. Bukan data penting: gagal baca/tulis cukup diam (anggap
   belum ada yang dibaca). Peta per-user agar dua akun di satu perangkat tak
   saling menutup pengumuman. */

import type { Pengumuman } from "@/features/guru/api";

const KEY = "anakara-pengumuman-dibaca";
const MAKS = 200; // batasi jejak id supaya tak tumbuh tanpa henti

/** userId → id pengumuman yang sudah ditutup user tersebut */
type Peta = Record<string, string[]>;

function bacaPeta(): Peta {
  if (typeof window === "undefined") return {};
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Peta)
      : {};
  } catch {
    return {};
  }
}

function idDibaca(userId: string): string[] {
  const arr = bacaPeta()[userId];
  return Array.isArray(arr)
    ? arr.filter((x): x is string => typeof x === "string")
    : [];
}

/** Pengumuman yang belum pernah ditutup user ini (urutan asli dipertahankan). */
export function pengumumanBelumDibaca(
  userId: string,
  semua: Pengumuman[]
): Pengumuman[] {
  const dibaca = new Set(idDibaca(userId));
  return semua.filter((p) => !dibaca.has(p.id));
}

/** Tandai id-id pengumuman sebagai sudah dibaca (ditutup) oleh user ini. */
export function tandaiPengumumanDibaca(userId: string, ids: string[]) {
  if (ids.length === 0) return;
  try {
    const peta = bacaPeta();
    const gabung = new Set([...(peta[userId] ?? []), ...ids]);
    peta[userId] = [...gabung].slice(-MAKS);
    localStorage.setItem(KEY, JSON.stringify(peta));
  } catch {}
}
