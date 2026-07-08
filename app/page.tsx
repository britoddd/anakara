"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/features/auth/AuthProvider";
import { rutePofil } from "@/features/auth/api";
import type { Role } from "@/features/auth/types";

/* Landing & Role Selection (Phase 1) — mockup MacBook Air - 1:
   dua kartu besar, terpilih = border biru tebal, lalu tombol Lanjut. */

const PERAN: { id: Role; label: string; emoji: string; deskripsi: string }[] = [
  { id: "siswa", label: "Siswa", emoji: "🎒", deskripsi: "Aku mau belajar dan bermain!" },
  { id: "guru", label: "Guru", emoji: "📚", deskripsi: "Saya mengelola kelas" },
];

export default function LandingPage() {
  const router = useRouter();
  const { profil, loading } = useAuth();
  const [pilihan, setPilihan] = useState<Role | null>(null);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <span className="font-display font-extrabold text-lg" aria-hidden="true">
          🐆 Anakara
        </span>
        <ThemeToggle />
      </header>

      <main id="konten-utama" className="max-w-4xl mx-auto px-6 py-8 sm:py-12 text-center">
        <p className="text-6xl mb-4 motion-safe:animate-bounce" aria-hidden="true">
          🐆
        </p>
        <h1 className="text-3xl mb-2">
          Selamat datang di <span className="text-primary">Anakara</span>
        </h1>
        <p className="text-lg text-muted mb-10">Kamu siapa? Pilih dulu, ya!</p>

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
                    ? "border-4 border-primary shadow-[0_8px_20px_rgba(10,114,176,0.2)]"
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
                  className={`text-sm font-bold ${aktif ? "text-primary" : "invisible"}`}
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
          onClick={() => router.push(`/masuk?peran=${pilihan}`)}
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
      </main>

      <footer className="text-center text-sm text-muted py-8">
        Anakara — Fase A Learning Platform
      </footer>
    </>
  );
}
