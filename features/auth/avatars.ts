/* 10 avatar kartun (grid 2×5, mockup MacBook Air - 8).
   PNG asli sudah digenerate via OpenArt (2026-07-07) — urutan nama mengikuti
   isi gambar hasil generate; emoji tetap sebagai fallback kalau file gagal dimuat.
   Catatan: latar gambar putih (bukan transparan) — tampilkan dalam lingkaran. */

export interface AvatarDef {
  id: string;
  nama: string;
  emoji: string;
  gambar: string;
}

export const AVATARS: AvatarDef[] = [
  { id: "avatar-01", nama: "Kucing", emoji: "🐱", gambar: "/assets/avatars/avatar-01.png" },
  { id: "avatar-02", nama: "Kelinci", emoji: "🐰", gambar: "/assets/avatars/avatar-02.png" },
  { id: "avatar-03", nama: "Panda", emoji: "🐼", gambar: "/assets/avatars/avatar-03.png" },
  { id: "avatar-04", nama: "Rubah", emoji: "🦊", gambar: "/assets/avatars/avatar-04.png" },
  { id: "avatar-05", nama: "Beruang", emoji: "🐻", gambar: "/assets/avatars/avatar-05.png" },
  { id: "avatar-06", nama: "Burung Hantu", emoji: "🦉", gambar: "/assets/avatars/avatar-06.png" },
  { id: "avatar-07", nama: "Penguin", emoji: "🐧", gambar: "/assets/avatars/avatar-07.png" },
  { id: "avatar-08", nama: "Katak", emoji: "🐸", gambar: "/assets/avatars/avatar-08.png" },
  { id: "avatar-09", nama: "Koala", emoji: "🐨", gambar: "/assets/avatars/avatar-09.png" },
  { id: "avatar-10", nama: "Anjing", emoji: "🐶", gambar: "/assets/avatars/avatar-10.png" },
];

export function getAvatar(id: string | null): AvatarDef | undefined {
  return AVATARS.find((a) => a.id === id);
}
