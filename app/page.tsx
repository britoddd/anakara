"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BlobMata from "@/components/deko/BlobMata";
import GarisMarker from "@/components/deko/GarisMarker";
import TepiGelombang from "@/components/deko/TepiGelombang";
import Button from "@/components/ui/Button";
import Footer from "@/components/ui/Footer";
import GambarEmoji from "@/components/ui/GambarEmoji";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/features/auth/AuthProvider";
import { useOnline } from "@/features/offline/OnlineContext";
import { rutePofil } from "@/features/auth/api";
import type { Role } from "@/features/auth/types";

/* Landing & Role Selection (Phase 1) — mockup MacBook Air - 1:
   dua kartu besar, terpilih = border tebal, lalu tombol Lanjut.
   Restyle THYNK: hero krem + doodle, kartu peran di band pink pastel. */

const PERAN: { id: Role; label: string; emoji: string; deskripsi: string }[] = [
  { id: "siswa", label: "Siswa", emoji: "🎒", deskripsi: "Aku mau belajar dan bermain!" },
  { id: "guru", label: "Guru", emoji: "📚", deskripsi: "Saya mengelola kelas" },
];

export default function LandingPage() {
  const router = useRouter();
  const { profil, loading } = useAuth();
  const { mintaOnline } = useOnline();
  const [pilihan, setPilihan] = useState<Role | null>(null);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <span className="flex items-center gap-2 font-display font-extrabold text-lg">
          <span className="w-8 h-8 flex items-center justify-center text-xl" aria-hidden="true">
            <GambarEmoji
              src="/assets/logo.png"
              emoji="🐆"
              className="w-full h-full object-contain"
              emojiClassName="text-xl"
            />
          </span>
          Anakara
        </span>
        <ThemeToggle />
      </header>

      <main id="konten-utama" className="text-center">
        <section className="relative max-w-4xl mx-auto px-6 pt-8 sm:pt-10 pb-10">
          {/* doodle "teman-teman" — dekoratif, jauh dari touch target */}
          <BlobMata
            bentuk="cipratan"
            className="hidden sm:inline-block absolute left-8 top-4 w-20 text-primary -rotate-12"
          />
          <BlobMata
            bentuk="bunga"
            className="hidden sm:inline-block absolute right-8 top-14 w-16 text-accent rotate-6"
          />
          <p className="text-6xl mb-4 motion-safe:animate-bounce" aria-hidden="true">
            🐆
          </p>
          <h1 className="text-3xl mb-2">
            Selamat datang di <GarisMarker>Anakara</GarisMarker>
          </h1>
          <p className="text-lg text-muted">Kamu siapa? Pilih dulu, ya!</p>
        </section>

        {/* band pink pastel berisi pilihan peran (§C) */}
        <TepiGelombang arah="atas" className="text-band-pink" />
        <section className="bg-band-pink px-6 py-10">
          <div
            role="radiogroup"
            aria-label="Pilih peran"
            className="grid gap-6 sm:grid-cols-2 max-w-xl mx-auto mb-10"
          >
            {PERAN.map((p) => {
              const aktif = pilihan === p.id;
              return (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={aktif}
                  onClick={() => setPilihan(p.id)}
                  className={[
                    "flex flex-col items-center gap-3 p-8 rounded-xl bg-surface",
                    "transition-[transform,border-color,box-shadow] duration-150 ease-out",
                    "hover:-translate-y-1 cursor-pointer",
                    aktif
                      ? "border-4 border-primary shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
                      : "border-4 border-border",
                  ].join(" ")}
                >
                  <span className="text-6xl" aria-hidden="true">
                    {p.emoji}
                  </span>
                  <span className="font-display font-extrabold text-xl">{p.label}</span>
                  <span className="text-sm text-muted">{p.deskripsi}</span>
                  {/* status tak hanya lewat warna: tanda centang saat terpilih */}
                  <span
                    className={`text-sm font-bold ${aktif ? "text-link" : "invisible"}`}
                  >
                    ✓ Dipilih
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            size="lg"
            disabled={!pilihan}
            onClick={() => {
              // masuk/daftar butuh internet (login Google) — tahan saat offline
              if (!mintaOnline("Masuk ke Anakara butuh internet. Sambungkan dulu, ya!"))
                return;
              router.push(`/masuk?peran=${pilihan}`);
            }}
          >
            Lanjut
          </Button>

          {/* Sudah pernah login → jalan pintas melanjutkan sesi */}
          {!loading && profil && (
            <p className="mt-8 text-sm text-muted">
              Sudah masuk sebagai <strong>{profil.nama}</strong>.{" "}
              <button
                onClick={() => router.push(rutePofil(profil))}
                className="text-link font-bold underline"
              >
                Lanjutkan →
              </button>
            </p>
          )}
        </section>
        <TepiGelombang arah="bawah" className="text-band-pink" />
      </main>

      <Footer />
    </>
  );
}
