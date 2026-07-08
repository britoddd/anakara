"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/features/auth/AuthProvider";
import { simpanAvatar } from "@/features/auth/api";
import { AVATARS } from "@/features/auth/avatars";

/* Pemilihan avatar (Phase 1) — mockup MacBook Air - 8: grid 2×5 + Lanjut.
   Privasi: avatar kartun, bukan foto Google anak. */

export default function PilihAvatarPage() {
  const router = useRouter();
  const { user, profil, loading, refreshProfil } = useAuth();
  const [pilihan, setPilihan] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (profil.role !== "siswa") router.replace("/guru");
  }, [loading, user, profil, router]);

  if (loading || !profil) return <LoadingSpinner />;

  async function lanjut() {
    if (!pilihan || !user) return;
    setGalat(null);
    setMenyimpan(true);
    try {
      await simpanAvatar(user.uid, pilihan);
      await refreshProfil();
      router.push("/onboarding/kelas");
    } catch {
      setMenyimpan(false);
      setGalat("Belum tersimpan. Coba tekan Lanjut sekali lagi, ya!");
    }
  }

  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl mb-2">Pilih avatarmu!</h1>
      <p className="text-lg text-muted mb-10">
        Mana yang paling kamu suka, {profil.nama}?
      </p>

      <div
        role="radiogroup"
        aria-label="Pilih avatar"
        className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 justify-items-center max-w-xl mx-auto mb-10"
      >
        {AVATARS.map((a) => {
          const aktif = pilihan === a.id;
          return (
            <button
              key={a.id}
              role="radio"
              aria-checked={aktif}
              aria-label={a.nama}
              onClick={() => setPilihan(a.id)}
              className={[
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full text-4xl sm:text-5xl",
                "flex items-center justify-center bg-white cursor-pointer overflow-hidden",
                "transition-[transform,border-color] duration-150 ease-out hover:scale-105",
                aktif
                  ? "border-4 border-primary scale-105"
                  : "border-4 border-border",
              ].join(" ")}
            >
              <GambarEmoji
                src={a.gambar}
                emoji={a.emoji}
                className="w-full h-full object-cover rounded-full"
              />
            </button>
          );
        })}
      </div>

      {/* nama avatar terpilih — afordans selain warna border */}
      <p className="text-muted font-bold mb-6 min-h-[1.5em]">
        {pilihan ? `✓ ${AVATARS.find((a) => a.id === pilihan)?.nama}` : " "}
      </p>

      <Button size="lg" disabled={!pilihan || menyimpan} onClick={lanjut}>
        {menyimpan ? "Menyimpan…" : "Lanjut"}
      </Button>

      {galat && (
        <p role="alert" className="mt-4 text-danger font-bold">
          ⚠️ {galat}
        </p>
      )}
    </main>
  );
}
