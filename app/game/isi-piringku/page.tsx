"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LatarDapur from "@/components/deko/LatarDapur";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/features/auth/AuthProvider";
import { rutePofil } from "@/features/auth/api";
import GameIsiPiringku from "@/features/games/isi-piringku/GameIsiPiringku";

export default function IsiPiringkuPage() {
  const router = useRouter();
  const { user, profil, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (rutePofil(profil) !== "/home") router.replace(rutePofil(profil));
  }, [loading, user, profil, router]);

  if (loading || !profil || rutePofil(profil) !== "/home") return <LoadingSpinner />;

  return (
    <>
      {/* latar dapur: taplak gingham + doodle peralatan masak */}
      <LatarDapur />
      <GameIsiPiringku profil={profil} />
    </>
  );
}
