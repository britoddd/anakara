/* Panduan Home untuk pemain baru — config langkah + penanda localStorage.
   Config-driven: menambah/mengubah langkah cukup di file ini, komponen
   TutorialOverlay tidak perlu disentuh. Penanda per perangkat (seperti
   riwayat main); saat storage gagal dianggap SUDAH lihat supaya panduan
   tidak muncul berulang-ulang di perangkat yang memblokir localStorage. */

export interface LangkahTutorial {
  /** nilai atribut data-tutorial elemen yang disorot; tanpa target = kartu di tengah */
  target?: string;
  judul: string;
  teks: string;
  /** pose Tayo pendamping; fallback emoji bila asset belum ada */
  gambar: string;
  emoji: string;
}

export const LANGKAH_TUTORIAL: LangkahTutorial[] = [
  {
    judul: "Halo! Aku Tayo!",
    teks: "Selamat datang di Anakara! Yuk, kutunjukkan cara bermainnya. Ketuk Lanjut, ya!",
    gambar: "/assets/mascot/tayo-hello.png",
    emoji: "🐆",
  },
  {
    target: "profil",
    judul: "Ini kamu, lho!",
    teks: "Avatar, nama, dan level kamu ada di sini. Ketuk kalau mau ganti avatar.",
    gambar: "/assets/mascot/tayo-happy.png",
    emoji: "😺",
  },
  {
    target: "poin",
    judul: "Bintang poinmu",
    teks: "Setiap selesai bermain kamu dapat bintang. Kumpulkan biar levelmu naik!",
    gambar: "/assets/mascot/tayo-cheer.png",
    emoji: "⭐",
  },
  {
    target: "menu-lain",
    judul: "Kelas, juara & koleksi",
    teks: "Lihat teman sekelasmu, papan juara, dan kartu keren yang sudah kamu kumpulkan.",
    gambar: "/assets/mascot/tayo-happy.png",
    emoji: "🏆",
  },
  {
    target: "game",
    judul: "Ayo main!",
    teks: "Pilih game yang kamu suka, lalu ketuk untuk mulai bermain.",
    gambar: "/assets/mascot/tayo-run.png",
    emoji: "🎮",
  },
  {
    target: "bantuan",
    judul: "Lupa caranya?",
    teks: "Ketuk tombol ? ini kapan saja untuk melihat panduan lagi. Selamat bermain!",
    gambar: "/assets/mascot/tayo-hello.png",
    emoji: "👋",
  },
];

const KEY = "anakara-tutorial-home";

/** sudah pernah lihat panduan? true di server & saat storage gagal (anti-nag) */
export function sudahLihatTutorial(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function tandaiTutorialSelesai() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {}
}
