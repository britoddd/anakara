"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TepiGelombang from "@/components/deko/TepiGelombang";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TombolKembali from "@/components/ui/TombolKembali";
import { useAuth } from "@/features/auth/AuthProvider";
import type { UserProfile } from "@/features/auth/types";
import {
  ambilKelas,
  ambilLogKuisKelas,
  ambilPengajarKelas,
  ambilPengumuman,
  ambilSiswaKelas,
  buatPengumuman,
  hapusPengumuman,
  keluarKelasSebagaiGuru,
  keluarkanGuru,
  keluarkanSiswa,
  resetProgresSiswa,
  type KelasGuru,
  type LogKuis,
  type PengajarKelas,
  type Pengumuman,
} from "@/features/guru/api";
import KelolaKelas from "@/features/guru/KelolaKelas";

/* Halaman kelola satu kelas (Teacher Dashboard) — dibuka dari "⚙️ Kelola Kelas"
   di dashboard. Guru bisa: kelola roster pengajar, pengumuman kelas, keluarkan
   siswa, reset progres. Setiap guru kelas (pemilik ATAU pengajar tambahan)
   boleh membuka (dicek via guruIds + rules §). */

export default function KelolaKelasPage() {
  const router = useRouter();
  const params = useParams<{ kode: string }>();
  const kode = String(params.kode ?? "").toUpperCase();
  const { user, profil, loading } = useAuth();

  /* undefined = memuat; null = tak ditemukan / bukan milikmu */
  const [kelas, setKelas] = useState<KelasGuru | null | undefined>(undefined);
  const [siswa, setSiswa] = useState<UserProfile[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [logKuis, setLogKuis] = useState<Record<string, LogKuis[]>>({});
  const [pengajar, setPengajar] = useState<PengajarKelas[]>([]);
  const [galat, setGalat] = useState(false);
  const [siswaSibuk, setSiswaSibuk] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (profil.role !== "guru") router.replace("/home");
  }, [loading, user, profil, router]);

  const muat = useCallback(async () => {
    if (!profil || profil.role !== "guru") return;
    setGalat(false);
    try {
      const k = await ambilKelas(kode);
      if (!k || !k.guruIds.includes(profil.userId)) {
        setKelas(null);
        return;
      }
      setKelas(k);
      const [s, p, log, guru] = await Promise.all([
        ambilSiswaKelas(kode),
        ambilPengumuman(kode),
        ambilLogKuisKelas(kode),
        ambilPengajarKelas(kode),
      ]);
      setSiswa(s);
      setPengumuman(p);
      setPengajar(guru);
      /* kelompokkan riwayat per siswa (by userId); urutan terbaru-di-atas
         dari ambilLogKuisKelas dipertahankan */
      const perSiswa: Record<string, LogKuis[]> = {};
      for (const l of log) (perSiswa[l.userId] ??= []).push(l);
      setLogKuis(perSiswa);
    } catch {
      setGalat(true);
    }
  }, [kode, profil]);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function keluarkan(s: UserProfile) {
    if (
      !window.confirm(
        `Keluarkan ${s.nama} dari kelas ini? Ia bisa bergabung lagi dengan kode kelas.`
      )
    )
      return;
    setSiswaSibuk(s.userId);
    try {
      await keluarkanSiswa(s.userId);
      await muat();
    } catch {
      setGalat(true);
    } finally {
      setSiswaSibuk(null);
    }
  }

  async function reset(s: UserProfile) {
    if (
      !window.confirm(
        `Reset progres ${s.nama}? Poin, level, kemajuan game, dan koleksi kartunya kembali ke awal. Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return;
    setSiswaSibuk(s.userId);
    try {
      await resetProgresSiswa(s.userId);
      await muat();
    } catch {
      setGalat(true);
    } finally {
      setSiswaSibuk(null);
    }
  }

  async function kirimPengumuman(teks: string) {
    if (!profil) return;
    await buatPengumuman(profil.userId, kode, teks); // galat → ditangani form
    await muat();
  }

  async function hapusPeng(p: Pengumuman) {
    if (!window.confirm("Hapus pengumuman ini?")) return;
    try {
      await hapusPengumuman(p.id);
      await muat();
    } catch {
      setGalat(true);
    }
  }

  async function keluarkanPengajar(g: PengajarKelas) {
    if (!window.confirm(`Keluarkan ${g.nama} dari pengajar kelas ini?`)) return;
    try {
      await keluarkanGuru(kode, g.userId);
      await muat();
    } catch {
      setGalat(true);
    }
  }

  async function keluarSendiri() {
    if (!profil) return;
    if (
      !window.confirm(
        "Keluar dari kelas ini? Kamu tak lagi mengelolanya, tapi bisa bergabung lagi dengan kodenya."
      )
    )
      return;
    try {
      await keluarKelasSebagaiGuru(profil.userId, kode);
      router.replace("/guru");
    } catch {
      setGalat(true);
    }
  }

  if (loading || !profil || profil.role !== "guru") return <LoadingSpinner />;

  return (
    <>
      {/* header band biru pastel (selaras /guru) */}
      <div className="bg-band-blue">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 max-w-5xl mx-auto w-full">
          <TombolKembali href="/guru" label="Kembali ke Dashboard Guru" />
          <div className="min-w-0">
            <p className="font-display font-extrabold text-lg truncate">
              🏫 {kelas ? kelas.nama : "Kelola Kelas"}
            </p>
            <p className="text-sm font-bold">
              Kode kelas:{" "}
              <span className="font-display font-extrabold tracking-[0.2em]">{kode}</span>
            </p>
          </div>
        </header>
      </div>
      <TepiGelombang arah="bawah" className="text-band-blue" />

      <main id="konten-utama" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-16">
        {galat && (
          <p role="alert" className="text-danger font-bold mb-4">
            ⚠️ Ada gangguan koneksi. Sebagian aksi mungkin belum tersimpan — muat
            ulang halaman, ya.
          </p>
        )}

        {kelas === undefined ? (
          <LoadingSpinner label="Membuka kelas…" />
        ) : kelas === null ? (
          <div className="text-center py-10">
            <p role="alert" className="text-muted font-bold mb-4">
              Kelas tidak ditemukan, atau bukan kelas milikmu. 🤔
            </p>
            <Button onClick={() => router.replace("/guru")}>
              Kembali ke Dashboard
            </Button>
          </div>
        ) : (
          <KelolaKelas
            namaKelas={kelas.nama}
            kode={kode}
            siswa={siswa}
            pengumuman={pengumuman}
            logKuis={logKuis}
            pengajar={pengajar}
            uidKu={profil.userId}
            onBuatPengumuman={kirimPengumuman}
            onHapusPengumuman={hapusPeng}
            onKeluarkan={keluarkan}
            onResetProgres={reset}
            onKeluarkanGuru={keluarkanPengajar}
            onKeluarSendiri={keluarSendiri}
            siswaSibuk={siswaSibuk}
          />
        )}
      </main>
    </>
  );
}
