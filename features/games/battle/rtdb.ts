import {
  child,
  get,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  update,
  type Unsubscribe,
} from "firebase/database";
import { getRtdb } from "@/lib/firebase-rtdb";
import type { UserProfile } from "@/features/auth/types";
import {
  BOT_AKURASI,
  BOT_JEDA_MAX_MS,
  BOT_JEDA_MIN_MS,
  JUMLAH_SOAL_BATTLE,
  adalahBot,
  buatBot,
  soalUntukBattle,
} from "./config";
import type {
  AnggotaTim,
  RuangBattle,
  SkorTim,
  TimBattle,
  TimDiRuang,
  WarnaTim,
} from "./types";

/* Operasi Realtime Database untuk Battle 2v2 (Phase 6).
   Arsitektur tanpa server: klien ketua tim menjalankan matchmaking lewat
   transaction pada battle/antrean (aman dari race — pemenang transaction
   yang membuat ruang, tim satunya cukup menunggu ruangId di node timnya).
   Bot (D7/D8) disimulasikan oleh klien pembuat ruang. */

const KARAKTER_KODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa I/O/0/1 (rawan tertukar)

function buatKodeTim(): string {
  let kode = "";
  for (let i = 0; i < 4; i++) {
    kode += KARAKTER_KODE[Math.floor(Math.random() * KARAKTER_KODE.length)];
  }
  return kode;
}

function anggotaDariProfil(profil: UserProfile): AnggotaTim {
  return { nama: profil.nama, avatar: profil.avatar };
}

/* ---------- tim ---------- */

export async function buatTim(
  profil: UserProfile,
  denganBot: boolean
): Promise<string> {
  const db = getRtdb();
  // coba beberapa kode sampai dapat yang belum dipakai
  for (let percobaan = 0; percobaan < 5; percobaan++) {
    const kode = buatKodeTim();
    const timRef = ref(db, `battle/tim/${kode}`);
    const sudahAda = (await get(timRef)).exists();
    if (sudahAda) continue;

    const anggota: Record<string, AnggotaTim> = {
      [profil.userId]: anggotaDariProfil(profil),
    };
    if (denganBot) {
      const bot = buatBot(0);
      anggota[bot.uid] = { nama: bot.nama, avatar: null, bot: true };
    }
    const tim: TimBattle = {
      dibuat: Date.now(),
      status: "kumpul",
      ketua: profil.userId,
      anggota,
    };
    await update(timRef, tim as unknown as Record<string, unknown>);
    // kalau ketua menutup tab sebelum battle mulai, tim dibersihkan otomatis
    onDisconnect(timRef).remove();
    return kode;
  }
  throw new Error("Gagal membuat kode tim. Coba sekali lagi, ya!");
}

export async function gabungTim(
  profil: UserProfile,
  kodeMentah: string
): Promise<string> {
  const kode = kodeMentah.trim().toUpperCase();
  const db = getRtdb();
  const timRef = ref(db, `battle/tim/${kode}`);
  const snap = await get(timRef);
  if (!snap.exists()) {
    throw new Error("Tim tidak ditemukan. Cek lagi kodenya, ya!");
  }
  const tim = snap.val() as TimBattle;
  if (tim.status !== "kumpul") {
    throw new Error("Tim ini sudah mulai bertanding.");
  }
  const jumlah = Object.keys(tim.anggota ?? {}).length;
  if (jumlah >= 2 && !tim.anggota[profil.userId]) {
    throw new Error("Tim sudah penuh (2 orang).");
  }
  const anggotaRef = child(timRef, `anggota/${profil.userId}`);
  await update(anggotaRef, anggotaDariProfil(profil) as unknown as Record<string, unknown>);
  onDisconnect(anggotaRef).remove();
  return kode;
}

export async function keluarTim(kode: string, uid: string): Promise<void> {
  const db = getRtdb();
  const timRef = ref(db, `battle/tim/${kode}`);
  const snap = await get(timRef);
  if (!snap.exists()) return;
  const tim = snap.val() as TimBattle;
  if (tim.ketua === uid) {
    // ketua bubar = tim bubar (anggota lain melihat node hilang → kembali ke lobi)
    await remove(ref(db, `battle/antrean/${kode}`));
    await remove(timRef);
  } else {
    await remove(child(timRef, `anggota/${uid}`));
  }
}

/** Isi slot rekan tim yang masih kosong dengan bot (D8) — dipakai ketua
    "Buat Tim" saat tak ada teman yang bergabung, supaya bisa langsung tanding. */
