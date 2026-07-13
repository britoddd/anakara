"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { LANGKAH_TUTORIAL } from "./tutorial";

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
  /** mulai dari langkah ke-n (0-based) — dipakai halaman uji /dev/tutorial */
  langkahAwal?: number;
}

/* rect elemen target dalam koordinat viewport (posisi sorotan fixed) */
interface Kotak {
  top: number;
  left: number;
  width: number;
  height: number;
}

/* jarak napas sorotan dari tepi elemen */
const PAD = 8;

/* Panduan interaktif Home: layar diredupkan, elemen asli disorot satu per
   satu (lubang cahaya mengikuti scroll/resize), Tayo menjelaskan di kartu
   yang menempel dekat sorotan. Langkah dari LANGKAH_TUTORIAL (tutorial.ts);
   langkah tanpa target = kartu sambutan di tengah layar. */
export default function TutorialOverlay({
  open,
  onClose,
  langkahAwal = 0,
}: TutorialOverlayProps) {
  const total = LANGKAH_TUTORIAL.length;
  const awal = Math.min(Math.max(langkahAwal, 0), total - 1);
  const [langkah, setLangkah] = useState(awal);
  const [kotak, setKotak] = useState<Kotak | null>(null);
  const kartuRef = useRef<HTMLDivElement>(null);

  const data = LANGKAH_TUTORIAL[langkah];
  const terakhir = langkah === total - 1;

  /* mulai lagi dari awal saat ditutup — buka berikutnya = langkah awal */
  useEffect(() => {
    if (!open) setLangkah(awal);
  }, [open, awal]);

  /* cari elemen target langkah ini, gulir ke tengah layar, lalu ukur;
     sorotan mengikuti scroll/resize supaya tetap menempel di elemennya */
  useEffect(() => {
    if (!open) return;
    const target = LANGKAH_TUTORIAL[langkah].target;
    const el = target
      ? document.querySelector<HTMLElement>(`[data-tutorial="${target}"]`)
      : null;
    if (!el) {
      /* target tak ditemukan (atau langkah sambutan) → tanpa sorotan */
      setKotak(null);
      return;
    }
    const halus = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: halus ? "smooth" : "auto" });
    const ukur = () => {
      const r = el.getBoundingClientRect();
      setKotak({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    ukur();
    /* ukur ulang setelah layout tenang: transisi rute/font/gambar bisa
       menggeser elemen tanpa memicu event scroll/resize */
    const raf = requestAnimationFrame(ukur);
    const tunda = window.setTimeout(ukur, 400);
    window.addEventListener("resize", ukur);
    window.addEventListener("scroll", ukur, true);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(tunda);
      window.removeEventListener("resize", ukur);
      window.removeEventListener("scroll", ukur, true);
    };
  }, [open, langkah]);

  /* fokus ke tombol Lanjut tiap langkah (kartu di-remount via key) supaya
     Enter-Enter-Enter cukup untuk menyelesaikan panduan. Lanjut = tombol
     terakhir di kartu (urutan DOM: ✕, Sebelumnya?, Lanjut). */
  useEffect(() => {
    if (!open) return;
    const tombol = kartuRef.current?.querySelectorAll<HTMLButtonElement>("button");
    tombol?.[tombol.length - 1]?.focus();
  }, [open, langkah]);

  /* Esc menutup; Tab berputar di dalam kartu (halaman di belakang diblokir) */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const kartu = kartuRef.current;
      if (!kartu) return;
      const tombol = kartu.querySelectorAll<HTMLElement>("button");
      if (tombol.length === 0) return;
      const pertama = tombol[0];
      const akhir = tombol[tombol.length - 1];
      const aktif = document.activeElement;
      if (!kartu.contains(aktif)) {
        e.preventDefault();
        pertama.focus();
      } else if (e.shiftKey && aktif === pertama) {
        e.preventDefault();
        akhir.focus();
      } else if (!e.shiftKey && aktif === akhir) {
        e.preventDefault();
        pertama.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  /* kartu menempel di bawah sorotan bila target di paruh atas layar,
     di atasnya bila di paruh bawah — tumbuh menjauh, tak menutupi target */
  let posisiKartu: CSSProperties;
  if (!kotak) {
    posisiKartu = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  } else {
    const lebarLayar = window.innerWidth;
    const tinggiLayar = window.innerHeight;
    const lebarKartu = Math.min(lebarLayar * 0.92, 400);
    const kiri = Math.min(
      Math.max(kotak.left + kotak.width / 2 - lebarKartu / 2, 8),
      lebarLayar - lebarKartu - 8
    );
    const tengahTarget = kotak.top + kotak.height / 2;
    /* clamp ±300px: target lebih tinggi dari layar (mis. grid game) membuat
       posisi mentah keluar viewport — kartu boleh menimpa sorotan daripada hilang */
    posisiKartu =
      tengahTarget < tinggiLayar / 2
        ? {
            top: Math.min(kotak.top + kotak.height + PAD + 12, tinggiLayar - 300),
            left: kiri,
            width: lebarKartu,
          }
        : {
            bottom: Math.min(
              Math.max(tinggiLayar - kotak.top + PAD + 12, 8),
              tinggiLayar - 300
            ),
            left: kiri,
            width: lebarKartu,
          };
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* peredup: lubang cahaya via box-shadow raksasa di sekeliling target */}
      {kotak ? (
        <div
          aria-hidden="true"
          className="fixed rounded-xl shadow-[0_0_0_200vmax_rgba(0,0,0,0.6)] transition-[top,left,width,height] duration-200 ease-out"
          style={{
            top: kotak.top - PAD,
            left: kotak.left - PAD,
            width: kotak.width + PAD * 2,
            height: kotak.height + PAD * 2,
          }}
        >
          {/* cincin aksen berdenyut menarik mata anak ke elemen yang disorot */}
          <div className="absolute inset-0 rounded-xl border-4 border-accent motion-safe:animate-[sorot-denyut_1.6s_ease-in-out_infinite]" />
        </div>
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-black/60" />
      )}

      {/* kartu di-remount tiap langkah (key) agar animasi pop terulang */}
      <div
        key={langkah}
        ref={kartuRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-judul"
        className="fixed bg-surface text-fg border-2 border-border rounded-xl p-5 sm:p-6 w-[min(92vw,400px)] motion-safe:animate-[kartu-pop_200ms_ease-out]"
        style={posisiKartu}
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-14 h-14 shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-3xl"
            aria-hidden="true"
          >
            <GambarEmoji
              src={data.gambar}
              emoji={data.emoji}
              className="w-full h-full object-cover"
            />
          </span>
          <h2 id="tutorial-judul" className="text-xl flex-1 min-w-0">
            {data.judul}
          </h2>
          <button
            onClick={onClose}
            aria-label="Lewati panduan"
            title="Lewati"
            className={[
              "shrink-0 w-11 h-11 -mt-1 -mr-1 rounded-full",
              "flex items-center justify-center text-lg font-bold",
              "bg-surface-2 text-muted border-2 border-border",
              "hover:text-fg hover:border-primary",
              "active:translate-y-[2px] transition-colors duration-150",
            ].join(" ")}
          >
            ✕
          </button>
        </div>

        <p className="font-bold text-muted mb-4">{data.teks}</p>

        {/* titik progres: langkah aktif memanjang jadi pil aksen */}
        <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
          {LANGKAH_TUTORIAL.map((_, i) => (
            <span
              key={i}
              className={[
                "h-2 rounded-full transition-[width,background-color] duration-200",
                i === langkah ? "w-6 bg-accent" : "w-2 bg-border",
              ].join(" ")}
            />
          ))}
        </div>
        {/* pembaca layar dapat konteks langkah saat fokus pindah ke kartu baru */}
        <span className="sr-only">
          Langkah {langkah + 1} dari {total}
        </span>

        <div className="flex justify-end gap-3">
          {langkah > 0 && (
            <Button variant="ghost" onClick={() => setLangkah((l) => l - 1)}>
              Sebelumnya
            </Button>
          )}
          <Button onClick={terakhir ? onClose : () => setLangkah((l) => l + 1)}>
            {terakhir ? "Selesai 🎉" : "Lanjut"}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes kartu-pop {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes sorot-denyut {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.04); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
