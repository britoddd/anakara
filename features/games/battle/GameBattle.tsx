"use client";

import { useEffect, useRef, useState } from "react";
import LatarArena from "@/components/deko/LatarArena";
import TombolKembali from "@/components/ui/TombolKembali";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { UserProfile } from "@/features/auth/types";
import { getAvatar } from "@/features/auth/avatars";
import ArenaBattle from "./ArenaBattle";
import { BATAS_CARI_DETIK } from "./config";
import {
  buatRuangLawanBot,
  buatRuangLawanKode,
  buatTim,
  cobaKlaimLawan,
  dengarkanAntrean,
  dengarkanTim,
  gabungTim,
  keluarAntrean,
  keluarTim,
  masukAntrean,
  setStatusTim,
  tambahBotKeTim,
} from "./rtdb";
import type { TimBattle } from "./types";

/* Team Battle 2v2 (Phase 6) — alur:
   lobi → "Main" (quick match: buat tim + rekan bot D8 + langsung antre) atau
   Buat Tim / Gabung Tim → ruang tim (kode 4 huruf). Di ruang tim, ketua bisa
   "Main dengan Robo" (isi slot kosong dengan bot D8) lalu tekan "Cari Lawan"
   → antrean RTDB; 15 dtk tak ada lawan → tim bot (D7) → arena (ArenaBattle).
   Ketua tim = pembuat & penggerak matchmaking. */

type Fase = "lobi" | "gabung" | "tim";

