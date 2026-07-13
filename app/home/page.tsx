"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GarisMarker from "@/components/deko/GarisMarker";
import LatarDoodle from "@/components/deko/LatarDoodle";
import Squiggle from "@/components/deko/Squiggle";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import Modal from "@/components/ui/Modal";
import ProgressBar from "@/components/ui/ProgressBar";
import { useAuth } from "@/features/auth/AuthProvider";
import { logout, rutePofil } from "@/features/auth/api";
import { getAvatar } from "@/features/auth/avatars";
import {
  POIN_PER_LEVEL,
  hitungLevel,
  poinMenujuLevelBerikut,
  type UserProfile,
} from "@/features/auth/types";
import GameCard from "@/features/home/GameCard";
import MenuHamburger from "@/features/home/MenuHamburger";
import { MENU_GAME, MENU_LAIN } from "@/features/home/menu";
import { bacaRiwayat } from "@/features/home/riwayat";
import {
  sudahLihatTutorial,
  tandaiTutorialSelesai,
} from "@/features/home/tutorial";
import TutorialOverlay from "@/features/home/TutorialOverlay";

/* Home Dashboard siswa (Phase 2) — grid bento ala referensi/image.png
   (dashboard PAC-MAN): kartu unggulan besar ("Main lagi" dari riwayat
   perangkat, atau "Mulai di sini" untuk pemain baru) + 4 kartu kecil,
   semua terlihat sekaligus tanpa scroll horizontal. */

/* pesan sapaan Tayo — dirotasi acak tiap kunjungan supaya tak monoton */
const PESAN_TAYO = [
  "Yuk main hari ini~",
  "Ayo lanjutkan petualanganmu!",
  "Kamu pasti bisa, semangat!",
  "Tayo sudah menunggumu, lho!",
];

