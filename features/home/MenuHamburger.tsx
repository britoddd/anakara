"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { useOnline } from "@/features/offline/OnlineContext";
import { MENU_LAIN } from "./menu";

interface MenuHamburgerProps {
  /** buka panduan (tombol ? versi desktop) */
  onPanduan: () => void;
  /** buka konfirmasi keluar (tombol 🚪 versi desktop) */
  onKeluar: () => void;
}

/* Menu ringkas untuk layar sempit (< sm): satu tombol hamburger yang
   melipat aksi header yang tak muat sejajar — Panduan, tautan MENU_LAIN
   (Kelas/Leaderboard/Koleksi), dan Keluar — jadi dropdown. Di desktop aksi
   itu tetap tampil berjajar (lihat header Home), jadi komponen ini sendiri
   disembunyikan lewat `sm:hidden`. Menutup saat klik di luar / tekan Esc /
   memilih salah satu item, supaya jempol anak tak "terjebak" di menu. */

/* baris item dropdown: target sentuh lega, gaya sama antar item */
const BARIS =
  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl no-underline text-left " +
  "font-display font-bold bg-transparent border-0 cursor-pointer " +
  "hover:bg-surface-2 active:scale-[0.98] transition-[background-color,transform] duration-150";

export default function MenuHamburger({
  onPanduan,
  onKeluar,
}: MenuHamburgerProps) {
  const [buka, setBuka] = useState(false);
  const bungkusRef = useRef<HTMLDivElement>(null);
  const { mintaOnline } = useOnline();

  /* tutup saat sentuh di luar bungkus atau tekan Esc */
  useEffect(() => {
    if (!buka) return;
    const diLuar = (e: PointerEvent) => {
      if (bungkusRef.current && !bungkusRef.current.contains(e.target as Node))
        setBuka(false);
    };
    const onTombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("pointerdown", diLuar);
    document.addEventListener("keydown", onTombol);
    return () => {
      document.removeEventListener("pointerdown", diLuar);
      document.removeEventListener("keydown", onTombol);
    };
  }, [buka]);

  /* pilih item → jalankan aksi lalu tutup menu */
  const pilih = (aksi: () => void) => () => {
    setBuka(false);
    aksi();
  };

  return (
    <div ref={bungkusRef} className="relative sm:hidden">
      {/* tombol hamburger: tiga garis → silang saat terbuka.
          data-tutorial="menu-lain" agar sorotan panduan menemukannya di layar
          sempit (versi desktop tersembunyi); resolver panduan memilih yang
          sedang terlihat. */}
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-label={buka ? "Tutup menu" : "Buka menu"}
        aria-expanded={buka}
        aria-haspopup="menu"
        data-tutorial="menu-lain"
        className={[
          "w-11 h-11 rounded-full flex flex-col items-center justify-center gap-[5px]",
          "bg-surface border-2 border-border",
          "hover:border-primary active:translate-y-[2px] transition-colors duration-150",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className={[
            "block w-5 h-0.5 rounded-full bg-fg transition-transform duration-200",
            buka ? "translate-y-[7px] rotate-45" : "",
          ].join(" ")}
        />
        <span
          aria-hidden="true"
          className={[
            "block w-5 h-0.5 rounded-full bg-fg transition-opacity duration-200",
            buka ? "opacity-0" : "",
          ].join(" ")}
        />
        <span
          aria-hidden="true"
          className={[
            "block w-5 h-0.5 rounded-full bg-fg transition-transform duration-200",
            buka ? "-translate-y-[7px] -rotate-45" : "",
          ].join(" ")}
        />
      </button>

      {buka && (
        <div
          role="menu"
          aria-label="Menu lainnya"
          className={[
            "absolute right-0 top-full mt-2 z-40 w-56 p-2",
            "bg-surface text-fg border-2 border-border rounded-2xl",
            "shadow-[0_10px_24px_-6px_rgba(0,0,0,0.28)]",
            "flex flex-col gap-1",
            "motion-safe:animate-[menu-turun_150ms_ease-out]",
          ].join(" ")}
        >
          <button
            type="button"
            role="menuitem"
            onClick={pilih(onPanduan)}
            className={BARIS + " text-fg"}
          >
            <span
              className="w-8 h-8 shrink-0 rounded-full bg-accent text-on-accent flex items-center justify-center text-lg font-extrabold"
              aria-hidden="true"
            >
              ?
            </span>
            Panduan
          </button>

          {MENU_LAIN.map((item) => (
            <Link
              key={item.id}
              role="menuitem"
              href={
                item.status === "segera"
                  ? `/segera-hadir?fitur=${item.id}`
                  : item.href
              }
              onClick={(e) => {
                // fitur butuh internet + sedang offline → tahan, munculkan popup
                // (sama seperti satelit versi desktop di header Home)
                if (
                  item.onlineOnly &&
                  !mintaOnline(`${item.judul} butuh internet. Sambungkan dulu, ya!`)
                ) {
                  e.preventDefault();
                }
                setBuka(false);
              }}
              className={BARIS + " text-fg"}
            >
              <span
                className="w-8 h-8 shrink-0 rounded-full bg-surface-2 border-2 border-border flex items-center justify-center"
                aria-hidden="true"
              >
                {item.gambar ? (
                  <GambarEmoji
                    src={item.gambar}
                    emoji={item.emoji}
                    className="w-5 h-5 object-contain"
                    emojiClassName="text-base"
                  />
                ) : (
                  <span className="text-base">{item.emoji}</span>
                )}
              </span>
              {item.judul}
            </Link>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={pilih(onKeluar)}
            className={BARIS + " text-danger"}
          >
            <span
              className="w-8 h-8 shrink-0 rounded-full bg-surface-2 border-2 border-border flex items-center justify-center text-base"
              aria-hidden="true"
            >
              🚪
            </span>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