export default function GameBattle({ profil }: { profil: UserProfile }) {
  const uid = profil.userId;
  const [fase, setFase] = useState<Fase>("lobi");
  const [kodeTim, setKodeTim] = useState<string | null>(null);
  const [tim, setTim] = useState<TimBattle | null>(null);
  /* ruangId disimpan terpisah dari node tim: setelah battle usai, ArenaBattle
     menghapus node tim (bersihkanTim) — arena harus tetap tampil tanpa node itu */
  const [ruangId, setRuangId] = useState<string | null>(null);
  const ruangIdRef = useRef<string | null>(null);
  const [kodeInput, setKodeInput] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sisaCari, setSisaCari] = useState(BATAS_CARI_DETIK);

  /* ---------- listener tim ---------- */
  useEffect(() => {
    if (!kodeTim) return;
    const unsub = dengarkanTim(kodeTim, (t) => {
      setTim(t);
      if (t?.ruangId) {
        ruangIdRef.current = t.ruangId;
        setRuangId(t.ruangId);
      }
      // node tim hilang SETELAH masuk arena = pembersihan normal usai battle,
      // bukan pembubaran — jangan tendang pemain keluar dari layar hasil
      if (!t && !ruangIdRef.current) {
        // tim dibubarkan ketua / koneksi ketua putus → kembali ke lobi
        setKodeTim(null);
        setFase("lobi");
        setGalat("Tim dibubarkan. Yuk buat atau gabung tim lagi!");
      }
    });
    return unsub;
  }, [kodeTim]);

  const akuKetua = tim?.ketua === uid;
  const jumlahAnggota = Object.keys(tim?.anggota ?? {}).length;

  /* ---------- matchmaking: hanya ketua, saat status "mencari" ---------- */
  const klaimSibuk = useRef(false);
  useEffect(() => {
    if (!tim || !kodeTim || tim.status !== "mencari" || !akuKetua || tim.ruangId) return;

    let aktif = true;
    setSisaCari(BATAS_CARI_DETIK);

    async function coba() {
      if (!aktif || klaimSibuk.current || !kodeTim) return;
      klaimSibuk.current = true;
      try {
        const kodeLawan = await cobaKlaimLawan(kodeTim);
        if (kodeLawan && aktif) {
          await buatRuangLawanKode(uid, kodeTim, kodeLawan);
        }
      } finally {
        klaimSibuk.current = false;
      }
    }

    const unsubAntrean = dengarkanAntrean(() => void coba());

    const mulai = Date.now();
    const interval = setInterval(() => {
      const sisa = BATAS_CARI_DETIK - Math.floor((Date.now() - mulai) / 1000);
      setSisaCari(Math.max(0, sisa));
    }, 500);

    // D7: 15 detik tak ada tim lawan → lawan bot
    const batasWaktu = setTimeout(async () => {
      if (!aktif || !kodeTim) return;
      const masihDiAntrean = await keluarAntrean(kodeTim);
      // kalau sudah diklaim tim lain, ruangId akan datang sendiri — jangan buat ruang bot
      if (masihDiAntrean && aktif) {
        await buatRuangLawanBot(uid, kodeTim);
      }
    }, BATAS_CARI_DETIK * 1000);

    return () => {
      aktif = false;
      unsubAntrean();
      clearInterval(interval);
      clearTimeout(batasWaktu);
    };
  }, [tim, kodeTim, akuKetua, uid]);

  /* ---------- aksi ---------- */

  async function aksi(fn: () => Promise<void>) {
    setGalat(null);
    setSibuk(true);
    try {
      await fn();
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Ada gangguan. Coba lagi, ya!");
    } finally {
      setSibuk(false);
    }
  }

  /* Quick match: buat tim + rekan bot otomatis (D8) lalu LANGSUNG antre lawan.
     Kalau nanti ada tim sungguhan di antrean → lawan pemain; kalau tidak
     (15 dtk, D7) → lawan tim bot. Bot hanya mengisi slot rekan yang kosong. */
  const mainCepat = () =>
    aksi(async () => {
      const kode = await buatTim(profil, true);
      setKodeTim(kode);
      setFase("tim");
      await masukAntrean(kode);
    });

  const buat = () =>
    aksi(async () => {
      const kode = await buatTim(profil, false);
      setKodeTim(kode);
      setFase("tim");
    });

  const gabung = () =>
    aksi(async () => {
      const kode = await gabungTim(profil, kodeInput);
      setKodeTim(kode);
      setFase("tim");
    });

  const tambahBot = () =>
    aksi(async () => {
      if (kodeTim) await tambahBotKeTim(kodeTim);
    });

  const cariLawan = () =>
    aksi(async () => {
      if (kodeTim) await masukAntrean(kodeTim);
    });

  const batalCari = () =>
    aksi(async () => {
      if (!kodeTim) return;
      const berhasil = await keluarAntrean(kodeTim);
      if (berhasil) await setStatusTim(kodeTim, "kumpul");
    });

  const keluar = () =>
    aksi(async () => {
      if (kodeTim) await keluarTim(kodeTim, uid);
      setKodeTim(null);
      setTim(null);
      setFase("lobi");
    });

  function mainLagi() {
    ruangIdRef.current = null;
    setRuangId(null);
    setKodeTim(null);
    setTim(null);
    setKodeInput("");
    setGalat(null);
    setFase("lobi");
  }

  /* ================== render ================== */

  /* ---------- arena ---------- */
  if (ruangId && kodeTim) {
    return (
      <ArenaBattle
        ruangId={ruangId}
        kodeTimKu={kodeTim}
        profil={profil}
        onMainLagi={mainLagi}
      />
    );
  }

  /* ---------- ruang tim ---------- */
  if (fase === "tim" && kodeTim) {
    if (!tim) return <LoadingSpinner label="Membuka ruang tim…" />;
    const mencari = tim.status === "mencari";
    return (
      <>
      <LatarArena />
      <main id="konten-utama" className="max-w-xl mx-auto px-6 py-10 text-center">
        <h1 className="text-3xl mb-2">Ruang Tim ⚔️</h1>
        <p className="text-muted font-bold mb-6">
          Ajak temanmu masuk dengan kode ini:
        </p>

        <p
          className="font-display font-extrabold text-5xl tracking-[0.3em] bg-surface border-4 border-primary rounded-lg inline-block px-8 py-4 mb-8"
          aria-label={`Kode tim: ${kodeTim.split("").join(" ")}`}
        >
          {kodeTim}
        </p>

        <ul className="flex justify-center gap-4 mb-8 list-none" aria-label="Anggota tim">
          {Object.entries(tim.anggota ?? {}).map(([id, a]) => {
            const av = getAvatar(a.avatar ?? "");
            return (
              <li key={id} className="flex flex-col items-center gap-2 w-28">
                <span className="w-16 h-16 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-3xl">
                  {a.bot ? (
                    <span aria-hidden="true">🤖</span>
                  ) : av ? (
                    <GambarEmoji src={av.gambar} emoji={av.emoji} className="w-full h-full object-cover" />
                  ) : (
                    <span aria-hidden="true">🙂</span>
                  )}
                </span>
                <span className="font-bold text-sm leading-tight">
                  {a.nama}
                  {id === uid ? " (kamu)" : ""}
                  {id === tim.ketua ? " 👑" : ""}
                </span>
              </li>
            );
          })}
          {jumlahAnggota < 2 && (
            <li className="flex flex-col items-center gap-2 w-28">
              <span
                className="w-16 h-16 rounded-full bg-surface-2 border-2 border-dashed border-border flex items-center justify-center text-2xl text-muted"
                aria-hidden="true"
              >
                ?
              </span>
              <span className="font-bold text-sm text-muted">Menunggu teman…</span>
            </li>
          )}
        </ul>

        {mencari ? (
          <div>
            <LoadingSpinner label={`Mencari tim lawan… ${sisaCari} detik`} />
            <p className="text-sm font-bold text-muted mb-4">
              Kalau tidak ada tim lain, kalian akan melawan Tim Robo 🤖
            </p>
            {akuKetua && (
              <Button variant="ghost" onClick={batalCari} disabled={sibuk}>
                Batal Mencari
              </Button>
            )}
          </div>
        ) : akuKetua ? (
          <div className="flex flex-col items-center gap-3">
            <Button size="lg" onClick={cariLawan} disabled={sibuk || jumlahAnggota < 2}>
              Cari Lawan ⚔️
            </Button>
            {jumlahAnggota < 2 && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm font-bold text-muted">
                  Tunggu 1 teman lagi masuk dengan kode di atas, atau…
                </p>
                <Button variant="accent" onClick={tambahBot} disabled={sibuk}>
                  🤖 Main dengan Robo
                </Button>
                <p className="text-xs font-bold text-muted">
                  Robo Milo akan mengisi timmu supaya bisa langsung tanding.
                </p>
              </div>
            )}
            <Button variant="ghost" onClick={keluar} disabled={sibuk}>
              Bubarkan Tim
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="font-bold">Menunggu ketua tim menekan “Cari Lawan”…</p>
            <Button variant="ghost" onClick={keluar} disabled={sibuk}>
              Keluar Tim
            </Button>
          </div>
        )}

        {galat && (
          <p role="alert" className="mt-4 text-danger font-bold">
            ⚠️ {galat}
          </p>
        )}
      </main>
      </>
    );
  }

  /* ---------- gabung tim (input kode) ---------- */
  if (fase === "gabung") {
    return (
      <>
      <LatarArena />
      <main id="konten-utama" className="max-w-md mx-auto px-6 py-10 text-center">
        <h1 className="text-3xl mb-2">Gabung Tim 🤝</h1>
        <p className="text-muted font-bold mb-8">
          Masukkan kode 4 huruf dari temanmu.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void gabung();
          }}
        >
          <label htmlFor="kode-tim" className="sr-only">
            Kode tim
          </label>
          <input
            id="kode-tim"
            value={kodeInput}
            onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
            maxLength={4}
            autoComplete="off"
            aria-invalid={galat ? true : undefined}
            placeholder="ABCD"
            className="w-full text-center font-display font-extrabold text-4xl tracking-[0.3em] uppercase bg-surface border-4 border-border rounded-lg px-4 py-4 mb-6 focus:border-primary outline-none"
          />
          <div className="flex justify-center gap-4">
            <Button type="button" variant="ghost" onClick={() => setFase("lobi")} disabled={sibuk}>
              Kembali
            </Button>
            <Button type="submit" disabled={sibuk || kodeInput.trim().length < 4}>
              {sibuk ? "Mencari tim…" : "Gabung"}
            </Button>
          </div>
        </form>
        {galat && (
          <p role="alert" className="mt-4 text-danger font-bold">
            ⚠️ {galat}
          </p>
        )}
      </main>
      </>
    );
  }

  /* ---------- lobi ---------- */
  return (
    <>
    <LatarArena />
    <main id="konten-utama" className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-2">
        <TombolKembali href="/home" label="Kembali ke Home" />
        <h1 className="text-3xl">Team Battle 2 vs 2 ⚔️</h1>
      </div>
      <p className="text-muted font-bold mb-8 text-lg">
        Berdua lebih seru! Jawab soal gizi bersama temanmu, kalahkan tim lawan,
        dan menangkan kotak misteri! 🎁
      </p>

      <div className="grid gap-4">
        <TombolLobi
          utama
          judul="⚡ Main"
          keterangan="Tanding cepat! Langsung cari lawan — Robo Milo jadi rekan timmu kalau belum ada teman."
          onClick={() => void mainCepat()}
          disabled={sibuk}
        />
        <TombolLobi
          judul="🛡️ Buat Tim"
          keterangan="Dapatkan kode tim, lalu ajak 1 teman (atau Robo) bergabung."
          onClick={() => void buat()}
          disabled={sibuk}
        />
        <TombolLobi
          judul="🤝 Gabung Tim"
          keterangan="Punya kode dari teman? Masuk di sini."
          onClick={() => setFase("gabung")}
          disabled={sibuk}
        />
      </div>

      {sibuk && <LoadingSpinner label="Menyiapkan tim…" />}
      {galat && (
        <p role="alert" className="mt-4 text-danger font-bold text-center">
          ⚠️ {galat}
        </p>
      )}
    </main>
    </>
  );
}

