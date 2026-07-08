"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import { useAuth } from "@/features/auth/AuthProvider";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import { simpanHasilCerita } from "./api";
import {
  EMOJI_SCENE_BAB1,
  POIN_PER_PERTANYAAN,
  type BabCerita,
  type HalamanPertanyaan,
} from "./config";
import { hentikanNarasi, putarNarasi } from "./narasi";

/* Tampilan buku cerita (Phase 7, mockup MacBook Air - 2):
   efek balik halaman (rotateY + perspective, hormat prefers-reduced-motion),
   narasi suara per halaman (file audio → fallback TTS id-ID), pertanyaan
   pilihan ganda di tengah cerita — salah = boleh pilih lagi (tanpa hukuman),
   Lanjut terbuka setelah benar. Selesai bab → +poin & buka bab berikutnya. */

interface BacaCeritaProps {
  bab: BabCerita;
  nomorBab: number;
  profil: UserProfile;
  onKembali: () => void;
  /** halaman awal (0-based) — hanya untuk halaman uji /dev/cerita */
  indexAwal?: number;
}

export default function BacaCerita({
  bab,
  nomorBab,
  profil,
  onKembali,
  indexAwal = 0,
}: BacaCeritaProps) {
  const { refreshProfil } = useAuth();
  /* poin SEBELUM sesi ini — deteksi naik level (D10) di layar selesai */
  const [poinAwal] = useState(profil.poin);
  const [index, setIndex] = useState(indexAwal);
  const [arah, setArah] = useState<"maju" | "mundur">("maju");
  const [suaraAktif, setSuaraAktif] = useState(true);
  const [selesai, setSelesai] = useState(false);
  const [statusSimpan, setStatusSimpan] = useState<"belum" | "menyimpan" | "tersimpan" | "gagal">("belum");
  /* pertanyaan: index halaman → sudah benar; pilihan salah percobaan ini */
  const [benarDiHalaman, setBenarDiHalaman] = useState<Record<number, boolean>>({});
  const [salahDicoba, setSalahDicoba] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const halaman = bab.halaman[index];
  const terakhir = index === bab.halaman.length - 1;
  const pertanyaanBelumBenar =
    halaman.tipe === "pertanyaan" && !benarDiHalaman[index];

  const poinPertanyaan =
    Object.values(benarDiHalaman).filter(Boolean).length * POIN_PER_PERTANYAAN;
  const poinSelesai =
    bab.halaman[bab.halaman.length - 1].tipe === "narasi"
      ? ((bab.halaman[bab.halaman.length - 1] as { hadiahSelesai?: { poin: number } })
          .hadiahSelesai?.poin ?? 0)
      : 0;
  const totalPoin = poinPertanyaan + poinSelesai;

  /* hentikan suara saat keluar dari halaman baca */
  useEffect(() => hentikanNarasi, []);

  function teksNarasi(): string {
    return halaman.tipe === "narasi"
      ? halaman.teks
      : (halaman as HalamanPertanyaan).pertanyaan;
  }

  function pindah(arahBaru: "maju" | "mundur") {
    const indexBaru = arahBaru === "maju" ? index + 1 : index - 1;
    if (indexBaru < 0 || indexBaru >= bab.halaman.length) return;
    setArah(arahBaru);
    setIndex(indexBaru);
    setSalahDicoba([]);
    setFeedback(null);
    const tujuan = bab.halaman[indexBaru];
    if (suaraAktif) {
      putarNarasi(
        tujuan.audio,
        tujuan.tipe === "narasi" ? tujuan.teks : tujuan.pertanyaan
      );
    } else {
      hentikanNarasi();
    }
  }

  function jawab(i: number) {
    if (halaman.tipe !== "pertanyaan" || benarDiHalaman[index]) return;
    if (i === halaman.kunciIndex) {
      setBenarDiHalaman((b) => ({ ...b, [index]: true }));
      setFeedback(`🐆✨ ${halaman.feedbackBenar} +${POIN_PER_PERTANYAAN} ⭐`);
    } else {
      setSalahDicoba((s) => (s.includes(i) ? s : [...s, i]));
      setFeedback(`🐆💛 ${halaman.feedbackSalah}`);
    }
  }

  async function selesaikan() {
    hentikanNarasi();
    setSelesai(true);
    setStatusSimpan("menyimpan");
    try {
      await simpanHasilCerita(profil, { bab: nomorBab, poinTambah: totalPoin });
      await refreshProfil();
      setStatusSimpan("tersimpan");
    } catch {
      setStatusSimpan("gagal");
    }
  }

  /* ---------- layar selesai ---------- */
  if (selesai) {
    return (
      <main id="konten-utama" className="max-w-xl mx-auto px-6 py-12 text-center">
        <span
          className="mx-auto mb-4 w-28 h-28 text-6xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center motion-safe:animate-bounce"
          aria-hidden="true"
        >
          <GambarEmoji
            src="/assets/mascot/tayo-happy.png"
            emoji="🐆🎉"
            className="w-full h-full object-cover"
          />
        </span>
        <h1 className="text-3xl mb-2">Cerita selesai! 📖✨</h1>
        <p className="text-lg text-muted font-bold mb-4">
          Kamu menamatkan “{bab.judul}”!
        </p>
        <p className="font-display font-extrabold text-2xl mb-1">+{totalPoin} ⭐</p>
        <p className="text-sm font-bold text-muted mb-6">
          {Object.values(benarDiHalaman).filter(Boolean).length} pertanyaan benar
          {poinSelesai > 0 && ` · hadiah tamat +${poinSelesai}`}
        </p>
        {hitungLevel(poinAwal + totalPoin) > hitungLevel(poinAwal) && (
          <p className="font-bold text-success mb-6">
            🎉 Kamu naik ke Lv {hitungLevel(poinAwal + totalPoin)}!
          </p>
        )}
        <p role="status" aria-live="polite" className="text-sm font-bold text-muted mb-8 min-h-[1.4em]">
          {statusSimpan === "menyimpan" && "Menyimpan…"}
          {statusSimpan === "tersimpan" && "✓ Tersimpan!"}
          {statusSimpan === "gagal" && "⚠️ Belum tersimpan — cek internetmu ya."}
        </p>
        <Button size="lg" onClick={onKembali} disabled={statusSimpan === "menyimpan"}>
          Kembali ke Daftar Cerita
        </Button>
      </main>
    );
  }

  /* ---------- halaman buku ---------- */
  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* header: kembali + judul + toggle audio */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            hentikanNarasi();
            onKembali();
          }}
          aria-label="Kembali ke daftar cerita"
          className="shrink-0 w-11 h-11 rounded-full bg-fg text-bg flex items-center justify-center font-bold cursor-pointer"
        >
          ←
        </button>
        <h1 className="text-lg sm:text-2xl flex-1 truncate">
          Bab {nomorBab}: {bab.judul}
        </h1>
        <button
          onClick={() => {
            const baru = !suaraAktif;
            setSuaraAktif(baru);
            if (!baru) hentikanNarasi();
          }}
          aria-pressed={suaraAktif}
          aria-label={suaraAktif ? "Matikan suara narasi" : "Nyalakan suara narasi"}
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl bg-surface border-2 border-border hover:border-primary cursor-pointer"
        >
          {suaraAktif ? "🔊" : "🔇"}
        </button>
      </div>

      {/* titik progres halaman */}
      <ol className="flex flex-wrap gap-1.5 mb-4 list-none" aria-label="Halaman cerita">
        {bab.halaman.map((h, i) => (
          <li key={h.no}>
            <span
              aria-label={`Halaman ${i + 1}${i === index ? " (sedang dibaca)" : ""}`}
              className={[
                "block w-3.5 h-3.5 rounded-full border-2",
                i === index
                  ? "bg-primary border-primary scale-125"
                  : i < index
                    ? "bg-primary/50 border-primary/50"
                    : "bg-surface-2 border-border",
              ].join(" ")}
            />
          </li>
        ))}
        <li className="ml-2 text-sm font-bold text-muted">
          {index + 1}/{bab.halaman.length}
        </li>
      </ol>

      {/* halaman dengan efek balik (remount per index → animasi jalan) */}
      <div style={{ perspective: "1400px" }}>
        <div
          key={index}
          className={[
            "bg-surface border-2 border-border rounded-lg overflow-hidden",
            "shadow-[0_6px_24px_rgba(16,32,43,0.12)]",
            arah === "maju"
              ? "motion-safe:animate-[balikMaju_0.5s_ease-out] origin-left"
              : "motion-safe:animate-[balikMundur_0.5s_ease-out] origin-right",
          ].join(" ")}
        >
          {/* ilustrasi (fallback: gradien hutan + emoji scene sampai asset P2 ada) */}
          {/* area ilustrasi: gradien hutan pastel (karya seni, sama di dua tema) */}
          <div className="relative aspect-[16/9] sm:aspect-[16/8] bg-gradient-to-b from-[#9fd898] via-[#c9e8b8] to-[#ead9a8] flex items-center justify-center">
            <GambarEmoji
              src={halaman.gambar}
              emoji={EMOJI_SCENE_BAB1[halaman.no] ?? "🐆"}
              className="absolute inset-0 w-full h-full object-cover"
              emojiClassName="text-6xl sm:text-7xl tracking-widest"
            />
          </div>

          <div className="p-5 sm:p-7">
            {halaman.tipe === "narasi" ? (
              <p className="text-lg sm:text-xl font-bold leading-relaxed text-center max-w-[52ch] mx-auto">
                {halaman.teks}
              </p>
            ) : (
              <div>
                <p className="text-lg sm:text-xl font-bold leading-relaxed text-center mb-5">
                  🤔 {halaman.pertanyaan}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {halaman.opsi.map((opsi, i) => {
                    const benar = benarDiHalaman[index] && i === halaman.kunciIndex;
                    const salah = salahDicoba.includes(i);
                    const nonaktif = Boolean(benarDiHalaman[index]) || salah;
                    return (
                      <button
                        key={i}
                        disabled={nonaktif}
                        onClick={() => jawab(i)}
                        aria-label={`Jawaban: ${opsi}${benar ? " (benar)" : salah ? " (kurang tepat)" : ""}`}
                        className={[
                          "relative flex flex-col items-center gap-1.5 p-4 rounded-lg border-4 text-fg",
                          "transition-[transform,border-color,background-color] duration-150",
                          benar
                            ? "bg-success/15 border-success"
                            : salah
                              ? "bg-surface border-border opacity-50"
                              : benarDiHalaman[index]
                                ? "bg-surface border-border opacity-60"
                                : "bg-surface border-border hover:border-primary hover:-translate-y-1 cursor-pointer",
                        ].join(" ")}
                      >
                        <span className="text-3xl" aria-hidden="true">
                          {halaman.opsiEmoji[i]}
                        </span>
                        <span className="font-bold leading-tight">{opsi}</span>
                        {benar && (
                          <span
                            aria-hidden="true"
                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-lg bg-success text-on-success border-2 border-success"
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p
                  role="status"
                  aria-live="assertive"
                  className="text-center font-bold mt-4 min-h-[1.6em]"
                >
                  {feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* footer navigasi (mockup: Kembali / Dengarkan Narasi / Lanjut) */}
      <div className="flex items-center justify-between gap-3 mt-6">
        <Button variant="ghost" onClick={() => pindah("mundur")} disabled={index === 0}>
          ← Sebelumnya
        </Button>
        <Button
          variant="accent"
          onClick={() => putarNarasi(halaman.audio, teksNarasi())}
          aria-label="Dengarkan narasi halaman ini"
        >
          🔊 <span className="hidden sm:inline">Dengarkan Narasi</span>
        </Button>
        {terakhir ? (
          <Button variant="success" onClick={selesaikan} disabled={pertanyaanBelumBenar}>
            Selesai 🎉
          </Button>
        ) : (
          <Button onClick={() => pindah("maju")} disabled={pertanyaanBelumBenar}>
            Lanjut →
          </Button>
        )}
      </div>
      {pertanyaanBelumBenar && (
        <p className="text-center text-sm font-bold text-muted mt-3">
          Jawab dulu pertanyaannya untuk lanjut, ya! 💪
        </p>
      )}

      {/* keyframes efek balik halaman */}
      <style>{`
        @keyframes balikMaju { from { transform: perspective(1400px) rotateY(55deg); opacity: 0.2 } to { transform: none; opacity: 1 } }
        @keyframes balikMundur { from { transform: perspective(1400px) rotateY(-55deg); opacity: 0.2 } to { transform: none; opacity: 1 } }
      `}</style>
    </main>
  );
}
