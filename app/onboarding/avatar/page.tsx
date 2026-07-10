"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/features/auth/AuthProvider";
import { perbaruiProfil } from "@/features/auth/api";
import PilihanAvatar from "@/features/auth/PilihanAvatar";
import { AVATARS } from "@/features/auth/avatars";
import { NAMA_MAKS, galatNama, rapikanNama } from "@/features/auth/types";

/* Buat profil siswa (Phase 1) — nama panggilan + avatar dalam satu langkah
   (mockup MacBook Air - 8). Privasi: nama pilihan sendiri + avatar kartun,
   bukan nama lengkap/foto Google. Keduanya bisa diubah lagi di /profil. */

export default function BuatProfilPage() {
  const router = useRouter();
  const { user, profil, loading, refreshProfil } = useAuth();
  const [nama, setNama] = useState("");
  const [pilihan, setPilihan] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const terisi = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (profil.role !== "siswa") router.replace("/guru");
  }, [loading, user, profil, router]);

  // isi nilai awal sekali: nama depan Google sebagai saran, avatar lama kalau balik
  useEffect(() => {
    if (profil && !terisi.current) {
      setNama(profil.nama);
      setPilihan(profil.avatar);
      terisi.current = true;
    }
  }, [profil]);

  if (loading || !profil) return <LoadingSpinner />;

  const galatInput = galatNama(nama);

  async function lanjut() {
    if (!pilihan || !user || galatInput) return;
    setGalat(null);
    setMenyimpan(true);
    try {
      await perbaruiProfil(user.uid, { nama: rapikanNama(nama), avatar: pilihan });
      await refreshProfil();
      router.push("/onboarding/kelas");
    } catch {
      setMenyimpan(false);
      setGalat("Belum tersimpan. Coba tekan Lanjut sekali lagi, ya!");
    }
  }

  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl mb-2">Buat profilmu!</h1>
      <p className="text-lg text-muted mb-8">
        Pilih nama panggilan dan avatar kerenmu, ya!
      </p>

      {/* Nama panggilan (username) — bisa diubah lagi nanti di /profil */}
      <div className="max-w-sm mx-auto mb-10 text-left">
        <label htmlFor="nama-panggilan" className="block font-bold mb-2 text-center">
          Nama panggilanku
        </label>
        <input
          id="nama-panggilan"
          name="nama-panggilan"
          type="text"
          autoComplete="off"
          maxLength={NAMA_MAKS}
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          aria-invalid={nama.length > 0 && !!galatInput}
          aria-describedby="nama-bantuan"
          className={[
            "w-full min-h-[56px] px-5 rounded-md bg-surface text-fg",
            "text-xl font-display font-bold text-center",
            "border-2",
            nama.length > 0 && galatInput ? "border-danger" : "border-border",
          ].join(" ")}
        />
        <p
          id="nama-bantuan"
          className={`mt-2 text-sm font-bold text-center min-h-[1.25em] ${
            nama.length > 0 && galatInput ? "text-danger" : "text-muted"
          }`}
        >
          {nama.length > 0 && galatInput
            ? `⚠️ ${galatInput}`
            : `${rapikanNama(nama).length}/${NAMA_MAKS} huruf`}
        </p>
      </div>

      <p className="font-bold mb-4">Pilih avatarmu</p>
      <div className="mb-4">
        <PilihanAvatar nilai={pilihan} onPilih={setPilihan} />
      </div>

      {/* nama avatar terpilih — afordans selain warna border */}
      <p className="text-muted font-bold mb-6 min-h-[1.5em]">
        {pilihan ? `✓ ${AVATARS.find((a) => a.id === pilihan)?.nama}` : " "}
      </p>

      <Button
        size="lg"
        disabled={!pilihan || !!galatInput || menyimpan}
        onClick={lanjut}
      >
        {menyimpan ? "Menyimpan…" : "Lanjut"}
      </Button>

      {galat && (
        <p role="alert" className="mt-4 text-danger font-bold">
          ⚠️ {galat}
        </p>
      )}
    </main>
  );
}
