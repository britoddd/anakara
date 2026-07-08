import dataKartu from "@/data/kartu-koleksi.json";
import { SEMUA_SOAL, type Soal } from "@/features/games/kuis/config";

/* Aturan Battle 2v2 (Phase 6) + gacha kartu (keputusan D2).
   Soal dipakai ulang dari skema kuis (kontrak §6) — level 1-2 supaya adil. */

export const JUMLAH_SOAL_BATTLE = 5;
export const POIN_PER_BENAR_BATTLE = 5;
export const POIN_DUPLIKAT = 25; // D2: kartu duplikat otomatis jadi poin
/** lama menunggu tim lawan sungguhan sebelum fallback bot (D7) */
export const BATAS_CARI_DETIK = 15;

/* ---------- kartu koleksi & gacha ---------- */

export type Rarity = "biasa" | "langka" | "legenda";

export interface KartuKoleksi {
  id: string;
  nama: string;
  emoji: string;
  rarity: Rarity;
  deskripsi: string;
  gambar: string;
}

interface RarityInfo {
  label: string;
  peluang: number;
  warnaBingkai: string;
}

const data = dataKartu as unknown as {
  rarity: Record<Rarity, RarityInfo>;
  kartu: KartuKoleksi[];
};

export const SEMUA_KARTU = data.kartu;
export const RARITY_INFO = data.rarity;

export function getKartu(id: string): KartuKoleksi | undefined {
  return SEMUA_KARTU.find((k) => k.id === id);
}

/** Gacha D2: Biasa 70% / Langka 25% / Legenda 5%, lalu kartu acak di rarity itu. */
export function gachaKartu(): KartuKoleksi {
  const roll = Math.random();
  const rarity: Rarity =
    roll < RARITY_INFO.legenda.peluang
      ? "legenda"
      : roll < RARITY_INFO.legenda.peluang + RARITY_INFO.langka.peluang
        ? "langka"
        : "biasa";
  const kandidat = SEMUA_KARTU.filter((k) => k.rarity === rarity);
  return kandidat[Math.floor(Math.random() * kandidat.length)];
}

/* ---------- soal battle ---------- */

/** 5 soal acak level 1-2 (level 3 terlalu sulit untuk mode kompetitif). */
export function soalUntukBattle(): Soal[] {
  const pool = SEMUA_SOAL.filter((s) => s.level <= 2);
  const acak = [...pool];
  for (let i = acak.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [acak[i], acak[j]] = [acak[j], acak[i]];
  }
  return acak.slice(0, JUMLAH_SOAL_BATTLE);
}

export function getSoal(id: string): Soal | undefined {
  return SEMUA_SOAL.find((s) => s.id === id);
}

/* ---------- bot (D7 lawan / D8 rekan "Main Sendiri") ---------- */

export const BOT_AKURASI = 0.7; // peluang bot menjawab benar
export const BOT_JEDA_MIN_MS = 4000;
export const BOT_JEDA_MAX_MS = 10000;

const NAMA_BOT = ["Robo Milo", "Robo Bibi", "Robo Kiko", "Robo Nana"];

export function buatBot(indeks: number): { uid: string; nama: string } {
  return {
    uid: `bot-${indeks}-${Math.random().toString(36).slice(2, 8)}`,
    nama: NAMA_BOT[indeks % NAMA_BOT.length],
  };
}

export function adalahBot(uid: string): boolean {
  return uid.startsWith("bot-");
}
