import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { hitungLevel, type UserProfile } from "@/features/auth/types";

/* Leaderboard (Phase 8): ranking poin siswa, filter Kelasku / Semua.
   Query sengaja pakai satu klausa where saja + sortir di klien — menghindari
   kebutuhan composite index Firestore (skala sekolah: puluhan–ratusan siswa). */

export interface BarisPeringkat {
  userId: string;
  nama: string;
  avatar: string | null;
  level: number;
  poin: number;
}

export type CakupanPeringkat = "kelas" | "semua";

export async function ambilPeringkat(
  cakupan: CakupanPeringkat,
  kelasId: string | null
): Promise<BarisPeringkat[]> {
  const users = collection(getDb(), "users");
  const q =
    cakupan === "kelas" && kelasId
      ? query(users, where("kelasId", "==", kelasId), limit(300))
      : query(users, where("role", "==", "siswa"), limit(300));

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((p) => p.role === "siswa")
    .sort((a, b) => b.poin - a.poin || a.nama.localeCompare(b.nama))
    .slice(0, 50)
    .map((p) => ({
      userId: p.userId,
      nama: p.nama,
      avatar: p.avatar,
      level: hitungLevel(p.poin), // D10: turunan poin, bukan field tersimpan
      poin: p.poin,
    }));
}
