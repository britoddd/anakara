"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LatarDoodle from "@/components/deko/LatarDoodle";
import GambarEmoji from "@/components/ui/GambarEmoji";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import KonfirmasiKeluar from "@/components/ui/KonfirmasiKeluar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PengaturanUmpanBalik from "@/components/ui/PengaturanUmpanBalik";
import TombolKembali from "@/components/ui/TombolKembali";
import { useAuth } from "@/features/auth/AuthProvider";
import { logout, perbaruiProfil, rutePofil } from "@/features/auth/api";
import PilihanAvatar from "@/features/auth/PilihanAvatar";
import { AVATARS, getAvatar } from "@/features/auth/avatars";
import { NAMA_MAKS, galatNama, hitungLevel, rapikanNama } from "@/features/auth/types";

/* Halaman Profil (siswa) — ubah nama panggilan & avatar setelah onboarding.
   Sumber logika simpan sama dengan onboarding (perbaruiProfil), jadi Home &
   Leaderboard langsung ikut terbarui. */

export default function ProfilPage() {
  const router = useRouter();
  const { user, profil, loading, refreshProfil } = useAuth();
  const [nama, setNama] = useState("");
  const [pilihan, setPilihan] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);
  const terisi = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    // guru & siswa yang belum selesai onboarding diarahkan ke tujuan yang benar
    else if (rutePofil(profil) !== "/home") router.replace(rutePofil(profil));
  }, [loading, user, profil, router]);

  // isi nilai form dari profil sekali saja (biar edit user tak ketimpa)
  useEffect(() => {
    if (profil && !terisi.current) {
      setNama(profil.nama);
      setPilihan(profil.avatar);
      terisi.current = true;
    }
  }, [profil]);

  if (loading || !profil || rutePofil(profil) !== "/home") return <LoadingSpinner />;

  const galatInput = galatNama(nama);
  const namaRapi = rapikanNama(nama);
  const berubah = namaRapi !== profil.nama || pilihan !== profil.avatar;
  const avatarKini = getAvatar(profil.avatar);

  async function simpan() {
    if (!user || galatInput || !berubah) return;
    setGalat(null);
    setSukses(false);
    setMenyimpan(true);
    try {
      await perbaruiProfil(user.uid, {
        nama: namaRapi,
        avatar: pilihan ?? undefined,
      });
      await refreshProfil();
      setSukses(true);
    } catch {
      setGalat("Belum tersimpan. Coba tekan Simpan sekali lagi, ya!");
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <main id="konten-utama" className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* doodle samar di latar utama — seragam dengan Home (restyle D12) */}
      <LatarDoodle />
      {/* header band biru pastel — seragam dengan Leaderboard */}
      <div className="relative rounded-xl bg-band-blue p-4 sm:p-5 mb-6 overflow-hidden">
        <div className="flex items-center gap-3">
          <KonfirmasiKeluar
            href="/home"
            label="Kembali ke Home"
            aktif={berubah}
            judul="Perubahan belum disimpan"
            pesan="Nama atau avatar barumu belum disimpan. Tetap keluar?"
            labelKeluar="Keluar Tanpa Simpan"
            labelBatal="Kembali Mengedit"
          />
          <h1 className="text-2xl sm:text-3xl">Profilku 🙂</h1>
        </div>
      </div>

      {/* ringkasan profil sekarang */}
      <Card className="flex items-center gap-4 mb-6">
        <span
          className="w-20 h-20 shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-4xl"
          aria-hidden="true"
        >
          {avatarKini ? (
            <GambarEmoji
              src={avatarKini.gambar}
              emoji={avatarKini.emoji}
              className="w-full h-full object-cover"
            />
          ) : (
            "🙂"
          )}
        </span>
        <div className="min-w-0">
          <p className="font-display font-extrabold text-xl truncate">{profil.nama}</p>
          <p className="text-muted font-bold text-sm">
            Lv {hitungLevel(profil.poin)} · ⭐ {profil.poin}
            {profil.kelasId ? ` · 🏫 ${profil.kelasId}` : ""}
          </p>
        </div>
      </Card>

      {/* form ubah nama + avatar */}
      <Card>
        <label htmlFor="nama-panggilan" className="block font-bold mb-2">
          Nama panggilan
        </label>
        <input
          id="nama-panggilan"
          name="nama-panggilan"
          type="text"
          autoComplete="off"
          maxLength={NAMA_MAKS}
          value={nama}
          onChange={(e) => {
            setNama(e.target.value);
            setSukses(false);
          }}
          aria-invalid={nama.length > 0 && !!galatInput}
          aria-describedby="nama-bantuan"
          className={[
            "w-full min-h-[56px] px-5 rounded-md bg-surface text-fg",
            "text-xl font-display font-bold",
            "border-2",
            nama.length > 0 && galatInput ? "border-danger" : "border-border",
          ].join(" ")}
        />
        <p
          id="nama-bantuan"
          className={`mt-2 text-sm font-bold min-h-[1.25em] ${
            nama.length > 0 && galatInput ? "text-danger" : "text-muted"
          }`}
        >
          {nama.length > 0 && galatInput
            ? `⚠️ ${galatInput}`
            : `${namaRapi.length}/${NAMA_MAKS} huruf`}
        </p>

        <p className="font-bold mt-6 mb-4">Avatar</p>
        <PilihanAvatar
          nilai={pilihan}
          onPilih={(id) => {
            setPilihan(id);
            setSukses(false);
          }}
        />
        {/* nama avatar terpilih — afordans selain warna border */}
        <p className="text-muted font-bold mt-4 mb-2 text-center min-h-[1.5em]">
          {pilihan ? `✓ ${AVATARS.find((a) => a.id === pilihan)?.nama}` : " "}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            size="lg"
            fullWidth
            disabled={!berubah || !!galatInput || menyimpan}
            onClick={simpan}
          >
            {menyimpan ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
          {sukses && (
            <p role="status" className="text-success font-bold">
              ✓ Tersimpan!
            </p>
          )}
          {galat && (
            <p role="alert" className="text-danger font-bold">
              ⚠️ {galat}
            </p>
          )}
        </div>
      </Card>

      {/* pengaturan tampilan — pindahan dari header Home, biar header lega */}
      <Card className="mt-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold">Tampilan</p>
          <p className="text-muted text-sm font-bold">Mode terang atau gelap</p>
        </div>
        <ThemeToggle />
      </Card>

      {/* pengaturan suara & getar — bunyi default mati (ramah kelas) */}
      <Card className="mt-6">
        <PengaturanUmpanBalik />
      </Card>

      {/* keluar akun — konvensi sama dengan Home (🚪) */}
      <div className="mt-8 text-center">
        <Button
          variant="ghost"
          onClick={async () => {
            await logout();
            router.replace("/");
          }}
        >
          🚪 Keluar dari akun
        </Button>
      </div>
    </main>
  );
}
