"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import GambarEmoji from "@/components/ui/GambarEmoji";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getAvatar } from "@/features/auth/avatars";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import { SEMUA_KARTU } from "@/features/games/battle/config";
import {
  ambilKelasGuru,
  ambilSoalGuru,
  buatKelas,
  gabungKelasSebagaiGuru,
  hapusKelas,
  hapusSoal,
  keluarKelasSebagaiGuru,
  simpanSoal,
  type KelasGuru,
  type SoalGuru,
  type SoalGuruInput,
} from "./api";
import FormSoal, { KATEGORI_SOAL } from "./FormSoal";

/* Teacher Dashboard (Phase 10): Kelas Saya (buat kelas à la Kahoot, kode
   undangan, daftar siswa + progress ringkas §6) dan Bank Soal (soal custom
   skema §6 sumber:"guru" — D11: dipakai fitur Kuis saja dulu). */

type Tab = "kelas" | "soal";

export default function DashboardGuru({ profil }: { profil: UserProfile }) {
  const [tab, setTab] = useState<Tab>("kelas");

  return (
    <main id="konten-utama" className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      <h1 className="text-3xl mb-1">Selamat datang, {profil.nama}! 👋</h1>
      <p className="text-muted font-bold mb-6">
        Kelola kelas dan soal kuis untuk siswa-siswimu.
      </p>

      {/* tab pilihan */}
      <div
        role="tablist"
        aria-label="Bagian dashboard"
        className="inline-flex rounded-full border-2 border-border bg-surface p-1 mb-8"
      >
        {(
          [
            { id: "kelas", label: "🏫 Kelas Saya" },
            { id: "soal", label: "📝 Bank Soal" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-full px-5 py-2.5 font-display font-bold cursor-pointer",
              "transition-colors duration-150",
              tab === t.id ? "bg-primary text-on-primary" : "text-muted hover:text-fg",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "kelas" ? <BagianKelas guruId={profil.userId} /> : <BagianSoal guruId={profil.userId} />}
    </main>
  );
}

/* ================== Kelas Saya ================== */

function BagianKelas({ guruId }: { guruId: string }) {
  const [daftar, setDaftar] = useState<KelasGuru[] | null>(null);
  const [namaBaru, setNamaBaru] = useState("");
  const [kodeGabung, setKodeGabung] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [tersalin, setTersalin] = useState<string | null>(null);

  const muat = useCallback(() => {
    setGalat(null);
    ambilKelasGuru(guruId)
      .then(setDaftar)
      .catch(() => setGalat("Gagal memuat daftar kelas. Muat ulang halaman, ya."));
  }, [guruId]);

  useEffect(muat, [muat]);

  async function tambahKelas(e: React.FormEvent) {
    e.preventDefault();
    if (namaBaru.trim().length < 3) {
      setGalat("Nama kelas minimal 3 huruf.");
      return;
    }
    setSibuk(true);
    setGalat(null);
    try {
      await buatKelas(guruId, namaBaru);
      setNamaBaru("");
      muat();
    } catch {
      setGalat("Gagal membuat kelas. Coba lagi, ya.");
    } finally {
      setSibuk(false);
    }
  }

  async function gabungKelas(e: React.FormEvent) {
    e.preventDefault();
    setSibuk(true);
    setGalat(null);
    try {
      const hasil = await gabungKelasSebagaiGuru(guruId, kodeGabung);
      if (!hasil.ok) {
        setGalat(hasil.pesan);
        return;
      }
      setKodeGabung("");
      muat();
    } catch {
      setGalat("Gagal bergabung ke kelas. Coba lagi, ya.");
    } finally {
      setSibuk(false);
    }
  }

  async function hapus(kode: string) {
    if (!window.confirm(`Hapus kelas ${kode}? Siswa tidak lagi bisa join dengan kode ini.`)) return;
    setSibuk(true);
    try {
      await hapusKelas(kode);
      muat();
    } catch {
      setGalat("Gagal menghapus kelas.");
    } finally {
      setSibuk(false);
    }
  }

  async function keluar(kode: string) {
    if (!window.confirm(`Keluar dari kelas ${kode}? Kamu bisa bergabung lagi dengan kodenya.`))
      return;
    setSibuk(true);
    try {
      await keluarKelasSebagaiGuru(guruId, kode);
      muat();
    } catch {
      setGalat("Gagal keluar dari kelas.");
    } finally {
      setSibuk(false);
    }
  }

  function salin(kode: string) {
    void navigator.clipboard?.writeText(kode).then(() => {
      setTersalin(kode);
      setTimeout(() => setTersalin(null), 2000);
    });
  }

  return (
    <section aria-label="Kelas saya">
      {/* buat kelas baru */}
      <Card className="mb-6">
        <form onSubmit={tambahKelas} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="nama-kelas" className="font-bold block mb-1">
              Buat kelas baru
            </label>
            <input
              id="nama-kelas"
              value={namaBaru}
              onChange={(e) => setNamaBaru(e.target.value)}
              maxLength={40}
              placeholder="Contoh: Kelas 1A SDN Melati"
              className="w-full bg-surface border-2 border-border rounded-md px-3 py-2.5 font-bold text-fg focus:border-primary outline-none"
            />
          </div>
          <div className="sm:self-end">
            <Button type="submit" disabled={sibuk}>
              ＋ Buat Kelas
            </Button>
          </div>
        </form>
        <p className="text-sm text-muted font-bold mt-2">
          Sistem membuat kode unik 5 huruf — bagikan ke siswa untuk join saat
          onboarding, atau ke guru lain untuk mengajar bersama.
        </p>
      </Card>

      {/* gabung sebagai pengajar tambahan (kelas guru lain) */}
      <Card className="mb-6">
        <form onSubmit={gabungKelas} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="kode-gabung" className="font-bold block mb-1">
              Gabung sebagai pengajar
            </label>
            <input
              id="kode-gabung"
              value={kodeGabung}
              onChange={(e) => setKodeGabung(e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="Masukkan kode kelas (5 huruf)"
              className="w-full bg-surface border-2 border-border rounded-md px-3 py-2.5 font-bold tracking-[0.15em] text-fg focus:border-primary outline-none"
            />
          </div>
          <div className="sm:self-end">
            <Button type="submit" variant="accent" disabled={sibuk}>
              🤝 Gabung
            </Button>
          </div>
        </form>
        <p className="text-sm text-muted font-bold mt-2">
          Punya kode kelas dari guru lain? Masukkan di sini untuk ikut mengajar
          kelas itu bersama-sama.
        </p>
      </Card>

      {galat && (
        <p role="alert" className="text-danger font-bold mb-4">
          ⚠️ {galat}
        </p>
      )}

      {daftar === null ? (
        <LoadingSpinner label="Memuat kelas…" />
      ) : daftar.length === 0 ? (
        <p className="text-muted font-bold text-center py-6">
          Belum ada kelas. Buat kelas pertamamu di atas! 🏫
        </p>
      ) : (
        <ul className="flex flex-col gap-4 list-none">
          {daftar.map((k) => {
            const akuPemilik = k.guruId === guruId;
            const jumlahGuru = k.guruIds.length;
            return (
              <li key={k.kode}>
                <Card>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-40">
                      <h3 className="font-display font-extrabold text-lg">{k.nama}</h3>
                      <p className="text-sm text-muted font-bold flex flex-wrap items-center gap-2">
                        <span>Kode kelas:</span>
                        {!akuPemilik && (
                          <span className="bg-accent/15 text-fg border border-accent rounded-full px-2 py-0.5 text-xs font-extrabold">
                            🤝 Mengajar bersama
                          </span>
                        )}
                        {jumlahGuru > 1 && (
                          <span className="bg-surface-2 border border-border rounded-full px-2 py-0.5 text-xs font-extrabold">
                            🧑‍🏫 {jumlahGuru} guru
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className="font-display font-extrabold text-2xl tracking-[0.25em] bg-surface-2 border-2 border-primary rounded-md px-4 py-2"
                      aria-label={`Kode kelas ${k.kode.split("").join(" ")}`}
                    >
                      {k.kode}
                    </span>
                    <Button variant="ghost" onClick={() => salin(k.kode)}>
                      {tersalin === k.kode ? "✓ Tersalin" : "📋 Salin"}
                    </Button>
                    <Link
                      href={`/guru/kelas/${k.kode}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full min-h-[48px] px-6 text-base font-display font-bold select-none no-underline bg-primary text-on-primary shadow-[0_4px_0_var(--primary-active)] hover:bg-primary-hover active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow,background-color] duration-150 ease-out"
                    >
                      ⚙️ Kelola Kelas
                    </Link>
                    {akuPemilik ? (
                      <Button variant="danger" onClick={() => hapus(k.kode)} disabled={sibuk}>
                        Hapus
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={() => keluar(k.kode)} disabled={sibuk}>
                        🚪 Keluar
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Tabel progress ringkas — presentasional (dipakai /dev/guru & halaman kelola).
    `aksi` opsional: render tombol per-siswa (kolom paling kanan) di halaman
    kelola; tanpa `aksi` tabel murni baca (dashboard/dev). */
export function TabelSiswa({
  siswa,
  aksi,
}: {
  siswa: UserProfile[];
  aksi?: (s: UserProfile) => ReactNode;
}) {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-left border-collapse">
        <caption className="sr-only">Daftar siswa dan progress belajar</caption>
        <thead>
          <tr className="border-b-2 border-border text-sm text-muted">
            <th className="py-2 pr-3 font-extrabold">Siswa</th>
            <th className="py-2 px-3 font-extrabold">Lv</th>
            <th className="py-2 px-3 font-extrabold">⭐ Poin</th>
            <th className="py-2 px-3 font-extrabold">❓ Kuis</th>
            <th className="py-2 px-3 font-extrabold">🍽️ Piring</th>
            <th className="py-2 px-3 font-extrabold">📖 Cerita</th>
            <th className="py-2 px-3 font-extrabold">🃏 Kartu</th>
            {aksi && <th className="py-2 pl-3 font-extrabold">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {siswa.map((s) => {
            const av = getAvatar(s.avatar ?? "");
            return (
              <tr key={s.userId} className="border-b border-border font-bold">
                <td className="py-2 pr-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-sm"
                      aria-hidden="true"
                    >
                      {av ? (
                        <GambarEmoji
                          src={av.gambar}
                          emoji={av.emoji}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "🙂"
                      )}
                    </span>
                    {s.nama}
                  </span>
                </td>
                <td className="py-2 px-3">{hitungLevel(s.poin)}</td>
                <td className="py-2 px-3">{s.poin}</td>
                <td className="py-2 px-3">Level {s.progress.kuis.levelTerbuka}</td>
                <td className="py-2 px-3">Level {s.progress.isiPiringku.levelTerbuka}</td>
                <td className="py-2 px-3">Bab {s.progress.cerita.babTerbuka}</td>
                <td className="py-2 px-3">
                  {s.koleksi.length}/{SEMUA_KARTU.length}
                </td>
                {aksi && <td className="py-2 pl-3">{aksi(s)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================== Bank Soal ================== */

function BagianSoal({ guruId }: { guruId: string }) {
  const [daftar, setDaftar] = useState<SoalGuru[] | null>(null);
  const [form, setForm] = useState<{ mode: "baru" } | { mode: "edit"; soal: SoalGuru } | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(() => {
    setGalat(null);
    ambilSoalGuru(guruId)
      .then(setDaftar)
      .catch(() => setGalat("Gagal memuat bank soal. Muat ulang halaman, ya."));
  }, [guruId]);

  useEffect(muat, [muat]);

  async function simpan(input: SoalGuruInput) {
    setSibuk(true);
    setGalat(null);
    try {
      await simpanSoal(guruId, input, form?.mode === "edit" ? form.soal.id : undefined);
      setForm(null);
      muat();
    } catch {
      setGalat("Gagal menyimpan soal. Coba lagi, ya.");
    } finally {
      setSibuk(false);
    }
  }

  async function hapus(soal: SoalGuru) {
    if (!window.confirm(`Hapus soal "${soal.pertanyaan.slice(0, 40)}…"?`)) return;
    setSibuk(true);
    try {
      await hapusSoal(soal.id);
      muat();
    } catch {
      setGalat("Gagal menghapus soal.");
    } finally {
      setSibuk(false);
    }
  }

  const labelKategori = (id: string) =>
    KATEGORI_SOAL.find((k) => k.id === id)?.label ?? id;

  return (
    <section aria-label="Bank soal">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-muted font-bold">
          Soal buatanmu otomatis ikut muncul di Kuis siswa kelasmu (sesuai level).
        </p>
        {!form && <Button onClick={() => setForm({ mode: "baru" })}>＋ Buat Soal</Button>}
      </div>

      {form && (
        <Card className="mb-6 border-primary border-2">
          <h3 className="font-display font-extrabold text-lg mb-4">
            {form.mode === "baru" ? "Soal baru" : "Edit soal"}
          </h3>
          <FormSoal
            awal={form.mode === "edit" ? form.soal : undefined}
            sibuk={sibuk}
            onSimpan={simpan}
            onBatal={() => setForm(null)}
          />
        </Card>
      )}

      {galat && (
        <p role="alert" className="text-danger font-bold mb-4">
          ⚠️ {galat}
        </p>
      )}

      {daftar === null ? (
        <LoadingSpinner label="Memuat soal…" />
      ) : daftar.length === 0 ? (
        <p className="text-muted font-bold text-center py-6">
          Belum ada soal buatanmu. Tekan “＋ Buat Soal” untuk mulai! 📝
        </p>
      ) : (
        <ul className="flex flex-col gap-4 list-none">
          {daftar.map((soal) => (
            <li key={soal.id}>
              <Card>
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <span className="bg-primary text-on-primary text-xs font-extrabold rounded-full px-2.5 py-1">
                    Level {soal.level}
                  </span>
                  <span className="bg-surface-2 border border-border text-xs font-extrabold rounded-full px-2.5 py-1">
                    {labelKategori(soal.kategori)}
                  </span>
                  <span className="bg-surface-2 border border-border text-xs font-extrabold rounded-full px-2.5 py-1">
                    ⏰ {soal.durasiDetik} dtk
                  </span>
                  <span className="ml-auto flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setForm({ mode: "edit", soal })}>
                      ✏️ Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => hapus(soal)} disabled={sibuk}>
                      Hapus
                    </Button>
                  </span>
                </div>
                <p className="font-bold mb-2">{soal.pertanyaan}</p>
                <ul className="grid sm:grid-cols-2 gap-1.5 list-none text-sm">
                  {soal.opsi.map((o, i) => (
                    <li
                      key={i}
                      className={[
                        "rounded-md border-2 px-3 py-1.5 font-bold",
                        i === soal.kunciIndex
                          ? "border-success bg-success/10"
                          : "border-border",
                      ].join(" ")}
                    >
                      {soal.opsiEmoji?.[i] && (
                        <span aria-hidden="true">{soal.opsiEmoji[i]} </span>
                      )}
                      {o}
                      {i === soal.kunciIndex && (
                        <span className="text-success font-extrabold"> ✓</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
