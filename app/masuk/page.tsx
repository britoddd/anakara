"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import AwanPikiran from "@/components/deko/AwanPikiran";
import TepiGelombang from "@/components/deko/TepiGelombang";
import Button from "@/components/ui/Button";
import TombolKembali from "@/components/ui/TombolKembali";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { hasFirebaseConfig } from "@/lib/firebase";
import { loginDenganGoogle, ambilAtauBuatProfil, rutePofil } from "@/features/auth/api";
import { useAuth } from "@/features/auth/AuthProvider";
import type { Role, UserProfile } from "@/features/auth/types";

/* Halaman login Google (Phase 1) — mockup MacBook Air - 4:
   banner ilustrasi di atas, "Login dengan" + tombol Google, lalu Lanjut. */

function IsiMasuk() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshProfil } = useAuth();
  const peran: Role = params.get("peran") === "guru" ? "guru" : "siswa";

  const [status, setStatus] = useState<"idle" | "proses" | "sukses">("idle");
  const [galat, setGalat] = useState<string | null>(null);
  const [profil, setProfil] = useState<UserProfile | null>(null);
  const [fotoGoogle, setFotoGoogle] = useState<string | null>(null);

  async function masuk() {
    setGalat(null);
    setStatus("proses");
    try {
      const user = await loginDenganGoogle();
      const p = await ambilAtauBuatProfil(user, peran);
      await refreshProfil();
      setProfil(p);
      setFotoGoogle(user.photoURL);
      setStatus("sukses");
    } catch (e) {
      setStatus("idle");
      const kode = (e as { code?: string }).code ?? "";
      if (kode === "auth/popup-closed-by-user") {
        setGalat("Jendela login tertutup. Yuk coba lagi!");
      } else if (kode === "permission-denied") {
        // login Google sukses tapi Firestore menolak → rules belum di-publish
        setGalat(
          "Login berhasil, tapi database menolak akses (permission-denied). " +
            "Untuk developer: publish isi firestore.rules di Firebase Console → Firestore → Rules."
        );
      } else {
        setGalat("Login belum berhasil. Coba lagi, ya!");
      }
    }
  }

  if (!hasFirebaseConfig) {
    return (
      <Card className="max-w-lg mx-auto text-left">
        <h2 className="text-lg mb-3">⚙️ Firebase belum dikonfigurasi</h2>
        <p className="text-muted mb-3">
          Salin bagian <code>NEXT_PUBLIC_FIREBASE_*</code> dari{" "}
          <code>.env.example</code> ke <code>.env.local</code>, isi nilainya dari
          Firebase Console (Project settings → Your apps), lalu restart{" "}
          <code>npm run dev</code>.
        </p>
        <p className="text-muted text-sm">
          Jangan lupa aktifkan <strong>Authentication → Sign-in method → Google</strong>{" "}
          dan buat database <strong>Firestore</strong>.
        </p>
      </Card>
    );
  }

  if (status === "sukses" && profil) {
    return (
      <Card className="max-w-md mx-auto flex flex-col items-center gap-4">
        {/* Foto Google hanya untuk sapaan (preview) — avatar produk dipilih sendiri */}
        {fotoGoogle ? (
          <Image
            src={fotoGoogle}
            alt=""
            width={64}
            height={64}
            className="rounded-full border-2 border-border"
            unoptimized
          />
        ) : (
          <span className="text-5xl" aria-hidden="true">
            👋
          </span>
        )}
        <h2 className="text-2xl">Halo, {profil.nama}!</h2>
        <p className="text-muted">
          {profil.role === "guru"
            ? "Selamat datang kembali, Bapak/Ibu Guru."
            : "Tayo senang kamu datang! 🐆"}
        </p>
        <Button size="lg" fullWidth onClick={() => router.push(rutePofil(profil))}>
          Lanjut
        </Button>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6">
      <p className="font-bold text-muted">
        Login dengan {peran === "guru" ? "akun Google (Guru)" : "akun Google"}
      </p>

      {status === "proses" ? (
        <LoadingSpinner label="Membuka jendela login…" />
      ) : (
        <Button size="lg" fullWidth onClick={masuk}>
          <GoogleLogo /> Masuk dengan Google
        </Button>
      )}

      {galat && (
        <p role="alert" className="text-danger font-bold flex items-center gap-2">
          <span aria-hidden="true">⚠️</span> {galat}
        </p>
      )}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.1 29.3 3 24 3 15.9 3 8.9 7.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C8.7 40.3 15.8 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.4 45 30.2 45 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}

export default function MasukPage() {
  return (
    <>
      {/* Banner dekoratif playful (mockup 4) — pembawa teks tetap di bawah */}
      <div
        aria-hidden="true"
        className="relative bg-band-blue py-10 text-center text-6xl"
      >
        <AwanPikiran className="absolute left-6 top-4 w-16 text-white/90" />
        <AwanPikiran className="absolute right-8 bottom-3 w-12 text-white/70" />
        🐆🍎🥕🍌
      </div>
      <TepiGelombang arah="bawah" className="text-band-blue" />

      <header className="px-6 py-4 max-w-4xl mx-auto w-full">
        <TombolKembali href="/" label="Kembali ke halaman awal" />
      </header>

      <main id="konten-utama" className="max-w-4xl mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl mb-8">Masuk ke Anakara</h1>
        <Suspense fallback={<LoadingSpinner />}>
          <IsiMasuk />
        </Suspense>
      </main>
    </>
  );
}
