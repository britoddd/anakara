import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import { ambilPengumuman, type Pengumuman } from "@/features/guru/api";

/* Halaman Kelasku: info kelas milik siswa — wali kelas + daftar teman sekelas.
   Rules sudah mengizinkan: users & kelas terbaca semua user login (Phase 8/10).
   Query sengaja satu klausa where + sortir di klien (tanpa composite index). */

export interface TemanKelas {
  userId: string;
  nama: string;
  avatar: string | null;
  level: number;
  poin: number;
  /** kemajuan per game — sudah ikut terbaca dari profil, dipakai detail teman */
  progress: UserProfile["progress"];
  /** id kartu koleksi yang dimiliki — untuk lihat album kartu teman */
  koleksi: string[];
}

/* Default kalau profil lama belum punya field ini (dibuat sebelum Phase 8/9) —
   tampil sebagai pemain baru, bukan bikin detail teman error. */
const PROGRESS_DEFAULT: UserProfile["progress"] = {
  kuis: { levelTerbuka: 1 },
  cerita: { babTerbuka: 1 },
  isiPiringku: { levelTerbuka: 1 },
};

export interface InfoKelas {
  kode: string;
  namaKelas: string;
  /** nama pengajar kelas dari users/{uid}, wali kelas (pemilik) di urutan
      pertama; kosong bila tak ada profil guru yang ditemukan */
  guru: string[];
  /** teman sekelas (termasuk diri sendiri), urut abjad — ranking urusan Leaderboard */
  teman: TemanKelas[];
  /** pengumuman dari guru (Teacher Dashboard), terbaru di atas */
  pengumuman: Pengumuman[];
}

export async function ambilInfoKelas(kode: string): Promise<InfoKelas | null> {
  const db = getDb();
  const kelasSnap = await getDoc(doc(db, "kelas", kode));
  if (!kelasSnap.exists()) return null;
  const { nama, guruId, guruIds } = kelasSnap.data() as {
    nama?: string;
    guruId?: string;
    guruIds?: string[];
  };
  // Dokumen lama (tanpa guruIds) → [guruId]. Wali kelas (pemilik) di depan.
  const idGuru = guruIds ?? (guruId ? [guruId] : []);
  const idUrut = [...idGuru].sort((a, b) => (a === guruId ? -1 : b === guruId ? 1 : 0));

  const [guruSnaps, siswaSnap, pengumuman] = await Promise.all([
    Promise.all(idUrut.map((id) => getDoc(doc(db, "users", id)))),
    getDocs(query(collection(db, "users"), where("kelasId", "==", kode), limit(300))),
    ambilPengumuman(kode),
  ]);

  const teman = siswaSnap.docs
    .map((d) => d.data() as UserProfile)
    .filter((p) => p.role === "siswa")
    .sort((a, b) => a.nama.localeCompare(b.nama))
    .map((p) => ({
      userId: p.userId,
      nama: p.nama,
      avatar: p.avatar,
      level: hitungLevel(p.poin), // D10: turunan poin, bukan field tersimpan
      poin: p.poin,
      progress: p.progress ?? PROGRESS_DEFAULT,
      koleksi: p.koleksi ?? [],
    }));

  return {
    kode,
    namaKelas: nama ?? kode,
    guru: guruSnaps
      .filter((s) => s.exists())
      .map((s) => (s.data() as UserProfile).nama),
    teman,
    pengumuman,
  };
}

/* ---------- statistik kelas (turunan murni dari daftar teman) ---------- */

export interface StatKelas {
  jumlahSiswa: number;
  totalPoin: number;
  rataLevel: number;
  /** teman dengan poin tertinggi; null bila kelas kosong */
  bintang: TemanKelas | null;
}

export function hitungStatKelas(teman: TemanKelas[]): StatKelas {
  const totalPoin = teman.reduce((t, s) => t + s.poin, 0);
  const bintang = teman.reduce<TemanKelas | null>(
    (juara, s) => (juara === null || s.poin > juara.poin ? s : juara),
    null
  );
  return {
    jumlahSiswa: teman.length,
    totalPoin,
    rataLevel: teman.length === 0 ? 0 : hitungLevel(totalPoin / teman.length),
    bintang,
  };
}
