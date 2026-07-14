"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LatarDoodle from "@/components/deko/LatarDoodle";
import TepiGelombang from "@/components/deko/TepiGelombang";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/features/auth/AuthProvider";
import { logout } from "@/features/auth/api";
import DashboardGuru from "@/features/guru/DashboardGuru";

/* Teacher Dashboard (Phase 10) — kelola kelas + bank soal custom. */

export default function GuruPage() {
  const router = useRouter();
  const { user, profil, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (profil.role !== "guru") router.replace("/home");
  }, [loading, user, profil, router]);

  if (loading || !profil || profil.role !== "guru") return <LoadingSpinner />;

  return (
    <>
      {/* doodle samar di latar — seragam dengan Home & Profil (restyle D12) */}
      <LatarDoodle />
      {/* header band biru pastel (restyle THYNK §C) */}
      <div className="bg-band-blue">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 max-w-5xl mx-auto w-full">
          <span className="font-display font-extrabold text-lg">
            🐆 Anakara · Dashboard Guru
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={async () => {
                await logout();
                router.replace("/");
              }}
              aria-label="Keluar dari akun"
              title="Keluar"
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl bg-surface-2 border-2 border-border hover:border-danger active:translate-y-[2px] transition-colors duration-150"
            >
              🚪
            </button>
          </div>
        </header>
      </div>
      <TepiGelombang arah="bawah" className="text-band-blue" />

      <DashboardGuru profil={profil} />
    </>
  );
}
