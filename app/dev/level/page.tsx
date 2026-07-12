"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { buatProfilBaru } from "@/features/auth/types";
import GameIsiPiringku from "@/features/games/isi-piringku/GameIsiPiringku";
import GameKuis from "@/features/games/kuis/GameKuis";

/* Halaman uji dev untuk sistem level 1-10 + Mode Tanpa Batas tanpa login
   (seperti /dev/cerita). Bukan bagian produk — jangan ditautkan dari halaman
   siswa. Catatan: tanpa Firebase, papan rekor menampilkan status error-nya
   (memang begitu di dev) dan menyimpan hasil akan gagal lembut.
   ?game=kuis|piring → pilih game · ?buka=N → level terbuka (default 10). */

function IsiDevLevel() {
  const params = useSearchParams();
  const game = params.get("game") === "piring" ? "piring" : "kuis";
  const buka = Math.min(Math.max(Number(params.get("buka") ?? 10) || 1, 1), 10);

  const profil = {
    ...buatProfilBaru("dev-uji", "siswa", "Tayo"),
    avatar: "avatar-01",
    poin: 320,
  };
  profil.progress.kuis.levelTerbuka = buka;
  profil.progress.isiPiringku.levelTerbuka = buka;

  return game === "piring" ? (
    <GameIsiPiringku profil={profil} />
  ) : (
    <GameKuis profil={profil} />
  );
}

export default function DevLevelPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <IsiDevLevel />
    </Suspense>
  );
}
