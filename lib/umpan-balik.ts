/* Umpan balik multi-indra untuk anak: bunyi + getar (haptik) saat menjawab,
   naik level, dsb. Semua bunyi DISINTESIS lewat Web Audio API — tak ada file
   audio yang perlu diunduh (hemat kuota, aman offline, tak ada aset eksternal).

   Konteks sekolah (D-suara): BUNYI default MATI (kelas berisik kalau 30 anak
   berbunyi bareng); GETAR default NYALA (senyap, hanya terasa di HP Android —
   di-abaikan diam-diam kalau perangkat tak mendukung). Keduanya bisa diubah
   anak di halaman Profil dan disimpan per perangkat (localStorage).

   Bunyi "salah" sengaja lembut & rendah — menyemangati, bukan bel hukuman
   (prinsip desain #4). SSR-safe: semua akses window/AudioContext dijaga. */

const KUNCI_SUARA = "anakara-suara";
const KUNCI_GETAR = "anakara-getar";

/* ---------- preferensi (per perangkat) ---------- */

export function suaraAktif(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KUNCI_SUARA) === "1"; // default MATI
  } catch {
    return false;
  }
}

export function setSuaraAktif(nyala: boolean): void {
  try {
    localStorage.setItem(KUNCI_SUARA, nyala ? "1" : "0");
  } catch {}
}

export function getarAktif(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KUNCI_GETAR) !== "0"; // default NYALA
  } catch {
    return true;
  }
}

export function setGetarAktif(nyala: boolean): void {
  try {
    localStorage.setItem(KUNCI_GETAR, nyala ? "1" : "0");
  } catch {}
}

/** true bila perangkat mendukung getar (Vibration API) — untuk sembunyikan
    tombol getar yang tak berguna (mis. di iPhone / desktop). */
export function getarDidukung(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/* ---------- mesin bunyi (Web Audio) ---------- */

type AudioContextCtor = typeof AudioContext;

let ctx: AudioContext | null = null;
function ambilCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  // browser bisa men-suspend context sampai ada gesture — resume aman dipanggil
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/** Satu nada beramplop (fade in/out cepat) supaya tak ada bunyi "klik". */
function nada(
  freq: number,
  mulaiDetik: number,
  durasi: number,
  puncak = 0.18,
  tipe: OscillatorType = "sine"
): void {
  const c = ambilCtx();
  if (!c) return;
  const t0 = c.currentTime + mulaiDetik;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = tipe;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(puncak, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durasi);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durasi + 0.03);
}

/* ---------- getar (haptik) ---------- */

function getar(pola: number | number[]): void {
  if (!getarAktif() || !getarDidukung()) return;
  try {
    navigator.vibrate(pola);
  } catch {}
}

/* ---------- umpan balik bernama (dipakai game) ---------- */

/** Jawaban benar: dua nada naik yang ceria + getar pendek. */
export function umpanBenar(): void {
  if (suaraAktif()) {
    nada(660, 0, 0.12, 0.18);
    nada(880, 0.09, 0.16, 0.18);
  }
  getar(18);
}

/** Jawaban salah: dua nada rendah turun yang LEMBUT (menyemangati, bukan bel)
    + getar dobel halus. */
export function umpanSalah(): void {
  if (suaraAktif()) {
    nada(300, 0, 0.16, 0.12, "triangle");
    nada(240, 0.12, 0.2, 0.12, "triangle");
  }
  getar([0, 12, 60, 12]);
}

/** Perayaan (lulus level / naik level / rekor baru): arpeggio naik + getar
    pola meriah. */
export function umpanRaya(): void {
  if (suaraAktif()) {
    const nadaRaya = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    nadaRaya.forEach((f, i) => nada(f, i * 0.1, 0.22, 0.16));
  }
  getar([0, 25, 40, 25, 40, 70]);
}

/** Ketuk/sentuh ringan (opsional): klik pendek + getar mikro. */
export function umpanKetuk(): void {
  if (suaraAktif()) nada(1150, 0, 0.05, 0.1);
  getar(8);
}