function salamWaktu(): string {
  const jam = new Date().getHours();
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

/* chip progres per game dari profil.progress — hanya tampil bila sudah maju */
function labelProgres(
  id: string,
  progress: UserProfile["progress"]
): string | undefined {
  if (id === "kuis" && progress.kuis.levelTerbuka >= 2)
    return `⭐ Lv ${progress.kuis.levelTerbuka}`;
  if (id === "cerita" && progress.cerita.babTerbuka >= 2)
    return `📖 Bab ${progress.cerita.babTerbuka}`;
  if (id === "isi-piringku" && progress.isiPiringku.levelTerbuka >= 2)
    return `⭐ Lv ${progress.isiPiringku.levelTerbuka}`;
  return undefined;
}

/* Skeleton seukuran layout asli (bukan spinner) — halaman terasa "terisi",
   bukan menunggu, dan tidak ada lompatan layout saat data tiba. */
function HomeSkeleton() {
  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 w-full"
      aria-busy="true"
      aria-label="Memuat halaman"
    >
      <div className="flex items-center justify-between py-4">
        <div className="skeleton h-12 w-44 rounded-full" />
        <div className="skeleton h-12 w-36 rounded-full" />
      </div>
      <div className="flex items-center gap-4 py-6">
        <div className="skeleton w-20 h-20 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2 max-w-md">
          <div className="skeleton h-7 w-2/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="skeleton col-span-2 lg:row-span-2 min-h-64 rounded-xl" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, profil, loading } = useAuth();
  const [modalKeluar, setModalKeluar] = useState(false);
  /* panduan pemain baru — juga bisa dibuka lagi lewat tombol ? di header */
  const [tutorialTerbuka, setTutorialTerbuka] = useState(false);
  /* key untuk memutar ulang animasi lompat Tayo saat disentuh */
  const [tayoKey, setTayoKey] = useState(0);
  /* dibaca sekali per kunjungan (lazy initializer): aman di server (→ []),
     dan hasilnya baru dirender setelah gerbang loading terbuka di klien */
  const [riwayat] = useState<string[]>(() => bacaRiwayat());
  const [pesan] = useState(
    () => PESAN_TAYO[Math.floor(Math.random() * PESAN_TAYO.length)]
  );
  const [salam] = useState(() => salamWaktu());

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (rutePofil(profil) !== "/home") router.replace(rutePofil(profil));
  }, [loading, user, profil, router]);

  /* pemain baru (per perangkat, seperti riwayat) langsung disambut panduan;
     setelah ditutup tak muncul lagi — sisanya lewat tombol ? */
  useEffect(() => {
    if (loading || !user || !profil || rutePofil(profil) !== "/home") return;
    if (!sudahLihatTutorial()) setTutorialTerbuka(true);
  }, [loading, user, profil]);

  const tutupTutorial = () => {
    tandaiTutorialSelesai();
    setTutorialTerbuka(false);
  };

  if (loading || !profil || rutePofil(profil) !== "/home")
    return <HomeSkeleton />;

  const avatar = getAvatar(profil.avatar);

  /* kartu unggulan: game terakhir dimainkan di perangkat ini; pemain baru
     diarahkan ke game pertama (kurangi kebingungan memilih) */
  const unggulan =
    MENU_GAME.find((g) => g.id === riwayat[0] && g.status === "aktif") ??
    MENU_GAME[0];
  const sisanya = MENU_GAME.filter((g) => g.id !== unggulan.id);
  const pernahMain = riwayat.includes(unggulan.id);
  /* "Baru!" hanya berarti bila sudah ada riwayat — di kunjungan pertama
     semua game baru, badge di mana-mana cuma jadi bising */
  const adaRiwayat = riwayat.length > 0;

  const persenLevel =
    ((profil.poin % POIN_PER_LEVEL) / POIN_PER_LEVEL) * 100;

  return (
    <>
      {/* doodle samar di latar utama (restyle D12) */}
      <LatarDoodle />
      {/* Di layar sempit aksi kanan (?, satelit, keluar) melipat ke satu
          tombol hamburger (MenuHamburger) → header tetap satu baris: chip
          profil di kiri, poin + hamburger di kanan. flex-wrap tinggal jaring
          pengaman kalau nama panggilan sangat panjang. */}
      <header className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-2 px-4 sm:px-6 py-4 max-w-6xl mx-auto w-full">
        {/* chip profil: avatar + nama + badge level (konvensi §4.5) —
            tautan ke /profil untuk ubah nama panggilan & avatar */}
        <Link
          href="/profil"
          aria-label="Buka profilku"
          data-tutorial="profil"
          className="flex items-center gap-2 sm:gap-3 bg-surface border-2 border-border rounded-full pl-1.5 pr-4 py-1.5 no-underline text-fg hover:border-primary hover:-translate-y-0.5 active:scale-95 transition-[transform,border-color] duration-150"
        >
          <span
            className="w-10 h-10 rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center text-xl"
            aria-hidden="true"
          >
            {avatar ? (
              <GambarEmoji
                src={avatar.gambar}
                emoji={avatar.emoji}
                className="w-full h-full object-cover"
              />
            ) : (
              "🙂"
            )}
          </span>
          <span className="font-display font-bold">{profil.nama}</span>
          {/* level = turunan poin (D10), bukan field tersimpan — selalu sinkron */}
          <span className="bg-accent text-on-accent text-sm font-extrabold rounded-full px-2.5 py-0.5">
            Lv {hitungLevel(profil.poin)}
          </span>
        </Link>

        {/* tombol ? di kanan chip profil: buka lagi panduan kapan saja
            (gaya sama dengan tombol Cara Main di lobi battle). Di layar sempit
            aksi ini pindah ke dalam menu hamburger (lihat MenuHamburger). */}
        <button
          onClick={() => setTutorialTerbuka(true)}
          aria-label="Lihat panduan bermain"
          title="Panduan"
          data-tutorial="bantuan"
          className={[
            "hidden sm:flex shrink-0 w-11 h-11 rounded-full cursor-pointer",
            "items-center justify-center font-display font-extrabold text-xl",
            "bg-accent text-on-accent shadow-[0_3px_0_var(--accent-edge)]",
            "transition-[transform,box-shadow,filter] duration-150 ease-out",
            "hover:brightness-95 active:translate-y-[3px] active:shadow-none",
          ].join(" ")}
        >
          ?
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span
            data-tutorial="poin"
            className="font-display font-bold bg-surface border-2 border-border rounded-full px-4 py-2"
          >
            ⭐ {profil.poin}
          </span>
          {/* Desktop (≥ sm): satelit MENU_LAIN + Keluar tampil berjajar.
              Di layar sempit semuanya melipat ke MenuHamburger di bawah supaya
              header tetap satu baris (bukan dua baris yang berdesakan). */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Leaderboard & Koleksi: tombol satelit bulat di samping poin
                (gaya referensi/image.png) — tetap config-driven dari MENU_LAIN.
                Dibungkus satu div agar panduan bisa menyorotnya sekaligus. */}
            <div className="flex items-center gap-2" data-tutorial="menu-lain">
              {MENU_LAIN.map((item) => (
                <Link
                  key={item.id}
                  href={
                    item.status === "segera"
                      ? `/segera-hadir?fitur=${item.id}`
                      : item.href
                  }
                  aria-label={item.judul}
                  title={item.judul}
                  className="w-11 h-11 rounded-full flex items-center justify-center no-underline bg-surface border-2 border-border hover:border-primary hover:-translate-y-0.5 active:scale-95 transition-[transform,border-color] duration-150"
                >
                  {item.gambar ? (
                    <GambarEmoji
                      src={item.gambar}
                      emoji={item.emoji}
                      className="w-7 h-7 object-contain"
                      emojiClassName="text-xl"
                    />
                  ) : (
                    <span className="text-xl" aria-hidden="true">
                      {item.emoji}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            {/* keluar lewat konfirmasi — jempol anak gampang salah pencet */}
            <button
              onClick={() => setModalKeluar(true)}
              aria-label="Keluar dari akun"
              title="Keluar"
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl bg-surface-2 border-2 border-border hover:border-danger active:translate-y-[2px] transition-colors duration-150"
            >
              🚪
            </button>
          </div>

          {/* Layar sempit: satu tombol hamburger melipat Panduan + MENU_LAIN
              + Keluar jadi dropdown (komponen sendiri disembunyikan ≥ sm). */}
          <MenuHamburger
            onPanduan={() => setTutorialTerbuka(true)}
            onKeluar={() => setModalKeluar(true)}
          />
        </div>
      </header>

      <main id="konten-utama" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {/* sapaan Tayo: lompat 3x lalu diam; sentuh untuk menyapanya lagi */}
        <div className="flex items-center gap-4 py-6">
          <button
            type="button"
            onClick={() => setTayoKey((k) => k + 1)}
            aria-label="Sapa Tayo"
            className="shrink-0 rounded-full active:scale-90 transition-transform duration-150"
          >
            <span
              key={tayoKey}
              className="tayo-lompat w-20 h-20 text-5xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center"
              aria-hidden="true"
            >
              <GambarEmoji
                src="/assets/mascot/tayo-hello.png"
                emoji="🐆"
                className="w-full h-full object-cover"
              />
            </span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl">
              {salam}, <GarisMarker>{profil.nama}</GarisMarker>!
            </h1>
            <p className="text-muted font-bold">{pesan}</p>
            {/* kemajuan level sebagai bar (glanceable), bukan kalimat panjang */}
            <div className="mt-2 flex items-center gap-3 max-w-md">
              <ProgressBar
                value={persenLevel}
                label="Kemajuan menuju level berikutnya"
                variant="accent"
              />
              <span className="text-sm font-extrabold whitespace-nowrap">
                ⭐ {poinMenujuLevelBerikut(profil.poin)} → Lv{" "}
                {hitungLevel(profil.poin) + 1}
              </span>
            </div>
          </div>
          <Squiggle className="hidden md:inline-block w-28 shrink-0 mr-4 text-primary rotate-6" />
        </div>

        {/* grid bento kartu game — band hijau pastel (restyle THYNK §C) */}
        <section aria-labelledby="judul-game" data-tutorial="game">
          <h2 id="judul-game" className="text-xl mb-3">
            Ayo Main! 🎮
          </h2>
          <div className="rounded-xl bg-band-green p-3 sm:p-5">
            <ul
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 list-none"
              aria-label="Daftar permainan"
            >
              <li className="col-span-2 lg:row-span-2">
                <GameCard
                  game={unggulan}
                  variant="besar"
                  badge={pernahMain ? "Main lagi ▶" : "Mulai di sini ✨"}
                  progres={labelProgres(unggulan.id, profil.progress)}
                />
              </li>
              {sisanya.map((game) => (
                <li key={game.id}>
                  <GameCard
                    game={game}
                    badge={
                      adaRiwayat &&
                      !riwayat.includes(game.id) &&
                      !labelProgres(game.id, profil.progress)
                        ? "Baru!"
                        : undefined
                    }
                    progres={labelProgres(game.id, profil.progress)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* konfirmasi keluar — cegah logout tak sengaja */}
      <Modal
        open={modalKeluar}
        onClose={() => setModalKeluar(false)}
        title="Mau keluar?"
      >
        <p className="mb-6 font-bold text-muted">
          Kamu bisa masuk lagi kapan saja, kok!
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalKeluar(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              await logout();
              router.replace("/");
            }}
          >
            Ya, keluar
          </Button>
        </div>
      </Modal>

      {/* panduan pemain baru / tombol ? — sorotan mengikuti data-tutorial */}
      <TutorialOverlay open={tutorialTerbuka} onClose={tutupTutorial} />
    </>
  );
}
