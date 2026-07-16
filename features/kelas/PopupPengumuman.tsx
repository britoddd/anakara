"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { useOnline } from "@/features/offline/OnlineContext";
import { ambilPengumuman, type Pengumuman } from "@/features/guru/api";
import DialogPengumuman from "./DialogPengumuman";
import {
  pengumumanBelumDibaca,
  tandaiPengumumanDibaca,
} from "./pengumumanDibaca";

/* Notifikasi pengumuman guru begitu siswa masuk aplikasi (dipasang global di
   layout, di dalam AuthProvider). Muncul di halaman mana pun setelah login dan
   tetap tampil sampai anak menekan tombol tutup. Yang sudah ditutup ditandai
   di localStorage (per user) supaya tak muncul lagi, tapi pengumuman BARU dari
   guru tetap tampil di login berikutnya.

   Hanya untuk siswa yang punya kelas; guru tidak melihat notifikasi ini. */

export default function PopupPengumuman() {
  const { profil, loading } = useAuth();
  const { online } = useOnline();
  const [daftar, setDaftar] = useState<Pengumuman[]>([]);

  const uid = profil?.userId ?? null;
  const kelasId = profil?.role === "siswa" ? profil.kelasId : null;

  useEffect(() => {
    // butuh login sebagai siswa berkelas + koneksi (baca Firestore)
    if (loading || !uid || !kelasId || !online) return;
    let aktif = true;
    ambilPengumuman(kelasId)
      .then((semua) => {
        if (aktif) setDaftar(pengumumanBelumDibaca(uid, semua));
      })
      // gagal baca (mis. offline sesaat / rules) — diam, jangan ganggu anak
      .catch(() => {});
    return () => {
      aktif = false;
    };
  }, [loading, uid, kelasId, online]);

  if (daftar.length === 0) return null;

  const tutup = () => {
    if (uid) tandaiPengumumanDibaca(uid, daftar.map((p) => p.id));
    setDaftar([]);
  };

  return <DialogPengumuman pengumuman={daftar} onTutup={tutup} />;
}
