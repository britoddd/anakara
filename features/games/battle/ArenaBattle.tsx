"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import GambarEmoji from "@/components/ui/GambarEmoji";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/features/auth/AuthProvider";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import { getAvatar } from "@/features/auth/avatars";
import { simpanHasilBattle } from "./api";
import {
  JUMLAH_SOAL_BATTLE,
  POIN_PER_BENAR_BATTLE,
  getSoal,
  type KartuKoleksi,
} from "./config";
import KotakMisteri from "./KotakMisteri";
import {
  bersihkanTim,
  dengarkanRuang,
  hitungSkorTim,
  jalankanBot,
  tandaiRuangSelesai,
  tandaiSelesai,
  tentukanPemenang,
  tulisJawaban,
} from "./rtdb";
import type { AnggotaTim, RuangBattle, WarnaTim } from "./types";

/* Arena Battle 2v2 (Phase 6): tiap pemain menjawab 5 soal yang sama dengan
   tempo sendiri (timer 15 dtk/soal); skor tim = total benar kedua anggota,
   tampil live sebagai bar berhadapan. Menang → kotak misteri (gacha D2).
   Ramah anak: tim kalah tetap dapat poin usaha & pesan menyemangati. */

const JEDA_FEEDBACK_MS = 1200;

interface ArenaBattleProps {
  ruangId: string;
  kodeTimKu: string;
  profil: UserProfile;
  onMainLagi: () => void;
}

