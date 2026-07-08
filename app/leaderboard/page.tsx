"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AwanPikiran from "@/components/deko/AwanPikiran";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TombolKembali from "@/components/ui/TombolKembali";
import { useAuth } from "@/features/auth/AuthProvider";
import { rutePofil } from "@/features/auth/api";
import {
  ambilPeringkat,
  type BarisPeringkat,
  type CakupanPeringkat,
} from "@/features/leaderboard/api";
import PapanPeringkat from "@/features/leaderboard/PapanPeringkat";

/* Leaderboard (Phase 8): ranking ⭐ poin dari semua aktivitas,
   filter 🏫 Kelasku / 🌍 Semua. */

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, profil, loading } = useAuth();
  const [cakupan, setCakupan] = useState<CakupanPeringkat>("kelas");
  const [baris, setBaris] = useState<BarisPeringkat[] | null>(null);
  const [galat, setGalat] = useState(false);
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (rutePofil(profil) !== "/home") router.replace(rutePofil(profil));
  }, [loading, user, profil, router]);

  useEffect(() => {
    if (!profil) return;
    let aktif = true;
    setBaris(null);
    setGalat(false);
    ambilPeringkat(cakupan, profil.kelasId)
      .then((hasil) => aktif && setBaris(hasil))
      .catch(() => aktif && setGalat(true));
    return () => {
      aktif = false;
    };
  }, [profil, cakupan, percobaan]);

  if (loading || !profil || rutePofil(profil) !== "/home") return <LoadingSpinner />;

  return (
    <main id="konten-utama" className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* header band biru pastel (restyle THYNK §C) */}
      <div className="relative rounded-xl bg-band-blue p-4 sm:p-5 mb-5 overflow-hidden">
        <AwanPikiran className="absolute -right-1 -top-2 w-16 text-white/70" />
        <div className="flex items-center gap-3">
          <TombolKembali href="/home" label="Kembali ke Home" />
          <h1 className="text-2xl sm:text-3xl">Leaderboard 🏆</h1>
        </div>
      </div>

      {/* filter cakupan */}
      <div
        role="group"
        aria-label="Filter peringkat"
        className="inline-flex rounded-full border-2 border-border bg-surface p-1 mb-6"
      >
        {(
          [
            { id: "kelas", label: "🏫 Kelasku" },
            { id: "semua", label: "🌍 Semua" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setCakupan(f.id)}
            aria-pressed={cakupan === f.id}
            className={[
              "rounded-full px-4 py-2 font-display font-bold text-sm cursor-pointer",
              "transition-colors duration-150",
              cakupan === f.id
                ? "bg-primary text-on-primary"
                : "text-muted hover:text-fg",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {galat ? (
        <div className="text-center py-8">
          <p role="alert" className="text-danger font-bold mb-4">
            ⚠️ Gagal memuat peringkat. Cek internetmu ya!
          </p>
          <Button onClick={() => setPercobaan((p) => p + 1)}>Coba Lagi</Button>
        </div>
      ) : baris === null ? (
        <LoadingSpinner label="Menghitung peringkat…" />
      ) : (
        <PapanPeringkat baris={baris} uidKu={profil.userId} />
      )}
    </main>
  );
}
