"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { getAvatar } from "@/features/auth/avatars";
import { ATURAN } from "@/features/games/kuis/config";
import type { UserProfile } from "@/features/auth/types";
import { TabelSiswa } from "./DashboardGuru";
import { PENGUMUMAN_MAKS, type LogKuis, type PengajarKelas, type Pengumuman } from "./api";
import { rangkumSiswa } from "./rangkumanSiswa";

/* Halaman kelola satu kelas (Teacher Dashboard) — menggantikan expand "Lihat
   Siswa" di dashboard dengan halaman khusus /guru/kelas/[kode]. Presentasional:
   data + handler via props supaya bisa diuji di /dev/guru tanpa login. */

interface KelolaKelasProps {
  namaKelas: string;
  kode: string;
  siswa: UserProfile[];
  pengumuman: Pengumuman[];
  /** riwayat jawaban Kuis per siswa (by userId), terbaru di atas */
  logKuis: Record<string, LogKuis[]>;
  /** roster pengajar kelas (pemilik di depan); kosongkan untuk sembunyikan panel */
  pengajar?: PengajarKelas[];
  /** uid guru yang sedang membuka — menentukan siapa "kamu" & hak kelola roster */
  uidKu?: string;
  onBuatPengumuman: (teks: string) => Promise<void>;
  onHapusPengumuman: (p: Pengumuman) => void;
  onKeluarkan: (s: UserProfile) => void;
  onResetProgres: (s: UserProfile) => void;
  /** pemilik mengeluarkan pengajar tambahan dari roster */
  onKeluarkanGuru?: (g: PengajarKelas) => void;
  /** pengajar tambahan keluar dari kelas ini sendiri */
  onKeluarSendiri?: () => void;
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

function tanggalWaktu(ms: number): string {
  if (!ms) return "Baru saja";
  return new Date(ms).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KelolaKelas({
  namaKelas,
  kode,
  siswa,
  pengumuman,
  logKuis,
  pengajar,
  uidKu,
  onBuatPengumuman,
  onHapusPengumuman,
  onKeluarkan,
  onResetProgres,
  onKeluarkanGuru,
  onKeluarSendiri,
  siswaSibuk = null,
}: KelolaKelasProps) {
  return (
    <div className="flex flex-col gap-8">
      {pengajar && (
        <PanelPengajar
          pengajar={pengajar}
          kode={kode}
          uidKu={uidKu}
          onKeluarkanGuru={onKeluarkanGuru}
          onKeluarSendiri={onKeluarSendiri}
        />
      )}

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

      <RangkumanPemahaman siswa={siswa} logKuis={logKuis} />

      <RiwayatKuis siswa={siswa} logKuis={logKuis} />
    </div>
  );
}

/* Avatar bulat kecil dipakai di beberapa daftar per-siswa di halaman ini. */
function AvatarSiswa({ siswa }: { siswa: UserProfile }) {
  const av = getAvatar(siswa.avatar ?? "");
  return (
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
  );
}

/* Rangkuman pemahaman per siswa — satu paragraf "AI-like" dirakit on-device
   dari riwayat Kuis (features/guru/rangkumanSiswa). Hanya siswa yang sudah
   punya riwayat yang muncul (yang lain belum ada yang bisa dirangkum). */
function RangkumanPemahaman({
  siswa,
  logKuis,
}: {
  siswa: UserProfile[];
  logKuis: Record<string, LogKuis[]>;
}) {
  const kartu = siswa
    .map((s) => ({ siswa: s, rangkuman: rangkumSiswa(s.nama, logKuis[s.userId] ?? []) }))
    .filter((k) => k.rangkuman !== null);

  return (
    <section aria-labelledby="judul-rangkuman">
      <h2 id="judul-rangkuman" className="text-xl mb-1">
        Rangkuman Pemahaman Siswa 🧠
      </h2>
      <p className="text-muted font-bold text-sm mb-3">
        Ringkasan otomatis dari jawaban Kuis tiap siswa — menyoroti materi yang
        sudah dikuasai dan yang masih perlu latihan. Dibuat di perangkat dari
        data yang ada, bukan penilaian resmi.
      </p>

      {kartu.length === 0 ? (
        <Card>
          <p className="text-muted font-bold text-center py-4">
            Rangkuman muncul di sini setelah siswa memainkan Kuis Asik. 🎮
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3 list-none">
          {kartu.map(({ siswa: s, rangkuman }) => (
            <li key={s.userId}>
              <Card className="flex items-start gap-3">
                <AvatarSiswa siswa={s} />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-extrabold">{s.nama}</p>
                  <p className="font-bold text-fg/90 leading-snug mt-0.5">
                    {rangkuman!.teks}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RiwayatKuis({
  siswa,
  logKuis,
}: {
  siswa: UserProfile[];
  logKuis: Record<string, LogKuis[]>;
}) {
  /* hanya tampilkan siswa yang punya riwayat; siswa aktif diprioritaskan */
  const denganLog = siswa.filter((s) => (logKuis[s.userId]?.length ?? 0) > 0);

  return (
    <section aria-labelledby="judul-riwayat-kuis">
      <h2 id="judul-riwayat-kuis" className="text-xl mb-1">
        Riwayat Jawaban Kuis 📋
      </h2>
      <p className="text-muted font-bold text-sm mb-3">
        Tiap kali siswa menyelesaikan satu level Kuis Asik, jawaban benar &amp;
        salahnya tercatat di sini — buka untuk lihat soal per soal.
      </p>

      {denganLog.length === 0 ? (
        <Card>
          <p className="text-muted font-bold text-center py-4">
            Belum ada yang menyelesaikan level Kuis. Riwayat muncul di sini setelah
            siswa bermain. 🎮
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3 list-none">
          {denganLog.map((s) => {
            const log = logKuis[s.userId] ?? [];
            return (
              <li key={s.userId}>
                <Card className="p-0 overflow-hidden">
                  <details className="group">
                    <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none font-bold list-none">
                      <AvatarSiswa siswa={s} />
                      <span className="flex-1 min-w-0">{s.nama}</span>
                      <span className="text-sm text-muted whitespace-nowrap">
                        {log.length} percobaan
                      </span>
                      <span
                        className="text-muted transition-transform group-open:rotate-90"
                        aria-hidden="true"
                      >
                        ▶
                      </span>
                    </summary>
                    <ul className="flex flex-col gap-2 px-4 pb-4 list-none border-t border-border pt-3">
                      {log.map((l) => (
                        <li key={l.id}>
                          <KartuPercobaan log={l} />
                        </li>
                      ))}
                    </ul>
                  </details>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function KartuPercobaan({ log }: { log: LogKuis }) {
  const minLulus = ATURAN[log.level]?.syaratLulus.minBenar ?? Math.ceil(log.total * 0.6);
  const lulus = log.benar >= minLulus;
  return (
    <details className="rounded-lg border-2 border-border bg-surface-2">
      <summary className="flex flex-wrap items-center gap-2 px-3 py-2 cursor-pointer select-none font-bold list-none">
        <span className="bg-primary text-on-primary text-xs font-extrabold rounded-full px-2.5 py-1">
          Level {log.level}
        </span>
        <span
          className={[
            "text-sm font-extrabold",
            lulus ? "text-success" : "text-danger",
          ].join(" ")}
        >
          {log.benar}/{log.total} benar
        </span>
        <span className="text-xs text-muted ml-auto whitespace-nowrap">
          {tanggalWaktu(log.dibuat)}
        </span>
      </summary>
      <ol className="flex flex-col gap-1.5 px-3 pb-3 pt-1 list-none">
        {log.detail.map((d, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm border-t border-border pt-1.5 first:border-t-0"
          >
            <span
              aria-hidden="true"
              className={d.benar ? "text-success" : "text-danger"}
            >
              {d.benar ? "✓" : "✗"}
            </span>
            <span className="min-w-0">
              <span className="font-bold">{d.pertanyaan}</span>{" "}
              <span className="text-muted">
                — jawab: <b className={d.benar ? "text-success" : "text-danger"}>
                  {d.jawabanSiswa}
                </b>
                {!d.benar && (
                  <>
                    {" "}
                    (benar: <b className="text-success">{d.jawabanBenar}</b>)
                  </>
                )}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}

function PanelPengajar({
  pengajar,
  kode,
  uidKu,
  onKeluarkanGuru,
  onKeluarSendiri,
}: {
  pengajar: PengajarKelas[];
  kode: string;
  uidKu?: string;
  onKeluarkanGuru?: (g: PengajarKelas) => void;
  onKeluarSendiri?: () => void;
}) {
  const akuPemilik = pengajar.some((g) => g.userId === uidKu && g.pemilik);

  return (
    <section aria-labelledby="judul-pengajar">
      <h2 id="judul-pengajar" className="text-xl mb-1">
        Pengajar Kelas 🧑‍🏫 ({pengajar.length})
      </h2>
      <p className="text-muted font-bold text-sm mb-3">
        Satu kelas bisa diajar beberapa guru. Bagikan kode <b>{kode}</b> ke guru
        lain — mereka masuk lewat “Gabung sebagai pengajar” di dashboard untuk
        mengajar kelas ini bersama.
      </p>
      <Card>
        <ul className="flex flex-col gap-2 list-none">
          {pengajar.map((g) => {
            const aku = g.userId === uidKu;
            return (
              <li
                key={g.userId}
                className="flex items-center gap-3 font-bold border-b border-border last:border-b-0 pb-2 last:pb-0"
              >
                <span
                  className="w-9 h-9 shrink-0 rounded-full bg-band-blue border-2 border-border flex items-center justify-center text-lg"
                  aria-hidden="true"
                >
                  🧑‍🏫
                </span>
                <span className="flex-1 min-w-0">
                  {g.nama}
                  {aku && <span className="text-muted"> (kamu)</span>}
                </span>
                {g.pemilik ? (
                  <span className="bg-primary text-on-primary text-xs font-extrabold rounded-full px-2.5 py-1 whitespace-nowrap">
                    Wali kelas
                  </span>
                ) : (
                  <span className="bg-surface-2 border border-border text-xs font-extrabold rounded-full px-2.5 py-1 whitespace-nowrap">
                    Pengajar
                  </span>
                )}
                {/* pemilik boleh mengeluarkan pengajar lain; pengajar lain boleh keluar sendiri */}
                {!g.pemilik && akuPemilik && onKeluarkanGuru && (
                  <Button size="sm" variant="danger" onClick={() => onKeluarkanGuru(g)}>
                    Keluarkan
                  </Button>
                )}
                {!g.pemilik && aku && onKeluarSendiri && (
                  <Button size="sm" variant="ghost" onClick={onKeluarSendiri}>
                    🚪 Keluar
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
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
