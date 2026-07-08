import type { HTMLAttributes } from "react";

/* Blob bermata gaya restyle THYNK (catatan-restyle-thynk.md §B) — "teman-teman"
   dekoratif, BUKAN pengganti maskot Tayo. Murni hiasan: aria-hidden +
   pointer-events-none; jangan dipasang di area soal/permainan aktif.
   Warna badan via currentColor (set lewat kelas text-*, mis. text-green-bright).
   Wajah = konstanta ilustrasi (seperti isi gambar) — sengaja bukan token. */

type Bentuk = "bunga" | "cipratan" | "gumpal";

const MATA_GELAP = "#163a2c";
const PIPI_PINK = "#f9b8cd";

function Badan({ bentuk }: { bentuk: Bentuk }) {
  if (bentuk === "bunga") {
    // kelopak = lingkaran tumpang tindih satu warna
    return (
      <g fill="currentColor">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <circle
            key={deg}
            cx={50 + 26 * Math.cos((deg * Math.PI) / 180)}
            cy={52 + 26 * Math.sin((deg * Math.PI) / 180)}
            r={17}
          />
        ))}
        <circle cx={50} cy={52} r={28} />
      </g>
    );
  }
  if (bentuk === "cipratan") {
    // bintang 8 sudut; stroke tebal round = ujung runcing membulat
    const titik = Array.from({ length: 16 }, (_, i) => {
      const r = i % 2 === 0 ? 44 : 25;
      const a = (i * Math.PI) / 8;
      return `${(50 + r * Math.cos(a)).toFixed(1)},${(52 + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
    return (
      <polygon
        points={titik}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinejoin="round"
      />
    );
  }
  // gumpal: gerombolan lingkaran seperti awan/semak
  return (
    <g fill="currentColor">
      <circle cx={36} cy={60} r={22} />
      <circle cx={62} cy={56} r={24} />
      <circle cx={46} cy={40} r={19} />
      <circle cx={70} cy={72} r={15} />
      <circle cx={30} cy={76} r={13} />
    </g>
  );
}

interface BlobMataProps extends HTMLAttributes<HTMLSpanElement> {
  bentuk?: Bentuk;
  /** false = bentuk polos tanpa wajah — untuk doodle latar yang samar */
  wajah?: boolean;
}

export default function BlobMata({
  bentuk = "gumpal",
  wajah = true,
  className = "",
  ...rest
}: BlobMataProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block pointer-events-none select-none ${className}`}
      {...rest}
    >
      <svg viewBox="0 0 100 104" className="w-full h-full">
        <Badan bentuk={bentuk} />
        {wajah && (
          <>
            {/* wajah: mata melirik + pipi + senyum kecil */}
            <ellipse cx={41} cy={54} rx={7} ry={8.5} fill="#ffffff" />
            <ellipse cx={59} cy={54} rx={7} ry={8.5} fill="#ffffff" />
            <circle cx={42.5} cy={51.5} r={3.6} fill={MATA_GELAP} />
            <circle cx={60.5} cy={51.5} r={3.6} fill={MATA_GELAP} />
            <circle cx={32} cy={64} r={4.2} fill={PIPI_PINK} />
            <circle cx={68} cy={64} r={4.2} fill={PIPI_PINK} />
            <path
              d="M46 66 Q 50 70 54 66"
              fill="none"
              stroke={MATA_GELAP}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </span>
  );
}
