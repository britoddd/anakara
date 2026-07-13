import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { tulisSinkronNanti } from "@/lib/tulis-offline";
import { hitungLevel, type UserProfile } from "@/features/auth/types";

/* Mode Tanpa Batas (level 10 tiap minigame berlevel) — papan rekor sendiri,
   terpisah dari leaderboard ⭐ poin. Satu dokumen per (game, siswa) berisi
   skor TERBAIK saja: id "gameId_uid" → tulis-ulang hanya saat rekor pecah,
   jadi tanpa riwayat & hemat kuota Firestore (koneksi sekolah lambat). */

export type GameEndless = "kuis" | "isi-piringku";

export interface RekorEndless {
  game: GameEndless;
  userId: string;
  nama: string;
  avatar: string | null;
  skor: number;
  /** epoch ms saat rekor dicapai — tie-break peringkat (lebih dulu = di atas) */
  dicapaiPada: number;
}

/** Simpan hasil sesi endless: poin ⭐ ke profil + perbarui rekor bila terpecahkan. */
export async function simpanHasilEndless(
  profil: UserProfile,
  game: GameEndless,
  skor: number,
  poinTambah: number
): Promise<{ pecahRekor: boolean; skorTerbaik: number }> {
  const db = getDb();
  await tulisSinkronNanti(() =>
    updateDoc(doc(db, "users", profil.userId), {
      poin: increment(poinTambah),
      level: hitungLevel(profil.poin + poinTambah), // D10: 150 ⭐/level
    })
  );

  const ref = doc(db, "rekorEndless", `${game}_${profil.userId}`);
  // getDoc offline membaca dari cache (persistence) — rekor lama tetap terbaca
  const snap = await getDoc(ref);
  const skorLama = snap.exists() ? (snap.data() as RekorEndless).skor : 0;
  if (skor > skorLama) {
    const rekor: RekorEndless = {
      game,
      userId: profil.userId,
      nama: profil.nama,
      avatar: profil.avatar,
      skor,
      dicapaiPada: Date.now(),
    };
    await tulisSinkronNanti(() => setDoc(ref, rekor));
    return { pecahRekor: skorLama > 0 || skor > 0, skorTerbaik: skor };
  }
  return { pecahRekor: false, skorTerbaik: skorLama };
}

/** Top 20 rekor sebuah game. Satu klausa where + sortir klien —
    konsisten dengan leaderboard Phase 8 (tanpa composite index). */
export async function ambilPeringkatEndless(
  game: GameEndless
): Promise<RekorEndless[]> {
  const snap = await getDocs(
    query(collection(getDb(), "rekorEndless"), where("game", "==", game), limit(300))
  );
  return snap.docs
    .map((d) => d.data() as RekorEndless)
    .sort((a, b) => b.skor - a.skor || a.dicapaiPada - b.dicapaiPada)
    .slice(0, 20);
}
