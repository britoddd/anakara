"use client";

import Card from "@/components/ui/Card";
import { buatProfilBaru } from "@/features/auth/types";
import { TabelSiswa } from "@/features/guru/DashboardGuru";
import FormSoal from "@/features/guru/FormSoal";

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

export default function DevGuruPage() {
  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-12">
      <section>
        <h1 className="text-2xl mb-4">Uji: Tabel Siswa 👥</h1>
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
