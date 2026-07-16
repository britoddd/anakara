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
import {
  LEVEL_ENDLESS,
  POIN_PER_BENAR_HARIAN,
  bonusBeruntun,
  tanggalKemarin,
  type KuisHarian,
  type LogSoalKuis,
  type Soal,
} from "./config";

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

/* Ambil status Tantangan Harian siswa (dokumen kuisHarian/{uid}). null =
   belum pernah main ATAU gagal baca — dua-duanya diperlakukan "belum selesai
   hari ini" oleh pemanggil, jadi tantangan tetap bisa dimainkan saat offline. */
export async function ambilStatusHarian(userId: string): Promise<KuisHarian | null> {
  try {
    const snap = await getDoc(doc(getDb(), "kuisHarian", userId));
    return snap.exists() ? (snap.data() as KuisHarian) : null;
  } catch {
    return null;
  }
}

/* Simpan hasil Tantangan Harian: catat penyelesaian + beruntun ke
   kuisHarian/{uid}, lalu tambah poin ⭐ ke profil. IDEMPOTEN untuk hari yang
   sama — bila sudah tercatat hari ini, poin & beruntun tak ditambah lagi
   (anti main berulang untuk poin). Dokumen harian ditulis LEBIH DULU (gerbang
   anti-ulang); bila penambahan poin gagal setelahnya, tantangan tetap terkunci
   hari ini — lebih baik daripada poin ganda. */
export async function simpanHasilHarian(
  profil: UserProfile,
  benar: number,
  tanggal: string
): Promise<{
  beruntun: number;
  beruntunTerbaik: number;
  poinTambah: number;
  sudahHariIni: boolean;
}> {
  const db = getDb();
  const ref = doc(db, "kuisHarian", profil.userId);
  const snap = await getDoc(ref);
  const lama = snap.exists() ? (snap.data() as KuisHarian) : null;

  if (lama && lama.tanggalTerakhir === tanggal) {
    return {
      beruntun: lama.beruntun,
      beruntunTerbaik: lama.beruntunTerbaik,
      poinTambah: 0,
      sudahHariIni: true,
    };
  }

  const beruntun =
    lama && lama.tanggalTerakhir === tanggalKemarin(tanggal) ? lama.beruntun + 1 : 1;
  const beruntunTerbaik = Math.max(beruntun, lama?.beruntunTerbaik ?? 0);
  const poinTambah = benar * POIN_PER_BENAR_HARIAN + bonusBeruntun(beruntun);

  const data: KuisHarian = {
    userId: profil.userId,
    tanggalTerakhir: tanggal,
    beruntun,
    beruntunTerbaik,
    totalSelesai: (lama?.totalSelesai ?? 0) + 1,
    benarTerakhir: benar,
  };
  await setDoc(ref, { ...data, diperbarui: serverTimestamp() });
  await updateDoc(doc(db, "users", profil.userId), {
    poin: increment(poinTambah),
    level: hitungLevel(profil.poin + poinTambah), // D10: 150 ⭐/level
  });

  return { beruntun, beruntunTerbaik, poinTambah, sudahHariIni: false };
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
