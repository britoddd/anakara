"use client";

import GambarEmoji from "@/components/ui/GambarEmoji";
import { getAvatar } from "@/features/auth/avatars";
import type { BarisPeringkat } from "./api";

/* Papan peringkat (Phase 8): podium 🥇🥈🥉 + daftar sisanya.
   Presentasional murni (data via props) supaya bisa diuji di /dev/phase8.
   Baris milik siswa yang sedang login disorot + label "(kamu)". */

const MEDALI = ["🥇", "🥈", "🥉"];

export default function PapanPeringkat({
  baris,
  uidKu,
}: {
  baris: BarisPeringkat[];
  uidKu: string;
}) {
  if (baris.length === 0) {
    return (
      <p className="text-center text-muted font-bold py-10">
        Belum ada siswa di sini. Ajak temanmu bermain! 🎉
      </p>
    );
  }

  const podium = baris.slice(0, 3);
  const sisanya = baris.slice(3);
  // urutan tampil podium: 2-1-3 (juara 1 di tengah, paling tinggi)
  const urutanPodium = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div>
      <ol
        className="flex items-end justify-center gap-3 sm:gap-5 mb-6 list-none"
        aria-label="Tiga peringkat teratas"
      >
        {urutanPodium.map((b) => {
          const peringkat = baris.indexOf(b) + 1;
          const juara1 = peringkat === 1;
          return (
            <li
              key={b.userId}
              className={[
                "flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 sm:px-6 pt-4 pb-3",
                "bg-surface w-28 sm:w-36",
                juara1
                  ? "border-accent pb-7 shadow-[0_6px_20px_rgba(255,210,63,0.25)]"
                  : b.userId === uidKu
                    ? "border-primary"
                    : "border-border",
              ].join(" ")}
            >
              <span className="text-3xl" aria-label={`Peringkat ${peringkat}`}>
                {MEDALI[peringkat - 1]}
              </span>
              <AvatarBulat avatarId={b.avatar} besar={juara1} />
              <span className="font-display font-extrabold text-sm sm:text-base text-center leading-tight">
                {b.nama}
                {b.userId === uidKu && (
                  <span className="block text-xs text-muted">(kamu)</span>
                )}
              </span>
              <span className="font-bold text-sm">⭐ {b.poin}</span>
            </li>
          );
        })}
      </ol>

      {sisanya.length > 0 && (
        <ol start={4} className="flex flex-col gap-2 list-none" aria-label="Peringkat lainnya">
          {sisanya.map((b, i) => (
            <li
              key={b.userId}
              className={[
                "flex items-center gap-3 rounded-lg border-2 px-4 py-2.5 bg-surface",
                b.userId === uidKu ? "border-accent" : "border-border",
              ].join(" ")}
            >
              <span className="font-display font-extrabold text-muted w-8 text-center shrink-0">
                {i + 4}
              </span>
              <AvatarBulat avatarId={b.avatar} />
              <span className="font-bold flex-1 truncate">
                {b.nama}
                {b.userId === uidKu && <span className="text-muted"> (kamu)</span>}
              </span>
              <span className="bg-surface-2 border border-border text-xs font-extrabold rounded-full px-2 py-0.5">
                Lv {b.level}
              </span>
              <span className="font-display font-extrabold whitespace-nowrap">
                ⭐ {b.poin}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function AvatarBulat({ avatarId, besar = false }: { avatarId: string | null; besar?: boolean }) {
  const av = getAvatar(avatarId ?? "");
  return (
    <span
      className={[
        besar ? "w-16 h-16 text-3xl" : "w-10 h-10 text-xl",
        "shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center",
      ].join(" ")}
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
