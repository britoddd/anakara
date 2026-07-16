"use client";

import Card from "@/components/ui/Card";
import { buatProfilBaru } from "@/features/auth/types";
import { TabelSiswa } from "@/features/guru/DashboardGuru";
import FormSoal from "@/features/guru/FormSoal";
import KelolaKelas from "@/features/guru/KelolaKelas";
import type { LogKuis, PengajarKelas, Pengumuman } from "@/features/guru/api";

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

/* Satu detail soal untuk data uji: `benar` diturunkan dari cocok/tidaknya
   jawaban siswa dengan kunci. `kategori` dipakai Rangkuman Pemahaman per materi
   (untuk soal nyata, GameKuis mengisinya otomatis). */
const d = (
  pertanyaan: string,
  kategori: string,
  jawabanBenar: string,
  jawabanSiswa: string = jawabanBenar
): LogKuis["detail"][number] => ({
  pertanyaan,
  benar: jawabanSiswa === jawabanBenar,
  jawabanSiswa,
  jawabanBenar,
  kategori,
});

const LOG_UJI: Record<string, LogKuis[]> = {
  // Salsa: kuat Makanan Sehat, lemah Gizi, Kebiasaan Baik bagus (2 percobaan)
  "uji-Salsa": [
    {
      id: "log-1",
      userId: "uji-Salsa",
      level: 2,
      benar: 5,
      total: 8,
      dibuat: Date.now() - 3600_000,
      detail: [
        d("Manakah camilan paling sehat?", "makanan-sehat", "Buah"),
        d("Buah kaya vitamin C?", "makanan-sehat", "Jeruk"),
        d("Menu makan siang bergizi seimbang?", "makanan-sehat", "Nasi, ayam, sayur"),
        d("Zat gizi sumber tenaga utama?", "gizi", "Karbohidrat", "Vitamin"),
        d("Vitamin untuk kesehatan mata?", "gizi", "Vitamin A", "Vitamin C"),
        d("Contoh sumber protein?", "gizi", "Telur", "(waktu habis)"),
        d("Kapan sebaiknya menyikat gigi?", "kebiasaan-baik", "Pagi & malam"),
        d("Berapa gelas air putih sehari?", "kebiasaan-baik", "8 gelas"),
      ],
    },
    {
      id: "log-2",
      userId: "uji-Salsa",
      level: 1,
      benar: 4,
      total: 5,
      dibuat: Date.now() - 90_000_000,
      detail: [
        d("Sarapan sehat sebaiknya…", "makanan-sehat", "Bergizi seimbang"),
        d("Minuman paling sehat?", "makanan-sehat", "Air putih"),
        d("Mengapa tubuh butuh sayur?", "gizi", "Sumber vitamin & serat"),
        d("Sebelum makan sebaiknya…", "kebiasaan-baik", "Cuci tangan"),
        d("Kapan waktu baik berolahraga?", "olahraga", "Pagi hari", "Malam hari"),
      ],
    },
  ],
  // Bima: satu percobaan — hanya Kebiasaan Baik yang cukup data untuk disebut
  "uji-Bima": [
    {
      id: "log-3",
      userId: "uji-Bima",
      level: 1,
      benar: 4,
      total: 6,
      dibuat: Date.now() - 7200_000,
      detail: [
        d("Cuci tangan sebaiknya pakai…", "kebiasaan-baik", "Sabun & air"),
        d("Sebelum tidur sebaiknya…", "kebiasaan-baik", "Sikat gigi"),
        d("Setelah bermain sebaiknya…", "kebiasaan-baik", "Cuci tangan"),
        d("Buah kaya vitamin C?", "makanan-sehat", "Jeruk", "Apel"),
        d("Contoh makanan bergizi?", "makanan-sehat", "Ikan"),
        d("Vitamin dari sinar matahari pagi?", "gizi", "Vitamin D", "Vitamin C"),
      ],
    },
  ],
  // Citra: data masih sedikit — tak ada materi capai ambang → kalimat keseluruhan
  "uji-Citra": [
    {
      id: "log-4",
      userId: "uji-Citra",
      level: 1,
      benar: 2,
      total: 3,
      dibuat: Date.now() - 5400_000,
      detail: [
        d("Minuman paling sehat?", "makanan-sehat", "Air putih"),
        d("Contoh sumber protein?", "gizi", "Telur"),
        d("Rajin berolahraga membuat tubuh…", "olahraga", "Sehat & kuat", "Lelah"),
      ],
    },
  ],
};

const PENGAJAR_UJI: PengajarKelas[] = [
  { userId: "guru-uji", nama: "Bu Rina", pemilik: true },
  { userId: "guru-2", nama: "Pak Doni", pemilik: false },
];

export default function DevGuruPage() {
  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-12">
      <section>
        <h1 className="text-2xl mb-4">Uji: Kelola Kelas ⚙️ (sbg. pemilik)</h1>
        <KelolaKelas
          namaKelas="Kelas 1A SDN Melati"
          kode="ABC23"
          siswa={SISWA_UJI}
          pengumuman={PENGUMUMAN_UJI}
          logKuis={LOG_UJI}
          pengajar={PENGAJAR_UJI}
          uidKu="guru-uji"
          onBuatPengumuman={async () => {}}
          onHapusPengumuman={() => {}}
          onKeluarkan={() => {}}
          onResetProgres={() => {}}
          onKeluarkanGuru={() => {}}
          onKeluarSendiri={() => {}}
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
