import type { HTMLAttributes } from "react";

/* Awan pikiran dekoratif (catatan-restyle-thynk.md §B). Warna via
   currentColor — di atas band pastel biasanya text-white / text-surface. */

export default function AwanPikiran({
  className = "",
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 90 64" className="w-full h-full" fill="currentColor">
        <circle cx={30} cy={26} r={16} />
        <circle cx={48} cy={20} r={18} />
        <circle cx={66} cy={27} r={14} />
        <circle cx={57} cy={34} r={15} />
        <circle cx={38} cy={35} r={14} />
        <circle cx={20} cy={48} r={6} />
        <circle cx={11} cy={57} r={3.5} />
      </svg>
    </span>
  );
}