export async function tambahBotKeTim(kode: string): Promise<void> {
  const db = getRtdb();
  const timRef = ref(db, `battle/tim/${kode}`);
  const snap = await get(timRef);
  if (!snap.exists()) throw new Error("Tim tidak ditemukan.");
  const tim = snap.val() as TimBattle;
  if (Object.keys(tim.anggota ?? {}).length >= 2) {
    throw new Error("Tim sudah penuh (2 orang).");
  }
  const bot = buatBot(0);
  await update(
    child(timRef, `anggota/${bot.uid}`),
    { nama: bot.nama, avatar: null, bot: true } as unknown as Record<string, unknown>
  );
}

export function dengarkanTim(
  kode: string,
  callback: (tim: TimBattle | null) => void
): Unsubscribe {
  return onValue(ref(getRtdb(), `battle/tim/${kode}`), (snap) =>
    callback(snap.exists() ? (snap.val() as TimBattle) : null)
  );
}

export async function setStatusTim(
  kode: string,
  status: TimBattle["status"]
): Promise<void> {
  await update(ref(getRtdb(), `battle/tim/${kode}`), { status });
}

/* ---------- matchmaking (hanya dijalankan ketua tim) ---------- */

/** Notifikasi tiap isi antrean berubah — pemicu ketua mencoba klaim lawan. */
export function dengarkanAntrean(callback: () => void): Unsubscribe {
  return onValue(ref(getRtdb(), "battle/antrean"), () => callback());
}

export async function masukAntrean(kode: string): Promise<void> {
  const db = getRtdb();
  await update(ref(db), {
    [`battle/antrean/${kode}`]: { dibuat: serverTimestamp() },
    [`battle/tim/${kode}/status`]: "mencari",
  });
  onDisconnect(ref(db, `battle/antrean/${kode}`)).remove();
}

/** Coba klaim tim lawan dari antrean. Transaction menjamin hanya satu ketua
    yang berhasil; yang kalah cukup menunggu ruangId ditulis oleh pemenang. */
export async function cobaKlaimLawan(kodeKu: string): Promise<string | null> {
  const db = getRtdb();
  let kodeLawan: string | null = null;
  const hasil = await runTransaction(
    ref(db, "battle/antrean"),
    (antrean: Record<string, { dibuat: number }> | null) => {
      kodeLawan = null;
      if (!antrean || !antrean[kodeKu]) return antrean; // kami sudah diklaim tim lain
      const kandidat = Object.keys(antrean)
        .filter((k) => k !== kodeKu)
        .sort((a, b) => (antrean[a].dibuat ?? 0) - (antrean[b].dibuat ?? 0));
      if (kandidat.length === 0) return antrean;
      kodeLawan = kandidat[0];
      const sisa = { ...antrean };
      delete sisa[kodeKu];
      delete sisa[kodeLawan];
      return sisa;
    }
  );
  return hasil.committed ? kodeLawan : null;
}

export async function keluarAntrean(kode: string): Promise<boolean> {
  // transaction supaya tidak balapan dengan ketua lain yang sedang mengklaim kami
  const hasil = await runTransaction(
    ref(getRtdb(), `battle/antrean/${kode}`),
    (entri) => (entri ? null : entri)
  );
  return hasil.committed;
}

/* ---------- ruang battle ---------- */

async function ambilTimDiRuang(kode: string): Promise<TimDiRuang> {
  const snap = await get(ref(getRtdb(), `battle/tim/${kode}`));
  const tim = snap.val() as TimBattle;
  return { kode, anggota: tim.anggota };
}

/** Buat ruang untuk dua tim; tulis ruangId ke kedua node tim (sinyal pindah arena). */
export async function buatRuang(
  uidPembuat: string,
  kodeBiru: string,
  timMerah: TimDiRuang,
  kodeMerahAsli?: string
): Promise<string> {
  const db = getRtdb();
  const timBiru = await ambilTimDiRuang(kodeBiru);
  const ruangRef = push(ref(db, "battle/ruang"));
  const ruang: RuangBattle = {
    dibuat: Date.now(),
    status: "main",
    pembuat: uidPembuat,
    soalIds: soalUntukBattle().map((s) => s.id),
    tim: { biru: timBiru, merah: timMerah },
  };
  const tulis: Record<string, unknown> = {
    [`battle/ruang/${ruangRef.key}`]: ruang,
    [`battle/tim/${kodeBiru}/ruangId`]: ruangRef.key,
    [`battle/tim/${kodeBiru}/status`]: "main",
  };
  if (kodeMerahAsli) {
    tulis[`battle/tim/${kodeMerahAsli}/ruangId`] = ruangRef.key;
    tulis[`battle/tim/${kodeMerahAsli}/status`] = "main";
  }
  await update(ref(db), tulis);
  return ruangRef.key as string;
}

export async function buatRuangLawanKode(
  uidPembuat: string,
  kodeKu: string,
  kodeLawan: string
): Promise<string> {
  const timLawan = await ambilTimDiRuang(kodeLawan);
  return buatRuang(uidPembuat, kodeKu, timLawan, kodeLawan);
}

