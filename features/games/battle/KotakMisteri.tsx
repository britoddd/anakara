"use client";

import { useRef, useState } from "react";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { POIN_DUPLIKAT, RARITY_INFO, gachaKartu, type KartuKoleksi } from "./config";

/* Kotak misteri (Phase 6, referensi peti WhatsApp ...21.55.30.jpeg):
   peti tertutup → tap → guncang → terbuka mengungkap kartu gacha D2.
   Kartu diroll SEKALI saat komponen dibuat (bukan saat dibuka) supaya
   refresh/tap ganda tidak bisa dipakai reroll. */

interface KotakMisteriProps {
  /** dipanggil sekali begitu kartu terungkap — pemanggil menyimpan ke Firestore */
  onTerbuka: (kartu: KartuKoleksi) => void;
  /** true = kartu sudah dimiliki → pesan +25⭐ (D2 duplikat) */
  duplikat: (kartu: KartuKoleksi) => boolean;
}

export default function KotakMisteri({ onTerbuka, duplikat }: KotakMisteriProps) {
  const kartuRef = useRef<KartuKoleksi | null>(null);
  if (!kartuRef.current) kartuRef.current = gachaKartu();
  const kartu = kartuRef.current;

  const [fase, setFase] = useState<"tutup" | "guncang" | "buka">("tutup");
  const sudahLapor = useRef(false);

  function buka() {
    if (fase !== "tutup") return;
    setFase("guncang");
    setTimeout(() => {
      setFase("buka");
      if (!sudahLapor.current) {
        sudahLapor.current = true;
        onTerbuka(kartu);
      }
    }, 900);
  }

  if (fase !== "buka") {
    return (
      <div className="text-center">
        <p className="text-lg font-bold mb-4">Kamu dapat kotak misteri! 🎁</p>
        <button
          onClick={buka}
          aria-label="Buka kotak misteri"
          className={[
            "text-8xl sm:text-9xl cursor-pointer bg-transparent border-0",
            "transition-transform duration-150 hover:scale-110",
            fase === "guncang" ? "motion-safe:animate-[wiggle_0.15s_ease-in-out_infinite]" : "motion-safe:animate-bounce",
          ].join(" ")}
        >
          <span aria-hidden="true">🎁</span>
        </button>
        <p className="text-muted font-bold mt-2">Tap untuk membuka!</p>
        {/* keyframes lokal untuk guncangan peti */}
        <style>{`@keyframes wiggle{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}`}</style>
      </div>
    );
  }

  const info = RARITY_INFO[kartu.rarity];
  const dup = duplikat(kartu);

  return (
    <div className="text-center motion-safe:animate-[munculKartu_0.4s_ease-out]">
      <p className="text-3xl mb-3" aria-hidden="true">
        ✨🎉✨
      </p>
      {/* kartu dengan bingkai warna rarity (D2) */}
      <div
        className="inline-block rounded-lg p-2 mb-3"
        style={{ backgroundColor: info.warnaBingkai }}
      >
        <div className="bg-surface rounded-md px-8 py-6 w-52">
          {/* jendela art putih — art kartu didesain di atas latar putih */}
          <span className="text-6xl mb-2 h-20 bg-white rounded-md flex items-center justify-center overflow-hidden">
            <GambarEmoji
              src={kartu.gambar}
              emoji={kartu.emoji}
              alt={kartu.nama}
              className="max-h-20 mx-auto"
            />
          </span>
          <p className="font-display font-extrabold text-lg leading-tight">
            {kartu.nama}
          </p>
          <p className="text-sm text-muted font-bold mt-1">{kartu.deskripsi}</p>
        </div>
      </div>
      <p
        className="font-display font-extrabold"
        style={{ color: kartu.rarity === "biasa" ? undefined : info.warnaBingkai }}
      >
        {kartu.rarity === "legenda" ? "🌟 " : ""}
        Kartu {info.label}
        {kartu.rarity === "legenda" ? " 🌟" : ""}
      </p>
      <p role="status" className="font-bold text-muted mt-2">
        {dup
          ? `Kamu sudah punya kartu ini — jadi +${POIN_DUPLIKAT} ⭐ untukmu!`
          : "Kartu baru masuk ke koleksimu! 🃏"}
      </p>
      <style>{`@keyframes munculKartu{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
