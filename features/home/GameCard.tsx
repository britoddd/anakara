"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MenuGame } from "./menu";
import { catatMain } from "./riwayat";

/* Kartu menu game gaya "stiker" (referensi/image.png — dashboard ala PAC-MAN):
   bingkai putih (surface) + art di dalam + judul DI BAWAH art. Judul memakai
   text-fg di atas surface — kontras lebih aman daripada putih di atas foto.
   Dua ukuran untuk grid bento Home:
   - "besar" : kartu unggulan — art lebih luas (mengisi tinggi 2 baris di lg)
               + subjudul tampil.
   - "kecil" : kartu grid biasa — art 4:3, judul 1 baris.
   Badge kiri-atas ("Main lagi ▶" / "Baru!") & chip progres kiri-bawah art. */

interface GameCardProps {
  game: MenuGame;
  variant?: "besar" | "kecil";
  /** chip kiri-atas art, mis. "Main lagi ▶" / "Baru!" / "Mulai di sini ✨" */
  badge?: string;
  /** chip progres kiri-bawah art, mis. "⭐ Lv 2" / "📖 Bab 3" */
  progres?: string;
}

export default function GameCard({
  game,
  variant = "kecil",
  badge,
  progres,
}: GameCardProps) {
  // render thumbnail asli jika file ada; kalau 404 → placeholder gradien+emoji
  const [pakaiGambar, setPakaiGambar] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const segera = game.status === "segera";
  const besar = variant === "besar";
  const href = segera ? `/segera-hadir?fitur=${game.id}` : game.href;

  // 404 bisa terjadi SEBELUM hydrate (onError React tak sempat terpasang) —
  // cek ulang setelah mount supaya fallback emoji tetap muncul
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setPakaiGambar(false);
  }, []);

  return (
    <Link
      href={href}
      onClick={() => {
        if (!segera) catatMain(game.id);
      }}
      aria-label={`${game.judul} — ${segera ? "segera hadir" : game.subjudul}`}
      className={[
        "group flex flex-col h-full rounded-xl bg-surface border-2 border-border",
        "p-2 no-underline shadow-[0_2px_8px_rgba(16,32,43,0.08)]",
        "transition-[transform,border-color,box-shadow] duration-200 ease-out",
        "hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_20px_rgba(16,32,43,0.14)]",
        // umpan balik sentuh: hover tak ada di tablet — kartu "menciut" saat ditekan
        "active:scale-95 active:translate-y-0",
      ].join(" ")}
    >
      {/* art di dalam bingkai */}
      <span
        className={[
          "relative block overflow-hidden rounded-lg",
          besar
            ? "aspect-[16/10] lg:aspect-auto lg:flex-1 lg:min-h-0"
            : "aspect-[4/3]",
          `bg-gradient-to-br ${game.gradien}`,
        ].join(" ")}
      >
        {pakaiGambar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={game.thumbnail}
            alt=""
            width={512}
            height={683}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setPakaiGambar(false)}
          />
        )}

        {/* emoji placeholder di tengah (hanya saat thumbnail belum ada) */}
        {!pakaiGambar && (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-6xl opacity-90 group-hover:scale-110 transition-transform duration-200"
          >
            {game.emoji}
          </span>
        )}

        {/* tombol play kuning bulat (token accent), pojok kanan atas art */}
        <span
          aria-hidden="true"
          className={[
            "absolute top-2 right-2 rounded-full bg-accent border-4 border-accent-edge",
            "flex items-center justify-center text-on-accent font-black",
            besar ? "w-11 h-11 text-lg" : "w-9 h-9 text-sm",
          ].join(" ")}
        >
          ▶
        </span>

        {/* badge ajakan (Baru!/Main lagi) — disembunyikan bila game terkunci */}
        {badge && !segera && (
          <span className="absolute top-2 left-2 bg-accent text-on-accent text-xs font-extrabold rounded-full px-2.5 py-1 border-2 border-accent-edge">
            {badge}
          </span>
        )}

        {/* chip progres (⭐ Lv N / 📖 Bab N) — kemajuan nyata dari profil */}
        {progres && !segera && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-bold rounded-full px-2.5 py-1">
            {progres}
          </span>
        )}

        {/* badge Segera Hadir — status tak hanya lewat visual redup */}
        {segera && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold rounded-full px-3 py-1">
            🔒 Segera Hadir
          </span>
        )}
      </span>

      {/* label di bawah art (di dalam bingkai putih, gaya referensi) */}
      <span className={`block text-center px-1 pt-2 ${besar ? "pb-2" : "pb-1"}`}>
        <span
          className={[
            "block font-display font-extrabold text-fg leading-tight",
            besar ? "text-lg sm:text-xl" : "text-sm sm:text-base",
          ].join(" ")}
        >
          {game.judul}
        </span>
        {besar && (
          <span className="block text-sm text-muted font-bold mt-0.5">
            {game.subjudul}
          </span>
        )}
      </span>
    </Link>
  );
}
