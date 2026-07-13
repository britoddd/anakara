"use client";

import { useEffect, useRef, useState } from "react";
import TombolKembali from "@/components/ui/TombolKembali";
import type { UserProfile } from "@/features/auth/types";
import { setLikeVideo } from "./api";
import dataVideo from "@/data/video.json";

/* Feed video vertikal gaya Reels (Phase 4).
   - Swipe/scroll vertikal dengan snap per video; autoplay saat terlihat, pause saat lewat.
   - SEMUA konten internal (data/video.json) — tanpa embed/rekomendasi eksternal (aman anak).
   - Reaksi hanya tombol suka ⭐ per user, tanpa komentar.
   - File .mp4 masih placeholder → slide menampilkan panel "sedang disiapkan"
     dan otomatis memutar video asli begitu filenya ada di public/assets/videos/.
   Pengecualian sadar aturan A2: penonton video berlatar gelap (standar pemutar,
   konten = area cinematic); teks putih di atas overlay gelap tetap kontras AA. */

interface VideoItem {
  id: string;
  judul: string;
  kategori: string;
  durasiDetik: number;
  thumbnail: string;
  url: string;
  status: string;
}

const DAFTAR_VIDEO = (dataVideo as { video: VideoItem[] }).video;

const EMOJI_KATEGORI: Record<string, string> = {
  "Makanan Sehat": "🍎",
  "Kebiasaan Baik": "🪥",
  Olahraga: "🤸",
};

export default function VideoFeed({ profil }: { profil: UserProfile }) {
  const [indexAktif, setIndexAktif] = useState(0);
  const [suaraAktif, setSuaraAktif] = useState(false);
  const [likes, setLikes] = useState<Set<string>>(
    () => new Set(profil.likesVideo ?? [])
  );
  const feedRef = useRef<HTMLDivElement>(null);

  /* tandai slide yang sedang terlihat (≥60%) sebagai aktif */
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setIndexAktif(Number((e.target as HTMLElement).dataset.index));
          }
        }
      },
      { root: feed, threshold: 0.6 }
    );
    feed.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  async function toggleLike(videoId: string) {
    const suka = !likes.has(videoId);
    // update optimis agar responsnya terasa instan untuk anak
    setLikes((l) => {
      const baru = new Set(l);
      if (suka) baru.add(videoId);
      else baru.delete(videoId);
      return baru;
    });
    try {
      await setLikeVideo(profil.userId, videoId, suka);
    } catch {
      setLikes((l) => {
        const baru = new Set(l);
        if (suka) baru.delete(videoId);
        else baru.add(videoId);
        return baru;
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div
        ref={feedRef}
        className="h-full overflow-y-auto snap-y snap-mandatory overscroll-contain"
        aria-label="Daftar video belajar — geser ke atas untuk video berikutnya"
      >
        {DAFTAR_VIDEO.map((v, i) => (
          <VideoSlide
            key={v.id}
            video={v}
            index={i}
            aktif={i === indexAktif}
            suaraAktif={suaraAktif}
            suka={likes.has(v.id)}
            onToggleSuara={() => setSuaraAktif((s) => !s)}
            onToggleLike={() => toggleLike(v.id)}
          />
        ))}
      </div>

      {/* bar atas mengambang — turun sebanyak tinggi banner offline agar tak tertutup */}
      <div
        className="absolute inset-x-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"
        style={{ top: "var(--tinggi-banner-offline, 0px)" }}
      >
        <TombolKembali href="/home" label="Keluar dari video" overlay />
        <span className="text-white font-display font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
          Video Belajar 📺 {indexAktif + 1}/{DAFTAR_VIDEO.length}
        </span>
      </div>
    </div>
  );
}

function VideoSlide({
  video,
  index,
  aktif,
  suaraAktif,
  suka,
  onToggleSuara,
  onToggleLike,
}: {
  video: VideoItem;
  index: number;
  aktif: boolean;
  suaraAktif: boolean;
  suka: boolean;
  onToggleSuara: () => void;
  onToggleLike: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gagal, setGagal] = useState(false);

  /* autoplay saat aktif, pause saat lewat */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || gagal) return;
    if (aktif) {
      el.play().catch(() => {}); // autoplay diblokir browser → anak tinggal ketuk
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [aktif, gagal]);

  const menit = Math.floor(video.durasiDetik / 60);
  const detik = video.durasiDetik % 60;

  return (
    <section
      data-index={index}
      aria-label={`Video: ${video.judul}`}
      className="relative h-full snap-start flex items-center justify-center"
    >
      {gagal ? (
        /* file video belum diproduksi → panel placeholder ramah anak */
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <span className="text-7xl" aria-hidden="true">
            🎬
          </span>
          <p className="text-white font-display font-bold text-xl max-w-[30ch]">
            Video ini sedang disiapkan tim Anakara
          </p>
          <p className="text-white/70 font-bold">Tunggu ya! 🐆</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={video.url}
          poster={video.thumbnail}
          loop
          playsInline
          muted={!suaraAktif}
          preload="metadata"
          onError={() => setGagal(true)}
          onClick={(e) => {
            const el = e.currentTarget;
            if (el.paused) el.play().catch(() => {});
            else el.pause();
          }}
          className="h-full w-auto max-w-full object-contain"
        />
      )}

      {/* tombol aksi kanan-bawah */}
      <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5">
        <button
          onClick={onToggleLike}
          aria-pressed={suka}
          aria-label={suka ? `Batal menyukai ${video.judul}` : `Sukai ${video.judul}`}
          className={[
            "w-14 h-14 rounded-full flex items-center justify-center text-3xl",
            "border-2 transition-transform duration-150 active:scale-90",
            suka
              ? "bg-accent border-accent-edge motion-safe:animate-[like-pop_300ms_ease-out]"
              : "bg-black/40 border-white/40",
          ].join(" ")}
        >
          <span aria-hidden="true">{suka ? "⭐" : "☆"}</span>
        </button>
        <button
          onClick={onToggleSuara}
          aria-pressed={suaraAktif}
          aria-label={suaraAktif ? "Matikan suara" : "Nyalakan suara"}
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-black/40 border-2 border-white/40"
        >
          <span aria-hidden="true">{suaraAktif ? "🔊" : "🔇"}</span>
        </button>
      </div>

      {/* info video kiri-bawah */}
      <div className="absolute left-4 right-24 bottom-8 text-white">
        <span className="inline-block bg-black/50 border border-white/30 rounded-full px-3 py-1 text-sm font-bold mb-2">
          {EMOJI_KATEGORI[video.kategori] ?? "📚"} {video.kategori} ·{" "}
          {menit > 0 ? `${menit} mnt ` : ""}
          {detik > 0 ? `${detik} dtk` : ""}
        </span>
        <h2 className="font-display font-extrabold text-2xl [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">
          {video.judul}
        </h2>
      </div>

      <style>{`
        @keyframes like-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
