"use client";

import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import GambarEmoji from "@/components/ui/GambarEmoji";
import ProgressBar from "@/components/ui/ProgressBar";
import TombolKembali from "@/components/ui/TombolKembali";
import { getAvatar } from "@/features/auth/avatars";
import AlbumKartu from "@/features/koleksi/AlbumKartu";
import { SEMUA_KARTU } from "@/features/games/battle/config";
import { BAB_LIST } from "@/features/games/cerita/config";
import { LEVELS } from "@/features/games/isi-piringku/config";
import { ATURAN } from "@/features/games/kuis/config";
import type { UserProfile } from "@/features/auth/types";
import type { TemanKelas } from "./api";

/* Detail teman sekelas (dibuka dari grid Kelasku): kemajuan tiap game +
   album koleksi kartu milik teman. Read-only — tak ada tombol simpan/ubah.
   Presentasional murni (data via props) supaya bisa diuji di /dev/kelas. */

/* Kemajuan yang ditampilkan = field profil.progress. Total per game diambil
   dari config masing-masing supaya ikut betul saat konten ditambah (bukan
   angka ajaib). Hanya 3 game ini yang menyimpan progress (kontrak types.ts). */
const GAME_PROGRES: {
  judul: string;
  emoji: string;
  satuan: "Lv" | "Bab";
  nilai: (p: UserProfile["progress"]) => number;
  total: number;
}[] = [
  {
    judul: "Isi Piringku",
    emoji: "🍽️",
    satuan: "Lv",
    nilai: (p) => p.isiPiringku.levelTerbuka,
    total: LEVELS.length,
  },
  {
    judul: "Kuis Asik",
    emoji: "❓",
    satuan: "Lv",
    nilai: (p) => p.kuis.levelTerbuka,
    total: Object.keys(ATURAN).length,
  },
  {
    judul: "Cerita Interaktif",
    emoji: "📖",
    satuan: "Bab",
    nilai: (p) => p.cerita.babTerbuka,
    total: BAB_LIST.length,
  },
];

export default function ProfilTeman({
  teman,
  aku,
  onKembali,
}: {
  teman: TemanKelas;
  aku: boolean;
  onKembali: () => void;
}) {
  const av = getAvatar(teman.avatar);

  return (
    <div className="flex flex-col gap-6">
      {/* balik ke daftar teman (state dalam satu halaman, konvensi TombolKembali) */}
      <div className="flex items-center gap-3">
        <TombolKembali onClick={onKembali} label="Kembali ke daftar teman" />
        <h2 className="text-xl">Profil Teman 🧒</h2>
      </div>

      {/* ringkasan: avatar + nama + level + poin */}
      <Card className="flex items-center gap-4 p-4 sm:p-5">
        <span
          className="w-16 h-16 shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-3xl"
          aria-hidden="true"
        >
          {av ? (
            <GambarEmoji
              src={av.gambar}
              emoji={av.emoji}
              className="w-full h-full object-cover"
            />
          ) : (
            "🙂"
          )}
        </span>
        <div className="min-w-0">
          <p className="font-display font-extrabold text-xl truncate">
            {teman.nama}
            {aku && <span className="text-muted"> (kamu)</span>}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Chip emoji="🚀" warna="hijau">
              Lv {teman.level}
            </Chip>
            <Chip emoji="⭐" warna="kuning">
              {teman.poin} poin
            </Chip>
          </div>
        </div>
      </Card>

      {/* kemajuan tiap game */}
      <section aria-labelledby="judul-kemajuan">
        <h3 id="judul-kemajuan" className="text-xl mb-3">
          Kemajuan Belajar 📚
        </h3>
        <ul className="flex flex-col gap-3 list-none">
          {GAME_PROGRES.map((g) => {
            const kini = g.nilai(teman.progress);
            const persen = g.total > 0 ? (kini / g.total) * 100 : 0;
            return (
              <li key={g.judul}>
                <Card className="flex items-center gap-3 p-3 sm:p-4">
                  <span className="text-2xl shrink-0" aria-hidden="true">
                    {g.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-display font-extrabold text-sm truncate">
                        {g.judul}
                      </span>
                      <span className="shrink-0 text-xs font-extrabold text-muted whitespace-nowrap">
                        {g.satuan} {kini}
                        <span className="text-muted/70"> / {g.total}</span>
                      </span>
                    </div>
                    <ProgressBar
                      value={persen}
                      label={`Kemajuan ${g.judul}: ${g.satuan} ${kini} dari ${g.total}`}
                      variant="success"
                    />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      {/* koleksi kartu milik teman — album yang sama dengan halaman Koleksi */}
      <section aria-labelledby="judul-koleksi">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 id="judul-koleksi" className="text-xl">
            Koleksi Kartu 🃏
          </h3>
          <Chip warna="kuning" className="font-display">
            {teman.koleksi.length}/{SEMUA_KARTU.length}
          </Chip>
        </div>
        <AlbumKartu koleksi={teman.koleksi} />
      </section>
    </div>
  );
}
