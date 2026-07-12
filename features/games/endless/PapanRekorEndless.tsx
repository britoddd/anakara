"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { getAvatar } from "@/features/auth/avatars";
import { ambilPeringkatEndless, type GameEndless, type RekorEndless } from "./api";

/* Papan rekor Mode Tanpa Batas — dipakai di layar hasil endless & layar pilih
   level. Mengambil datanya sendiri; 3 status region data (gate §4.6):
   skeleton → kosong (+ajakan) → error (+tombol coba lagi). */

const MEDALI = ["🥇", "🥈", "🥉"];

export default function PapanRekorEndless({
  game,
  uidKu,
}: {
  game: GameEndless;
  uidKu: string;
}) {
  const [baris, setBaris] = useState<RekorEndless[] | null>(null);
  const [galat, setGalat] = useState(false);

  const muat = useCallback(() => {
    setGalat(false);
    setBaris(null);
    ambilPeringkatEndless(game)
      .then(setBaris)
      .catch(() => setGalat(true));
  }, [game]);

  useEffect(muat, [muat]);

  if (galat) {
    return (
      <div className="text-center py-6">
        <p className="font-bold text-muted mb-3">
          ⚠️ Papan rekor belum bisa dimuat — cek koneksimu, ya.
        </p>
        <Button variant="ghost" onClick={muat}>
          🔁 Coba Lagi
        </Button>
      </div>
    );
  }

  if (baris === null) {
    // skeleton seukuran hasil akhir (anti lompatan layout)
    return (
      <ol className="flex flex-col gap-2 list-none" aria-label="Memuat papan rekor">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="h-[52px] rounded-lg border-2 border-border bg-surface-2 motion-safe:animate-pulse"
          />
        ))}
      </ol>
    );
  }

  if (baris.length === 0) {
    return (
      <p className="text-center text-muted font-bold py-6">
        Belum ada rekor. Jadilah yang pertama! 🚀
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2 list-none" aria-label="Papan rekor Mode Tanpa Batas">
      {baris.map((b, i) => {
        const kamu = b.userId === uidKu;
        return (
          <li
            key={b.userId}
            className={[
              "flex items-center gap-3 rounded-lg border-2 px-4 py-2 bg-surface",
              kamu ? "border-accent" : "border-border",
            ].join(" ")}
          >
            <span
              className="font-display font-extrabold w-8 text-center shrink-0"
              aria-label={`Peringkat ${i + 1}`}
            >
              {MEDALI[i] ?? <span className="text-muted">{i + 1}</span>}
            </span>
            <AvatarBulat avatarId={b.avatar} />
            <span className="font-bold flex-1 truncate text-left">
              {b.nama}
              {kamu && <span className="text-muted"> (kamu)</span>}
            </span>
            <span className="font-display font-extrabold whitespace-nowrap">
              {b.skor} <span className="text-sm font-bold text-muted">benar</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function AvatarBulat({ avatarId }: { avatarId: string | null }) {
  const av = getAvatar(avatarId ?? "");
  return (
    <span
      className="w-9 h-9 text-lg shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center"
      aria-hidden="true"
    >
      {av ? (
        <GambarEmoji src={av.gambar} emoji={av.emoji} className="w-full h-full object-cover" />
      ) : (
        "🙂"
      )}
    </span>
  );
}
