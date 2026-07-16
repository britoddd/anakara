import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { tulisSinkronNanti } from "@/lib/tulis-offline";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import { LEVEL_ENDLESS, type LogSoalKuis, type Soal } from "./config";

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

  await tulisSinkronNanti(() =>
    updateDoc(doc(getDb(), "users", profil.userId), {
      poin: increment(hasil.poinTambah),
      level: hitungLevel(profil.poin + hasil.poinTambah), // D10: 150 ⭐/level
      "progress.kuis.levelTerbuka": terbukaBaru,
    })
  );
}

/* Catat satu percobaan level (biasa, 1..9) ke koleksi `logKuis` — riwayat
   jawaban benar/salah per soal yang dibaca guru di Kelola Kelas. Dipanggil
   fire-and-forget saat level selesai; siswa tanpa kelas tak dicatat (tak ada
   guru yang memantau). Kegagalan diabaikan pemanggil supaya layar hasil tak
   macet saat koneksi sekolah lambat (bandingkan simpanHasilKuis). */
export async function catatLogKuis(
  profil: UserProfile,
  level: number,
  detail: LogSoalKuis[]
): Promise<void> {
  if (!profil.kelasId) return;
  const ref = doc(collection(getDb(), "logKuis"));
  await setDoc(ref, {
    userId: profil.userId,
    kelasId: profil.kelasId,
    level,
    benar: detail.filter((d) => d.benar).length,
    total: detail.length,
    detail,
    dibuat: serverTimestamp(),
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
