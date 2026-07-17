"use client";

import { useEffect, useRef } from "react";
import { kurangiGerak } from "@/lib/gerak";

/* Konfeti perayaan singkat (lulus level / naik level / rekor baru). Canvas
   melayang di atas layar, pointer-events-none (tak menghalangi tombol), dan
   membersihkan diri setelah durasi. Warna diambil dari token tema (serasi
   terang & gelap). Dihormati penuh oleh preferensi "kurangi gerak": bila aktif,
   komponen tak menggambar apa pun. Tanpa file aset — murni digambar. */

export default function Konfetti({
  jumlah = 90,
  durasiMs = 1600,
}: {
  jumlah?: number;
  durasiMs?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (kurangiGerak()) return; // hormati preferensi: tak ada animasi
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pasangUkuran = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    pasangUkuran();

    const gaya = getComputedStyle(document.documentElement);
    const token = (nama: string, fallback: string) =>
      gaya.getPropertyValue(nama).trim() || fallback;
    const warna = [
      token("--primary", "#d6336c"),
      token("--accent", "#ffc93c"),
      token("--success", "#2f7d33"),
      token("--sky", "#8ec9e8"),
      token("--orange", "#ff9f43"),
    ];

    const partikel = Array.from({ length: jumlah }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 6 * dpr,
      vy: (Math.random() * 3 + 2) * dpr,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.3,
      sisi: (Math.random() * 6 + 6) * dpr,
      warna: warna[Math.floor(Math.random() * warna.length)],
      bulat: Math.random() < 0.35,
    }));
    const gravitasi = 0.14 * dpr;

    const mulai = performance.now();
    let raf = 0;
    const gambar = (t: number) => {
      const lewat = t - mulai;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = Math.max(0, 1 - lewat / durasiMs);
      for (const p of partikel) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravitasi;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.warna;
        if (p.bulat) {
          ctx.beginPath();
          ctx.arc(0, 0, p.sisi / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.sisi / 2, -p.sisi / 2, p.sisi, p.sisi * 0.6);
        }
        ctx.restore();
      }
      if (lewat < durasiMs) {
        raf = requestAnimationFrame(gambar);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    raf = requestAnimationFrame(gambar);

    window.addEventListener("resize", pasangUkuran);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", pasangUkuran);
    };
  }, [jumlah, durasiMs]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
}
