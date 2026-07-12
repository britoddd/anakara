"use client";

import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { getAvatar } from "@/features/auth/avatars";
import { hitungStatKelas, type InfoKelas, type TemanKelas } from "./api";

/* Ruang kelas (halaman Kelasku): kartu wali kelas, kekuatan kelas (statistik),
   bintang kelas, dan grid teman sekelas urut abjad (ranking urusan Leaderboard).
   Presentasional murni (data via props) supaya bisa diuji di /dev/kelas. */

export default function RuangKelas({
  info,
  uidKu,
}: {
  info: InfoKelas;
  uidKu: string;
}) {
  const stat = hitungStatKelas(info.teman);

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
          <Card className="mt-3 flex items-center gap-4 p-4 border-accent">
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
          </Card>
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
              <KartuTeman key={t.userId} teman={t} aku={t.userId === uidKu} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function KartuTeman({ teman, aku }: { teman: TemanKelas; aku: boolean }) {
  return (
    <li
      className={[
        "flex flex-col items-center gap-1.5 rounded-lg border-2 bg-surface px-3 py-4 text-center",
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