export default function ArenaBattle({
  ruangId,
  kodeTimKu,
  profil,
  onMainLagi,
}: ArenaBattleProps) {
  const router = useRouter();
  const { refreshProfil } = useAuth();
  const uid = profil.userId;

  const [ruang, setRuang] = useState<RuangBattle | null>(null);
  const [index, setIndex] = useState(0);
  const [pilihan, setPilihan] = useState<number | null>(null);
  const [terkunci, setTerkunci] = useState(false);
  const [waktuHabis, setWaktuHabis] = useState(false);
  const [timerSisa, setTimerSisa] = useState(15);
  const [selesaiKu, setSelesaiKu] = useState(false);
  const [statusSimpan, setStatusSimpan] = useState<"belum" | "menyimpan" | "tersimpan" | "gagal">("belum");
  /* poin final dari hasil simpan (termasuk bonus duplikat) — deteksi naik level D10 */
  const [poinFinal, setPoinFinal] = useState<number | null>(null);
  const poinAwalRef = useRef(profil.poin);

  /* ---------- sinkronisasi ruang ---------- */
  useEffect(() => dengarkanRuang(ruangId, setRuang), [ruangId]);

  /* ---------- driver bot: hanya klien pembuat ruang, mulai sekali ---------- */
  const botMulai = useRef(false);
  const stopBot = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!ruang || botMulai.current || ruang.pembuat !== uid) return;
    botMulai.current = true;
    stopBot.current = jalankanBot(ruangId, ruang);
  }, [ruang, ruangId, uid]);
  useEffect(() => () => stopBot.current?.(), []);

  /* ---------- data turunan ---------- */
  const warnaKu: WarnaTim = ruang?.tim.biru.kode === kodeTimKu ? "biru" : "merah";
  const warnaLawan: WarnaTim = warnaKu === "biru" ? "merah" : "biru";
  const daftarSoal = (ruang?.soalIds ?? []).map((id) => getSoal(id));
  const soal = daftarSoal[index];
  const skorKu = ruang ? hitungSkorTim(ruang, warnaKu) : null;
  const skorLawan = ruang ? hitungSkorTim(ruang, warnaLawan) : null;
  const battleSelesai =
    ruang?.status === "selesai" ||
    Boolean(skorKu?.semuaSelesai && skorLawan?.semuaSelesai);
  const benarKu = Object.values(ruang?.jawaban?.[uid] ?? {}).filter(Boolean).length;

  /* ---------- kunci jawaban (via ref agar timer tidak stale) ---------- */
  const kunciRef = useRef<(i: number | null) => void>(() => {});
  kunciRef.current = (i: number | null) => {
    if (terkunci || selesaiKu || !soal || !ruang) return;
    setTerkunci(true);
    setPilihan(i);
    setWaktuHabis(i === null);
    const benar = i !== null && i === soal.kunciIndex;
    void tulisJawaban(ruangId, uid, index, benar);
    setTimeout(() => {
      if (index + 1 >= JUMLAH_SOAL_BATTLE) {
        setSelesaiKu(true);
        void tandaiSelesai(ruangId, uid);
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
    if (terkunci || selesaiKu || !soal) return;
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
  }, [index, terkunci, selesaiKu, Boolean(soal)]);

  /* ---------- akhir battle: pembuat menandai ruang + ketua bersihkan tim ---------- */
  const sudahTutup = useRef(false);
  useEffect(() => {
    if (!ruang || !battleSelesai || sudahTutup.current) return;
    sudahTutup.current = true;
    if (ruang.pembuat === uid) void tandaiRuangSelesai(ruangId);
    void bersihkanTim(kodeTimKu);
  }, [battleSelesai, ruang, ruangId, uid, kodeTimKu]);

  /* ---------- simpan hasil (tim kalah: langsung; menang: saat kotak dibuka) ---------- */
  const pemenang = ruang && battleSelesai ? tentukanPemenang(ruang) : null;
  const dapatKotak = pemenang !== null && (pemenang === warnaKu || pemenang === "seri");

  async function simpan(kartuId: string | null) {
    setStatusSimpan("menyimpan");
    try {
      const ringkasan = await simpanHasilBattle(profil, { benar: benarKu, kartuId });
      setPoinFinal(ringkasan.poinTambah);
      await refreshProfil();
      setStatusSimpan("tersimpan");
    } catch {
      setStatusSimpan("gagal");
    }
  }

  const simpanKalahJalan = useRef(false);
  useEffect(() => {
    if (!battleSelesai || dapatKotak || simpanKalahJalan.current || !ruang) return;
    simpanKalahJalan.current = true;
    void simpan(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleSelesai, dapatKotak, ruang]);

  /* ================== render ================== */

  if (!ruang || !soal) return <LoadingSpinner label="Menyiapkan arena…" />;

  /* ---------- layar hasil ---------- */
  if (battleSelesai && pemenang) {
    const menang = pemenang === warnaKu;
    const seri = pemenang === "seri";
    return (
      <main id="konten-utama" className="max-w-xl mx-auto px-6 py-10 text-center">
        <h1 className="text-3xl mb-1">
          {seri ? "Seri! Sama-sama hebat! 🤝" : menang ? "Tim kamu menang! 🏆" : "Seru sekali!"}
        </h1>
        <p className="text-lg text-muted font-bold mb-4">
          {NAMA_TIM[warnaKu]} {skorKu?.benar} ⭐ — {skorLawan?.benar} ⭐ {NAMA_TIM[warnaLawan]}
        </p>

        {dapatKotak ? (
          <KotakMisteri
            duplikat={(k: KartuKoleksi) => profil.koleksi.includes(k.id)}
            onTerbuka={(k) => void simpan(k.id)}
          />
        ) : (
          <div>
            <span
              className="mx-auto mb-3 w-28 h-28 text-6xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center"
              aria-hidden="true"
            >
              <GambarEmoji
                src="/assets/mascot/tayo-cheer.png"
                emoji="🐆💛"
                className="w-full h-full object-cover"
              />
            </span>
            <p className="font-bold text-lg">
              Tim lawan menang kali ini — kamu tetap keren! Yuk coba lagi! 💪
            </p>
          </div>
        )}

        <p className="font-bold text-muted mt-5">
          Poin usahamu: +{benarKu * POIN_PER_BENAR_BATTLE} ⭐ ({benarKu} jawaban benar)
        </p>
        {poinFinal !== null &&
          hitungLevel(poinAwalRef.current + poinFinal) > hitungLevel(poinAwalRef.current) && (
            <p className="font-bold text-success mt-1">
              🎉 Kamu naik ke Lv {hitungLevel(poinAwalRef.current + poinFinal)}!
            </p>
          )}
        <p role="status" aria-live="polite" className="text-sm font-bold text-muted mt-1 min-h-[1.4em]">
          {statusSimpan === "menyimpan" && "Menyimpan hadiah…"}
          {statusSimpan === "tersimpan" && "✓ Tersimpan!"}
          {statusSimpan === "gagal" && "⚠️ Belum tersimpan — cek internetmu ya."}
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
    );
  }

  /* ---------- layar menunggu (aku selesai, lawan belum) ---------- */
  if (selesaiKu) {
    return (
      <main id="konten-utama" className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <h1 className="text-2xl mb-6">Jawabanmu selesai! 🎉</h1>
        <PapanSkor
          ruang={ruang}
          warnaKu={warnaKu}
          uid={uid}
        />
        <div className="mt-8">
          <LoadingSpinner label="Menunggu pemain lain menyelesaikan soal…" />
        </div>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/home")}>
          Kembali ke Home
        </Button>
      </main>
    );
  }

  /* ---------- layar main ---------- */
  const persenWaktu = (timerSisa / soal.durasiDetik) * 100;
  return (
    <main id="konten-utama" className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="sr-only">Team Battle 2 lawan 2</h1>

      <PapanSkor ruang={ruang} warnaKu={warnaKu} uid={uid} />

      {/* progres soal-ku + timer */}
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

      <Card className="mb-4 border-accent border-2">
        <p className="font-bold text-lg text-center">{soal.pertanyaan}</p>
      </Card>

      <p role="status" aria-live="assertive" className="text-center font-bold mb-4 min-h-[1.6em]">
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
    </main>
  );
}

/* ---------- papan skor dua tim berhadapan ---------- */

const NAMA_TIM: Record<WarnaTim, string> = { biru: "Tim Biru", merah: "Tim Merah" };
const IKON_TIM: Record<WarnaTim, string> = { biru: "🔵", merah: "🔴" };

function PapanSkor({
  ruang,
  warnaKu,
  uid,
}: {
  ruang: RuangBattle;
  warnaKu: WarnaTim;
  uid: string;
}) {
  return (
    <section aria-label="Skor kedua tim" className="grid grid-cols-2 gap-3 sm:gap-4">
      {(["biru", "merah"] as const).map((warna) => (
        <KartuTim
          key={warna}
          ruang={ruang}
          warna={warna}
          timKu={warna === warnaKu}
          uid={uid}
        />
      ))}
    </section>
  );
}

function KartuTim({
  ruang,
  warna,
  timKu,
  uid,
}: {
  ruang: RuangBattle;
  warna: WarnaTim;
  timKu: boolean;
  uid: string;
}) {
  const skor = hitungSkorTim(ruang, warna);
  const persen = skor.totalSoal > 0 ? (skor.terjawab / skor.totalSoal) * 100 : 0;
  const warnaBar = warna === "biru" ? "bg-primary" : "bg-[#e2574c]";
  return (
    <div
      className={[
        "rounded-lg border-4 p-3 sm:p-4 bg-surface",
        timKu ? "border-accent" : "border-border",
      ].join(" ")}
    >
      <p className="font-display font-extrabold flex items-center gap-1.5 flex-wrap">
        <span aria-hidden="true">{IKON_TIM[warna]}</span>
        {NAMA_TIM[warna]}
        {timKu && (
          <span className="text-xs bg-accent text-on-accent rounded-full px-2 py-0.5">
            Tim Kamu
          </span>
        )}
      </p>
      <p className="font-display font-extrabold text-2xl my-1" aria-label={`${skor.benar} jawaban benar`}>
        ⭐ {skor.benar}
      </p>
      {/* bar progres soal terjawab (live) */}
      <div
        role="progressbar"
        aria-valuenow={skor.terjawab}
        aria-valuemin={0}
        aria-valuemax={skor.totalSoal}
        aria-label={`${NAMA_TIM[warna]}: ${skor.terjawab} dari ${skor.totalSoal} soal terjawab`}
        className="h-3 rounded-full bg-surface-2 border-2 border-border overflow-hidden mb-2"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${warnaBar}`}
          style={{ width: `${persen}%` }}
        />
      </div>
      {/* anggota */}
      <ul className="flex flex-col gap-1 list-none text-sm font-bold">
        {Object.entries(ruang.tim[warna].anggota ?? {}).map(([id, anggota]) => (
          <BarisAnggota key={id} id={id} anggota={anggota} akuSendiri={id === uid} ruang={ruang} />
        ))}
      </ul>
    </div>
  );
}

function BarisAnggota({
  id,
  anggota,
  akuSendiri,
  ruang,
}: {
  id: string;
  anggota: AnggotaTim;
  akuSendiri: boolean;
  ruang: RuangBattle;
}) {
  const av = getAvatar(anggota.avatar ?? "");
  const selesai = Boolean(ruang.selesai?.[id]);
  return (
    <li className="flex items-center gap-2">
      <span
        className="w-7 h-7 shrink-0 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-sm"
        aria-hidden="true"
      >
        {anggota.bot ? (
          "🤖"
        ) : av ? (
          <GambarEmoji src={av.gambar} emoji={av.emoji} className="w-full h-full object-cover" />
        ) : (
          "🙂"
        )}
      </span>
      <span className="truncate">
        {anggota.nama}
        {akuSendiri ? " (kamu)" : ""}
      </span>
      {selesai && (
        <span className="ml-auto text-success" aria-label="sudah selesai">
          ✓
        </span>
      )}
    </li>
  );
}
