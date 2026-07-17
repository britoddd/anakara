"use client";

import { useEffect, useState } from "react";
import {
  suaraAktif,
  setSuaraAktif,
  getarAktif,
  setGetarAktif,
  getarDidukung,
  umpanBenar,
} from "@/lib/umpan-balik";

/* Pengaturan Suara & Getar (di halaman Profil). Nilai per perangkat
   (localStorage). Suara default MATI (ramah kelas), getar default NYALA.
   Tombol getar hanya muncul bila perangkat mendukung Vibration API. */

function Sakelar({
  nyala,
  onToggle,
  labelNyala,
  labelMati,
  ikonNyala,
  ikonMati,
}: {
  nyala: boolean;
  onToggle: () => void;
  labelNyala: string;
  labelMati: string;
  ikonNyala: string;
  ikonMati: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={nyala}
      onClick={onToggle}
      className={[
        "shrink-0 inline-flex items-center gap-2 rounded-full px-4 h-11 min-w-[6.5rem] justify-center",
        "font-display font-extrabold text-sm border-2",
        "active:translate-y-[2px] transition-colors duration-150",
        nyala
          ? "bg-success/15 border-success text-fg"
          : "bg-surface-2 border-border text-muted hover:border-primary",
      ].join(" ")}
    >
      <span className="text-lg" aria-hidden="true">
        {nyala ? ikonNyala : ikonMati}
      </span>
      {nyala ? labelNyala : labelMati}
    </button>
  );
}

export default function PengaturanUmpanBalik() {
  /* null sampai hydration selesai — hindari mismatch (nilai ada di localStorage) */
  const [suara, setSuara] = useState<boolean | null>(null);
  const [getar, setGetar] = useState<boolean | null>(null);
  const [adaGetar, setAdaGetar] = useState(false);

  useEffect(() => {
    setSuara(suaraAktif());
    setGetar(getarAktif());
    setAdaGetar(getarDidukung());
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold">Suara</p>
          <p className="text-muted text-sm font-bold">
            Bunyi seru saat menjawab & menang
          </p>
        </div>
        <Sakelar
          nyala={suara ?? false}
          onToggle={() => {
            const next = !(suara ?? false);
            setSuara(next);
            setSuaraAktif(next);
            if (next) umpanBenar(); // dengarkan contohnya saat dinyalakan
          }}
          labelNyala="Nyala"
          labelMati="Mati"
          ikonNyala="🔊"
          ikonMati="🔇"
        />
      </div>

      {adaGetar && (
        <div className="flex items-center justify-between gap-4 border-t-2 border-border pt-4">
          <div className="min-w-0">
            <p className="font-bold">Getar</p>
            <p className="text-muted text-sm font-bold">
              Getaran kecil di HP saat menjawab
            </p>
          </div>
          <Sakelar
            nyala={getar ?? false}
            onToggle={() => {
              const next = !(getar ?? false);
              setGetar(next);
              setGetarAktif(next);
              if (next && typeof navigator !== "undefined") {
                try {
                  navigator.vibrate(20);
                } catch {}
              }
            }}
            labelNyala="Nyala"
            labelMati="Mati"
            ikonNyala="📳"
            ikonMati="🚫"
          />
        </div>
      )}
    </div>
  );
}
