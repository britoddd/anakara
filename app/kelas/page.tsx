"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Squiggle from "@/components/deko/Squiggle";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TombolKembali from "@/components/ui/TombolKembali";
import { useAuth } from "@/features/auth/AuthProvider";
import { rutePofil } from "@/features/auth/api";
import { ambilInfoKelas, type InfoKelas } from "@/features/kelas/api";
import RuangKelas from "@/features/kelas/RuangKelas";

/* Halaman Kelasku: lihat Bapak/Ibu Guru + teman sekelas, kekuatan kelas,
   dan kode kelas untuk mengajak teman. Ranking lengkap tetap di /leaderboard
   (tautan silang di bawah) — halaman ini tentang KEBERSAMAAN, bukan lomba. */

export default function KelasPage() {
  const router = useRouter();
  const { user, profil, loading } = useAuth();
  const [info, setInfo] = useState<InfoKelas | null | undefined>(undefined);
  const [galat, setGalat] = useState(false);
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (rutePofil(profil) !== "/home") router.replace(rutePofil(profil));
  }, [loading, user, profil, router]);

  useEffect(() => {
    if (!profil?.kelasId) return;
    let aktif = true;
    setInfo(undefined);
    setGalat(false);
    ambilInfoKelas(profil.kelasId)
      .then((hasil) => aktif && setInfo(hasil))
      .catch(() => aktif && setGalat(true));
    return () => {
      aktif = false;
    };
  }, [profil?.kelasId, percobaan]);

  if (loading || !profil || rutePofil(profil) !== "/home") return <LoadingSpinner />;

  return (
    <main id="konten-utama" className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* header band hijau pastel (restyle THYNK §C) */}
      <div className="relative rounded-xl bg-band-green p-4 sm:p-5 mb-6 overflow-hidden">
        <Squiggle className="absolute -right-2 -top-1 w-20 text-white/60 rotate-12" />
        <div className="flex items-center gap-3">
          <TombolKembali href="/home" label="Kembali ke Home" />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl truncate">
              {info ? info.namaKelas : "Kelasku"} 🏫
            </h1>
            {/* kode kelas: buat mengajak teman baru bergabung */}
            <p className="text-sm font-bold mt-1">
              Kode kelas:{" "}
              <span className="font-display font-extrabold tracking-[0.2em] bg-surface border-2 border-border rounded-full px-3 py-0.5">
                {profil.kelasId}
              </span>{" "}
              — ajak temanmu gabung!
            </p>
          </div>
        </div>
      </div>

      {galat ? (
        <div className="text-center py-8">
          <p role="alert" className="text-danger font-bold mb-4">
            ⚠️ Gagal memuat kelasmu. Cek internetmu ya!
          </p>
          <Button onClick={() => setPercobaan((p) => p + 1)}>Coba Lagi</Button>
        </div>
      ) : info === undefined ? (
        <LoadingSpinner label="Membuka pintu kelas…" />
      ) : info === null ? (
        <p role="alert" className="text-center text-muted font-bold py-8">
          Kelasmu tidak ditemukan. Tanya Bapak/Ibu Guru, ya! 🙏
        </p>
      ) : (
        <>
          <RuangKelas info={info} uidKu={profil.userId} />

          {/* tautan silang ke ranking lengkap — leaderboard tetap satu pintu */}
          <div className="mt-8 text-center">
            <Button size="lg" onClick={() => router.push("/leaderboard")}>
              Lihat Leaderboard Kelas 🏆
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
