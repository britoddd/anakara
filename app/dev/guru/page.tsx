"use client";

import Card from "@/components/ui/Card";
import { buatProfilBaru } from "@/features/auth/types";
import { TabelSiswa } from "@/features/guru/DashboardGuru";
import FormSoal from "@/features/guru/FormSoal";
import KelolaKelas from "@/features/guru/KelolaKelas";
import type { LogKuis, Pengumuman } from "@/features/guru/api";

/* Halaman uji dev untuk komponen Phase 10 tanpa login (seperti /dev/komponen).
   Bukan bagian produk — jangan ditautkan dari halaman guru/siswa. */

function siswaUji(
  nama: string,
  avatar: string,
  poin: number,
  kuis: number,
  piring: number,
  kartu: number
) {
  const p = buatProfilBaru(`uji-${nama}`, "siswa", nama);
  return {
    ...p,
    avatar,
    poin,
    progress: {
      kuis: { levelTerbuka: kuis },
      cerita: { babTerbuka: 1 },
      isiPiringku: { levelTerbuka: piring },
    },
    koleksi: Array.from({ length: kartu }, (_, i) => `kartu-${i + 1}`),
  };
}

const SISWA_UJI = [
  siswaUji("Salsa", "avatar-02", 480, 3, 2, 5),
  siswaUji("Bima", "avatar-01", 455, 2, 3, 3),
  siswaUji("Citra", "avatar-06", 390, 2, 2, 2),
  siswaUji("Dodi", "avatar-07", 95, 1, 1, 0),
];

const PENGUMUMAN_UJI: Pengumuman[] = [
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
];

const LOG_UJI: Record<string, LogKuis[]> = {
  "uji-Salsa": [
    {
      id: "log-1",
      userId: "uji-Salsa",
      level: 2,
      benar: 8,
      total: 10,
      dibuat: Date.now() - 3600_000,
      detail: [
        { pertanyaan: "Buah kaya vitamin C?", benar: true, jawabanSiswa: "Jeruk", jawabanBenar: "Jeruk" },
        { pertanyaan: "Sarapan sehat itu…", benar: false, jawabanSiswa: "Permen", jawabanBenar: "Bubur" },
        { pertanyaan: "Minum air putih berapa gelas?", benar: true, jawabanSiswa: "8 gelas", jawabanBenar: "8 gelas" },
        { pertanyaan: "Sumber protein?", benar: false, jawabanSiswa: "(waktu habis)", jawabanBenar: "Telur" },
      ],
    },
    {
      id: "log-2",
      userId: "uji-Salsa",
      level: 1,
      benar: 10,
      total: 10,
      dibuat: Date.now() - 90_000_000,
      detail: [
        { pertanyaan: "Warna sayur bayam?", benar: true, jawabanSiswa: "Hijau", jawabanBenar: "Hijau" },
        { pertanyaan: "Susu baik untuk?", benar: true, jawabanSiswa: "Tulang", jawabanBenar: "Tulang" },
      ],
    },
  ],
  "uji-Bima": [
    {
      id: "log-3",
      userId: "uji-Bima",
      level: 1,
      benar: 5,
      total: 10,
      dibuat: Date.now() - 7200_000,
      detail: [
        { pertanyaan: "Buah kaya vitamin C?", benar: false, jawabanSiswa: "Apel", jawabanBenar: "Jeruk" },
        { pertanyaan: "Warna sayur bayam?", benar: true, jawabanSiswa: "Hijau", jawabanBenar: "Hijau" },
      ],
    },
  ],
};

export default function DevGuruPage() {
  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-12">
      <section>
        <h1 className="text-2xl mb-4">Uji: Kelola Kelas ⚙️</h1>
        <KelolaKelas
          namaKelas="Kelas 1A SDN Melati"
          kode="ABC23"
          siswa={SISWA_UJI}
          pengumuman={PENGUMUMAN_UJI}
          logKuis={LOG_UJI}
          onBuatPengumuman={async () => {}}
          onHapusPengumuman={() => {}}
          onKeluarkan={() => {}}
          onResetProgres={() => {}}
        />
      </section>
      <section>
        <h2 className="text-2xl mb-4">Uji: Tabel Siswa 👥 (baca)</h2>
        <Card>
          <TabelSiswa siswa={SISWA_UJI} />
        </Card>
      </section>
      <section>
        <h2 className="text-2xl mb-4">Uji: Form Soal 📝</h2>
        <Card className="border-primary border-2">
          <FormSoal sibuk={false} onSimpan={() => {}} onBatal={() => {}} />
        </Card>
      </section>
    </main>
  );
}
