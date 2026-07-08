"use client";

import { useState } from "react";
import GambarEmoji from "@/components/ui/GambarEmoji";
import Modal from "@/components/ui/Modal";
import {
  RARITY_INFO,
  SEMUA_KARTU,
  type KartuKoleksi,
  type Rarity,
} from "@/features/games/battle/config";

/* Album Koleksi Kartu (Phase 8, keputusan D2): grid 24 kartu ber-rarity.
   Belum didapat = silhouette "?" redup (bikin penasaran, konvensi mockup);
   klik kartu yang dimiliki → detail besar (gambar, nama, rarity, deskripsi).
   Presentasional murni (koleksi via prop) supaya bisa diuji di /dev/phase8. */

export default function AlbumKartu({ koleksi }: { koleksi: string[] }) {
  const [detail, setDetail] = useState<KartuKoleksi | null>(null);
  const punya = new Set(koleksi);

  const perRarity = (r: Rarity) => ({
    dapat: SEMUA_KARTU.filter((k) => k.rarity === r && punya.has(k.id)).length,
    total: SEMUA_KARTU.filter((k) => k.rarity === r).length,
  });

  return (
    <div>
      {/* ringkasan per rarity */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(RARITY_INFO) as Rarity[]).map((r) => {
          const c = perRarity(r);
          return (
            <span
              key={r}
              className="text-sm font-extrabold rounded-full px-3 py-1 border-2 bg-surface"
              style={{ borderColor: RARITY_INFO[r].warnaBingkai }}
            >
              {RARITY_INFO[r].label}: {c.dapat}/{c.total}
            </span>
          );
        })}
      </div>

      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 list-none">
        {SEMUA_KARTU.map((kartu) => {
          const dimiliki = punya.has(kartu.id);
          return (
            <li key={kartu.id}>
              {dimiliki ? (
                <button
                  onClick={() => setDetail(kartu)}
                  aria-label={`${kartu.nama} — kartu ${RARITY_INFO[kartu.rarity].label}, lihat detail`}
                  className="w-full rounded-lg p-1.5 cursor-pointer transition-transform duration-150 hover:-translate-y-1 hover:scale-[1.03]"
                  style={{ backgroundColor: RARITY_INFO[kartu.rarity].warnaBingkai }}
                >
                  <span className="flex flex-col items-center gap-1 bg-surface rounded-md px-1 py-3 min-h-[7.5rem]">
                    <span className="text-4xl h-12 flex items-center justify-center">
                      <GambarEmoji
                        src={kartu.gambar}
                        emoji={kartu.emoji}
                        className="max-h-12"
                      />
                    </span>
                    <span className="font-display font-extrabold text-xs text-center leading-tight px-1">
                      {kartu.nama}
                    </span>
                    <span className="text-[10px] font-bold text-muted">
                      {kartu.rarity === "legenda" ? "🌟 " : ""}
                      {RARITY_INFO[kartu.rarity].label}
                    </span>
                  </span>
                </button>
              ) : (
                /* silhouette: belum didapat — status lewat simbol ?, bukan warna saja */
                <span
                  aria-label={`Kartu ${RARITY_INFO[kartu.rarity].label} — belum didapat`}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-surface-2 px-1 py-3 min-h-[8.25rem] opacity-70 grayscale"
                >
                  <span className="text-4xl text-muted" aria-hidden="true">
                    ❔
                  </span>
                  <span className="font-display font-extrabold text-xs text-muted">???</span>
                  <span className="text-[10px] font-bold text-muted">
                    {RARITY_INFO[kartu.rarity].label} 🔒
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* detail kartu */}
      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.nama ?? ""}
      >
        {detail && (
          <div className="text-center">
            <div
              className="inline-block rounded-lg p-2 mb-4"
              style={{ backgroundColor: RARITY_INFO[detail.rarity].warnaBingkai }}
            >
              <div className="bg-surface rounded-md px-10 py-8 w-56">
                <span className="text-7xl h-24 flex items-center justify-center">
                  <GambarEmoji
                    src={detail.gambar}
                    emoji={detail.emoji}
                    alt={detail.nama}
                    className="max-h-24 mx-auto"
                  />
                </span>
              </div>
            </div>
            <p
              className="font-display font-extrabold mb-2"
              style={{
                color:
                  detail.rarity === "biasa"
                    ? undefined
                    : RARITY_INFO[detail.rarity].warnaBingkai,
              }}
            >
              {detail.rarity === "legenda" ? "🌟 " : ""}
              Kartu {RARITY_INFO[detail.rarity].label}
              {detail.rarity === "legenda" ? " 🌟" : ""}
            </p>
            <p className="font-bold text-muted">{detail.deskripsi}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
