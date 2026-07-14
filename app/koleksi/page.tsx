"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AwanPikiran from "@/components/deko/AwanPikiran";
import LatarDoodle from "@/components/deko/LatarDoodle";
import Chip from "@/components/ui/Chip";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TombolKembali from "@/components/ui/TombolKembali";
import { useAuth } from "@/features/auth/AuthProvider";
import { rutePofil } from "@/features/auth/api";
import { SEMUA_KARTU } from "@/features/games/battle/config";
import AlbumKartu from "@/features/koleksi/AlbumKartu";

/* Album Koleksi Kartu (Phase 8): semua kartu dari kotak misteri battle. */

export default function KoleksiPage() {
  const router = useRouter();
  const { user, profil, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (rutePofil(profil) !== "/home") router.replace(rutePofil(profil));
  }, [loading, user, profil, router]);

  if (loading || !profil || rutePofil(profil) !== "/home") return <LoadingSpinner />;

  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* doodle samar di latar — seragam dengan Home & Profil (restyle D12) */}
      <LatarDoodle />
      {/* header band biru pastel (restyle THYNK §C) */}
      <div className="relative rounded-xl bg-band-blue p-4 sm:p-5 mb-6 overflow-hidden">
        <AwanPikiran className="absolute -right-1 -top-2 w-16 text-white/70" />
        <div className="flex items-center gap-3 mb-2">
          <TombolKembali href="/home" label="Kembali ke Home" />
          <h1 className="text-2xl sm:text-3xl flex-1">Koleksi Kartu 🃏</h1>
          <Chip warna="kuning" className="font-display text-base px-4 py-1.5">
            {profil.koleksi.length}/{SEMUA_KARTU.length}
          </Chip>
        </div>
        <p className="font-bold">
          Menangkan Team Battle 2 vs 2 untuk membuka kotak misteri dan melengkapi
          albummu! ⚔️🎁
        </p>
      </div>

      <AlbumKartu koleksi={profil.koleksi} />
    </main>
  );
}
