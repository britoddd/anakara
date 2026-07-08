"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { buatProfilBaru } from "@/features/auth/types";
import BacaCerita from "@/features/games/cerita/BacaCerita";
import CeritaHub from "@/features/games/cerita/CeritaHub";
import { getBab } from "@/features/games/cerita/config";

/* Halaman uji dev untuk Cerita Interaktif tanpa login (seperti /dev/komponen).
   Bukan bagian produk — jangan ditautkan dari halaman siswa.
   ?tampil=hub → daftar cerita · default → buku · ?hal=N → mulai di halaman N. */

const profilUji = {
  ...buatProfilBaru("dev-uji", "siswa", "Tayo"),
  avatar: "avatar-01",
};

function IsiDevCerita() {
  const params = useSearchParams();
  const bab = getBab(1);
  if (!bab) return null;

  if (params.get("tampil") === "hub") {
    return <CeritaHub profil={profilUji} onBaca={() => {}} />;
  }
  const hal = Math.min(
    Math.max(Number(params.get("hal") ?? 1), 1),
    bab.halaman.length
  );
  return (
    <BacaCerita
      bab={bab}
      nomorBab={1}
      profil={profilUji}
      onKembali={() => {}}
      indexAwal={hal - 1}
    />
  );
}

export default function DevCeritaPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <IsiDevCerita />
    </Suspense>
  );
}
