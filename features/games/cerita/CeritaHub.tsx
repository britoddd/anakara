"use client";

import Link from "next/link";
import AwanPikiran from "@/components/deko/AwanPikiran";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import TombolKembali from "@/components/ui/TombolKembali";
import type { UserProfile } from "@/features/auth/types";
import { SEMUA_KARTU } from "@/features/games/battle/config";
import { BAB_LIST, SUB_MODE } from "./config";

/* Hub Mode Cerita (mockup MacBook Air - 2): sidebar sub-mode (D3: hanya
   Petualangan aktif) + daftar bab. Bab yang belum ada/terkunci tampil
   redup + 🔒 dengan syarat jelas (konvensi §4.5). */

interface CeritaHubProps {
  profil: UserProfile;
  onBaca: (nomorBab: number) => void;
}

export default function CeritaHub({ profil, onBaca }: CeritaHubProps) {
  const babTerbuka = profil.progress.cerita.babTerbuka;

  return (
    <main
      id="konten-utama"
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-8"
    >
      {/* ---------- sidebar sub-mode ---------- */}
      <aside aria-label="Sub-mode cerita" className="mb-6 lg:mb-0">
        <div className="flex items-center gap-3 mb-4">
          <TombolKembali href="/home" label="Kembali ke Home" />
          <h1 className="text-xl lg:text-2xl">Mode Cerita</h1>
        </div>

        <nav aria-label="Pilihan mode">
          <ul className="flex lg:flex-col gap-2 overflow-x-auto list-none pb-1">
            {SUB_MODE.map((m) =>
              m.aktif ? (
                <li key={m.id} className="shrink-0">
                  <span
                    aria-current="page"
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-display font-bold bg-primary text-on-primary"
                  >
                    <span aria-hidden="true">{m.emoji}</span> {m.judul}
                  </span>
                </li>
              ) : (
                <li key={m.id} className="shrink-0">
                  <Link
                    href={`/segera-hadir?fitur=${m.id}`}
                    className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-display font-bold no-underline text-muted bg-surface border-2 border-border hover:border-primary"
                  >
                    <span aria-hidden="true" className="grayscale">
                      {m.emoji}
                    </span>
                    {m.judul} <span aria-label="terkunci">🔒</span>
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        {/* koleksi kartu — counter asli dari profil, tautan ke album Phase 8 */}
        <Link
          href="/koleksi"
          className="mt-4 hidden lg:flex items-center gap-3 bg-surface border-2 border-border rounded-lg px-4 py-3 no-underline text-fg hover:border-primary"
        >
          <span className="text-2xl" aria-hidden="true">
            🃏
          </span>
          <span className="font-bold text-sm">
            Koleksi Kartu
            <span className="block font-display font-extrabold text-lg">
              {profil.koleksi.length}/{SEMUA_KARTU.length}
            </span>
          </span>
        </Link>
      </aside>

      {/* ---------- daftar bab ---------- */}
      <section aria-labelledby="judul-daftar">
        <h2 id="judul-daftar" className="text-xl mb-4">
          Petualangan 🗺️
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 list-none">
          {BAB_LIST.map((bab, i) => {
            const nomor = i + 1;
            const terkunci = nomor > babTerbuka;
            const selesaiDibaca = babTerbuka > nomor;
            return (
              <li key={bab.id}>
                <article
                  className={[
                    "bg-surface border-2 border-border rounded-lg overflow-hidden h-full flex flex-col",
                    terkunci ? "opacity-70" : "",
                  ].join(" ")}
                >
                  <div
                    className={`relative aspect-[16/9] bg-band-green flex items-center justify-center ${terkunci ? "grayscale" : ""}`}
                  >
                    <AwanPikiran className="absolute top-2 right-3 w-12 text-white/80" />
                    <GambarEmoji
                      src={bab.cover}
                      emoji="🐆🧺🐰"
                      className="absolute inset-0 w-full h-full object-cover"
                      emojiClassName="text-5xl tracking-widest"
                    />
                    {selesaiDibaca && (
                      <span className="absolute top-2 right-2 bg-success text-on-success text-xs font-bold rounded-full px-3 py-1">
                        ✓ Selesai
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="font-display font-extrabold text-lg">
                      Bab {nomor}: {bab.judul}
                    </h3>
                    <p className="text-muted font-bold text-sm flex-1">{bab.deskripsi}</p>
                    <p className="text-xs font-bold text-muted">
                      {bab.halaman.length} halaman ·{" "}
                      {bab.halaman.filter((h) => h.tipe === "pertanyaan").length} pertanyaan
                    </p>
                    {/* konvensi §4.5: syarat unlock ditulis jelas, bukan sekadar gembok */}
                    <Button onClick={() => onBaca(nomor)} disabled={terkunci}>
                      {terkunci
                        ? `🔒 Selesaikan Bab ${nomor - 1} dulu`
                        : selesaiDibaca
                          ? "Baca Lagi 📖"
                          : "Baca Cerita 📖"}
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}

          {/* bab berikutnya — belum dibuat, tampil terkunci dengan syarat jelas */}
          <li>
            <article className="bg-surface border-2 border-dashed border-border rounded-lg overflow-hidden h-full flex flex-col opacity-70">
              <div className="aspect-[16/9] bg-surface-2 flex items-center justify-center grayscale">
                <span className="text-5xl" aria-hidden="true">
                  📖✨
                </span>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-display font-extrabold text-lg">
                  Bab {BAB_LIST.length + 1}: Segera Hadir
                </h3>
                <p className="text-muted font-bold text-sm flex-1">
                  Petualangan Tayo berikutnya sedang ditulis. Tunggu ya!
                </p>
                <Button disabled>🔒 Segera Hadir</Button>
              </div>
            </article>
          </li>
        </ul>
      </section>
    </main>
  );
}
