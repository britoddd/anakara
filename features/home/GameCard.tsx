"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MenuGame } from "./menu";

/* Kartu menu game (mockup MacBook Air - 5/9 + design-system.html .game-card):
   thumbnail art dramatis 3:4, radius-lg, tombol play kuning pojok kanan atas,
   judul putih + subjudul di atas gradasi gelap. (Mask arch dari restyle D12
   dibatalkan atas permintaan user — bentuk mengikuti design system.)
   Pengecualian sadar aturan A2: bagian DALAM kartu boleh gelap/cinematic;
   teks putih di atas overlay hitam ≥60% tetap kontras AA. */

export default function GameCard({ game }: { game: MenuGame }) {
  // render thumbnail asli jika file ada; kalau 404 → placeholder gradien+emoji
  const [pakaiGambar, setPakaiGambar] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const segera = game.status === "segera";
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
      aria-label={`${game.judul} — ${segera ? "segera hadir" : game.subjudul}`}
      className={[
        // "block" wajib: <a> default inline → w-/aspect- diabaikan, kartu kolaps
        "group relative block shrink-0 snap-start overflow-hidden",
        "w-56 sm:w-64 aspect-[3/4] rounded-lg no-underline",
        "border-4 border-black/30",
        "transition-transform duration-200 ease-out",
        "hover:-translate-y-1.5 hover:scale-[1.02] focus-visible:scale-[1.02]",
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
          className="absolute inset-0 flex items-center justify-center text-7xl opacity-90 group-hover:scale-110 transition-transform duration-200"
        >
          {game.emoji}
        </span>
      )}

      {/* tombol play kuning bulat (token accent), pojok kanan atas */}
      <span
        aria-hidden="true"
        className="absolute top-3 right-3 w-11 h-11 rounded-full bg-accent border-4 border-accent-edge flex items-center justify-center text-on-accent text-lg font-black"
      >
        ▶
      </span>

      {/* badge Segera Hadir — status tak hanya lewat visual redup */}
      {segera && (
        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold rounded-full px-3 py-1">
          🔒 Segera Hadir
        </span>
      )}

      {/* judul + subjudul di atas gradasi gelap (teks putih AA) */}
      <span className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 bg-gradient-to-t from-black/85 via-black/55 to-transparent text-center">
        <span className="block font-display font-extrabold text-white text-xl leading-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
          {game.judul}
        </span>
        <span className="block text-white/90 text-sm font-bold mt-1 leading-snug">
          {game.subjudul}
        </span>
      </span>
    </Link>
  );
}
