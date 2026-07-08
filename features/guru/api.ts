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
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { UserProfile } from "@/features/auth/types";
import type { Soal } from "@/features/games/kuis/config";

/* API Teacher Dashboard (Phase 10).
   - kelas/{KODE}: { nama, guruId, dibuat } — kode 5 huruf à la Kahoot.
   - soalGuru/{id}: skema soal §6 + guruId (D11: dipakai fitur Kuis saja dulu).
   Query sengaja satu klausa where + sortir klien (tanpa composite index). */

export interface KelasGuru {
  kode: string;
  nama: string;
  guruId: string;
}

export interface SoalGuru extends Omit<Soal, "id"> {
  id: string; // = id dokumen Firestore
  guruId: string;
}

/** Data yang diisi form soal (id & metadata ditambahkan saat simpan) */
export type SoalGuruInput = Omit<SoalGuru, "id" | "guruId" | "sumber">;

const KARAKTER_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa I/O/0/1

/* ---------- kelas ---------- */

export async function buatKelas(guruId: string, nama: string): Promise<string> {
  const db = getDb();
  for (let percobaan = 0; percobaan < 5; percobaan++) {
    let kode = "";
    for (let i = 0; i < 5; i++) {
      kode += KARAKTER_KODE[Math.floor(Math.random() * KARAKTER_KODE.length)];
    }
    const ref = doc(db, "kelas", kode);
    if ((await getDoc(ref)).exists()) continue;
    await setDoc(ref, { nama: nama.trim(), guruId, dibuat: serverTimestamp() });
    return kode;
  }
  throw new Error("Gagal membuat kode kelas. Coba sekali lagi, ya.");
}

export async function hapusKelas(kode: string): Promise<void> {
  await deleteDoc(doc(getDb(), "kelas", kode));
}

export async function ambilKelasGuru(guruId: string): Promise<KelasGuru[]> {
  const snap = await getDocs(
    query(collection(getDb(), "kelas"), where("guruId", "==", guruId), limit(50))
  );
  return snap.docs
    .map((d) => ({ kode: d.id, ...(d.data() as { nama: string; guruId: string }) }))
    .sort((a, b) => a.nama.localeCompare(b.nama));
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
