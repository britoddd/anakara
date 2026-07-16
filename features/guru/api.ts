import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { UserProfile } from "@/features/auth/types";
import type { LogSoalKuis, Soal } from "@/features/games/kuis/config";

/* API Teacher Dashboard (Phase 10).
   - kelas/{KODE}: { nama, guruId, guruIds, dibuat } — kode 5 huruf à la Kahoot.
     guruId = pemilik/pembuat (boleh hapus & kelola roster); guruIds = SEMUA
     pengajar (termasuk pemilik). Satu kelas bisa punya lebih dari satu guru:
     guru lain "gabung" dengan kode kelas (mirror join siswa). Dokumen lama
     tanpa guruIds diperlakukan sebagai [guruId] saat dibaca.
   - soalGuru/{id}: skema soal §6 + guruId (D11: dipakai fitur Kuis saja dulu).
   Query sengaja satu klausa where + sortir klien (tanpa composite index). */

export interface KelasGuru {
  kode: string;
  nama: string;
  /** pemilik/pembuat kelas — satu-satunya yang boleh hapus & kelola roster */
  guruId: string;
  /** semua pengajar kelas (termasuk pemilik) */
  guruIds: string[];
}

/** Satu pengajar dalam roster kelas (dipakai panel "Pengajar Kelas"). */
export interface PengajarKelas {
  userId: string;
  nama: string;
  /** true bila pemilik/pembuat kelas (guruId) */
  pemilik: boolean;
}

export interface SoalGuru extends Omit<Soal, "id"> {
  id: string; // = id dokumen Firestore
  guruId: string;
}

/** Data yang diisi form soal (id & metadata ditambahkan saat simpan) */
export type SoalGuruInput = Omit<SoalGuru, "id" | "guruId" | "sumber">;

const KARAKTER_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa I/O/0/1

/* ---------- kelas ---------- */

/** Baca dokumen kelas → KelasGuru, dengan fallback dokumen lama (tanpa guruIds
    → diperlakukan sebagai [guruId]). Satu sumber parsing untuk semua query. */
function bacaKelas(d: QueryDocumentSnapshot | { id: string; data: () => DocumentData }): KelasGuru {
  const data = d.data() as { nama?: string; guruId?: string; guruIds?: string[] };
  const guruId = data.guruId ?? "";
  return {
    kode: d.id,
    nama: data.nama ?? d.id,
    guruId,
    guruIds: data.guruIds ?? (guruId ? [guruId] : []),
  };
}

export async function buatKelas(guruId: string, nama: string): Promise<string> {
  const db = getDb();
  for (let percobaan = 0; percobaan < 5; percobaan++) {
    let kode = "";
    for (let i = 0; i < 5; i++) {
      kode += KARAKTER_KODE[Math.floor(Math.random() * KARAKTER_KODE.length)];
    }
    const ref = doc(db, "kelas", kode);
    if ((await getDoc(ref)).exists()) continue;
    await setDoc(ref, {
      nama: nama.trim(),
      guruId,
      guruIds: [guruId], // pembuat = pengajar pertama
      dibuat: serverTimestamp(),
    });
    return kode;
  }
  throw new Error("Gagal membuat kode kelas. Coba sekali lagi, ya.");
}

export async function hapusKelas(kode: string): Promise<void> {
  await deleteDoc(doc(getDb(), "kelas", kode));
}

/** Ambil satu kelas — dipakai halaman kelola (verifikasi pengajar + judul). */
export async function ambilKelas(kode: string): Promise<KelasGuru | null> {
  const snap = await getDoc(doc(getDb(), "kelas", kode));
  if (!snap.exists()) return null;
  return bacaKelas(snap);
}

/** Semua kelas yang guru ini ajar — sebagai pemilik (guruId) ATAU pengajar
    tambahan (guruIds). Dua query satu-klausa (tanpa composite index) digabung
    per-kode; query guruId== juga menjaring dokumen lama yang belum punya
    guruIds. */
export async function ambilKelasGuru(guruId: string): Promise<KelasGuru[]> {
  const db = getDb();
  const [pemilik, pengajar] = await Promise.all([
    getDocs(query(collection(db, "kelas"), where("guruId", "==", guruId), limit(50))),
    getDocs(query(collection(db, "kelas"), where("guruIds", "array-contains", guruId), limit(50))),
  ]);
  const perKode = new Map<string, KelasGuru>();
  for (const d of [...pemilik.docs, ...pengajar.docs]) perKode.set(d.id, bacaKelas(d));
  return [...perKode.values()].sort((a, b) => a.nama.localeCompare(b.nama));
}

