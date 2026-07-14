"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LatarDoodle from "@/components/deko/LatarDoodle";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MENU_GAME, MENU_LAIN } from "@/features/home/menu";

/* Placeholder generik "Segera Hadir" untuk fitur yang belum dibangun.
   Nama fitur diambil dari ?fitur=<id> (lihat features/home/menu.ts). */

function IsiSegeraHadir() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("fitur");
  const fitur =
    MENU_GAME.find((g) => g.id === id) ?? MENU_LAIN.find((m) => m.id === id);

  return (
    <main id="konten-utama" className="max-w-xl mx-auto px-6 py-20 text-center">
      {/* doodle samar di latar — seragam dengan Home & Profil (restyle D12) */}
      <LatarDoodle />
      <p className="text-6xl mb-6" aria-hidden="true">
        🐆💤
      </p>
      <h1 className="text-3xl mb-3">Segera Hadir!</h1>
      <p className="text-lg text-muted mb-10 max-w-[45ch] mx-auto">
        {fitur ? (
          <>
            <strong>{"judul" in fitur ? fitur.judul : ""}</strong> sedang
            disiapkan Tayo. Tunggu ya, pasti seru!
          </>
        ) : (
          "Fitur ini sedang disiapkan Tayo. Tunggu ya, pasti seru!"
        )}
      </p>
      {/* CTA tanpa "←" — panah hanya milik TombolKembali (konsistensi header) */}
      <Button size="lg" onClick={() => router.push("/home")}>
        Kembali ke Home
      </Button>
    </main>
  );
}

export default function SegeraHadirPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <IsiSegeraHadir />
    </Suspense>
  );
}
