import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { buatProfilBaru, type Role, type UserProfile } from "./types";

export async function loginDenganGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const hasil = await signInWithPopup(auth, new GoogleAuthProvider());
  return hasil.user;
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function ambilProfil(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getDb(), "users", userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Dipanggil setelah login pertama. Profil yang sudah ada MENANG atas
    role yang dipilih di landing (mencegah akun ganda beda role). */
export async function ambilAtauBuatProfil(
  user: User,
  rolePilihan: Role
): Promise<UserProfile> {
  const ada = await ambilProfil(user.uid);
  if (ada) return ada;
  // Sapaan pakai nama depan saja — lebih akrab untuk anak
  const namaDepan = (user.displayName ?? "Teman").trim().split(/\s+/)[0];
  const profil = buatProfilBaru(user.uid, rolePilihan, namaDepan);
  await setDoc(doc(getDb(), "users", user.uid), profil);
  return profil;
}

/** Perbarui sebagian profil (nama tampilan &/atau avatar). Dipakai saat
    onboarding (pilih nama + avatar) dan di halaman /profil. Field bernilai
    `undefined` tidak dikirim (Firestore menolak undefined). */
export async function perbaruiProfil(
  userId: string,
  data: { nama?: string; avatar?: string }
): Promise<void> {
  const bersih: Record<string, string> = {};
  if (data.nama !== undefined) bersih.nama = data.nama;
  if (data.avatar !== undefined) bersih.avatar = data.avatar;
  await updateDoc(doc(getDb(), "users", userId), bersih);
}

/** Validasi kode kelas (dokumen kelas/{KODE}) lalu simpan ke profil.
    Kelas dibuat guru di Phase 10 — untuk test, buat dokumen manual di console. */
export async function joinKelas(
  userId: string,
  kode: string
): Promise<{ ok: true; namaKelas: string } | { ok: false; pesan: string }> {
  const kodeRapi = kode.trim().toUpperCase();
  if (!kodeRapi) return { ok: false, pesan: "Kodenya masih kosong, nih." };
  const snap = await getDoc(doc(getDb(), "kelas", kodeRapi));
  if (!snap.exists()) {
    return {
      ok: false,
      pesan: "Kode kelas tidak ditemukan. Coba cek lagi dari Bapak/Ibu Guru, ya!",
    };
  }
  await updateDoc(doc(getDb(), "users", userId), { kelasId: kodeRapi });
  return { ok: true, namaKelas: (snap.data().nama as string) ?? kodeRapi };
}

/** Halaman tujuan sesuai kelengkapan profil (satu sumber logika redirect). */
export function rutePofil(profil: UserProfile): string {
  if (profil.role === "guru") return "/guru";
  if (!profil.avatar) return "/onboarding/avatar";
  if (!profil.kelasId) return "/onboarding/kelas"; // D5: wajib join kelas
  return "/home";
}
