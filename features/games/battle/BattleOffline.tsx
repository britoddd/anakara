"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LatarArena from "@/components/deko/LatarArena";
import BlobMata from "@/components/deko/BlobMata";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import GambarEmoji from "@/components/ui/GambarEmoji";
import TombolKembali from "@/components/ui/TombolKembali";
import { getAvatar } from "@/features/auth/avatars";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import type { Soal } from "@/features/games/kuis/config";
import { simpanHasilBattle } from "./api";
import {
  BOT_AKURASI,
  JUMLAH_SOAL_BATTLE,
  POIN_PER_BENAR_BATTLE,
  buatBot,
  soalUntukBattle,
  type KartuKoleksi,
} from "./config";
import KotakMisteri from "./KotakMisteri";

/* Team Battle 2v2 — MODE OFFLINE (lawan Tim Robo, tanpa jaringan).
   Versi online (GameBattle) memakai Realtime Database untuk matchmaking +
   sinkron arena; itu butuh internet. Saat offline, anak tetap bisa "2 vs 2
   lawan bot": semuanya dihitung di perangkat. Kamu + Robo (Tim Biru) melawan
   dua Robo (Tim Merah). Soal, kotak misteri (gacha), dan simpan poin memakai
   ulang kode yang sama — poin diantre Firestore persistence & sinkron saat
   online (lib/tulis-offline). */

const JEDA_FEEDBACK_MS = 1200;

function acakBenar(): boolean {
  return Math.random() < BOT_AKURASI;
}

export default function BattleOffline({ profil }: { profil: UserProfile }) {
  const [main, setMain] = useState(false);
  /* key untuk remount arena → "Main Lagi" mendapat soal & undian bot baru */
  const [sesi, setSesi] = useState(0);

  if (!main) return <LobiOffline onMulai={() => setMain(true)} />;
  return (
    <ArenaLokal
      key={sesi}
      profil={profil}
      onMainLagi={() => setSesi((s) => s + 1)}
    />
  );
}

/* ---------------------------- lobi offline ---------------------------- */

function LobiOffline({ onMulai }: { onMulai: () => void }) {
  return (
    <>
      <LatarArena />
      <main id="konten-utama" className="max-w-xl mx-auto px-6 py-8 sm:py-10">
        <div className="mb-8">
          <TombolKembali href="/home" label="Kembali ke Home" />
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4" aria-hidden="true">
            <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-band-blue border-2 border-border -rotate-6 flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl">
              2
            </span>
            <span className="font-display font-extrabold text-2xl text-primary">VS</span>
            <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-band-pink border-2 border-border rotate-6 flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl">
              2
            </span>
          </div>
          <h1 className="text-4xl mb-1">
            Team Battle<span className="sr-only"> 2 lawan 2</span> ⚔️
          </h1>
          <p className="text-muted font-bold text-lg">Mode Offline — lawan Tim Robo!</p>
        </div>

        <Card className="mb-6 border-2 border-border">
          <div className="flex items-start gap-3">
            <span className="text-3xl shrink-0" aria-hidden="true">📴</span>
            <p className="font-bold">
              Kamu sedang offline, jadi kita main melawan{" "}
              <span className="font-display font-extrabold">Tim Robo</span>. Kamu
              berpasangan dengan <span className="font-display font-extrabold">Robo Bibi</span>{" "}
              🤖 melawan dua robot lawan. Jawab soal gizi bersama, kumpulkan
              bintang terbanyak, dan menangkan kotak misteri! 🎁
            </p>
          </div>
        </Card>

        <Button size="lg" fullWidth onClick={onMulai}>
          ⚡ Main Sekarang!
        </Button>
        <p className="text-center text-sm font-bold text-muted mt-4">
          Poinmu tersimpan di perangkat dan otomatis sinkron saat kembali online. 📶
        </p>
      </main>
    </>
  );
}

/* ------------------------------ arena lokal ------------------------------ */

interface Bot {
  uid: string;
  nama: string;
}
interface Setup {
  soal: Soal[];
  rekan: Bot;
  lawanA: Bot;
  lawanB: Bot;
  rekanBenar: boolean[];
  lawanABenar: boolean[];
  lawanBBenar: boolean[];
}

