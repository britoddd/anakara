"use client";

import AlbumKartu from "@/features/koleksi/AlbumKartu";
import type { BarisPeringkat } from "@/features/leaderboard/api";
import PapanPeringkat from "@/features/leaderboard/PapanPeringkat";

/* Halaman uji dev untuk Phase 8 tanpa login (seperti /dev/komponen).
   Bukan bagian produk — jangan ditautkan dari halaman siswa. */

const barisUji: BarisPeringkat[] = [
  { userId: "u1", nama: "Salsa", avatar: "avatar-02", level: 3, poin: 480 },
  { userId: "u2", nama: "Bima", avatar: "avatar-01", level: 3, poin: 455 },
  { userId: "u3", nama: "Citra", avatar: "avatar-06", level: 2, poin: 390 },
  { userId: "dev-uji", nama: "Tayo", avatar: "avatar-04", level: 2, poin: 320 },
  { userId: "u5", nama: "Dodi", avatar: "avatar-07", level: 2, poin: 275 },
  { userId: "u6", nama: "Eka", avatar: "avatar-09", level: 1, poin: 180 },
  { userId: "u7", nama: "Fajar", avatar: "avatar-10", level: 1, poin: 95 },
];

const koleksiUji = ["kartu-01", "kartu-05", "kartu-10", "kartu-15", "kartu-17", "kartu-22"];

export default function DevPhase8Page() {
  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-12">
      <section>
        <h1 className="text-2xl mb-5">Uji: Leaderboard 🏆</h1>
        <PapanPeringkat baris={barisUji} uidKu="dev-uji" />
      </section>
      <section>
        <h2 className="text-2xl mb-5">Uji: Album Koleksi 🃏 (6/24)</h2>
        <AlbumKartu koleksi={koleksiUji} />
      </section>
    </main>
  );
}
