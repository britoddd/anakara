import type { HTMLAttributes } from "react";

/* Coretan keriting dekoratif (catatan-restyle-thynk.md §B) — seperti coretan
   "m" pink tebal di referensi THYNK. Warna via currentColor (kelas text-*);
   putar/miringkan lewat className (mis. rotate-12). Murni hiasan. */

export default function Squiggle({
  className = "",
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 140 52" fill="none" className="w-full h-full">
        <path
          d="M10 40 C 6 16 30 10 34 26 C 37 38 24 44 22 34 C 28 12 54 8 58 24 C 61 36 48 42 46 32 C 52 10 78 8 82 24 C 85 36 72 42 70 32 C 76 10 102 10 106 26 C 109 40 96 46 94 36 C 100 16 124 14 130 30"
          stroke="currentColor"
          strokeWidth={9}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
