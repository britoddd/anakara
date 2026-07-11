import type { HTMLAttributes } from "react";
import AwanPikiran from "./AwanPikiran";
import Squiggle from "./Squiggle";

/* Latar dapur untuk game Isi Piringku: doodle peralatan masak samar di
   "dinding" (gaya LatarDoodle — polos tanpa wajah, warna band-*) + taplak
   meja gingham kotak-kotak di bagian bawah (CSS .taplak-gingham + renda
   .taplak-renda di globals.css — warna ikut token, aman dua tema).
   fixed + -z-10 → di belakang seluruh konten; murni hiasan.
   tetap={false} = absolute, untuk pratinjau dalam kotak (galeri dev). */

function Panci({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 120 92" fill="none" className="w-full h-full">
        {/* kenop + tutup */}
        <circle cx={60} cy={16} r={6} fill="currentColor" />
        <path d="M24 34 Q 60 14 96 34" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
        {/* badan panci bulat-bawah */}
        <path
          d="M26 42 h68 v24 q0 16 -16 16 h-36 q-16 0 -16 -16 z"
          stroke="currentColor"
          strokeWidth={8}
          strokeLinejoin="round"
        />
        {/* gagang kiri-kanan */}
        <path d="M6 48 h14 M100 48 h14" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SendokGarpu({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 90 112" fill="none" className="w-full h-full">
        {/* sendok */}
        <ellipse cx={25} cy={24} rx={14} ry={18} stroke="currentColor" strokeWidth={7} />
        <path d="M25 44 v58" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
        {/* garpu */}
        <path d="M53 10 v16 M65 8 v18 M77 10 v16" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
        <path d="M53 28 q0 12 12 12 q12 0 12 -12" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
        <path d="M65 42 v60" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
      </svg>
    </span>
  );
}

function TopiKoki({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 90 72" fill="currentColor" className="w-full h-full">
        <circle cx={24} cy={26} r={15} />
        <circle cx={45} cy={17} r={17} />
        <circle cx={66} cy={26} r={15} />
        <rect x={24} y={28} width={42} height={26} />
        <rect x={21} y={56} width={48} height={9} rx={4.5} />
      </svg>
    </span>
  );
}

export default function LatarDapur({ tetap = true }: { tetap?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`${tetap ? "fixed" : "absolute"} inset-0 -z-10 overflow-hidden pointer-events-none`}
    >
      {/* dinding dapur: panci beruap, topi koki, sendok-garpu */}
      <Panci className="absolute left-[4%] top-[11%] w-24 text-band-blue" />
      {/* uap panci: squiggle diputar tegak */}
      <Squiggle className="absolute left-[5%] top-[1%] w-16 text-band-blue rotate-90" />
      <TopiKoki className="absolute left-[46%] top-[4%] w-20 text-band-green" />
      <SendokGarpu className="absolute right-[5%] top-[9%] w-16 text-band-pink -rotate-12" />
      <AwanPikiran className="hidden sm:block absolute right-[18%] top-[34%] w-16 text-band-blue" />
      <Squiggle className="hidden sm:block absolute left-[10%] top-[42%] w-24 text-band-pink -rotate-12" />

      {/* meja makan: taplak gingham + renda tepi */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] taplak-gingham" />
      <div className="absolute inset-x-0 bottom-[42%] h-3.5 taplak-renda" />
    </div>
  );
}
