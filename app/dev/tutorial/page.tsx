"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import LatarDoodle from "@/components/deko/LatarDoodle";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GameCard from "@/features/home/GameCard";
import { MENU_GAME, MENU_LAIN } from "@/features/home/menu";
import TutorialOverlay from "@/features/home/TutorialOverlay";

/* Halaman uji dev untuk panduan pemain baru (TutorialOverlay) tanpa login —
   tiruan statis header + grid Home dengan atribut data-tutorial yang sama
   (profil, bantuan, poin, menu-lain, game). Bukan bagian produk — jangan
   ditautkan dari halaman siswa. Panduan langsung terbuka saat halaman dimuat;
   tombol di bawah membukanya lagi. ?langkah=1..6 → lompat ke langkah itu.
   Paksa tema: lewat /dev/tema?set=...&ke=. */

function IsiDevTutorial() {
  const params = useSearchParams();
  const langkah = Math.min(Math.max(Number(params.get("langkah") ?? 1) || 1, 1), 6);
  const [terbuka, setTerbuka] = useState(true);

  return (
    <>
      <LatarDoodle />
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
        {/* chip profil statis (struktur sama dengan /home) */}
        <a
          href="#"
          aria-label="Buka profilku"
          data-tutorial="profil"
          className="flex items-center gap-2 sm:gap-3 bg-surface border-2 border-border rounded-full pl-1.5 pr-4 py-1.5 no-underline text-fg"
        >
          <span
            className="w-10 h-10 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-xl"
            aria-hidden="true"
          >
            <GambarEmoji
              src="/assets/avatars/avatar-01.png"
              emoji="🐱"
              className="w-full h-full object-cover"
            />
          </span>
          <span className="font-display font-bold">Tayo</span>
          <span className="bg-accent text-on-accent text-sm font-extrabold rounded-full px-2.5 py-0.5">
            Lv 3
          </span>
        </a>

        <button
          onClick={() => setTerbuka(true)}
          aria-label="Lihat panduan bermain"
          title="Panduan"
          data-tutorial="bantuan"
          className={[
            "shrink-0 w-11 h-11 rounded-full cursor-pointer",
            "flex items-center justify-center font-display font-extrabold text-xl",
            "bg-accent text-on-accent shadow-[0_3px_0_var(--accent-edge)]",
            "transition-[transform,box-shadow,filter] duration-150 ease-out",
            "hover:brightness-95 active:translate-y-[3px] active:shadow-none",
          ].join(" ")}
        >
          ?
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span
            data-tutorial="poin"
            className="font-display font-bold bg-surface border-2 border-border rounded-full px-4 py-2"
          >
            ⭐ 320
          </span>
          <div className="flex items-center gap-2" data-tutorial="menu-lain">
            {MENU_LAIN.map((item) => (
              <span
                key={item.id}
                title={item.judul}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-surface border-2 border-border"
              >
                <span className="text-xl" aria-hidden="true">
                  {item.emoji}
                </span>
              </span>
            ))}
          </div>
          <span className="w-11 h-11 rounded-full flex items-center justify-center text-xl bg-surface-2 border-2 border-border">
            🚪
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <section aria-labelledby="judul-game" data-tutorial="game">
          <h2 id="judul-game" className="text-xl mb-3">
            Ayo Main! 🎮
          </h2>
          <div className="rounded-xl bg-band-green p-3 sm:p-5">
            <ul
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 list-none"
              aria-label="Daftar permainan"
            >
              <li className="col-span-2 lg:row-span-2">
                <GameCard
                  game={MENU_GAME[0]}
                  variant="besar"
                  badge="Mulai di sini ✨"
                />
              </li>
              {MENU_GAME.slice(1).map((game) => (
                <li key={game.id}>
                  <GameCard game={game} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-8">
          <Button onClick={() => setTerbuka(true)}>Buka panduan lagi</Button>
        </div>
      </main>

      <TutorialOverlay
        open={terbuka}
        onClose={() => setTerbuka(false)}
        langkahAwal={langkah - 1}
      />
    </>
  );
}

export default function DevTutorialPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <IsiDevTutorial />
    </Suspense>
  );
}
