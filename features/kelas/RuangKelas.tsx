"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { getAvatar } from "@/features/auth/avatars";
import ProfilTeman from "./ProfilTeman";
import { hitungStatKelas, type InfoKelas, type TemanKelas } from "./api";

/* Ruang kelas (halaman Kelasku): kartu wali kelas, kekuatan kelas (statistik),
   bintang kelas, dan grid teman sekelas urut abjad (ranking urusan Leaderboard).
   Ketuk teman → lihat detail kemajuan game + koleksi kartunya (ProfilTeman).
   Presentasional murni (data via props) supaya bisa diuji di /dev/kelas. */

export default function RuangKelas({
  info,
  uidKu,
}: {
  info: InfoKelas;
  uidKu: string;
}) {
  const stat = hitungStatKelas(info.teman);
  /* teman yang sedang dilihat detailnya; null = tampil daftar kelas (D:
     tukar tampilan dalam satu halaman, bukan modal — album kartu perlu ruang). */
  const [dipilih, setDipilih] = useState<TemanKelas | null>(null);

  if (dipilih) {
    return (
      <ProfilTeman
        teman={dipilih}
        aku={dipilih.userId === uidKu}
        onKembali={() => setDipilih(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* wali kelas — kontak utama anak di aplikasi */}
      <section aria-labelledby="judul-guru">
        <h2 id="judul-guru" className="text-xl mb-3">
          Bapak/Ibu Guru 🧑‍🏫
        </h2>
        <Card className="flex items-center gap-4 p-4 sm:p-5">
          <span
            className="w-14 h-14 shrink-0 rounded-full bg-band-blue border-2 border-border flex items-center justify-center text-3xl"
            aria-hidden="true"
          >
            🧑‍🏫
          </span>
          <div className="min-w-0">
            <p className="font-display font-extrabold text-lg truncate">
              {info.namaGuru ?? "Bapak/Ibu Guru"}
            </p>
            <p className="text-sm text-muted font-bold">
              Wali kelas · {info.namaKelas}
            </p>
          </div>
        </Card>
      </section>

      {/* kekuatan kelas — statistik gabungan, bukan ranking perorangan */}
      <section aria-labelledby="judul-stat">
        <h2 id="judul-stat" className="text-xl mb-3">
          Kekuatan Kelas 💪
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Chip emoji="🧒" warna="biru">
            {stat.jumlahSiswa} teman
          </Chip>
          <Chip emoji="⭐" warna="kuning">
            {stat.totalPoin} poin bersama
          </Chip>
          {stat.jumlahSiswa > 0 && (
            <Chip emoji="🚀" warna="hijau">
              Rata-rata Lv {stat.rataLevel}
            </Chip>
          )}
        </div>
        {stat.bintang && (
          <button
            type="button"
            onClick={() => setDipilih(stat.bintang)}
            aria-label={`Lihat profil ${stat.bintang.nama}, bintang kelas`}
            className="block w-full text-left mt-3"
          >
            <Card interactive className="flex items-center gap-4 p-4 border-accent">
              <span className="text-3xl shrink-0" aria-hidden="true">
                🌟
              </span>
              <AvatarBulat avatarId={stat.bintang.avatar} />
              <div className="min-w-0 flex-1">
                <p className="font-display font-extrabold truncate">
                  {stat.bintang.nama}
                  {stat.bintang.userId === uidKu && (
                    <span className="text-muted"> (kamu)</span>
                  )}
                </p>
                <p className="text-sm text-muted font-bold">
                  Bintang kelas — ⭐ {stat.bintang.poin} poin
                </p>
              </div>
              <span className="text-muted text-xl shrink-0" aria-hidden="true">
                ›
              </span>
            </Card>
          </button>
        )}
      </section>

      {/* teman sekelas — urut abjad supaya gampang dicari, bukan lomba */}
      <section aria-labelledby="judul-teman">
        <h2 id="judul-teman" className="text-xl mb-3">
          Teman Sekelas 🧒 ({stat.jumlahSiswa})
        </h2>
        {info.teman.length === 0 ? (
          <p className="text-center text-muted font-bold py-8">
            Belum ada teman di kelas ini. Ajak temanmu bergabung! 🎉
          </p>
        ) : (
          <ul
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 list-none"
            aria-label="Daftar teman sekelas"
          >
            {info.teman.map((t) => (
              <KartuTeman
                key={t.userId}
                teman={t}
                aku={t.userId === uidKu}
                onLihat={() => setDipilih(t)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KartuTeman({
  teman,
  aku,
  onLihat,
}: {
  teman: TemanKelas;
  aku: boolean;
  onLihat: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onLihat}
        aria-label={`Lihat profil ${teman.nama}${aku ? " (kamu)" : ""}`}
        className={[
          "w-full h-full flex flex-col items-center gap-1.5 rounded-lg border-2 bg-surface px-3 py-4 text-center cursor-pointer",
          "transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-primary active:scale-95",
          aku ? "border-primary" : "border-border",
        ].join(" ")}
      >
        <AvatarBulat avatarId={teman.avatar} />
        <span className="font-display font-extrabold text-sm leading-tight">
          {teman.nama}
          {aku && <span className="block text-xs text-muted">(kamu)</span>}
        </span>
        <span className="bg-surface-2 border border-border text-xs font-extrabold rounded-full px-2 py-0.5">
          Lv {teman.level}
        </span>
      </button>
    </li>
  );
}

function AvatarBulat({ avatarId }: { avatarId: string | null }) {
  const av = getAvatar(avatarId);
  return (
    <span
      className="w-12 h-12 shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-2xl"
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
