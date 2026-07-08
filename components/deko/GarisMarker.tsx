import type { ReactNode } from "react";

/* Garis marker tangan di bawah kata penting pada judul (gaya THYNK,
   catatan-restyle-thynk.md §B). Pakai untuk SATU kata kunci per judul:
   <h1>Belajar <GarisMarker>Gizi</GarisMarker> Seru</h1>
   Warna garis via kelas text-* (default text-primary; di judul terang
   pakai mis. text-accent). Garis dekoratif — teks tetap node biasa. */

export default function GarisMarker({
  children,
  warnaKelas = "text-primary",
}: {
  children: ReactNode;
  warnaKelas?: string;
}) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        className={`absolute left-0 -bottom-[0.18em] w-full h-[0.22em] pointer-events-none ${warnaKelas}`}
      >
        <path
          d="M4 8 C 22 3 34 10 52 6 S 82 3 96 7"
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
