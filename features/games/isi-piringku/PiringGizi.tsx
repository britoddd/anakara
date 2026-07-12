"use client";

import { useDroppable } from "@dnd-kit/core";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { KELOMPOK_INFO, URUTAN_KELOMPOK, type Kelompok, type Makanan } from "./config";

/* Piring 4 kuadran game Isi Piringku — komponen presentasi terpisah agar bisa
   dipratinjau di /dev/komponen. Tiap kuadran = droppable dnd-kit (butuh
   DndContext di atasnya) sekaligus tombol untuk mode ketuk.

   Desain: grid 2×2 dipotong lingkaran, jadi sudut luar tiap kuadran hilang.
   Konten TIDAK di tengah kuadran (bisa kepotong lengkung) melainkan di "zona
   aman": kotak 65% yang menempel sudut pusat piring dengan inset 5% —
   titik terjauhnya (0.7R, 0.7R) → √(0.98)·R, pasti di dalam lengkung. */

const ZONA_AMAN = [
  "right-[5%] bottom-[5%]", // kuadran kiri-atas → zona menempel pusat (kanan-bawah)
  "left-[5%] bottom-[5%]",
  "right-[5%] top-[5%]",
  "left-[5%] top-[5%]",
];

interface PiringGiziProps {
  tertempat: Record<Kelompok, Makanan[]>;
  onTapKuadran?: (k: Kelompok) => void;
  /** ada makanan terpilih (mode ketuk) → kuadran diberi cincin petunjuk */
  modeTapAktif?: boolean;
  className?: string;
}

export default function PiringGizi({
  tertempat,
  onTapKuadran,
  modeTapAktif = false,
  className = "",
}: PiringGiziProps) {
  return (
    /* bibir piring: cincin surface di sekeliling "cekungan" makanan */
    <div
      className={[
        "rounded-full bg-surface p-3 sm:p-4 border-2 border-border",
        "shadow-[0_10px_28px_rgba(16,32,43,0.16)]",
        className,
      ].join(" ")}
    >
      <div
        className="relative grid grid-cols-2 grid-rows-2 aspect-square rounded-full overflow-hidden border-2 border-border/60"
        aria-label="Piring dengan empat bagian kelompok makanan"
      >
        {URUTAN_KELOMPOK.map((k, i) => (
          <Kuadran
            key={k}
            kelompok={k}
            zonaAman={ZONA_AMAN[i]}
            items={tertempat[k]}
            onTap={() => onTapKuadran?.(k)}
            modeTapAktif={modeTapAktif}
          />
        ))}

        {/* garis pemisah silang (dekoratif — jangan halangi ketuk/seret) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-border/70"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-border/70"
        />

        {/* pusat piring (dekoratif) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-surface border-[3px] sm:border-4 border-border flex items-center justify-center text-xl sm:text-3xl"
        >
          ❤️
        </span>
      </div>
    </div>
  );
}

function Kuadran({
  kelompok,
  zonaAman,
  items,
  onTap,
  modeTapAktif,
}: {
  kelompok: Kelompok;
  zonaAman: string;
  items: Makanan[];
  onTap: () => void;
  modeTapAktif: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: kelompok });
  const info = KELOMPOK_INFO[kelompok];
  const rapat = items.length > 6; // banyak item → ikon dikecilkan agar muat di zona aman
  return (
    <button
      ref={setNodeRef}
      onClick={onTap}
      aria-label={`Bagian ${info.label} (${info.fungsi})${
        items.length ? `, berisi ${items.length} makanan` : ""
      }`}
      className={[
        "relative",
        info.bgKuadran,
        "transition-[filter,box-shadow] duration-150",
        isOver ? "brightness-95 shadow-[inset_0_0_0_4px_var(--focus)]" : "",
        modeTapAktif ? "cursor-pointer shadow-[inset_0_0_0_2px_var(--primary)]" : "",
      ].join(" ")}
    >
      <span
        className={`absolute w-[65%] h-[65%] ${zonaAman} flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-center`}
      >
        <span className="text-2xl sm:text-4xl leading-none" aria-hidden="true">
          {info.emoji}
        </span>
        <span className="font-display font-extrabold text-sm sm:text-xl leading-tight text-fg">
          {info.label}
        </span>
        <span className="text-[11px] sm:text-sm font-bold leading-tight text-muted">
          {info.fungsi}
        </span>
        {items.length > 0 && (
          <span
            className="flex flex-wrap justify-center gap-0.5 leading-none max-w-full"
            aria-hidden="true"
          >
            {items.map((f, i) => (
              <span
                key={`${f.id}-${i}`}
                className={[
                  "flex items-center justify-center",
                  rapat ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6 sm:w-8 sm:h-8",
                ].join(" ")}
              >
                <GambarEmoji
                  src={f.gambar}
                  emoji={f.emoji}
                  className="w-full h-full object-contain"
                  emojiClassName={rapat ? "text-sm sm:text-base" : "text-lg sm:text-2xl"}
                />
              </span>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}
