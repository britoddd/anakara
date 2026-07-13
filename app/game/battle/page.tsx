"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/features/auth/AuthProvider";
import { useOnline } from "@/features/offline/OnlineContext";
import { rutePofil } from "@/features/auth/api";
import GameBattle from "@/features/games/battle/GameBattle";
import BattleOffline from "@/features/games/battle/BattleOffline";

export default function BattlePage() {
  const router = useRouter();
  const { user, profil, loading } = useAuth();
  const { online } = useOnline();

  useEffect(() => {
    if (loading) return;
    if (!user || !profil) router.replace("/");
    else if (rutePofil(profil) !== "/home") router.replace(rutePofil(profil));
  }, [loading, user, profil, router]);

  if (loading || !profil || rutePofil(profil) !== "/home") return <LoadingSpinner />;

  /* Online → matchmaking RTDB (bisa lawan pemain sungguhan). Offline →
     mode lokal lawan Tim Robo tanpa jaringan (2 vs 2 tetap bisa dimainkan). */
  return online ? <GameBattle profil={profil} /> : <BattleOffline profil={profil} />;
}
