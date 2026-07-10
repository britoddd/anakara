"use client";

import GambarEmoji from "@/components/ui/GambarEmoji";
import { AVATARS } from "./avatars";

interface PilihanAvatarProps {
  /** id avatar terpilih; null = belum ada */
  nilai: string | null;
  onPilih: (id: string) => void;
}

/* Grid 2×5 pemilih avatar (radiogroup, mockup MacBook Air - 8) — dipakai
   bersama oleh onboarding (buat profil) dan halaman /profil. */
export default function PilihanAvatar({ nilai, onPilih }: PilihanAvatarProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Pilih avatar"
      className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 justify-items-center max-w-xl mx-auto"
    >
      {AVATARS.map((a) => {
        const aktif = nilai === a.id;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={aktif}
            aria-label={a.nama}
            onClick={() => onPilih(a.id)}
            className={[
              "w-20 h-20 sm:w-24 sm:h-24 rounded-full text-4xl sm:text-5xl",
              "flex items-center justify-center bg-white cursor-pointer overflow-hidden",
              "transition-[transform,border-color] duration-150 ease-out hover:scale-105",
              aktif
                ? "border-4 border-primary scale-105"
                : "border-4 border-border",
            ].join(" ")}
          >
            <GambarEmoji
              src={a.gambar}
              emoji={a.emoji}
              className="w-full h-full object-cover rounded-full"
            />
          </button>
        );
      })}
    </div>
  );
}
