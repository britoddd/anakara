"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import BlobMata from "@/components/deko/BlobMata";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import KonfirmasiKeluar from "@/components/ui/KonfirmasiKeluar";
import DialogUlangLevel from "@/components/ui/KonfirmasiUlangLevel";
import TombolKembali from "@/components/ui/TombolKembali";
import GambarEmoji from "@/components/ui/GambarEmoji";
import ProgressBar from "@/components/ui/ProgressBar";
import { useAuth } from "@/features/auth/AuthProvider";
import { hitungLevel, type UserProfile } from "@/features/auth/types";
import Konfetti from "@/components/ui/Konfetti";
import { umpanBenar, umpanSalah, umpanRaya } from "@/lib/umpan-balik";
import PapanRekorEndless from "@/features/games/endless/PapanRekorEndless";
import { simpanHasilEndless } from "@/features/games/endless/api";
import {
  ENDLESS_IP,
  KELOMPOK_INFO,
  LEVELS,
  POIN,
  acak,
  hitungBintang,
  poolLevel,
  timerRondeEndless,
  type Kelompok,
  type LevelConfig,
  type Makanan,
} from "./config";
import PiringGizi from "./PiringGizi";
import { simpanHasilIsiPiringku } from "./api";

/* Game "Isi Piringku" (Phase 3, mockup MacBook Air - 3).
   Sortir makanan ke 4 kelompok gizi. Dua cara main (mobile + a11y):
   1) seret makanan ke kuadran piring (dnd-kit), atau
   2) ketuk makanan lalu ketuk kuadran tujuan.
   Salah tidak mengurangi poin (ramah anak); persen benar menentukan bintang.
   Level 1-9 = mode biasa; level 10 "Piring Tanpa Batas" = endless: ronde terus
   berlanjut dengan timer menyusut, ❤️ 3 nyawa, papan rekor sendiri. */

type Fase = "pilih" | "main" | "hasil";

interface PesanTayo {
  teks: string;
  tipe: "info" | "sukses" | "salah";
}

const PESAN_AWAL: PesanTayo = {
  teks: "Seret setiap makanan ke bagian piring yang tepat sesuai kelompoknya!",
  tipe: "info",
};

const PESAN_AWAL_ENDLESS: PesanTayo = {
  teks: "Mode Tanpa Batas! Sortir terus selama nyawamu ada — waktunya makin cepat tiap ronde! ⚡",
  tipe: "info",
};

/* cfg sintetis level 10: ronde tak terhingga; timer per ronde dihitung
   timerRondeEndless() saat buatRonde, bukan dari timerDetik ini */
const CFG_ENDLESS: LevelConfig = {
  level: ENDLESS_IP.level,
  nama: ENDLESS_IP.nama,
  itemPerRonde: ENDLESS_IP.itemPerRonde,
  jumlahRonde: Number.POSITIVE_INFINITY,
  timerDetik: ENDLESS_IP.timerAwalDetik,
  syaratBuka: ENDLESS_IP.syaratBuka,
  syaratLulus: { minBenarPersen: 0 },
  bintang: {},
};

