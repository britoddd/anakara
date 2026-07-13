import type { HTMLAttributes } from "react";
import Squiggle from "./Squiggle";

/* Latar arena untuk menu Team Battle 2v2: tali bendera lomba (bunting) di
   langit-langit, doodle perisai dua kubu (biru kiri vs pink kanan) + petir
   & bintang penyemangat di "tribun" (gaya LatarDapur — polos, warna band-*),
   lalu matras lantai garis diagonal warna dua tim (CSS .lantai-arena di
   globals.css — color-mix token, aman dua tema).
   fixed + -z-10 → di belakang seluruh konten; murni hiasan.
   tetap={false} = absolute, untuk pratinjau dalam kotak (galeri dev). */

function Perisai({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 90 104" fill="none" className="w-full h-full">
        {/* badan perisai */}
        <path
          d="M45 8 L79 21 v27 q0 30 -34 46 q-34 -16 -34 -46 v-27 z"
          stroke="currentColor"
          strokeWidth={8}
          strokeLinejoin="round"
        />
        {/* salib heraldik sederhana */}
        <path d="M45 30 v32 M29 46 h32" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Petir({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 64 92" fill="currentColor" className="w-full h-full">
        <path d="M30 2 L6 50 h18 L16 90 L58 36 H38 L50 2 z" />
      </svg>
    </span>
  );
}

function Bintang({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 96 92" fill="currentColor" className="w-full h-full">
        <path d="M48 4 l11 27 29 3 -22 20 6 29 -24 -15 -24 15 6 -29 -22 -20 29 -3 z" />
      </svg>
    </span>
  );
}

/* Tali bendera segitiga selebar layar; preserveAspectRatio="none" supaya
   ikut melar — segitiga tetap terbaca sebagai bendera. Warna band-* via
   var() langsung (satu SVG multi-warna, tidak bisa currentColor). */
function BenderaTali({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 480 56" fill="none" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0 8 Q 240 30 480 8" stroke="var(--border)" strokeWidth={4} />
        <polygon points="24,11 56,11 40,41" fill="var(--band-pink)" />
        <polygon points="104,16 136,16 120,46" fill="var(--band-green)" />
        <polygon points="184,19 216,19 200,49" fill="var(--band-blue)" />
        <polygon points="264,19 296,19 280,49" fill="var(--band-pink)" />
        <polygon points="344,16 376,16 360,46" fill="var(--band-green)" />
        <polygon points="424,11 456,11 440,41" fill="var(--band-blue)" />
      </svg>
    </span>
  );
}

export default function LatarArena({ tetap = true }: { tetap?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`${tetap ? "fixed" : "absolute"} inset-0 -z-10 overflow-hidden pointer-events-none`}
    >
      {/* langit-langit: tali bendera lomba */}
      <BenderaTali className="absolute inset-x-0 top-0 h-10 sm:h-14 w-full" />

      {/* tribun: perisai dua kubu berhadapan + petir & bintang */}
      <Perisai className="absolute left-[4%] top-[24%] w-16 sm:w-20 text-band-blue -rotate-6" />
      <Petir className="hidden sm:block absolute left-[14%] top-[48%] w-9 text-band-blue rotate-12" />
      <Perisai className="absolute right-[4%] top-[24%] w-16 sm:w-20 text-band-pink rotate-6" />
      <Petir className="hidden sm:block absolute right-[14%] top-[48%] w-9 text-band-pink -rotate-12" />
      <Bintang className="hidden sm:block absolute left-[29%] top-[15%] w-10 text-band-green rotate-12" />
      <Bintang className="absolute right-[29%] top-[17%] w-8 text-band-green -rotate-12" />
      <Squiggle className="hidden sm:block absolute left-[42%] top-[42%] w-24 text-band-green -rotate-6" />

      {/* lantai: matras arena garis diagonal warna dua tim + garis pembatas */}
      <div className="absolute inset-x-0 bottom-0 h-[20%] lantai-arena" />
      <div className="absolute inset-x-0 bottom-[20%] h-1.5 bg-border" />
    </div>
  );
}
