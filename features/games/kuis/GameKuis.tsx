"use client";

import { useEffect, useRef, useState } from "react";
import BlobMata from "@/components/deko/BlobMata";
import LatarKuis from "@/components/deko/LatarKuis";
import Button from "@/components/ui/Button";
import KonfirmasiKeluar from "@/components/ui/KonfirmasiKeluar";
import TombolKembali from "@/components/ui/TombolKembali";
import Card from "@/components/ui/Card";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { useAuth } from "@/features/auth/AuthProvider";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import {
  ATURAN,
  JUMLAH_SOAL,
  POIN_PER_BENAR,
  hitungBintangKuis,
  soalUntukLevel,
  type Soal,
} from "./config";
import { ambilSoalGuruKelas, simpanHasilKuis } from "./api";

/* Kuis Asik (Phase 5, mockup MacBook Air - 6).
   D4: TIDAK ada tombol "Sebelumnya" (mockup di-override) — jawaban terkunci
   begitu dipilih atau waktu habis, feedback sebentar, lalu otomatis lanjut.
   Timer 15 dtk per soal dengan bar visual; progres = 10 lingkaran bernomor. */

type Fase = "pilih" | "main" | "hasil";
type HasilSoal = "benar" | "salah" | null;

const JEDA_FEEDBACK_MS = 1800;

