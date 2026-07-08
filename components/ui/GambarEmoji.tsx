"use client";

import { useEffect, useRef, useState } from "react";

interface GambarEmojiProps {
  src: string;
  /** fallback saat file gambar belum ada / gagal dimuat */
  emoji: string;
  /** kosongkan untuk gambar dekoratif (aria-hidden otomatis) */
  alt?: string;
  /** class untuk <img>; fallback emoji memakai emojiClassName */
  className?: string;
  emojiClassName?: string;
}

/* Gambar dengan fallback emoji — pola sama dengan GameCard: render <img>,
   kalau 404 kembali ke emoji. Dipakai untuk avatar & maskot Tayo. */
export default function GambarEmoji({
  src,
  emoji,
  alt = "",
  className = "",
  emojiClassName = "",
}: GambarEmojiProps) {
  const [pakaiGambar, setPakaiGambar] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // 404 bisa terjadi SEBELUM hydrate (onError React tak sempat terpasang) —
  // cek ulang setelah mount supaya fallback emoji tetap muncul
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setPakaiGambar(false);
  }, []);

  if (!pakaiGambar) {
    return (
      <span aria-hidden={alt === "" || undefined} className={emojiClassName}>
        {emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      aria-hidden={alt === "" || undefined}
      className={className}
      onError={() => setPakaiGambar(false)}
    />
  );
}