function ArenaLokal({
  profil,
  onMainLagi,
}: {
  profil: UserProfile;
  onMainLagi: () => void;
}) {
  const router = useRouter();

  /* undian sekali per pertandingan: soal + benar/salah tiap bot per soal */
  const setupRef = useRef<Setup | null>(null);
  if (!setupRef.current) {
    const soal = soalUntukBattle();
    setupRef.current = {
      soal,
      rekan: buatBot(1),
      lawanA: buatBot(2),
      lawanB: buatBot(3),
      rekanBenar: soal.map(acakBenar),
      lawanABenar: soal.map(acakBenar),
      lawanBBenar: soal.map(acakBenar),
    };
  }
  const S = setupRef.current;

  const [index, setIndex] = useState(0);
  const [hasilKu, setHasilKu] = useState<(boolean | null)[]>(() =>
    S.soal.map(() => null)
  );
  const [pilihan, setPilihan] = useState<number | null>(null);
  const [terkunci, setTerkunci] = useState(false);
  const [waktuHabis, setWaktuHabis] = useState(false);
  const [timerSisa, setTimerSisa] = useState(S.soal[0]?.durasiDetik ?? 15);
  const [selesai, setSelesai] = useState(false);
  const [statusSimpan, setStatusSimpan] = useState<
    "belum" | "menyimpan" | "tersimpan" | "gagal"
  >("belum");
  const [poinTambah, setPoinTambah] = useState<number | null>(null);
  const poinAwalRef = useRef(profil.poin);

  const soal = S.soal[index];

  /* jumlah soal yang sudah kamu tuntaskan = berapa banyak jawaban bot dibuka
     (bot dibuka bertahap mengikuti tempo kamu supaya papan skor terasa hidup) */
  const terjawab = hasilKu.filter((x) => x !== null).length;
  const skorKu =
    hasilKu.filter(Boolean).length +
    S.rekanBenar.slice(0, terjawab).filter(Boolean).length;
  const skorLawan =
    S.lawanABenar.slice(0, terjawab).filter(Boolean).length +
    S.lawanBBenar.slice(0, terjawab).filter(Boolean).length;

  /* ---------- kunci jawaban (via ref agar timer tak stale) ---------- */
  const kunciRef = useRef<(i: number | null) => void>(() => {});
  kunciRef.current = (i: number | null) => {
    if (terkunci || selesai || !soal) return;
    setTerkunci(true);
    setPilihan(i);
    setWaktuHabis(i === null);
    const benar = i !== null && i === soal.kunciIndex;
    setHasilKu((h) => {
      const n = [...h];
      n[index] = benar;
      return n;
    });
    setTimeout(() => {
      if (index + 1 >= JUMLAH_SOAL_BATTLE) {
        setSelesai(true);
      } else {
        setIndex((x) => x + 1);
        setPilihan(null);
        setTerkunci(false);
        setWaktuHabis(false);
      }
    }, JEDA_FEEDBACK_MS);
  };

  /* ---------- timer per soal ---------- */
  useEffect(() => {
    if (terkunci || selesai || !soal) return;
    setTimerSisa(soal.durasiDetik);
    const mulai = Date.now();
    const interval = setInterval(() => {
      const sisa = soal.durasiDetik - Math.floor((Date.now() - mulai) / 1000);
      setTimerSisa(Math.max(0, sisa));
      if (sisa <= 0) {
        clearInterval(interval);
        kunciRef.current(null);
      }
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, terkunci, selesai]);

  /* ---------- hasil akhir ---------- */
  const benarKu = hasilKu.filter(Boolean).length;
  const skorKuAkhir = benarKu + S.rekanBenar.filter(Boolean).length;
  const skorLawanAkhir =
    S.lawanABenar.filter(Boolean).length + S.lawanBBenar.filter(Boolean).length;
  const menang = skorKuAkhir > skorLawanAkhir;
  const seri = skorKuAkhir === skorLawanAkhir;
  const dapatKotak = menang || seri;

  async function simpan(kartuId: string | null) {
    setStatusSimpan("menyimpan");
    try {
      const r = await simpanHasilBattle(profil, { benar: benarKu, kartuId });
      setPoinTambah(r.poinTambah);
      setStatusSimpan("tersimpan");
    } catch {
      setStatusSimpan("gagal");
    }
  }

  /* kalah/seri-tanpa-kotak tak terjadi (seri tetap dapat kotak); kalah → simpan
     otomatis sekali begitu battle usai */
  const simpanKalahJalan = useRef(false);
  useEffect(() => {
    if (!selesai || dapatKotak || simpanKalahJalan.current) return;
    simpanKalahJalan.current = true;
    void simpan(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selesai, dapatKotak]);

  /* ============================ render ============================ */

  /* ---------- layar hasil ---------- */
  if (selesai) {
    return (
      <>
        <LatarArena />
        <main id="konten-utama" className="max-w-xl mx-auto px-6 py-10 text-center">
          <h1 className="text-3xl mb-1">
            {seri
              ? "Seri! Sama-sama hebat! 🤝"
              : menang
                ? "Tim kamu menang! 🏆"
                : "Seru sekali!"}
          </h1>
          <p className="text-lg text-muted font-bold mb-4">
            Tim Biru {skorKuAkhir} ⭐ — {skorLawanAkhir} ⭐ Tim Robo
          </p>

          {dapatKotak ? (
            <KotakMisteri
              duplikat={(k: KartuKoleksi) => profil.koleksi.includes(k.id)}
              onTerbuka={(k) => void simpan(k.id)}
            />
          ) : (
            <div>
              <span className="relative inline-block mb-3" aria-hidden="true">
                <BlobMata bentuk="bunga" className="absolute -left-14 bottom-1 w-12 text-accent -rotate-6" />
                <BlobMata bentuk="gumpal" className="absolute -right-14 bottom-2 w-12 text-green-bright rotate-6" />
                <span className="w-28 h-28 text-6xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center">
                  <GambarEmoji
                    src="/assets/mascot/tayo-cheer.png"
                    emoji="🐆💛"
                    className="w-full h-full object-cover"
                  />
                </span>
              </span>
              <p className="font-bold text-lg">
                Tim Robo menang kali ini — kamu tetap keren! Yuk coba lagi! 💪
              </p>
            </div>
          )}

          <p className="font-bold text-muted mt-5">
            Poin usahamu: +{benarKu * POIN_PER_BENAR_BATTLE} ⭐ ({benarKu} jawaban benar)
          </p>
          {poinTambah !== null &&
            hitungLevel(poinAwalRef.current + poinTambah) >
              hitungLevel(poinAwalRef.current) && (
              <p className="font-bold text-success mt-1">
                🎉 Kamu naik ke Lv {hitungLevel(poinAwalRef.current + poinTambah)}!
              </p>
            )}
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-bold text-muted mt-1 min-h-[1.4em]"
          >
            {statusSimpan === "menyimpan" && "Menyimpan hadiah…"}
            {statusSimpan === "tersimpan" && "✓ Tersimpan! Otomatis sinkron saat online. 📶"}
            {statusSimpan === "gagal" && "⚠️ Belum tersimpan — coba lagi nanti ya."}
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <Button variant="ghost" onClick={() => router.push("/home")}>
              Kembali ke Home
            </Button>
            <Button onClick={onMainLagi} disabled={statusSimpan === "menyimpan"}>
              Main Lagi ⚔️
            </Button>
          </div>
        </main>
      </>
    );
  }

  /* ---------- layar main ---------- */
  const persenWaktu = soal ? (timerSisa / soal.durasiDetik) * 100 : 0;
  return (
    <>
      <LatarArena />
      <main id="konten-utama" className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="sr-only">Team Battle 2 lawan 2 — mode offline</h1>

        <div className="mb-4">
          <TombolKembali href="/home" label="Keluar dari battle" />
        </div>

        <PanelSkorLokal
          skorKu={skorKu}
          skorLawan={skorLawan}
          terjawab={terjawab}
          profil={profil}
          rekan={S.rekan}
          lawanA={S.lawanA}
          lawanB={S.lawanB}
        />

        {/* progres soal + timer */}
        <div className="flex items-center gap-3 mt-5 mb-4">
          <span className="font-display font-extrabold whitespace-nowrap">
            Soal {index + 1}/{JUMLAH_SOAL_BATTLE}
          </span>
          <div
            role="timer"
            aria-label={`Sisa waktu ${timerSisa} detik`}
            className="flex-1 h-3 rounded-full bg-surface-2 border-2 border-border overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-linear ${
                timerSisa <= 5 ? "bg-accent" : "bg-primary"
              }`}
              style={{ width: `${persenWaktu}%` }}
            />
          </div>
          <span className="font-display font-extrabold text-lg tabular-nums w-[2ch]">
            {timerSisa}
          </span>
        </div>

        {soal && (
          <>
            <Card className="mb-4 border-accent border-2">
              <p className="font-bold text-lg text-center">{soal.pertanyaan}</p>
            </Card>

            <p
              role="status"
              aria-live="assertive"
              className="text-center font-bold mb-4 min-h-[1.6em]"
            >
              {terkunci &&
                (waktuHabis
                  ? "⏰ Waktu habis! Lanjut ke soal berikutnya…"
                  : pilihan === soal.kunciIndex
                    ? "🐆✨ Yeay, benar!"
                    : "🐆💛 Semangat, masih ada soal berikutnya!")}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {soal.opsi.map((opsi, i) => {
                const kunci = i === soal.kunciIndex;
                const dipilih = i === pilihan;
                let gaya = "bg-surface border-border hover:border-primary cursor-pointer";
                let tanda: string | null = null;
                if (terkunci) {
                  if (kunci) {
                    gaya = "bg-success/15 border-success";
                    tanda = "✓";
                  } else if (dipilih) {
                    gaya = "bg-danger/10 border-danger";
                    tanda = "✗";
                  } else {
                    gaya = "bg-surface border-border opacity-60";
                  }
                }
                return (
                  <button
                    key={i}
                    disabled={terkunci}
                    onClick={() => kunciRef.current(i)}
                    aria-label={`Jawaban: ${opsi}${
                      terkunci && kunci ? " (benar)" : terkunci && dipilih ? " (salah)" : ""
                    }`}
                    className={[
                      "relative flex flex-col items-center gap-2 p-4 sm:p-5 rounded-lg border-4 text-fg",
                      "transition-[transform,border-color,background-color] duration-150",
                      !terkunci ? "hover:-translate-y-1" : "",
                      gaya,
                    ].join(" ")}
                  >
                    {soal.opsiEmoji?.[i] && (
                      <span className="text-3xl sm:text-4xl" aria-hidden="true">
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
          </>
        )}
      </main>
    </>
  );
}

/* ---------- papan skor dua tim (versi lokal, ringkas) ---------- */

function PanelSkorLokal({
  skorKu,
  skorLawan,
  terjawab,
  profil,
  rekan,
  lawanA,
  lawanB,
}: {
  skorKu: number;
  skorLawan: number;
  terjawab: number;
  profil: UserProfile;
  rekan: Bot;
  lawanA: Bot;
  lawanB: Bot;
}) {
  const persen = (terjawab / JUMLAH_SOAL_BATTLE) * 100;
  const av = getAvatar(profil.avatar ?? "");
  return (
    <section aria-label="Skor kedua tim" className="grid grid-cols-2 gap-3 sm:gap-4">
      {/* Tim Biru (kamu + Robo) */}
      <div className="rounded-lg border-4 border-accent p-3 sm:p-4 bg-surface">
        <p className="font-display font-extrabold flex items-center gap-1.5 flex-wrap">
          <span aria-hidden="true">🔵</span>
          Tim Biru
          <span className="text-xs bg-accent text-on-accent rounded-full px-2 py-0.5">
            Tim Kamu
          </span>
        </p>
        <p className="font-display font-extrabold text-2xl my-1" aria-label={`${skorKu} bintang`}>
          ⭐ {skorKu}
        </p>
        <BarProgres persen={persen} warna="bg-tim-biru" />
        <ul className="flex flex-col gap-1 list-none text-sm font-bold">
          <BarisPemain
            emoji={
              av ? (
                <GambarEmoji src={av.gambar} emoji={av.emoji} className="w-full h-full object-cover" />
              ) : (
                "🙂"
              )
            }
            nama={`${profil.nama} (kamu)`}
          />
          <BarisPemain emoji="🤖" nama={rekan.nama} />
        </ul>
      </div>

      {/* Tim Robo (lawan) */}
      <div className="rounded-lg border-4 border-border p-3 sm:p-4 bg-surface">
        <p className="font-display font-extrabold flex items-center gap-1.5 flex-wrap">
          <span aria-hidden="true">🔴</span>
          Tim Robo
        </p>
        <p className="font-display font-extrabold text-2xl my-1" aria-label={`${skorLawan} bintang`}>
          ⭐ {skorLawan}
        </p>
        <BarProgres persen={persen} warna="bg-tim-merah" />
        <ul className="flex flex-col gap-1 list-none text-sm font-bold">
          <BarisPemain emoji="🤖" nama={lawanA.nama} />
          <BarisPemain emoji="🤖" nama={lawanB.nama} />
        </ul>
      </div>
    </section>
  );
}

function BarProgres({ persen, warna }: { persen: number; warna: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(persen)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-3 rounded-full bg-surface-2 border-2 border-border overflow-hidden mb-2"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${warna}`}
        style={{ width: `${persen}%` }}
      />
    </div>
  );
}

function BarisPemain({ emoji, nama }: { emoji: React.ReactNode; nama: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="w-7 h-7 shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-sm"
        aria-hidden="true"
      >
        {emoji}
      </span>
      <span className="truncate">{nama}</span>
    </li>
  );
}
