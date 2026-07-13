"use client";

import { useOnline } from "./OnlineContext";

/* Banner status offline melintang di paling atas layar. Muncul HANYA saat
   koneksi putus. Tinggi banner disediakan CSS lewat --tinggi-banner-offline
   (globals.css) sehingga isi halaman turun & tidak tertutup. z tinggi supaya
   di atas header tiap halaman; native <dialog> popup tetap menang di atasnya. */

export default function IndikatorOffline() {
  const { online } = useOnline();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed top-0 inset-x-0 z-[300]",
        "flex items-center justify-center gap-2 px-4",
        "h-[var(--tinggi-banner-offline)]",
        "bg-accent text-on-accent",
        "font-display font-extrabold text-sm sm:text-base text-center",
        "border-b-2 border-accent-edge shadow-[0_2px_6px_rgba(0,0,0,0.15)]",
      ].join(" ")}
    >
      <span aria-hidden="true">📴</span>
      <span>Kamu sedang offline — sebagian permainan tetap bisa dimainkan!</span>
    </div>
  );
}
