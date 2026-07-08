"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/home"
          aria-label="Kembali ke Home"
          className="shrink-0 w-11 h-11 rounded-full bg-fg text-bg flex items-center justify-center no-underline font-bold"
        >
          ←
        </Link>
        <h1 className="text-2xl sm:text-3xl flex-1">Koleksi Kartu 🃏</h1>
        <span className="font-display font-extrabold text-lg bg-surface border-2 border-border rounded-full px-4 py-1.5">
          {profil.koleksi.length}/{SEMUA_KARTU.length}
        </span>
      </div>
      <p className="text-muted font-bold mb-6">
        Menangkan Team Battle 2 vs 2 untuk membuka kotak misteri dan melengkapi
        albummu! ⚔️🎁
      </p>

      <AlbumKartu koleksi={profil.koleksi} />
    </main>
  );
}