export default function GameKuis({ profil }: { profil: UserProfile }) {
  const { refreshProfil } = useAuth();

  const [fase, setFase] = useState<Fase>("pilih");
  const [level, setLevel] = useState(1);
  const [daftarSoal, setDaftarSoal] = useState<Soal[]>([]);
  const [index, setIndex] = useState(0);
  const [riwayat, setRiwayat] = useState<HasilSoal[]>([]);
  const [pilihan, setPilihan] = useState<number | null>(null);
  const [terkunci, setTerkunci] = useState(false);
  const [waktuHabis, setWaktuHabis] = useState(false);
  const [timerSisa, setTimerSisa] = useState(15);
  const [statusSimpan, setStatusSimpan] = useState<"idle" | "proses" | "ok" | "gagal">("idle");

  const soal = daftarSoal[index];
  const benarTotal = riwayat.filter((r) => r === "benar").length;
  /* poin SEBELUM sesi ini — untuk deteksi naik level (D10) di layar hasil
     (profil bisa sudah ter-refresh setelah simpan, jadi tak bisa dipakai) */
  const poinAwalRef = useRef(profil.poin);

  /* soal buatan guru kelas (Phase 10, D11) — gabung ke pool; gagal = [] */
  const [soalGuru, setSoalGuru] = useState<Soal[]>([]);
  useEffect(() => {
    let aktif = true;
    ambilSoalGuruKelas(profil.kelasId)
      .then((s) => aktif && setSoalGuru(s))
      .catch(() => {});
    return () => {
      aktif = false;
    };
  }, [profil.kelasId]);

  function mulaiLevel(lv: number) {
    poinAwalRef.current = profil.poin;
    const soalBaru = soalUntukLevel(lv, soalGuru);
    setLevel(lv);
    setDaftarSoal(soalBaru);
    setIndex(0);
    setRiwayat(Array(soalBaru.length).fill(null));
    setPilihan(null);
    setTerkunci(false);
    setWaktuHabis(false);
    setTimerSisa(soalBaru[0]?.durasiDetik ?? 15);
    setStatusSimpan("idle");
    setFase("main");
  }

  function kunciJawaban(idxOpsi: number | null) {
    if (terkunci || !soal) return;
    setTerkunci(true);
    setPilihan(idxOpsi);
    setWaktuHabis(idxOpsi === null);
    setRiwayat((r) => {
      const baru = [...r];
      baru[index] = idxOpsi === soal.kunciIndex ? "benar" : "salah";
      return baru;
    });
  }

  const selesaiLevel = async (riwayatAkhir: HasilSoal[]) => {
    const benar = riwayatAkhir.filter((r) => r === "benar").length;
    const lulus = benar >= ATURAN[level].syaratLulus.minBenar;
    setFase("hasil");
    setStatusSimpan("proses");
    try {
      await simpanHasilKuis(profil, {
        level,
        lulus,
        poinTambah: benar * POIN_PER_BENAR,
      });
      await refreshProfil();
      setStatusSimpan("ok");
    } catch {
      setStatusSimpan("gagal");
    }
  };
  const selesaiLevelRef = useRef(selesaiLevel);
  selesaiLevelRef.current = selesaiLevel;

  /* setelah jawaban terkunci: tampilkan feedback sebentar → otomatis lanjut (D4) */
  useEffect(() => {
    if (fase !== "main" || !terkunci) return;
    const id = setTimeout(() => {
      if (index + 1 < daftarSoal.length) {
        setIndex((i) => i + 1);
        setPilihan(null);
        setTerkunci(false);
        setWaktuHabis(false);
        setTimerSisa(daftarSoal[index + 1].durasiDetik);
      } else {
        void selesaiLevelRef.current(riwayat);
      }
    }, JEDA_FEEDBACK_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, terkunci]);

  /* timer per soal */
  useEffect(() => {
    if (fase !== "main" || terkunci) return;
    if (timerSisa <= 0) {
      kunciJawaban(null); // waktu habis = dianggap belum benar, tetap lanjut
      return;
    }
    const id = setTimeout(() => setTimerSisa((t) => t - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, terkunci, timerSisa]);

  /* ---------- layar pilih level ---------- */
  if (fase === "pilih") {
    const levelTerbuka = profil.progress.kuis.levelTerbuka;
    return (
      <>
      <LatarKuis />
      <main id="konten-utama" className="max-w-4xl mx-auto px-6 py-12">
        <TombolKembali href="/home" label="Kembali ke Home" />
        <h1 className="text-3xl text-center mb-2 mt-4">Kuis Asik! ❓</h1>
        <p className="text-lg text-muted text-center mb-10 max-w-[55ch] mx-auto">
          Jawab {JUMLAH_SOAL} soal, tiap soal punya waktu 15 detik. Jawabanmu
          terkunci begitu dipilih — pilih dengan teliti, ya!
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((lv) => {
            const terkunciLv = lv > levelTerbuka;
            const aturan = ATURAN[lv];
            return (
              <button
                key={lv}
                disabled={terkunciLv}
                onClick={() => mulaiLevel(lv)}
                aria-label={
                  terkunciLv
                    ? `Level ${lv} terkunci. Selesaikan Level ${lv - 1} untuk membukanya`
                    : `Main Kuis Level ${lv}`
                }
                className={[
                  "flex flex-col items-center gap-2 p-8 rounded-xl bg-surface border-4 text-fg",
                  "transition-[transform,border-color] duration-150",
                  terkunciLv
                    ? "border-border opacity-60 grayscale cursor-not-allowed"
                    : "border-border hover:border-primary hover:-translate-y-1 cursor-pointer",
                ].join(" ")}
              >
                <span className="text-5xl" aria-hidden="true">
                  {terkunciLv ? "🔒" : ["🌱", "🌿", "🌳"][lv - 1]}
                </span>
                <span className="font-display font-extrabold text-xl">Level {lv}</span>
                <span className="text-sm text-muted text-center">
                  {terkunciLv
                    ? `Selesaikan Level ${lv - 1} untuk buka ini!`
                    : `${JUMLAH_SOAL} soal · lulus minimal ${aturan.syaratLulus.minBenar} benar`}
                </span>
              </button>
            );
          })}
        </div>
      </main>
      </>
    );
  }

  /* ---------- layar hasil ---------- */
  if (fase === "hasil") {
    const lulus = benarTotal >= ATURAN[level].syaratLulus.minBenar;
    const bintang = hitungBintangKuis(level, benarTotal);
    const bukaLevelBaru =
      lulus && level === profil.progress.kuis.levelTerbuka && level < 3;
    return (
      <main id="konten-utama" className="max-w-xl mx-auto px-6 py-12 text-center">
        <span className="relative inline-block mb-4" aria-hidden="true">
          {/* blob "teman-teman" ikut merayakan (restyle THYNK §B) */}
          <BlobMata bentuk="bunga" className="absolute -left-14 bottom-1 w-12 text-accent -rotate-6" />
          <BlobMata bentuk="cipratan" className="absolute -right-14 bottom-2 w-12 text-primary rotate-6" />
          <span className="w-28 h-28 text-6xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center motion-safe:animate-bounce">
            <GambarEmoji
              src={lulus ? "/assets/mascot/tayo-happy.png" : "/assets/mascot/tayo-cheer.png"}
              emoji={lulus ? "🐆🎉" : "🐆💛"}
              className="w-full h-full object-cover"
            />
          </span>
        </span>
        <h1 className="text-3xl mb-2">{lulus ? "Kamu hebat!" : "Sudah bagus!"}</h1>
        <p className="text-lg text-muted mb-6">
          {lulus
            ? `Level ${level} selesai!`
            : `Butuh ${ATURAN[level].syaratLulus.minBenar} benar untuk lulus — yuk coba lagi!`}
        </p>

        <p className="text-5xl mb-6 tracking-widest" aria-label={`${bintang} dari 3 bintang`}>
          {[1, 2, 3].map((b) => (
            <span key={b} aria-hidden="true">
              {b <= bintang ? "⭐" : "☆"}
            </span>
          ))}
        </p>

        <Card className="mb-6">
          <p className="font-display font-extrabold text-2xl mb-1">
            {benarTotal} / {daftarSoal.length} benar
          </p>
          <p className="font-bold text-lg">+ ⭐ {benarTotal * POIN_PER_BENAR} poin</p>
          {bukaLevelBaru && (
            <p className="font-bold text-success mt-2">🔓 Level {level + 1} terbuka!</p>
          )}
          {hitungLevel(poinAwalRef.current + benarTotal * POIN_PER_BENAR) >
            hitungLevel(poinAwalRef.current) && (
            <p className="font-bold text-success mt-1">
              🎉 Kamu naik ke Lv{" "}
              {hitungLevel(poinAwalRef.current + benarTotal * POIN_PER_BENAR)}!
            </p>
          )}
          <p className="text-sm text-muted mt-2" role="status">
            {statusSimpan === "proses" && "Menyimpan progres…"}
            {statusSimpan === "ok" && "✓ Progres tersimpan"}
            {statusSimpan === "gagal" &&
              "⚠️ Progres belum tersimpan (cek koneksi) — poin sesi ini mungkin hilang."}
          </p>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => mulaiLevel(level)}>🔁 Main Lagi</Button>
          <Button variant="ghost" onClick={() => setFase("pilih")}>
            Pilih Level
          </Button>
          <Button variant="ghost" onClick={() => (window.location.href = "/home")}>
            🏠 Home
          </Button>
        </div>
      </main>
    );
  }

  /* ---------- layar soal ---------- */
  if (!soal) return null;
  const persenWaktu = (timerSisa / soal.durasiDetik) * 100;

  const waktuKritis = timerSisa <= 5;

  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* header ramping — kromnya sengaja dibuat tenang agar soal jadi fokus */}
      <div className="flex items-center gap-3 mb-4">
        <KonfirmasiKeluar
          href="/home"
          label="Keluar dari kuis"
          judul="Keluar dari kuis?"
          pesan="Kuis masih berlangsung — kalau keluar, skor level ini tidak tersimpan."
        />
        <h1 className="text-base sm:text-lg font-display font-extrabold text-muted">
          Kuis Asik · Level {level}
        </h1>
      </div>

      {/* ISLAND: satu panel menonjol yang memegang soal + jawaban (fokus utama) */}
      <section className="rounded-3xl bg-surface border-2 border-border shadow-[0_10px_30px_rgba(16,32,43,0.12)] p-4 sm:p-6">
        {/* timer ramping menempel di puncak island + konteks "soal ke-berapa" */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <span className="font-display font-extrabold text-sm text-muted whitespace-nowrap tabular-nums">
            Soal {index + 1}/{daftarSoal.length}
          </span>
          <div
            role="timer"
            aria-label={`Sisa waktu ${timerSisa} detik`}
            className="flex-1 h-2.5 rounded-full bg-surface-2 border-2 border-border overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
                waktuKritis ? "bg-danger" : "bg-primary"
              }`}
              style={{ width: `${persenWaktu}%` }}
            />
          </div>
          <span
            className={`font-display font-extrabold text-lg tabular-nums w-[2.5ch] text-right ${
              waktuKritis ? "text-danger motion-safe:animate-pulse" : "text-fg"
            }`}
          >
            {timerSisa}
          </span>
        </div>

        {/* pertanyaan — panel berwarna, teks besar: bagian yang paling menonjol */}
        <div className="rounded-2xl bg-band-blue px-5 py-6 sm:py-8">
          <p className="font-display font-extrabold text-xl sm:text-2xl text-center text-balance leading-snug">
            {soal.pertanyaan}
          </p>
        </div>

        {/* feedback Tayo saat terkunci */}
        <p
          role="status"
          aria-live="assertive"
          className="text-center font-bold my-4 min-h-[1.6em]"
        >
          {terkunci &&
            (waktuHabis
              ? "⏰ Waktu habis! Jawabannya yang benar diberi tanda ✓"
              : pilihan === soal.kunciIndex
                ? "🐆✨ Yeay, benar!"
                : "🐆💛 Yuk coba lagi di soal berikutnya!")}
        </p>

        {/* 4 opsi ikon + label — kartu surface-2 agar terpisah dari island putih */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {soal.opsi.map((opsi, i) => {
            const kunci = i === soal.kunciIndex;
            const dipilih = i === pilihan;
            let gaya =
              "bg-surface-2 border-border hover:border-primary hover:bg-surface cursor-pointer";
            let tanda: string | null = null;
            if (terkunci) {
              if (kunci) {
                gaya = "bg-success/15 border-success";
                tanda = "✓";
              } else if (dipilih) {
                gaya = "bg-danger/10 border-danger";
                tanda = "✗";
              } else {
                gaya = "bg-surface-2 border-border opacity-60";
              }
            }
            return (
              <button
                key={i}
                disabled={terkunci}
                onClick={() => kunciJawaban(i)}
                aria-label={`Jawaban: ${opsi}${
                  terkunci && kunci ? " (benar)" : terkunci && dipilih ? " (salah)" : ""
                }`}
                className={[
                  "relative flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl border-4 text-fg",
                  "transition-[transform,border-color,background-color] duration-150",
                  !terkunci ? "hover:-translate-y-1" : "",
                  gaya,
                ].join(" ")}
              >
                {soal.opsiEmoji?.[i] && (
                  <span className="text-4xl" aria-hidden="true">
                    {soal.opsiEmoji[i]}
                  </span>
                )}
                <span className="font-bold leading-tight">{opsi}</span>
                {tanda && (
                  <span
                    aria-hidden="true"
                    className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-lg border-2 ${
                      tanda === "✓"
                        ? "bg-success text-on-success border-success"
                        : "bg-danger text-white border-danger"
                    }`}
                  >
                    {tanda}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* progres 10 lingkaran — dipindah ke bawah island (kromnya menepi) */}
      <ol
        className="flex flex-wrap justify-center gap-2 mt-6 list-none"
        aria-label="Progres soal"
      >
        {daftarSoal.map((s, i) => {
          const status = riwayat[i];
          const sekarang = i === index;
          return (
            <li key={s.id}>
              <span
                aria-label={`Soal ${i + 1}${
                  sekarang ? " (sedang dikerjakan)" : status ? `: ${status}` : ""
                }`}
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm border-2",
                  sekarang
                    ? "bg-primary text-on-primary border-primary shadow-[0_0_0_3px_var(--focus)]"
                    : status === "benar"
                      ? "bg-success text-on-success border-success"
                      : status === "salah"
                        ? "bg-danger text-white border-danger"
                        : "bg-surface-2 text-muted border-border",
                ].join(" ")}
              >
                {/* simbol + angka: status tak hanya lewat warna */}
                {status === "benar" ? "✓" : status === "salah" ? "✗" : i + 1}
              </span>
            </li>
          );
        })}
      </ol>

      {/* D4: tanpa tombol "Sebelumnya" — otomatis lanjut setelah feedback */}
      <p className="text-center text-sm text-muted mt-4">
        Soal berlanjut otomatis setelah dijawab. Skor sementara: ⭐{" "}
        {benarTotal * POIN_PER_BENAR}
      </p>
    </main>
  );
}
