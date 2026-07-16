"use client";

import type { InfoKelas } from "@/features/kelas/api";
import RuangKelas from "@/features/kelas/RuangKelas";

/* Halaman uji dev untuk Kelasku tanpa login (seperti /dev/phase8).
   Bukan bagian produk — jangan ditautkan dari halaman siswa. */

/* progress + koleksi contoh — supaya detail teman (kemajuan game + album kartu)
   ikut teruji tanpa login. Nilai levelTerbuka/babTerbuka & id kartu bervariasi. */
const prog = (kuis: number, cerita: number, piring: number) => ({
  kuis: { levelTerbuka: kuis },
  cerita: { babTerbuka: cerita },
  isiPiringku: { levelTerbuka: piring },
});
const kartuSampai = (n: number) =>
  Array.from({ length: n }, (_, i) => `kartu-${String(i + 1).padStart(2, "0")}`);

const infoUji: InfoKelas = {
  kode: "ABC23",
  namaKelas: "Kelas 1A",
  guru: ["Bu Rina", "Pak Doni"],
  pengumuman: [
    {
      id: "p1",
      kelasId: "ABC23",
      guruId: "guru-uji",
      teks: "Jangan lupa main Kuis Asik sampai level 3 ya, minggu ini! 🌟",
      dibuat: Date.now() - 3600_000,
    },
    {
      id: "p2",
      kelasId: "ABC23",
      guruId: "guru-uji",
      teks: "Besok kita belajar tentang Isi Piringku. Sampai jumpa! 🍽️",
      dibuat: Date.now() - 86_400_000,
    },
  ],
  teman: [
    { userId: "u2", nama: "Bima", avatar: "avatar-01", level: 4, poin: 455, progress: prog(3, 1, 3), koleksi: kartuSampai(18) },
    { userId: "u3", nama: "Citra", avatar: "avatar-06", level: 3, poin: 390, progress: prog(2, 1, 3), koleksi: kartuSampai(12) },
    { userId: "u5", nama: "Dodi", avatar: "avatar-07", level: 2, poin: 275, progress: prog(2, 1, 2), koleksi: kartuSampai(7) },
    { userId: "u6", nama: "Eka", avatar: "avatar-09", level: 2, poin: 180, progress: prog(1, 1, 2), koleksi: kartuSampai(4) },
    { userId: "u7", nama: "Fajar", avatar: "avatar-10", level: 1, poin: 95, progress: prog(1, 1, 1), koleksi: [] },
    { userId: "u1", nama: "Salsa", avatar: "avatar-02", level: 4, poin: 480, progress: prog(3, 1, 3), koleksi: kartuSampai(24) },
    { userId: "dev-uji", nama: "Tayo", avatar: "avatar-04", level: 3, poin: 320, progress: prog(2, 1, 3), koleksi: kartuSampai(10) },
  ],
};

const infoKosong: InfoKelas = {
  kode: "KOSON",
  namaKelas: "Kelas Baru",
  guru: [],
  pengumuman: [],
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