/* ---------- roster pengajar (fitur multi-guru) ---------- */

/** Gabung sebagai pengajar tambahan lewat kode kelas (mirror joinKelas siswa).
    Menulis guruIds eksplisit (bukan arrayUnion) supaya dokumen lama tanpa
    guruIds ikut membawa pemilik — dan lolos rules self-service. */
export async function gabungKelasSebagaiGuru(
  guruId: string,
  kode: string
): Promise<{ ok: true; nama: string } | { ok: false; pesan: string }> {
  const kodeRapi = kode.trim().toUpperCase();
  if (!kodeRapi) return { ok: false, pesan: "Kodenya masih kosong, nih." };
  const ref = doc(getDb(), "kelas", kodeRapi);
  const snap = await getDoc(ref);
  if (!snap.exists())
    return { ok: false, pesan: "Kode kelas tidak ditemukan. Coba cek lagi, ya!" };
  const kelas = bacaKelas(snap);
  if (kelas.guruIds.includes(guruId))
    return { ok: false, pesan: "Kamu sudah mengajar di kelas ini." };
  await updateDoc(ref, { guruIds: [...kelas.guruIds, guruId] });
  return { ok: true, nama: kelas.nama };
}

/** Keluar sendiri dari kelas (pengajar tambahan). Pemilik tidak bisa keluar —
    ia harus menghapus kelas atau menyerahkannya. */
export async function keluarKelasSebagaiGuru(guruId: string, kode: string): Promise<void> {
  const ref = doc(getDb(), "kelas", kode);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const kelas = bacaKelas(snap);
  if (kelas.guruId === guruId)
    throw new Error("Pemilik kelas tidak bisa keluar. Hapus kelas bila perlu.");
  await updateDoc(ref, { guruIds: kelas.guruIds.filter((id) => id !== guruId) });
}

/** Pemilik mengeluarkan seorang pengajar tambahan dari roster. */
export async function keluarkanGuru(kode: string, guruId: string): Promise<void> {
  const ref = doc(getDb(), "kelas", kode);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const kelas = bacaKelas(snap);
  if (kelas.guruId === guruId) return; // pemilik tak bisa dikeluarkan
  await updateDoc(ref, { guruIds: kelas.guruIds.filter((id) => id !== guruId) });
}

/** Roster pengajar sebuah kelas + nama tampilan (dari users/{uid}); pemilik
    diletakkan paling depan. Nama tak ditemukan → "Bapak/Ibu Guru". */
export async function ambilPengajarKelas(kode: string): Promise<PengajarKelas[]> {
  const db = getDb();
  const kelasSnap = await getDoc(doc(db, "kelas", kode));
  if (!kelasSnap.exists()) return [];
  const kelas = bacaKelas(kelasSnap);
  const urut = [...kelas.guruIds].sort((a, b) =>
    a === kelas.guruId ? -1 : b === kelas.guruId ? 1 : 0
  );
  const profil = await Promise.all(urut.map((id) => getDoc(doc(db, "users", id))));
  return urut.map((userId, i) => ({
    userId,
    nama: profil[i].exists() ? (profil[i].data() as UserProfile).nama : "Bapak/Ibu Guru",
    pemilik: userId === kelas.guruId,
  }));
}

/** Daftar siswa sebuah kelas + progress ringkas (dibaca dari store §6). */
export async function ambilSiswaKelas(kode: string): Promise<UserProfile[]> {
  const snap = await getDocs(
    query(collection(getDb(), "users"), where("kelasId", "==", kode), limit(300))
  );
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((p) => p.role === "siswa")
    .sort((a, b) => b.poin - a.poin || a.nama.localeCompare(b.nama));
}

/* ---------- kontrol siswa (rules: guru pemilik kelas boleh mengubah) ---------- */

/** Keluarkan siswa dari kelas: kosongkan kelasId (siswa diarahkan join ulang,
    D5). Rules mengizinkan karena guru = pemilik kelas siswa saat ini. */
export async function keluarkanSiswa(userId: string): Promise<void> {
  await updateDoc(doc(getDb(), "users", userId), { kelasId: null });
}

/** Reset progres siswa ke awal (poin, level, kemajuan game, koleksi kartu) —
    padanan buatProfilBaru §6. Kelas & identitas (nama/avatar) tidak disentuh. */
