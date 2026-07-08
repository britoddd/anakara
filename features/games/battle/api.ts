import { arrayUnion, doc, increment, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import { POIN_DUPLIKAT, POIN_PER_BENAR_BATTLE } from "./config";

/* Simpan hasil battle ke store progress terpusat users/{uid} (kontrak §6).
   Poin usaha (benar×5) untuk semua; pemenang menambah kartu gacha —
   duplikat otomatis jadi poin (+25 ⭐, keputusan D2). */

export interface HasilBattleSimpan {
  benar: number;
  /** id kartu hasil gacha; null = kalah (tidak dapat kotak) */
  kartuId: string | null;
}

export interface RingkasanSimpan {
  poinTambah: number;
  kartuBaru: boolean;
  duplikat: boolean;
}

export async function simpanHasilBattle(
  profil: UserProfile,
  hasil: HasilBattleSimpan
): Promise<RingkasanSimpan> {
  const duplikat =
    hasil.kartuId !== null && profil.koleksi.includes(hasil.kartuId);
  const kartuBaru = hasil.kartuId !== null && !duplikat;
  const poinTambah =
    hasil.benar * POIN_PER_BENAR_BATTLE + (duplikat ? POIN_DUPLIKAT : 0);

  const perubahan: Record<string, unknown> = {
    poin: increment(poinTambah),
    level: hitungLevel(profil.poin + poinTambah), // D10: 150 ⭐/level
  };
  if (kartuBaru) perubahan.koleksi = arrayUnion(hasil.kartuId);

  await updateDoc(doc(getDb(), "users", profil.userId), perubahan);
  return { poinTambah, kartuBaru, duplikat };
}
