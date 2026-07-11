"use client";

import { useState } from "react";
import AwanPikiran from "@/components/deko/AwanPikiran";
import BlobMata from "@/components/deko/BlobMata";
import GarisMarker from "@/components/deko/GarisMarker";
import LatarDapur from "@/components/deko/LatarDapur";
import LatarDoodle from "@/components/deko/LatarDoodle";
import Squiggle from "@/components/deko/Squiggle";
import TepiGelombang from "@/components/deko/TepiGelombang";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ProgressBar from "@/components/ui/ProgressBar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import TombolKembali from "@/components/ui/TombolKembali";
import GameCard from "@/features/home/GameCard";
import { MENU_GAME } from "@/features/home/menu";

/* Galeri dev untuk test manual komponen Phase 0 di dua tema.
   Bukan bagian produk — jangan ditautkan dari halaman siswa. */
export default function KomponenPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [progress, setProgress] = useState(60);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <TombolKembali href="/" label="Kembali ke halaman awal" />
        <ThemeToggle />
      </header>

      <main id="konten-utama" className="max-w-5xl mx-auto px-6 pb-24 flex flex-col gap-12">
        <h1 className="text-3xl">Galeri Komponen (Phase 0)</h1>

        <section aria-labelledby="h-button" className="flex flex-col gap-4">
          <h2 id="h-button" className="text-xl">
            Button — efek pop saat ditekan
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button>Lanjut</Button>
            <Button variant="accent">⭐ Main Lagi</Button>
            <Button variant="success">✓ Benar!</Button>
            <Button variant="ghost">Sebelumnya</Button>
            <Button variant="danger">Keluar</Button>
            <Button disabled>Terkunci 🔒</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg">Mulai Petualangan! 🚀</Button>
          </div>
        </section>

        <section aria-labelledby="h-card" className="flex flex-col gap-4">
          <h2 id="h-card" className="text-xl">
            Card
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <h3 className="text-lg mb-2">Kartu biasa</h3>
              <p className="text-muted">
                Panel konten statis: teks, gambar, hasil skor.
              </p>
            </Card>
            <Card interactive tabIndex={0} role="button" aria-label="Contoh kartu interaktif">
              <h3 className="text-lg mb-2">Kartu interaktif 🎮</h3>
              <p className="text-muted">
                Hover: naik + border biru. Dipakai untuk menu game di Home.
              </p>
            </Card>
          </div>
        </section>

        <section aria-labelledby="h-modal" className="flex flex-col gap-4">
          <h2 id="h-modal" className="text-xl">
            Modal
          </h2>
          <div>
            <Button onClick={() => setModalOpen(true)}>Buka Modal</Button>
          </div>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Hebat! 🎉"
          >
            <p className="mb-6">
              Kamu berhasil menyelesaikan level ini. Tayo bangga padamu!
            </p>
            <Button fullWidth onClick={() => setModalOpen(false)}>
              Lanjut
            </Button>
          </Modal>
        </section>

        <section aria-labelledby="h-spinner" className="flex flex-col gap-4">
          <h2 id="h-spinner" className="text-xl">
            LoadingSpinner — Tayo placeholder
          </h2>
          <Card>
            <LoadingSpinner />
          </Card>
        </section>

        <section aria-labelledby="h-progress" className="flex flex-col gap-4">
          <h2 id="h-progress" className="text-xl">
            ProgressBar
          </h2>
          <Card className="flex flex-col gap-6">
            <ProgressBar value={progress} label="Kemajuan contoh" showValue />
            <ProgressBar value={100} label="Level selesai" variant="success" showValue />
            <ProgressBar value={35} label="Bintang terkumpul" variant="accent" showValue />
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setProgress((p) => Math.max(0, p - 10))}
              >
                −10
              </Button>
              <Button
                variant="ghost"
                onClick={() => setProgress((p) => Math.min(100, p + 10))}
              >
                +10
              </Button>
            </div>
          </Card>
        </section>

        <section aria-labelledby="h-gamecard" className="flex flex-col gap-4">
          <h2 id="h-gamecard" className="text-xl">
            GameCard — grid bento Home (unggulan besar + kecil, badge & progres)
          </h2>
          <div className="rounded-xl bg-band-green p-3 sm:p-5">
            <ul
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 list-none"
              aria-label="Contoh kartu game"
            >
              <li className="col-span-2 lg:row-span-2">
                <GameCard
                  game={MENU_GAME[0]}
                  variant="besar"
                  badge="Main lagi ▶"
                  progres="⭐ Lv 2"
                />
              </li>
              {MENU_GAME.slice(1).map((game, i) => (
                <li key={game.id}>
                  <GameCard
                    game={game}
                    badge={i === 0 ? "Baru!" : undefined}
                    progres={i === 1 ? "📖 Bab 3" : undefined}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="h-deko" className="flex flex-col gap-4">
          <h2 id="h-deko" className="text-xl">
            Dekorasi restyle THYNK — <GarisMarker>GarisMarker</GarisMarker>, blob,
            squiggle, awan, chip
          </h2>
          <Card className="flex flex-wrap items-end gap-6">
            <BlobMata bentuk="cipratan" className="w-24 text-primary" />
            <BlobMata bentuk="bunga" className="w-24 text-accent" />
            <BlobMata bentuk="gumpal" className="w-24 text-green-bright" />
            <Squiggle className="w-28 text-primary" />
            <span className="bg-band-blue rounded-xl p-3 inline-flex">
              <AwanPikiran className="w-20 text-white" />
            </span>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Chip emoji="💗" warna="pink">Emosi</Chip>
            <Chip emoji="🥦" warna="hijau">Makanan Sehat</Chip>
            <Chip emoji="💧" warna="biru">Minum Air</Chip>
            <Chip emoji="⭐" warna="kuning">120 poin</Chip>
            <Chip emoji="🏫">Kelasku</Chip>
          </div>
          <div>
            <div className="rounded-t-xl bg-band-pink p-6 text-center font-bold">
              band-pink … lalu TepiGelombang di bawahnya
            </div>
            <TepiGelombang arah="bawah" className="text-band-pink" />
          </div>
          <div className="relative isolate h-72 rounded-xl border-2 border-border overflow-hidden">
            <LatarDoodle tetap={false} />
            <p className="relative p-6 font-bold text-muted">
              LatarDoodle — lapisan doodle samar di belakang konten (dipakai di
              latar Home; bentuk polos tanpa wajah, warna band-*).
            </p>
          </div>
          <div className="relative isolate h-96 rounded-xl border-2 border-border overflow-hidden">
            <LatarDapur tetap={false} />
            <p className="relative p-6 font-bold text-muted">
              LatarDapur — latar game Isi Piringku: doodle dapur di dinding +
              taplak meja gingham dengan renda (warna token, aman dua tema).
            </p>
          </div>
        </section>

        <section aria-labelledby="h-skeleton" className="flex flex-col gap-4">
          <h2 id="h-skeleton" className="text-xl">
            Skeleton (status memuat region data)
          </h2>
          <Card className="flex flex-col gap-3" aria-hidden="true">
            <div className="skeleton h-6 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </Card>
        </section>
      </main>
    </>
  );
}
