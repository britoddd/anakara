import { doc, updateDoc, increment } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { hitungLevel, type UserProfile } from "@/features/auth/types";

/* Simpan hasil sesi ke store progress terpusat users/{uid} (kontrak §6 / Phase 9). */
export async function simpanHasilIsiPiringku(
  profil: UserProfile,
  hasil: { level: number; lulus: boolean; poinTambah: number }
): Promise<void> {
  const terbukaSekarang = profil.progress.isiPiringku.levelTerbuka;
  const terbukaBaru =
    hasil.lulus && hasil.level === terbukaSekarang
      ? Math.min(terbukaSekarang + 1, 3)
      : terbukaSekarang;

  await updateDoc(doc(getDb(), "users", profil.userId), {
    poin: increment(hasil.poinTambah),
    level: hitungLevel(profil.poin + hasil.poinTambah), // D10: 150 ⭐/level
    "progress.isiPiringku.levelTerbuka": terbukaBaru,
  });
}
