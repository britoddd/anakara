"use client";

import { useEffect, useRef, useState } from "react";
import LatarArena from "@/components/deko/LatarArena";
import KonfirmasiKeluar from "@/components/ui/KonfirmasiKeluar";
import TombolKembali from "@/components/ui/TombolKembali";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import type { UserProfile } from "@/features/auth/types";
import { getAvatar } from "@/features/auth/avatars";
import ArenaBattle from "./ArenaBattle";
import { BATAS_CARI_DETIK, BATAS_LANJUT_RUANG_MENIT } from "./config";
import {
  ambilRuangSekali,
  buatRuangLawanBot,
  buatRuangLawanKode,
  buatTim,
  cobaKlaimLawan,
  dengarkanAntrean,
  dengarkanTim,
  gabungTim,
  keluarAntrean,
  keluarTim,
  kodeTimDiRuang,
  masukAntrean,
  setStatusTim,
  tambahBotKeTim,
} from "./rtdb";
import { ambilSesiBattle, hapusSesiBattle, simpanSesiBattle } from "./sesi";
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
  const [bantuanTerbuka, setBantuanTerbuka] = useState(false);
  /* umpan balik "Tersalin!" sesaat setelah kode disalin ke clipboard */
  const [tersalin, setTersalin] = useState(false);
  /* sesi belum selesai yang bisa dilanjutkan (keluar tak sengaja) */
  const [sesiLanjut, setSesiLanjut] = useState<{ ruangId: string; kodeTim: string } | null>(null);

  /* ---------- tawaran "Lanjutkan" bila ada battle yang belum selesai ----------
     Sesi arena tersimpan di localStorage; validasi ke RTDB dulu: ruang masih
     ada, masih "main", belum kedaluwarsa, dan uid memang anggota di dalamnya. */
  useEffect(() => {
    let aktif = true;
    void (async () => {
      const sesi = ambilSesiBattle(uid);
      if (!sesi) return;
      const ruang = await ambilRuangSekali(sesi.ruangId);
      const kodeTimKu = ruang ? kodeTimDiRuang(ruang, uid) : null;
      const bisaLanjut =
        ruang &&
        kodeTimKu &&
        ruang.status === "main" &&
        Date.now() - ruang.dibuat < BATAS_LANJUT_RUANG_MENIT * 60_000;
      if (!bisaLanjut) {
        hapusSesiBattle();
        return;
      }
      if (aktif) setSesiLanjut({ ruangId: sesi.ruangId, kodeTim: kodeTimKu });
    })();
    return () => {
      aktif = false;
    };
  }, [uid]);

  /* simpan sesi arena — bekal tombol "Lanjutkan" bila keluar tak sengaja */
  useEffect(() => {
    if (ruangId && kodeTim) simpanSesiBattle({ uid, ruangId, kodeTim });
  }, [uid, ruangId, kodeTim]);

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

  /* salin kode tim ke clipboard supaya mudah dibagikan ke teman. Gagal senyap
     bila API tak tersedia (konteks non-secure / HP lama) — kode tetap terlihat. */
  async function salinKode() {
    if (!kodeTim || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(kodeTim);
      setTersalin(true);
      window.setTimeout(() => setTersalin(false), 2000);
    } catch {
      /* diabaikan */
    }
  }

  function mainLagi() {
    hapusSesiBattle();
    ruangIdRef.current = null;
    setRuangId(null);
    setKodeTim(null);
    setTim(null);
    setKodeInput("");
    setGalat(null);
    setFase("lobi");
  }

  /* masuk kembali ke arena battle yang belum selesai */
  function lanjutkanBattle() {
    if (!sesiLanjut) return;
    // set ref dulu supaya listener tim (node sudah terhapus) tidak menendang ke lobi
    ruangIdRef.current = sesiLanjut.ruangId;
    setRuangId(sesiLanjut.ruangId);
    setKodeTim(sesiLanjut.kodeTim);
    setSesiLanjut(null);
  }

  function abaikanSesi() {
    hapusSesiBattle();
    setSesiLanjut(null);
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
    const timLengkap = jumlahAnggota >= 2;
    return (
      <>
      <LatarArena />
      {/* cegat back browser/HP: keluar ruang tim harus lewat konfirmasi */}
      <KonfirmasiKeluar
        tanpaTombol
        judul="Keluar dari ruang tim?"
        pesan={
          akuKetua
            ? "Kalau kamu keluar, tim akan dibubarkan dan pencarian lawan berhenti."
            : "Kamu akan keluar dari tim ini dan kembali ke lobi."
        }
        labelBatal="Tetap di Tim"
        onKeluar={keluar}
      />
      <main id="konten-utama" className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-3xl text-center mb-6">Ruang Tim ⚔️</h1>

        {/* ── Sorotan 1: kartu kode undangan (bisa disalin sekali ketuk) ── */}
        <section
          aria-label="Kode undangan tim"
          className="relative bg-surface border-4 border-primary rounded-lg px-6 py-6 mb-6 text-center overflow-hidden shadow-[0_6px_0_var(--primary-active)]"
        >
          <span className="block font-display font-extrabold uppercase tracking-[0.2em] text-sm text-primary mb-1">
            Kode Tim
          </span>
          <p
            className="font-display font-extrabold text-5xl sm:text-6xl tracking-[0.28em] leading-none mb-4"
            aria-label={`Kode tim: ${kodeTim.split("").join(" ")}`}
          >
            {kodeTim}
          </p>
          <p className="text-muted font-bold text-sm mb-4">
            Ajak temanmu masuk dengan kode ini
          </p>
          <Button variant={tersalin ? "success" : "accent"} onClick={() => void salinKode()}>
            {tersalin ? "✅ Tersalin!" : "📋 Salin Kode"}
          </Button>
        </section>

        {/* ── Sorotan 2: panel tim (identitas kubu biru) + status kesiapan ── */}
        <section
          aria-label="Anggota tim"
          className="bg-surface border-2 border-border rounded-lg overflow-hidden mb-6 shadow-[0_2px_8px_rgba(16,32,43,0.06)]"
        >
          <div className="flex items-center justify-between gap-3 bg-band-blue px-4 py-3 border-b-2 border-border">
            <span className="font-display font-extrabold text-lg flex items-center gap-2">
              <span aria-hidden="true">🛡️</span> Timmu
            </span>
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-3 py-1",
                "text-sm font-display font-extrabold border-2 bg-surface",
                timLengkap ? "text-success border-success" : "text-muted border-border",
              ].join(" ")}
            >
              {timLengkap ? "Siap Tanding! 💪" : `${jumlahAnggota}/2 pemain`}
            </span>
          </div>

          <ul className="grid grid-cols-2 gap-3 p-4 list-none">
            {Object.entries(tim.anggota ?? {}).map(([id, a]) => {
              const av = getAvatar(a.avatar ?? "");
              const ketua = id === tim.ketua;
              return (
                <li
                  key={id}
                  className="flex flex-col items-center gap-2 rounded-md bg-surface-2 border-2 border-border px-3 py-4"
                >
                  <span className="relative">
                    <span className="w-20 h-20 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-4xl">
                      {a.bot ? (
                        <span aria-hidden="true">🤖</span>
                      ) : av ? (
                        <GambarEmoji src={av.gambar} emoji={av.emoji} className="w-full h-full object-cover" />
                      ) : (
                        <span aria-hidden="true">🙂</span>
                      )}
                    </span>
                    {ketua && (
                      <span
                        className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-accent border-2 border-surface flex items-center justify-center text-sm"
                        title="Ketua tim"
                        aria-hidden="true"
                      >
                        👑
                      </span>
                    )}
                  </span>
                  <span className="font-display font-extrabold text-sm leading-tight text-center">
                    {a.nama}
                  </span>
                  {id === uid ? (
                    <span className="rounded-full bg-primary text-on-primary text-xs font-bold px-2 py-0.5">
                      Kamu
                    </span>
                  ) : ketua ? (
                    <span className="text-xs font-bold text-muted">Ketua tim</span>
                  ) : null}
                </li>
              );
            })}
            {jumlahAnggota < 2 && (
              <li className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border px-3 py-4 min-h-[9rem]">
                <span
                  className="w-20 h-20 rounded-full bg-surface-2 border-2 border-dashed border-border flex items-center justify-center text-3xl text-muted motion-safe:animate-pulse"
                  aria-hidden="true"
                >
                  ?
                </span>
                <span className="font-bold text-sm text-muted text-center">Menunggu teman…</span>
              </li>
            )}
          </ul>
        </section>

        {/* ── Sorotan 3: aksi utama (cari lawan / isi Robo / status) ── */}
        {mencari ? (
          <div className="text-center">
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
            <Button size="lg" fullWidth onClick={cariLawan} disabled={sibuk || jumlahAnggota < 2}>
              Cari Lawan ⚔️
            </Button>
            {jumlahAnggota < 2 && (
              <div className="flex flex-col items-center gap-2 w-full">
                <p className="text-sm font-bold text-muted text-center">
                  Tunggu 1 teman lagi masuk dengan kode di atas, atau…
                </p>
                <Button variant="accent" fullWidth onClick={tambahBot} disabled={sibuk}>
                  🤖 Main dengan Robo
                </Button>
                <p className="text-xs font-bold text-muted text-center">
                  Robo Milo akan mengisi timmu supaya bisa langsung tanding.
                </p>
              </div>
            )}
            <Button variant="ghost" onClick={keluar} disabled={sibuk}>
              Bubarkan Tim
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-bold">Menunggu ketua tim menekan “Cari Lawan”…</p>
            <Button variant="ghost" onClick={keluar} disabled={sibuk}>
              Keluar Tim
            </Button>
          </div>
        )}

        {galat && (
          <p role="alert" className="mt-4 text-danger font-bold text-center">
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
    <main id="konten-utama" className="max-w-xl mx-auto px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between mb-8">
        <TombolKembali href="/home" label="Kembali ke Home" />
        <button
          onClick={() => setBantuanTerbuka(true)}
          aria-label="Cara main"
          className={[
            "shrink-0 w-11 h-11 rounded-full cursor-pointer",
            "flex items-center justify-center font-display font-extrabold text-xl",
            "bg-accent text-on-accent shadow-[0_3px_0_var(--accent-edge)]",
            "transition-[transform,box-shadow,filter] duration-150 ease-out",
            "hover:brightness-95 active:translate-y-[3px] active:shadow-none",
          ].join(" ")}
        >
          ?
        </button>
      </div>

      {/* hero: emblem 2 VS 2 dua kubu (biru vs pink, senada perisai LatarArena) */}
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
        <p className="text-muted font-bold text-lg">Berdua lebih seru!</p>
      </div>

      <div className="grid gap-4">
        <TombolLobi
          utama
          judul="⚡ Main Sekarang!"
          onClick={() => void mainCepat()}
          disabled={sibuk}
        />
        <div className="grid grid-cols-2 gap-4">
          <TombolLobi
            ikon="🛡️"
            judul="Buat Tim"
            onClick={() => void buat()}
            disabled={sibuk}
          />
          <TombolLobi
            ikon="🤝"
            judul="Gabung Tim"
            onClick={() => setFase("gabung")}
            disabled={sibuk}
          />
        </div>
      </div>

      {sibuk && <LoadingSpinner label="Menyiapkan tim…" />}
      {galat && (
        <p role="alert" className="mt-4 text-danger font-bold text-center">
          ⚠️ {galat}
        </p>
      )}

      {/* keluar tak sengaja di tengah battle? tawarkan kembali ke arena */}
      <Modal
        open={Boolean(sesiLanjut)}
        onClose={abaikanSesi}
        title="Battle Belum Selesai! ⚔️"
      >
        <p className="font-bold mb-6">
          Pertandinganmu tadi masih menunggu. Mau lanjut main?
        </p>
        <div className="grid gap-3">
          <Button fullWidth onClick={lanjutkanBattle}>
            Lanjutkan Battle ⚔️
          </Button>
          <Button fullWidth variant="ghost" onClick={abaikanSesi}>
            Tidak, mulai baru
          </Button>
        </div>
      </Modal>

      <Modal
        open={bantuanTerbuka}
        onClose={() => setBantuanTerbuka(false)}
        title="Cara Main ⚔️"
      >
        <ul className="grid gap-4 list-none mb-4">
          <li className="flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden="true">⚡</span>
            <p className="font-bold">
              <span className="font-display font-extrabold">Main Sekarang</span> —
              tanding cepat! Langsung cari lawan; Robo Milo jadi rekan timmu
              kalau belum ada teman.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden="true">🛡️</span>
            <p className="font-bold">
              <span className="font-display font-extrabold">Buat Tim</span> —
              dapatkan kode tim, lalu ajak 1 teman (atau Robo) bergabung.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl shrink-0" aria-hidden="true">🤝</span>
            <p className="font-bold">
              <span className="font-display font-extrabold">Gabung Tim</span> —
              punya kode dari teman? Masukkan kodenya di sana.
            </p>
          </li>
        </ul>
        <p className="font-bold text-muted mb-6">
          Jawab soal gizi bersama temanmu, kalahkan tim lawan, dan menangkan
          kotak misteri! 🎁
        </p>
        <Button fullWidth onClick={() => setBantuanTerbuka(false)}>
          Oke, siap!
        </Button>
      </Modal>
    </main>
    </>
  );
}

