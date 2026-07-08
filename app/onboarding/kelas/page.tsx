"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/features/auth/AuthProvider";
import { joinKelas } from "@/features/auth/api";

/* Join kelas via kode (Phase 1, keputusan D5) — langkah terakhir onboarding siswa.
   Kode = id dokumen kelas/{KODE} yang dibuat guru (Phase 10). */

export default function JoinKelasPage() {
  const router = useRouter();
  const { user, profil, loading, refreshProfil } = useAuth();
  const [kode, setKode] = useState("");
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (profil.role !== "siswa") router.replace("/guru");
    else if (!profil.avatar) router.replace("/onboarding/avatar");
  }, [loading, user, profil, router]);

  if (loading || !profil) return <LoadingSpinner />;

  async function kirim(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setGalat(null);
    setProses(true);
    const hasil = await joinKelas(user.uid, kode).catch(() => ({
      ok: false as const,
      pesan: "Ada gangguan koneksi. Coba lagi, ya!",
    }));
    if (hasil.ok) {
      await refreshProfil();
      router.push("/home");
    } else {
      setProses(false);
      setGalat(hasil.pesan);
    }
  }

  return (
    <main id="konten-utama" className="max-w-xl mx-auto px-6 py-12 text-center">
      <p className="text-5xl mb-4" aria-hidden="true">
        🏫
      </p>
      <h1 className="text-3xl mb-2">Masuk ke kelasmu</h1>
      <p className="text-lg text-muted mb-10">
        Minta kode kelas dari Bapak/Ibu Guru, lalu ketik di sini, ya!
      </p>

      <Card className="text-left">
        <form onSubmit={kirim} noValidate>
          <label htmlFor="kode-kelas" className="block font-bold mb-2">
            Kode kelas
          </label>
          <input
            id="kode-kelas"
            name="kode-kelas"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={8}
            value={kode}
            onChange={(e) => setKode(e.target.value.toUpperCase())}
            aria-invalid={galat ? true : undefined}
            aria-describedby={galat ? "kode-galat" : undefined}
            placeholder="Contoh: ABC123"
            className={[
              "w-full min-h-[56px] px-5 rounded-md bg-surface text-fg",
              "text-xl font-display font-bold tracking-[0.25em] text-center uppercase",
              "border-2",
              galat ? "border-danger" : "border-border",
            ].join(" ")}
          />
          {galat && (
            <p id="kode-galat" role="alert" className="mt-3 text-danger font-bold">
              ⚠️ {galat}
            </p>
          )}
          <div className="mt-6">
            <Button type="submit" size="lg" fullWidth disabled={proses || !kode.trim()}>
              {proses ? "Mencari kelasmu…" : "Gabung Kelas"}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
