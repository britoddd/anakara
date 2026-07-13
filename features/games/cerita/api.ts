import { doc, increment, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { tulisSinkronNanti } from "@/lib/tulis-offline";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import { BAB_LIST } from "./config";

/* Simpan hasil cerita ke store progress terpusat users/{uid} (kontrak §6).
   Selesai bab N → buka bab N+1 (dibatasi jumlah bab + 1 supaya siap saat
   bab baru ditambahkan ke BAB_LIST). */
export async function simpanHasilCerita(
  profil: UserProfile,
  hasil: { bab: number; poinTambah: number }
): Promise<void> {
  const terbukaSekarang = profil.progress.cerita.babTerbuka;
  const terbukaBaru = Math.max(
    terbukaSekarang,
    Math.min(hasil.bab + 1, BAB_LIST.length + 1)
  );

  await tulisSinkronNanti(() =>
    updateDoc(doc(getDb(), "users", profil.userId), {
      poin: increment(hasil.poinTambah),
      level: hitungLevel(profil.poin + hasil.poinTambah), // D10: 150 ⭐/level
      "progress.cerita.babTerbuka": terbukaBaru,
    })
  );
}