/* Kartu aksi lobi sebagai <button> asli supaya bisa diakses keyboard.
   Tanpa teks penjelasan — penjelasan pindah ke modal "Cara Main" (tombol ?).
   utama = CTA "Main Sekarang" (quick match): kartu primary besar selebar grid;
   kartu sekunder (ikon besar + judul) tampil berdampingan dua kolom. */
function TombolLobi({
  judul,
  ikon,
  onClick,
  disabled,
  utama = false,
}: {
  judul: string;
  ikon?: string;
  onClick: () => void;
  disabled: boolean;
  utama?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "text-center rounded-lg border-2 cursor-pointer",
        "transition-[transform,box-shadow,border-color,filter] duration-200 ease-out",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        utama
          ? [
              "bg-primary text-on-primary border-primary px-6 py-7",
              "shadow-[0_5px_0_var(--primary-active)]",
              "hover:-translate-y-1 hover:brightness-105 hover:shadow-[0_12px_26px_rgba(214,51,108,0.35)]",
            ].join(" ")
          : [
              "bg-surface text-fg border-border px-4 py-5",
              "shadow-[0_2px_8px_rgba(16,32,43,0.06)]",
              "hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_20px_rgba(16,32,43,0.12)]",
            ].join(" "),
      ].join(" ")}
    >
      {ikon && (
        <span className="block text-4xl mb-2" aria-hidden="true">
          {ikon}
        </span>
      )}
      <span
        className={[
          "block font-display font-extrabold",
          utama ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
        ].join(" ")}
      >
        {judul}
      </span>
    </button>
  );
}
