import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import { LEVEL_ENDLESS, type Soal } from "./config";

/* Simpan hasil kuis ke store progress terpusat users/{uid} (kontrak §6 / Phase 9). */
export async function simpanHasilKuis(
  profil: UserProfile,
  hasil: { level: number; lulus: boolean; poinTambah: number }
): Promise<void> {
  const terbukaSekarang = profil.progress.kuis.levelTerbuka;
  // lulus level 9 → terbuka 10 = Mode Tanpa Batas (level pamungkas)
  const terbukaBaru =
    hasil.lulus && hasil.level === terbukaSekarang
      ? Math.min(terbukaSekarang + 1, LEVEL_ENDLESS)
      : terbukaSekarang;

  await updateDoc(doc(getDb(), "users", profil.userId), {
    poin: increment(hasil.poinTambah),
    level: hitungLevel(profil.poin + hasil.poinTambah), // D10: 150 ⭐/level
    "progress.kuis.levelTerbuka": terbukaBaru,
  });
}

/* Soal buatan guru kelas siswa (Phase 10, D11: khusus Kuis) — digabung ke
   pool soal anakara. Gagal/kelas tanpa guru → [] (kuis tetap jalan). */
export async function ambilSoalGuruKelas(kelasId: string | null): Promise<Soal[]> {
  if (!kelasId) return [];
  const db = getDb();
  const kelasSnap = await getDoc(doc(db, "kelas", kelasId));
  const guruId = kelasSnap.exists()
    ? (kelasSnap.data() as { guruId?: string }).guruId
    : undefined;
  if (!guruId) return [];
  const snap = await getDocs(
    query(collection(db, "soalGuru"), where("guruId", "==", guruId), limit(200))
  );
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Soal, "id">), id: d.id }));
}
