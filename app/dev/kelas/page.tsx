"use client";

import type { InfoKelas } from "@/features/kelas/api";
import RuangKelas from "@/features/kelas/RuangKelas";

/* Halaman uji dev untuk Kelasku tanpa login (seperti /dev/phase8).
   Bukan bagian produk — jangan ditautkan dari halaman siswa. */

const infoUji: InfoKelas = {
  kode: "ABC23",
  namaKelas: "Kelas 1A",
  namaGuru: "Bu Rina",
  teman: [
    { userId: "u2", nama: "Bima", avatar: "avatar-01", level: 4, poin: 455 },
    { userId: "u3", nama: "Citra", avatar: "avatar-06", level: 3, poin: 390 },
    { userId: "u5", nama: "Dodi", avatar: "avatar-07", level: 2, poin: 275 },
    { userId: "u6", nama: "Eka", avatar: "avatar-09", level: 2, poin: 180 },
    { userId: "u7", nama: "Fajar", avatar: "avatar-10", level: 1, poin: 95 },
    { userId: "u1", nama: "Salsa", avatar: "avatar-02", level: 4, poin: 480 },
    { userId: "dev-uji", nama: "Tayo", avatar: "avatar-04", level: 3, poin: 320 },
  ],
};

const infoKosong: InfoKelas = {
  kode: "KOSON",
  namaKelas: "Kelas Baru",
  namaGuru: null,
  teman: [],
};

export default function DevKelasPage() {
  return (
    <main id="konten-utama" className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-12">
      <section>
        <h1 className="text-2xl mb-5">Uji: Ruang Kelas 🏫</h1>
        <RuangKelas info={infoUji} uidKu="dev-uji" />
      </section>
      <section>
        <h2 className="text-2xl mb-5">Uji: kelas kosong (guru tak ditemukan)</h2>
        <RuangKelas info={infoKosong} uidKu="dev-uji" />
      </section>
    </main>
  );
}
