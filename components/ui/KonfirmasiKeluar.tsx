"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import Modal from "./Modal";
import TombolKembali from "./TombolKembali";

/* Konfirmasi keluar untuk halaman yang progresnya bisa hilang (game sedang
   berlangsung, form belum tersimpan). Menjaga TIGA pintu keluar sekaligus:
   1) tombol ← di header — dialog konfirmasi sebelum pindah halaman,
   2) tombol back browser/HP — popstate dicegat lalu dialog yang sama muncul,
   3) tutup tab / refresh — prompt bawaan browser (beforeunload).
   aktif=false → penjaga mati, tombol ← langsung navigasi (halaman aman);
   tanpaTombol → hanya penjaga back/refresh, untuk layar tanpa tombol ←
   (mis. arena battle). Aksi "batal" selalu jadi tombol utama (ramah anak). */

interface DialogKeluarProps {
  terbuka: boolean;
  judul?: string;
  pesan?: string;
  labelKeluar?: string;
  labelBatal?: string;
  onBatal: () => void;
  onKeluar: () => void;
}

/* Bagian dialognya saja — dipakai KonfirmasiKeluar dan galeri /dev/komponen. */
export function DialogKeluar({
  terbuka,
  judul = "Yakin mau keluar?",
  pesan = "Progresmu di sesi ini akan hilang, lho.",
  labelKeluar = "Ya, Keluar",
  labelBatal = "Lanjut Main",
  onBatal,
  onKeluar,
}: DialogKeluarProps) {
  return (
    <Modal open={terbuka} onClose={onBatal} title={judul}>
      <p className="font-bold mb-6">{pesan}</p>
      <div className="flex flex-col sm:flex-row-reverse gap-3">
        <Button fullWidth onClick={onBatal}>
          {labelBatal}
        </Button>
        <Button fullWidth variant="ghost" onClick={onKeluar}>
          {labelKeluar}
        </Button>
      </div>
    </Modal>
  );
}

interface KonfirmasiKeluarProps {
  /** aria-label tombol ← (wajib deskriptif bila tombol tampil) */
  label?: string;
  /** tujuan navigasi saat keluar; kosongkan bila keluar = onKeluar saja */
  href?: string;
  /** dijalankan sebelum navigasi (hentikan suara, keluar tim, dsb.) */
  onKeluar?: () => void | Promise<void>;
  /** false = penjaga mati, tombol ← langsung navigasi (default true) */
  aktif?: boolean;
  judul?: string;
  pesan?: string;
  labelKeluar?: string;
  labelBatal?: string;
  /** true = tanpa tombol ← — hanya cegat back browser/HP & tutup tab */
  tanpaTombol?: boolean;
  overlay?: boolean;
}

export default function KonfirmasiKeluar({
  label = "Keluar",
  href,
  onKeluar,
  aktif = true,
  judul,
  pesan,
  labelKeluar,
  labelBatal,
  tanpaTombol = false,
  overlay = false,
}: KonfirmasiKeluarProps) {
  const router = useRouter();
  const [terbuka, setTerbuka] = useState(false);
  const sedangKeluar = useRef(false);

  useEffect(() => {
    if (!aktif) return;
    // entri riwayat "bantalan": back browser/HP mendarat di sini (halaman
    // yang sama), bukan langsung keluar — lalu dialog konfirmasi muncul
    window.history.pushState(null, "", window.location.href);
    const cegatBack = () => {
      if (sedangKeluar.current) return;
      window.history.pushState(null, "", window.location.href);
      setTerbuka(true);
    };
    const cegatTutup = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Chromium lama butuh ini agar prompt muncul
    };
    window.addEventListener("popstate", cegatBack);
    window.addEventListener("beforeunload", cegatTutup);
    return () => {
      window.removeEventListener("popstate", cegatBack);
      window.removeEventListener("beforeunload", cegatTutup);
    };
  }, [aktif]);

  async function keluar() {
    sedangKeluar.current = true;
    setTerbuka(false);
    try {
      await onKeluar?.();
    } finally {
      if (href) router.push(href);
      sedangKeluar.current = false;
    }
  }

  function klikTombol() {
    if (!aktif) {
      if (href) router.push(href);
      else void onKeluar?.();
      return;
    }
    setTerbuka(true);
  }

  return (
    <>
      {!tanpaTombol && (
        <TombolKembali onClick={klikTombol} label={label} overlay={overlay} />
      )}
      <DialogKeluar
        terbuka={terbuka}
        judul={judul}
        pesan={pesan}
        labelKeluar={labelKeluar}
        labelBatal={labelBatal}
        onBatal={() => setTerbuka(false)}
        onKeluar={() => void keluar()}
      />
    </>
  );
}
