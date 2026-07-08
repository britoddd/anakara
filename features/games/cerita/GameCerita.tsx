"use client";

import { useState } from "react";
import type { UserProfile } from "@/features/auth/types";
import BacaCerita from "./BacaCerita";
import CeritaHub from "./CeritaHub";
import { getBab } from "./config";

/* Orkestrator Cerita Interaktif (Phase 7): hub daftar bab ↔ tampilan buku. */
export default function GameCerita({ profil }: { profil: UserProfile }) {
  const [babAktif, setBabAktif] = useState<number | null>(null);
  const bab = babAktif !== null ? getBab(babAktif) : undefined;

  if (babAktif !== null && bab) {
    return (
      <BacaCerita
        bab={bab}
        nomorBab={babAktif}
        profil={profil}
        onKembali={() => setBabAktif(null)}
      />
    );
  }

  return <CeritaHub profil={profil} onBaca={setBabAktif} />;
}
