"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { UserProfile } from "@/features/auth/types";
import { TabelSiswa } from "./DashboardGuru";
import { PENGUMUMAN_MAKS, type Pengumuman } from "./api";

/* Halaman kelola satu kelas (Teacher Dashboard) — menggantikan expand "Lihat
   Siswa" di dashboard dengan halaman khusus /guru/kelas/[kode]. Presentasional:
   data + handler via props supaya bisa diuji di /dev/guru tanpa login. */

interface KelolaKelasProps {
  namaKelas: string;
  kode: string;
  siswa: UserProfile[];
  pengumuman: Pengumuman[];
  onBuatPengumuman: (teks: string) => Promise<void>;
  onHapusPengumuman: (p: Pengumuman) => void;
  onKeluarkan: (s: UserProfile) => void;
  onResetProgres: (s: UserProfile) => void;
  /** siswa yang aksinya sedang diproses (tombol nonaktif) */
  siswaSibuk?: string | null;
}

function tanggalRingkas(ms: number): string {
  if (!ms) return "Baru saja";
  return new Date(ms).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function KelolaKelas({
  namaKelas,
  kode,
  siswa,
  pengumuman,
  onBuatPengumuman,
  onHapusPengumuman,
  onKeluarkan,
  onResetProgres,
  siswaSibuk = null,
}: KelolaKelasProps) {
  return (
    <div className="flex flex-col gap-8">
      <PanelPengumuman
        pengumuman={pengumuman}
        onBuat={onBuatPengumuman}
        onHapus={onHapusPengumuman}
      />

      {/* daftar siswa + kontrol per-siswa */}
      <section aria-labelledby="judul-siswa">
        <h2 id="judul-siswa" className="text-xl mb-1">
          Siswa di Kelas Ini 👥 ({siswa.length})
        </h2>
        <p className="text-muted font-bold text-sm mb-3">
          Reset progres mengembalikan poin, level, kemajuan game & koleksi kartu
          siswa ke awal. Keluarkan menghapus siswa dari <b>{namaKelas}</b> (kode{" "}
          {kode}); ia bisa bergabung lagi dengan kode kelas.
        </p>
        {siswa.length === 0 ? (
          <Card>
            <p className="text-muted font-bold text-center py-4">
              Belum ada siswa yang join. Bagikan kode <b>{kode}</b>! 📣
            </p>
          </Card>
        ) : (
          <Card>
            <TabelSiswa
              siswa={siswa}
              aksi={(s) => (
                <span className="flex flex-col items-stretch gap-1.5 whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onResetProgres(s)}
                    disabled={siswaSibuk === s.userId}
                  >
                    ♻️ Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onKeluarkan(s)}
                    disabled={siswaSibuk === s.userId}
                  >
                    🚪 Keluarkan
                  </Button>
                </span>
              )}
            />
          </Card>
        )}
      </section>
    </div>
  );
}

function PanelPengumuman({
  pengumuman,
  onBuat,
  onHapus,
}: {
  pengumuman: Pengumuman[];
  onBuat: (teks: string) => Promise<void>;
  onHapus: (p: Pengumuman) => void;
}) {
  const [teks, setTeks] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    if (teks.trim().length < 3) {
      setGalat("Tulis pengumuman minimal 3 huruf, ya.");
      return;
    }
    setSibuk(true);
    setGalat(null);
    try {
      await onBuat(teks.trim());
      setTeks("");
    } catch {
      setGalat("Gagal mengirim pengumuman. Coba lagi, ya.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <section aria-labelledby="judul-pengumuman">
      <h2 id="judul-pengumuman" className="text-xl mb-1">
        Pengumuman Kelas 📣
      </h2>
      <p className="text-muted font-bold text-sm mb-3">
        Pesan yang kamu tulis muncul di halaman Kelasku semua siswa kelas ini.
      </p>

      <Card className="mb-4">
        <form onSubmit={kirim}>
          <label htmlFor="teks-pengumuman" className="font-bold block mb-1">
            Tulis pengumuman baru
          </label>
          <textarea
            id="teks-pengumuman"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            maxLength={PENGUMUMAN_MAKS}
            rows={3}
            placeholder="Contoh: Jangan lupa main Kuis Asik sampai level 3 ya, minggu ini! 🌟"
            className="w-full bg-surface border-2 border-border rounded-md px-3 py-2.5 font-bold text-fg focus:border-primary outline-none resize-y"
          />
          <div className="flex items-center justify-between gap-3 mt-2">
            <span className="text-xs text-muted font-bold">
              {teks.length}/{PENGUMUMAN_MAKS}
            </span>
            <Button type="submit" disabled={sibuk}>
              ＋ Kirim Pengumuman
            </Button>
          </div>
        </form>
        {galat && (
          <p role="alert" className="text-danger font-bold mt-2">
            ⚠️ {galat}
          </p>
        )}
      </Card>

      {pengumuman.length === 0 ? (
        <p className="text-muted font-bold text-center py-2">
          Belum ada pengumuman. Tulis yang pertama di atas! ✍️
        </p>
      ) : (
        <ul className="flex flex-col gap-3 list-none">
          {pengumuman.map((p) => (
            <li key={p.id}>
              <Card className="flex items-start gap-3">
                <span className="text-2xl shrink-0" aria-hidden="true">
                  📌
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold whitespace-pre-wrap break-words">{p.teks}</p>
                  <p className="text-xs text-muted font-bold mt-1">
                    {tanggalRingkas(p.dibuat)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onHapus(p)}
                  aria-label="Hapus pengumuman"
                >
                  🗑️ Hapus
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
