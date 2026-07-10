"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GarisMarker from "@/components/deko/GarisMarker";
import LatarDoodle from "@/components/deko/LatarDoodle";
import Squiggle from "@/components/deko/Squiggle";
import GambarEmoji from "@/components/ui/GambarEmoji";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/features/auth/AuthProvider";
import { logout, rutePofil } from "@/features/auth/api";
import { getAvatar } from "@/features/auth/avatars";
import { hitungLevel, poinMenujuLevelBerikut } from "@/features/auth/types";
import GameCard from "@/features/home/GameCard";
import { MENU_GAME, MENU_LAIN } from "@/features/home/menu";

/* Home Dashboard siswa (Phase 2) — mockup MacBook Air - 5/9:
   chip profil kiri-atas, sapaan Tayo, band biru berisi kartu game
   art dramatis yang di-scroll horizontal, plus tautan Leaderboard/Koleksi. */

export default function HomePage() {
  const router = useRouter();
  const { user, profil, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (rutePofil(profil) !== "/home") router.replace(rutePofil(profil));
  }, [loading, user, profil, router]);

  if (loading || !profil || rutePofil(profil) !== "/home") return <LoadingSpinner />;

  const avatar = getAvatar(profil.avatar);

  return (
    <>
      {/* doodle samar di latar utama (restyle D12) */}
      <LatarDoodle />
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
        {/* chip profil: avatar + nama + badge level (konvensi §4.5) —
            tautan ke /profil untuk ubah nama panggilan & avatar */}
        <Link
          href="/profil"
          aria-label="Buka profilku"
          className="flex items-center gap-2 sm:gap-3 bg-surface border-2 border-border rounded-full pl-1.5 pr-4 py-1.5 no-underline text-fg hover:border-primary hover:-translate-y-0.5 transition-[transform,border-color] duration-150"
        >
          <span
            className="w-10 h-10 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-xl"
            aria-hidden="true"
          >
            {avatar ? (
              <GambarEmoji
                src={avatar.gambar}
                emoji={avatar.emoji}
                className="w-full h-full object-cover"
              />
            ) : (
              "🙂"
            )}
          </span>
          <span className="font-display font-bold">{profil.nama}</span>
          {/* level = turunan poin (D10), bukan field tersimpan — selalu sinkron */}
          <span className="bg-accent text-on-accent text-sm font-extrabold rounded-full px-2.5 py-0.5">
            Lv {hitungLevel(profil.poin)}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-display font-bold bg-surface border-2 border-border rounded-full px-4 py-2">
            ⭐ {profil.poin}
          </span>
          <ThemeToggle />
          <button
            onClick={async () => {
              await logout();
              router.replace("/");
            }}
            aria-label="Keluar dari akun"
            title="Keluar"
            className="w-11 h-11 rounded-full flex items-center justify-center text-xl bg-surface-2 border-2 border-border hover:border-danger active:translate-y-[2px] transition-colors duration-150"
          >
            🚪
          </button>
        </div>
      </header>

      <main id="konten-utama" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {/* sapaan Tayo */}
        <div className="flex items-center gap-4 py-6">
          <span
            className="w-20 h-20 text-5xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center motion-safe:animate-bounce"
            aria-hidden="true"
          >
            <GambarEmoji
              src="/assets/mascot/tayo-hello.png"
              emoji="🐆"
              className="w-full h-full object-cover"
            />
          </span>
          <div>
            <h1 className="text-2xl">
              Halo, <GarisMarker>{profil.nama}</GarisMarker>!
            </h1>
            <p className="text-muted font-bold">
              Yuk main hari ini~ Kumpulkan ⭐ {poinMenujuLevelBerikut(profil.poin)}{" "}
              lagi untuk naik ke Lv {hitungLevel(profil.poin) + 1}!
            </p>
          </div>
          <Squiggle className="hidden md:inline-block w-28 ml-auto mr-4 text-primary rotate-6" />
        </div>

        {/* band kartu game — band hijau pastel (restyle THYNK §C) */}
        <section aria-labelledby="judul-game">
          <h2 id="judul-game" className="sr-only">
            Menu permainan
          </h2>
          <div className="rounded-xl bg-band-green p-4 sm:p-6">
            <ul
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 list-none"
              aria-label="Daftar permainan"
            >
              {MENU_GAME.map((game) => (
                <li key={game.id} className="shrink-0">
                  <GameCard game={game} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* tautan sekunder: Leaderboard & Koleksi (Phase 8) — band pink pastel */}
        <section aria-labelledby="judul-lain" className="mt-8">
          <h2 id="judul-lain" className="sr-only">
            Menu lainnya
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xl rounded-xl bg-band-pink p-4 sm:p-6">
            {MENU_LAIN.map((item) => (
              <Link
                key={item.id}
                href={
                  item.status === "segera"
                    ? `/segera-hadir?fitur=${item.id}`
                    : item.href
                }
                className="flex items-center gap-3 bg-surface border-2 border-border rounded-lg px-5 py-4 no-underline font-display font-bold text-fg hover:border-primary hover:-translate-y-0.5 transition-[transform,border-color] duration-150"
              >
                <span
                  className="w-9 h-9 shrink-0 flex items-center justify-center text-3xl"
                  aria-hidden="true"
                >
                  {item.gambar ? (
                    <GambarEmoji
                      src={item.gambar}
                      emoji={item.emoji}
                      className="w-full h-full object-contain"
                      emojiClassName="text-3xl"
                    />
                  ) : (
                    item.emoji
                  )}
                </span>
                {item.judul}
                {item.status === "segera" && (
                  <span className="ml-auto text-xs font-bold text-muted">🔒</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
