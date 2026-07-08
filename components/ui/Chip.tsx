import type { HTMLAttributes, ReactNode } from "react";

/* Chip pill emoji + label (gaya THYNK, catatan-restyle-thynk.md §D) —
   penyeragam chip yang tersebar (counter koleksi, kategori video, dst.).
   fg di atas band-* sudah lolos kontras (scripts/cek-kontras.mjs). */

type WarnaChip = "polos" | "pink" | "hijau" | "biru" | "kuning";

const warnaClasses: Record<WarnaChip, string> = {
  polos: "bg-surface-2 border-2 border-border text-fg",
  pink: "bg-band-pink text-fg",
  hijau: "bg-band-green text-fg",
  biru: "bg-band-blue text-fg",
  kuning: "bg-accent text-on-accent",
};

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  emoji?: string;
  warna?: WarnaChip;
  children: ReactNode;
}

export default function Chip({
  emoji,
  warna = "polos",
  className = "",
  children,
  ...rest
}: ChipProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "text-sm font-bold whitespace-nowrap",
        warnaClasses[warna],
        className,
      ].join(" ")}
      {...rest}
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      {children}
    </span>
  );
}