/** Fallback D7: lawan = tim bot penuh. */
export async function buatRuangLawanBot(
  uidPembuat: string,
  kodeKu: string
): Promise<string> {
  const bot1 = buatBot(1);
  const bot2 = buatBot(2);
  const timBot: TimDiRuang = {
    kode: "ROBO",
    anggota: {
      [bot1.uid]: { nama: bot1.nama, avatar: null, bot: true },
      [bot2.uid]: { nama: bot2.nama, avatar: null, bot: true },
    },
  };
  return buatRuang(uidPembuat, kodeKu, timBot);
}

export function dengarkanRuang(
  ruangId: string,
  callback: (ruang: RuangBattle | null) => void
): Unsubscribe {
  return onValue(ref(getRtdb(), `battle/ruang/${ruangId}`), (snap) =>
    callback(snap.exists() ? (snap.val() as RuangBattle) : null)
  );
}

export async function tulisJawaban(
  ruangId: string,
  uid: string,
  indexSoal: number,
  benar: boolean
): Promise<void> {
  await update(ref(getRtdb(), `battle/ruang/${ruangId}/jawaban/${uid}`), {
    [indexSoal]: benar,
  });
}

export async function tandaiSelesai(ruangId: string, uid: string): Promise<void> {
  await update(ref(getRtdb(), `battle/ruang/${ruangId}/selesai`), {
    [uid]: serverTimestamp() as unknown as number,
  });
}

export async function tandaiRuangSelesai(ruangId: string): Promise<void> {
  await update(ref(getRtdb(), `battle/ruang/${ruangId}`), { status: "selesai" });
}

/** Setelah battle selesai, tim tidak dipakai lagi — bersihkan node-nya. */
export async function bersihkanTim(kode: string): Promise<void> {
  if (kode === "ROBO") return;
  await remove(ref(getRtdb(), `battle/tim/${kode}`));
}

/* ---------- skor ---------- */

export function hitungSkorTim(ruang: RuangBattle, warna: WarnaTim): SkorTim {
  const anggota = Object.keys(ruang.tim[warna].anggota ?? {});
  let benar = 0;
  let terjawab = 0;
  let selesaiPada = 0;
  let jumlahSelesai = 0;
  for (const uid of anggota) {
    const jawaban = ruang.jawaban?.[uid] ?? {};
    for (const nilai of Object.values(jawaban)) {
      terjawab += 1;
      if (nilai) benar += 1;
    }
    const ts = ruang.selesai?.[uid];
    if (ts) {
      jumlahSelesai += 1;
      selesaiPada = Math.max(selesaiPada, ts);
    }
  }
  return {
    benar,
    terjawab,
    totalSoal: anggota.length * JUMLAH_SOAL_BATTLE,
    semuaSelesai: jumlahSelesai === anggota.length,
    selesaiPada,
  };
}

/** "biru" | "merah" | "seri" — terbanyak benar; seri → tercepat selesai; tetap sama → seri. */
export function tentukanPemenang(ruang: RuangBattle): WarnaTim | "seri" {
  const biru = hitungSkorTim(ruang, "biru");
  const merah = hitungSkorTim(ruang, "merah");
  if (biru.benar !== merah.benar) return biru.benar > merah.benar ? "biru" : "merah";
  if (biru.selesaiPada !== merah.selesaiPada) {
    return biru.selesaiPada < merah.selesaiPada ? "biru" : "merah";
  }
  return "seri";
}

/* ---------- driver bot (dijalankan HANYA oleh klien pembuat ruang) ---------- */

/** Simulasikan semua bot di ruang: tiap soal dijawab dengan jeda acak dan
    akurasi ~70%. Return fungsi stop untuk cleanup effect. */
export function jalankanBot(ruangId: string, ruang: RuangBattle): () => void {
  let berhenti = false;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const semuaBot = (["biru", "merah"] as const).flatMap((warna) =>
    Object.keys(ruang.tim[warna].anggota ?? {}).filter(adalahBot)
  );

  for (const uid of semuaBot) {
    const jawabSoal = (index: number) => {
      if (berhenti) return;
      if (index >= JUMLAH_SOAL_BATTLE) {
        void tandaiSelesai(ruangId, uid);
        return;
      }
      const jeda =
        BOT_JEDA_MIN_MS + Math.random() * (BOT_JEDA_MAX_MS - BOT_JEDA_MIN_MS);
      timeouts.push(
        setTimeout(() => {
          if (berhenti) return;
          void tulisJawaban(ruangId, uid, index, Math.random() < BOT_AKURASI);
          jawabSoal(index + 1);
        }, jeda)
      );
    };
    jawabSoal(0);
  }

  return () => {
    berhenti = true;
    timeouts.forEach(clearTimeout);
  };
}
