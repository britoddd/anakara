import type { HTMLAttributes } from "react";
import AwanPikiran from "./AwanPikiran";
import Squiggle from "./Squiggle";

/* Latar kelas untuk menu Kuis Asik: doodle tanda tanya, awan ide, bola
   lampu, dan pensil samar di "dinding kelas" (gaya LatarDapur — polos
   tanpa wajah, warna band-*) + buku tulis bergaris dengan lubang jilid
   spiral di bagian bawah (CSS .kertas-garis + .kertas-lubang di
   globals.css — warna ikut token, aman dua tema).
   fixed + -z-10 → di belakang seluruh konten; murni hiasan.
   tetap={false} = absolute, untuk pratinjau dalam kotak (galeri dev). */

function TandaTanya({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 72 104" fill="none" className="w-full h-full">
        <path
          d="M14 30 q0 -20 22 -20 q22 0 22 19 q0 12 -12 18 q-10 5 -10 17"
          stroke="currentColor"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <circle cx={36} cy={92} r={8} fill="currentColor" />
      </svg>
    </span>
  );
}

function BolaLampu({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 88 108" fill="none" className="w-full h-full">
        {/* sinar ide */}
        <path d="M44 2 v6 M12 12 l8 8 M76 12 l-8 8" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
        {/* bohlam + ulir fitting */}
        <circle cx={44} cy={40} r={26} stroke="currentColor" strokeWidth={7} />
        <path d="M34 74 h20 M34 84 h20 M38 94 h12" stroke="currentColor" strokeWidth={7} strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Pensil({ className = "", ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 120 64" fill="none" className="w-full h-full">
        {/* badan + garis penghapus + ujung runcing */}
        <path d="M10 18 h68 v28 H10 z" stroke="currentColor" strokeWidth={7} strokeLinejoin="round" />
        <path d="M24 18 v28" stroke="currentColor" strokeWidth={7} />
        <path d="M78 18 l32 14 -32 14" stroke="currentColor" strokeWidth={7} strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function LatarKuis({ tetap = true }: { tetap?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`${tetap ? "fixed" : "absolute"} inset-0 -z-10 overflow-hidden pointer-events-none`}
    >
      {/* dinding kelas: tanda tanya, awan ide, bola lampu, pensil */}
      <TandaTanya className="absolute left-[5%] top-[9%] w-12 sm:w-14 text-band-pink -rotate-12" />
      <AwanPikiran className="hidden sm:block absolute left-[44%] top-[4%] w-20 text-band-blue" />
      <BolaLampu className="absolute right-[5%] top-[8%] w-14 sm:w-16 text-band-green" />
      <TandaTanya className="hidden sm:block absolute right-[17%] top-[36%] w-10 text-band-blue rotate-12" />
      <Pensil className="hidden sm:block absolute left-[7%] top-[44%] w-24 text-band-green -rotate-12" />
      <Squiggle className="absolute right-[28%] top-[20%] w-20 text-band-pink rotate-6" />

      {/* meja belajar: buku tulis bergaris + lubang jilid spiral di tepinya */}
      <div className="absolute inset-x-0 bottom-0 h-[34%] kertas-garis">
        <div className="absolute inset-x-0 top-1.5 h-4 kertas-lubang" />
      </div>
    </div>
  );
}
