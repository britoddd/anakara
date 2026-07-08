import Link from "next/link";

/* Tombol kembali seragam untuk header semua halaman: lingkaran ← 44px
   (target sentuh §4.6), warna bg-fg/text-bg (kontras kuat di dua tema),
   aria-label WAJIB deskriptif ("Kembali ke Home", "Keluar dari kuis", …).
   - href   → render <Link> (navigasi antar halaman)
   - onClick → render <button> (kembali antar fase/state dalam satu halaman)
   - overlay → varian di atas video/foto (hitam transparan + tepi putih,
     legibilitas tidak bergantung tema; menyalakan pointer-events sendiri
     karena bar video memakai pointer-events-none)
   CTA layar hasil ("Kembali ke Home" dsb.) tetap <Button> biasa TANPA "←" —
   panah hanya milik tombol lingkaran ini. */

interface TombolKembaliProps {
  href?: string;
  onClick?: () => void;
  label: string;
  overlay?: boolean;
}

export default function TombolKembali({
  href,
  onClick,
  label,
  overlay = false,
}: TombolKembaliProps) {
  const kelas = [
    "shrink-0 w-11 h-11 rounded-full flex items-center justify-center",
    "font-bold no-underline",
    overlay
      ? "bg-black/40 border-2 border-white/40 text-white pointer-events-auto"
      : "bg-fg text-bg",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} aria-label={label} className={kelas}>
        ←
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`${kelas} cursor-pointer`}>
      ←
    </button>
  );
}
