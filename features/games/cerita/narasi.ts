/* Narasi suara (Phase 7 — jawaban klarifikasi: narasi = YA, untuk anak yang
   belum lancar membaca). Strategi dua lapis:
   1. Putar file audio dari data (mis. /assets/audio/bab1/hal-01.mp3) kalau ada.
   2. File belum direkam → fallback Web Speech API (speechSynthesis) bahasa
      Indonesia, bawaan browser — tanpa asset, tanpa biaya.
   Semua fungsi aman dipanggil di klien saja ("use client"). */

let audioAktif: HTMLAudioElement | null = null;

export function hentikanNarasi(): void {
  if (audioAktif) {
    audioAktif.pause();
    audioAktif = null;
  }
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

function bacakanTeks(teks: string): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  const ucapan = new SpeechSynthesisUtterance(teks);
  const suaraId = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang?.toLowerCase().startsWith("id"));
  if (suaraId) ucapan.voice = suaraId;
  ucapan.lang = "id-ID";
  ucapan.rate = 0.95; // sedikit lebih pelan untuk anak kelas 1-2
  ucapan.pitch = 1.05;
  window.speechSynthesis.speak(ucapan);
  return true;
}

/** Putar narasi halaman: coba file audio dulu, gagal (404/belum ada) → TTS.
    Return false hanya kalau kedua jalur tidak tersedia. */
export function putarNarasi(audioSrc: string | undefined, teks: string): boolean {
  hentikanNarasi();
  if (audioSrc && typeof Audio !== "undefined") {
    const audio = new Audio(audioSrc);
    audioAktif = audio;
    audio.play().catch(() => {
      // file belum ada / gagal decode → jatuh ke TTS (kalau masih narasi ini)
      if (audioAktif === audio) {
        audioAktif = null;
        bacakanTeks(teks);
      }
    });
    return true;
  }
  return bacakanTeks(teks);
}