export async function resetProgresSiswa(userId: string): Promise<void> {
  await updateDoc(doc(getDb(), "users", userId), {
    poin: 0,
    level: 1,
    progress: {
      kuis: { levelTerbuka: 1 },
      cerita: { babTerbuka: 1 },
      isiPiringku: { levelTerbuka: 1 },
    },
    koleksi: [],
  });
}

/* ---------- pengumuman kelas ---------- */

export interface Pengumuman {
  id: string;
  kelasId: string;
  guruId: string;
  teks: string;
  /** waktu dibuat (epoch ms); 0 bila serverTimestamp belum tersinkron */
  dibuat: number;
}

export const PENGUMUMAN_MAKS = 280;

function bacaPengumuman(d: QueryDocumentSnapshot): Pengumuman {
  const data = d.data() as {
    kelasId: string;
    guruId: string;
    teks: string;
    dibuat?: { toMillis?: () => number };
  };
  return {
    id: d.id,
    kelasId: data.kelasId,
    guruId: data.guruId,
    teks: data.teks,
    dibuat: data.dibuat?.toMillis?.() ?? 0,
  };
}

/** Pengumuman sebuah kelas, terbaru di atas. Satu klausa where + sortir klien
    (tanpa composite index) — konsisten dengan query lain di sini. */
export async function ambilPengumuman(kelasId: string): Promise<Pengumuman[]> {
  const snap = await getDocs(
    query(collection(getDb(), "pengumuman"), where("kelasId", "==", kelasId), limit(50))
  );
  return snap.docs.map(bacaPengumuman).sort((a, b) => b.dibuat - a.dibuat);
}

export async function buatPengumuman(
  guruId: string,
  kelasId: string,
  teks: string
): Promise<void> {
  const ref = doc(collection(getDb(), "pengumuman"));
  await setDoc(ref, {
    kelasId,
    guruId,
    teks: teks.trim().slice(0, PENGUMUMAN_MAKS),
    dibuat: serverTimestamp(),
  });
}

export async function hapusPengumuman(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "pengumuman", id));
}

/* ---------- log jawaban kuis (riwayat benar/salah per level) ---------- */

/** Satu percobaan level Kuis oleh seorang siswa (dibaca guru di Kelola Kelas). */
export interface LogKuis {
  id: string;
  userId: string;
  level: number;
  benar: number;
  total: number;
  detail: LogSoalKuis[];
  /** epoch ms saat percobaan selesai; 0 bila serverTimestamp belum tersinkron */
  dibuat: number;
}

function bacaLogKuis(d: QueryDocumentSnapshot): LogKuis {
  const data = d.data() as {
    userId: string;
    level: number;
    benar: number;
    total: number;
    detail: LogSoalKuis[];
    dibuat?: { toMillis?: () => number };
  };
  return {
    id: d.id,
    userId: data.userId,
    level: data.level,
    benar: data.benar,
    total: data.total,
    detail: data.detail ?? [],
    dibuat: data.dibuat?.toMillis?.() ?? 0,
  };
}

/** Riwayat jawaban Kuis semua siswa sebuah kelas (terbaru di atas). Satu klausa
    where + sortir klien (tanpa composite index) — konsisten dengan query lain.
    Halaman kelola mengelompokkannya per siswa (by userId). */
export async function ambilLogKuisKelas(kelasId: string): Promise<LogKuis[]> {
  const snap = await getDocs(
    query(collection(getDb(), "logKuis"), where("kelasId", "==", kelasId), limit(500))
  );
  return snap.docs.map(bacaLogKuis).sort((a, b) => b.dibuat - a.dibuat);
}

/* ---------- bank soal guru ---------- */

export async function ambilSoalGuru(guruId: string): Promise<SoalGuru[]> {
  const snap = await getDocs(
    query(collection(getDb(), "soalGuru"), where("guruId", "==", guruId), limit(200))
  );
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<SoalGuru, "id">), id: d.id }))
    .sort((a, b) => a.level - b.level || a.pertanyaan.localeCompare(b.pertanyaan));
}

/** Buat baru (id undefined) atau perbarui (id terisi). Return id dokumen. */
export async function simpanSoal(
  guruId: string,
  input: SoalGuruInput,
  id?: string
): Promise<string> {
  const db = getDb();
  const ref = id ? doc(db, "soalGuru", id) : doc(collection(db, "soalGuru"));
  await setDoc(ref, {
    ...input,
    pertanyaan: input.pertanyaan.trim(),
    opsi: input.opsi.map((o) => o.trim()),
    sumber: "guru",
    guruId,
    diubah: serverTimestamp(),
  });
  return ref.id;
}

export async function hapusSoal(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "soalGuru", id));
}