export default function GameIsiPiringku({ profil }: { profil: UserProfile }) {
  const { refreshProfil } = useAuth();

  /* poin SEBELUM sesi ini — deteksi naik level (D10) di layar hasil */
  const poinAwalRef = useRef(profil.poin);

  const [fase, setFase] = useState<Fase>("pilih");
  const [cfg, setCfg] = useState<LevelConfig | null>(null);
  const [ronde, setRonde] = useState(1);
  const [tray, setTray] = useState<Makanan[]>([]);
  const [tertempat, setTertempat] = useState<Record<Kelompok, Makanan[]>>({
    pokok: [],
    lauk: [],
    sayur: [],
    buah: [],
  });
  const [benarTotal, setBenarTotal] = useState(0);
  const [salahTotal, setSalahTotal] = useState(0);
  const [salahRonde, setSalahRonde] = useState(0);
  const [poinSesi, setPoinSesi] = useState(0);
  const [pesan, setPesan] = useState<PesanTayo>(PESAN_AWAL);
  const [pilihanTap, setPilihanTap] = useState<string | null>(null);
  const [dragAktif, setDragAktif] = useState<Makanan | null>(null);
  const [timerSisa, setTimerSisa] = useState<number | null>(null);
  const [hasil, setHasil] = useState<{
    persen: number;
    bintang: number;
    lulus: boolean;
    poin: number;
    bukaLevelBaru: boolean;
  } | null>(null);
  const [statusSimpan, setStatusSimpan] = useState<"idle" | "proses" | "ok" | "gagal">("idle");

  /* --- Mode Tanpa Batas (level 10) --- */
  const modeEndless = cfg?.level === ENDLESS_IP.level;
  const [nyawa, setNyawa] = useState<number>(ENDLESS_IP.nyawa);
  const [hasilEndless, setHasilEndless] = useState<{ skor: number; poin: number } | null>(null);
  const [rekor, setRekor] = useState<{ pecahRekor: boolean; skorTerbaik: number } | null>(null);
  // penjaga agar sesi endless tak "selesai" dua kali (nyawa habis + waktu habis
  // bisa beririsan di jeda 900ms) → simpan ganda ke Firestore
  const sesiSelesaiRef = useRef(false);

  const sensors = useSensors(
    // jarak aktivasi 6px: klik/ketuk biasa tetap terhitung klik (mode tap)
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  /* ---------- alur permainan ---------- */

  function buatRonde(c: LevelConfig, rondeKe: number) {
    setTray(acak(poolLevel(c.level)).slice(0, c.itemPerRonde));
    setTertempat({ pokok: [], lauk: [], sayur: [], buah: [] });
    setSalahRonde(0);
    setPilihanTap(null);
    // endless: timer menyusut tiap ronde (60→30 dtk); mode biasa: dari config
    setTimerSisa(c.level === ENDLESS_IP.level ? timerRondeEndless(rondeKe) : c.timerDetik);
  }

  function mulaiLevel(c: LevelConfig) {
    poinAwalRef.current = profil.poin;
    setCfg(c);
    setRonde(1);
    setBenarTotal(0);
    setSalahTotal(0);
    setPoinSesi(0);
    setHasil(null);
    setHasilEndless(null);
    setRekor(null);
    setNyawa(ENDLESS_IP.nyawa);
    sesiSelesaiRef.current = false;
    setStatusSimpan("idle");
    setPesan(c.level === ENDLESS_IP.level ? PESAN_AWAL_ENDLESS : PESAN_AWAL);
    buatRonde(c, 1);
    setFase("main");
  }

  const selesaiLevel = useCallback(
    async (benar: number, salah: number, poin: number, c: LevelConfig) => {
      // salah sudah termasuk item yang tak sempat tertempat saat waktu habis
      const total = benar + salah;
      const persen = total === 0 ? 0 : Math.round((benar / total) * 100);
      const lulus = persen >= c.syaratLulus.minBenarPersen;
      const bintang = hitungBintang(c, persen);
      const bukaLevelBaru =
        lulus &&
        c.level === profil.progress.isiPiringku.levelTerbuka &&
        c.level < ENDLESS_IP.level;

      const naik =
        hitungLevel(poinAwalRef.current + poin) > hitungLevel(poinAwalRef.current);
      if (lulus || naik) umpanRaya(); // rayakan lulus / naik level
      setHasil({ persen, bintang, lulus, poin, bukaLevelBaru });
      setFase("hasil");

      setStatusSimpan("proses");
      try {
        await simpanHasilIsiPiringku(profil, { level: c.level, lulus, poinTambah: poin });
        await refreshProfil();
        setStatusSimpan("ok");
      } catch {
        setStatusSimpan("gagal");
      }
    },
    [profil, refreshProfil]
  );

  /* akhir sesi Tanpa Batas (nyawa habis / waktu habis): skor = total benar,
     simpan ke papan rekor rekorEndless + poin ⭐ ke profil */
  const selesaiEndless = useCallback(
    async (benar: number, poin: number) => {
      if (sesiSelesaiRef.current) return;
      sesiSelesaiRef.current = true;

      setHasilEndless({ skor: benar, poin });
      setFase("hasil");
      setStatusSimpan("proses");
      try {
        const r = await simpanHasilEndless(profil, "isi-piringku", benar, poin);
        setRekor(r);
        const naik =
          hitungLevel(poinAwalRef.current + poin) > hitungLevel(poinAwalRef.current);
        if (r.pecahRekor || naik) umpanRaya();
        await refreshProfil();
        setStatusSimpan("ok");
      } catch {
        setStatusSimpan("gagal");
      }
    },
    [profil, refreshProfil]
  );
  const selesaiEndlessRef = useRef(selesaiEndless);
  selesaiEndlessRef.current = selesaiEndless;

  function lanjutkanSetelahRonde(
    sisaTray: Makanan[],
    salahRondeAkhir: number,
    opsi?: { waktuHabis?: boolean }
  ) {
    if (!cfg) return;

    if (modeEndless) {
      // Tanpa Batas: waktu habis = sesi selesai (item tersisa tak dihitung
      // salah); selain itu ronde berikutnya selalu datang, makin cepat
      if (opsi?.waktuHabis) {
        void selesaiEndless(benarTotal, poinSesi);
        return;
      }
      setRonde((r) => r + 1);
      buatRonde(cfg, ronde + 1);
      setPesan({
        teks: `Ronde ${ronde + 1} — waktunya makin cepat! ⚡`,
        tipe: "info",
      });
      return;
    }

    let poinBaru = poinSesi;
    let salahBaru = salahTotal;

    if (opsi?.waktuHabis && sisaTray.length > 0) {
      // timer lembut: item tersisa dihitung "belum benar", tanpa layar kalah
      salahBaru += sisaTray.length;
      setSalahTotal(salahBaru);
    }
    if (salahRondeAkhir === 0 && !(opsi?.waktuHabis && sisaTray.length > 0)) {
      poinBaru += POIN.bonusRondeSempurna;
      setPoinSesi(poinBaru);
    }

    if (ronde < cfg.jumlahRonde) {
      setRonde((r) => r + 1);
      buatRonde(cfg, ronde + 1);
      setPesan({
        teks: `Ronde ${ronde + 1} dimulai! Semangat! 💪`,
        tipe: "info",
      });
    } else {
      void selesaiLevel(benarTotal, salahBaru, poinBaru, cfg);
    }
  }

  function tempatkan(foodId: string, target: Kelompok) {
    if (!cfg) return;
    if (modeEndless && (nyawa <= 0 || sesiSelesaiRef.current)) return; // sesi sedang ditutup
    const food = tray.find((f) => f.id === foodId);
    if (!food) return;
    setPilihanTap(null);

    if (food.kelompok === target) {
      umpanBenar();
      const trayBaru = tray.filter((f) => f.id !== foodId);
      const benarBaru = benarTotal + 1;
      const poinBaru =
        poinSesi + (modeEndless ? ENDLESS_IP.poinPerBenar : POIN.benarPerItem);
      setTray(trayBaru);
      setTertempat((t) => ({ ...t, [target]: [...t[target], food] }));
      setBenarTotal(benarBaru);
      setPoinSesi(poinBaru);
      setPesan({ teks: `Yeay, benar! 🎉 ${food.fakta}`, tipe: "sukses" });

      if (trayBaru.length === 0) {
        // tunda sejenak agar anak sempat melihat feedback benar terakhir
        const salahAkhir = salahRonde;
        setTimeout(() => lanjutkanSetelahRondeRef.current([], salahAkhir), 900);
      }
    } else {
      umpanSalah();
      setSalahTotal((s) => s + 1);
      setSalahRonde((s) => s + 1);

      if (modeEndless) {
        const nyawaBaru = nyawa - 1;
        setNyawa(nyawaBaru);
        if (nyawaBaru <= 0) {
          setPesan({
            teks: "Nyawa habis — sesi selesai. Skormu keren, lihat yuk! 🐆💛",
            tipe: "salah",
          });
          // beri waktu membaca pesan sebelum layar hasil
          const benarAkhir = benarTotal;
          const poinAkhir = poinSesi;
          setTimeout(() => selesaiEndlessRef.current(benarAkhir, poinAkhir), 900);
          return;
        }
        setPesan({
          teks: `Yuk hati-hati! ${food.nama} bukan ${KELOMPOK_INFO[target].label}. Sisa nyawa: ${"❤️".repeat(nyawaBaru)} 🐆`,
          tipe: "salah",
        });
        return;
      }

      setPesan({
        teks: `Yuk coba lagi! ${food.nama} bukan ${KELOMPOK_INFO[target].label}. 🐆`,
        tipe: "salah",
      });
    }
  }

  // ref agar setTimeout selalu memanggil versi terbaru (hindari state basi)
  const lanjutkanSetelahRondeRef = useRef(lanjutkanSetelahRonde);
  lanjutkanSetelahRondeRef.current = lanjutkanSetelahRonde;

  /* timer lembut level 3 — hitung mundur per ronde */
  useEffect(() => {
    if (fase !== "main" || timerSisa === null) return;
    if (timerSisa <= 0) {
      lanjutkanSetelahRondeRef.current(tray, salahRonde, { waktuHabis: true });
      return;
    }
    const id = setTimeout(() => setTimerSisa((t) => (t === null ? null : t - 1)), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, timerSisa]);

  function onDragStart(e: DragStartEvent) {
    setDragAktif(tray.find((f) => f.id === e.active.id) ?? null);
  }
  function onDragEnd(e: DragEndEvent) {
    setDragAktif(null);
    const target = e.over?.id as Kelompok | undefined;
    if (target) tempatkan(String(e.active.id), target);
  }

  /* ---------- tampilan ---------- */

  if (fase === "pilih") {
    return (
      <PilihLevel
        levelTerbuka={profil.progress.isiPiringku.levelTerbuka}
        onPilih={mulaiLevel}
        uidKu={profil.userId}
      />
    );
  }

  /* ---------- layar hasil: Piring Tanpa Batas ---------- */
  if (fase === "hasil" && modeEndless && hasilEndless) {
    return (
      <main id="konten-utama" className="max-w-xl mx-auto px-6 py-12 text-center">
        {(rekor?.pecahRekor ||
          hitungLevel(poinAwalRef.current + hasilEndless.poin) >
            hitungLevel(poinAwalRef.current)) && <Konfetti />}
        <span className="relative inline-block mb-4" aria-hidden="true">
          <BlobMata bentuk="bunga" className="absolute -left-14 bottom-1 w-12 text-accent -rotate-6" />
          <BlobMata bentuk="cipratan" className="absolute -right-14 bottom-2 w-12 text-primary rotate-6" />
          <span className="w-28 h-28 text-6xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center">
            <GambarEmoji
              src={rekor?.pecahRekor ? "/assets/mascot/tayo-happy.png" : "/assets/mascot/tayo-cheer.png"}
              emoji={rekor?.pecahRekor ? "🐆🎉" : "🐆💛"}
              className="w-full h-full object-cover"
            />
          </span>
        </span>
        <h1 className="text-3xl mb-2">
          {rekor?.pecahRekor ? "Rekor baru! 🏅" : "Sesi selesai!"}
        </h1>
        <p className="text-lg text-muted mb-6">
          Kamu menyortir {hasilEndless.skor} makanan dengan benar di {ENDLESS_IP.nama}!
        </p>

        <Card className="mb-6">
          <p className="font-display font-extrabold text-4xl mb-1">{hasilEndless.skor}</p>
          <p className="text-muted font-bold mb-2">makanan benar</p>
          <p className="font-bold text-lg">+ ⭐ {hasilEndless.poin} poin</p>
          {rekor && !rekor.pecahRekor && (
            <p className="text-sm text-muted mt-1">
              Rekor terbaikmu: {rekor.skorTerbaik} benar
            </p>
          )}
          {hitungLevel(poinAwalRef.current + hasilEndless.poin) >
            hitungLevel(poinAwalRef.current) && (
            <p className="font-bold text-success mt-1">
              🎉 Kamu naik ke Lv {hitungLevel(poinAwalRef.current + hasilEndless.poin)}!
            </p>
          )}
          <p className="text-sm text-muted mt-2" role="status">
            {statusSimpan === "proses" && "Menyimpan progres…"}
            {statusSimpan === "ok" && "✓ Progres tersimpan"}
            {statusSimpan === "gagal" &&
              "⚠️ Progres belum tersimpan (cek koneksi) — poin sesi ini mungkin hilang."}
          </p>
        </Card>

        <Card className="mb-6 text-left">
          <h2 className="text-lg text-center mb-3">🏆 Papan Rekor</h2>
          {statusSimpan === "proses" ? (
            <p className="text-center text-muted font-bold py-4">Memuat papan rekor…</p>
          ) : (
            <PapanRekorEndless game="isi-piringku" uidKu={profil.userId} />
          )}
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => mulaiLevel(CFG_ENDLESS)}>🔁 Main Lagi</Button>
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

  if (fase === "hasil" && hasil && cfg) {
    return (
      <main id="konten-utama" className="max-w-xl mx-auto px-6 py-12 text-center">
        {(hasil.lulus ||
          hitungLevel(poinAwalRef.current + hasil.poin) >
            hitungLevel(poinAwalRef.current)) && <Konfetti />}
        <span className="relative inline-block mb-4" aria-hidden="true">
          {/* blob "teman-teman" ikut merayakan (restyle THYNK §B) */}
          <BlobMata bentuk="bunga" className="absolute -left-14 bottom-1 w-12 text-accent -rotate-6" />
          <BlobMata bentuk="cipratan" className="absolute -right-14 bottom-2 w-12 text-primary rotate-6" />
          <span className="w-28 h-28 text-6xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center">
            <GambarEmoji
              src={hasil.lulus ? "/assets/mascot/tayo-happy.png" : "/assets/mascot/tayo-cheer.png"}
              emoji={hasil.lulus ? "🐆🎉" : "🐆💛"}
              className="w-full h-full object-cover"
            />
          </span>
        </span>
        <h1 className="text-3xl mb-2">
          {hasil.lulus ? "Hebat sekali!" : "Sudah bagus!"}
        </h1>
        <p className="text-lg text-muted mb-6">
          {hasil.lulus
            ? `Kamu menyelesaikan ${cfg.nama}!`
            : "Yuk coba sekali lagi, pasti bisa!"}
        </p>

        <p className="text-5xl mb-6 tracking-widest" aria-label={`${hasil.bintang} dari 3 bintang`}>
          {[1, 2, 3].map((b) => (
            <span key={b} aria-hidden="true">
              {b <= hasil.bintang ? "⭐" : "☆"}
            </span>
          ))}
        </p>

        <Card className="mb-6 text-left">
          <div className="mb-4">
            <ProgressBar value={hasil.persen} label="Persentase jawaban benar" showValue />
          </div>
          <p className="font-bold text-center text-lg">+ ⭐ {hasil.poin} poin</p>
          {hasil.bukaLevelBaru && (
            <p className="text-center font-bold text-success mt-2">
              {cfg.level + 1 === ENDLESS_IP.level
                ? `🔓 ${ENDLESS_IP.nama} terbuka!`
                : `🔓 Level ${cfg.level + 1} terbuka!`}
            </p>
          )}
          {hitungLevel(poinAwalRef.current + hasil.poin) >
            hitungLevel(poinAwalRef.current) && (
            <p className="text-center font-bold text-success mt-1">
              🎉 Kamu naik ke Lv {hitungLevel(poinAwalRef.current + hasil.poin)}!
            </p>
          )}
          <p className="text-center text-sm text-muted mt-2" role="status">
            {statusSimpan === "proses" && "Menyimpan progres…"}
            {statusSimpan === "ok" && "✓ Progres tersimpan"}
            {statusSimpan === "gagal" &&
              "⚠️ Progres belum tersimpan (cek koneksi) — poin sesi ini mungkin hilang."}
          </p>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => mulaiLevel(cfg)}>🔁 Main Lagi</Button>
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

  if (!cfg) return null;

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <main id="konten-utama" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {/* bar status permainan */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <KonfirmasiKeluar
            href="/home"
            label="Keluar dari permainan"
            judul="Keluar dari permainan?"
            pesan="Permainan masih berlangsung — kalau keluar, poin sesi ini tidak tersimpan."
          />
          <h1 className="text-2xl text-center">Isi Piringku!</h1>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold bg-surface border-2 border-border rounded-full px-4 py-1.5">
              {modeEndless ? `Ronde ${ronde} ♾️` : `Ronde ${ronde}/${cfg.jumlahRonde}`}
            </span>
            {modeEndless && (
              <span
                className="font-display font-bold bg-surface border-2 border-border rounded-full px-4 py-1.5 tracking-wider"
                role="status"
                aria-label={`Sisa nyawa ${nyawa} dari ${ENDLESS_IP.nyawa}`}
              >
                {"❤️".repeat(nyawa)}
                {"🤍".repeat(Math.max(0, ENDLESS_IP.nyawa - nyawa))}
              </span>
            )}
            {timerSisa !== null && (
              <span
                className={`font-display font-bold border-2 rounded-full px-4 py-1.5 ${
                  timerSisa <= 15
                    ? "bg-accent text-on-accent border-accent-edge"
                    : "bg-surface border-border"
                }`}
              >
                ⏰ {Math.floor(timerSisa / 60)}:{String(timerSisa % 60).padStart(2, "0")}
              </span>
            )}
            <span className="font-display font-bold bg-surface border-2 border-border rounded-full px-4 py-1.5">
              ⭐ {poinSesi}
            </span>
          </div>
        </div>

        {/* Tayo memandu — pesan feedback (dibacakan screen reader) */}
        <div
          role="status"
          aria-live="polite"
          className={[
            "flex items-center gap-3 rounded-lg border-2 px-4 py-3 mb-6 font-bold",
            pesan.tipe === "sukses"
              ? "bg-success/10 border-success text-fg"
              : pesan.tipe === "salah"
                ? "bg-accent/20 border-accent text-fg"
                : "bg-surface border-border text-fg",
          ].join(" ")}
        >
          <span className="text-3xl shrink-0" aria-hidden="true">
            {pesan.tipe === "sukses" ? "🐆✨" : pesan.tipe === "salah" ? "🐆💬" : "🐆"}
          </span>
          <span>{pesan.teks}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,380px)] items-start">
          {/* piring 4 kuadran */}
          <div className="mx-auto w-full max-w-[560px]">
            <PiringGizi
              tertempat={tertempat}
              modeTapAktif={pilihanTap !== null}
              onTapKuadran={(k) => {
                if (pilihanTap) tempatkan(pilihanTap, k);
              }}
            />
          </div>

          {/* nampan makanan */}
          <Card>
            <h2 className="text-lg mb-1">Pilih Makanan</h2>
            <p className="text-sm text-muted mb-4">
              Seret ke piring, atau ketuk makanan lalu ketuk bagian piringnya.
            </p>
            {tray.length === 0 ? (
              <p className="text-center text-muted font-bold py-6">
                Piring lengkap! 🎉
              </p>
            ) : (
              <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3 list-none">
                {tray.map((f) => (
                  <li key={f.id}>
                    <FoodChip
                      food={f}
                      terpilih={pilihanTap === f.id}
                      onTap={() =>
                        setPilihanTap((p) => (p === f.id ? null : f.id))
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <DragOverlay dropAnimation={null}>
          {dragAktif && (
            <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-surface border-2 border-primary shadow-lg w-24">
              <span className="w-12 h-12 flex items-center justify-center text-3xl">
                <GambarEmoji
                  src={dragAktif.gambar}
                  emoji={dragAktif.emoji}
                  className="w-full h-full object-contain"
                  emojiClassName="text-3xl"
                />
              </span>
              <span className="text-xs font-bold text-center">{dragAktif.nama}</span>
            </div>
          )}
        </DragOverlay>
      </main>
    </DndContext>
  );
}

/* ---------- sub-komponen ---------- */

/* Emoji kartu level 1-9 (makin "hebat"); Tanpa Batas = ♾️ */
const EMOJI_LEVEL_IP = ["🍽️", "🍱", "🥗", "⚡", "🎯", "🧠", "🚀", "🌟", "🏆"];

function formatTimer(detik: number): string {
  return detik % 60 === 0 ? `${detik / 60} menit` : `${detik} detik`;
}

function PilihLevel({
  levelTerbuka,
  onPilih,
  uidKu,
}: {
  levelTerbuka: number;
  onPilih: (c: LevelConfig) => void;
  uidKu: string;
}) {
  const endlessTerbuka = levelTerbuka >= ENDLESS_IP.level;
  /* level yang sudah pernah diselesaikan (c.level < levelTerbuka) minta
     konfirmasi ulang dulu; level baru langsung main */
  const [levelUlang, setLevelUlang] = useState<LevelConfig | null>(null);
  function pilih(c: LevelConfig) {
    if (c.level < levelTerbuka) setLevelUlang(c);
    else onPilih(c);
  }
  return (
    <main id="konten-utama" className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <TombolKembali href="/home" label="Kembali ke Home" />
      </div>
      <h1 className="text-3xl text-center mb-2">Isi Piringku! 🍽️</h1>
      <p className="text-lg text-muted text-center mb-10 max-w-[55ch] mx-auto">
        Seret setiap makanan ke bagian piring yang tepat sesuai kelompoknya!
      </p>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        {LEVELS.map((c) => {
          const terkunci = c.level > levelTerbuka;
          return (
            <button
              key={c.level}
              disabled={terkunci}
              onClick={() => pilih(c)}
              aria-label={
                terkunci
                  ? `${c.nama} terkunci. Selesaikan Level ${c.level - 1} untuk membukanya`
                  : c.level < levelTerbuka
                    ? `Main lagi ${c.nama} (sudah selesai)`
                    : `Main ${c.nama}`
              }
              className={[
                "flex flex-col items-center gap-1.5 p-5 rounded-xl bg-surface border-4 text-fg",
                "transition-[transform,border-color] duration-150",
                terkunci
                  ? "border-border opacity-60 grayscale cursor-not-allowed"
                  : "border-border hover:border-primary hover:-translate-y-1 cursor-pointer",
              ].join(" ")}
            >
              <span className="text-4xl" aria-hidden="true">
                {terkunci ? "🔒" : EMOJI_LEVEL_IP[c.level - 1]}
              </span>
              <span className="font-display font-extrabold text-lg">
                Level {c.level}
              </span>
              <span className="font-bold text-sm">{c.nama}</span>
              <span className="text-sm text-muted text-center leading-snug">
                {terkunci
                  ? `Selesaikan Level ${c.level - 1} untuk buka ini!`
                  : `${c.itemPerRonde} makanan × ${c.jumlahRonde} ronde${
                      c.timerDetik ? ` · ⏰ ${formatTimer(c.timerDetik)}` : ""
                    }`}
              </span>
            </button>
          );
        })}
      </div>

      {/* level pamungkas: Piring Tanpa Batas (kartu lebar, aksen) */}
      <button
        disabled={!endlessTerbuka}
        onClick={() => onPilih(CFG_ENDLESS)}
        aria-label={
          endlessTerbuka
            ? `Main ${ENDLESS_IP.nama}`
            : `${ENDLESS_IP.nama} terkunci. Selesaikan Level ${ENDLESS_IP.level - 1} untuk membukanya`
        }
        className={[
          "mt-6 w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4",
          "p-6 rounded-xl bg-surface border-4 text-fg",
          "transition-[transform,border-color] duration-150",
          endlessTerbuka
            ? "border-accent hover:border-primary hover:-translate-y-1 cursor-pointer"
            : "border-border opacity-60 grayscale cursor-not-allowed",
        ].join(" ")}
      >
        <span className="text-5xl" aria-hidden="true">
          {endlessTerbuka ? "♾️" : "🔒"}
        </span>
        <span className="flex flex-col items-center sm:items-start">
          <span className="font-display font-extrabold text-xl">
            Level {ENDLESS_IP.level} · {ENDLESS_IP.nama}
          </span>
          <span className="text-sm text-muted text-center sm:text-left">
            {endlessTerbuka
              ? `Ronde terus berlanjut makin cepat, ${ENDLESS_IP.nyawa} ❤️ nyawa — kejar rekor tertinggi!`
              : `Selesaikan Level ${ENDLESS_IP.level - 1} untuk buka ini!`}
          </span>
        </span>
      </button>

      {endlessTerbuka && (
        <section aria-labelledby="judul-rekor-piring" className="mt-10 max-w-xl mx-auto">
          <h2 id="judul-rekor-piring" className="text-xl text-center mb-4">
            🏆 Papan Rekor Tanpa Batas
          </h2>
          <PapanRekorEndless game="isi-piringku" uidKu={uidKu} />
        </section>
      )}

      <DialogUlangLevel
        terbuka={levelUlang !== null}
        namaLevel={levelUlang ? `Level ${levelUlang.level} · ${levelUlang.nama}` : ""}
        onBatal={() => setLevelUlang(null)}
        onUlang={() => {
          const c = levelUlang;
          setLevelUlang(null);
          if (c) onPilih(c);
        }}
      />
    </main>
  );
}

function FoodChip({
  food,
  terpilih,
  onTap,
}: {
  food: Makanan;
  terpilih: boolean;
  onTap: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: food.id,
  });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onTap}
      aria-pressed={terpilih}
      aria-label={`${food.nama}${terpilih ? ", terpilih — ketuk bagian piring tujuan" : ""}`}
      className={[
        "w-full flex flex-col items-center gap-1 p-2 rounded-md bg-surface cursor-grab",
        "border-2 transition-[transform,border-color] duration-150 touch-none",
        terpilih
          ? "border-primary bg-surface-2 scale-105 shadow-[0_0_0_2px_var(--primary)]"
          : "border-border hover:border-primary",
        isDragging ? "opacity-40" : "",
      ].join(" ")}
    >
      <span className="w-12 h-12 flex items-center justify-center text-3xl" aria-hidden="true">
        <GambarEmoji
          src={food.gambar}
          emoji={food.emoji}
          className="w-full h-full object-contain"
          emojiClassName="text-3xl"
        />
      </span>
      <span className="text-xs font-bold text-center leading-tight">{food.nama}</span>
    </button>
  );
}