/* Kartu aksi lobi sebagai <button> asli supaya bisa diakses keyboard.
   utama = aksi utama "Main" (quick match): kartu primary menonjol + lebih besar. */
function TombolLobi({
  judul,
  keterangan,
  onClick,
  disabled,
  utama = false,
}: {
  judul: string;
  keterangan: string;
  onClick: () => void;
  disabled: boolean;
  utama?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "text-left rounded-lg border-2 cursor-pointer",
        "transition-[transform,box-shadow,border-color,filter] duration-200 ease-out",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        utama
          ? [
              "bg-primary text-on-primary border-primary p-7",
              "shadow-[0_5px_0_var(--primary-active)]",
              "hover:-translate-y-1 hover:brightness-105 hover:shadow-[0_12px_26px_rgba(214,51,108,0.35)]",
            ].join(" ")
          : [
              "bg-surface text-fg border-border p-6",
              "shadow-[0_2px_8px_rgba(16,32,43,0.06)]",
              "hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_20px_rgba(16,32,43,0.12)]",
            ].join(" "),
      ].join(" ")}
    >
      <span
        className={[
          "block font-display font-extrabold",
          utama ? "text-2xl" : "text-xl",
        ].join(" ")}
      >
        {judul}
      </span>
      <span
        className={[
          "block font-bold",
          utama ? "text-on-primary opacity-90" : "text-muted",
        ].join(" ")}
      >
        {keterangan}
      </span>
    </button>
  );
}
