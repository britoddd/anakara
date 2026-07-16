"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import GambarEmoji from "@/components/ui/GambarEmoji";
import type { Pengumuman } from "@/features/guru/api";

/* Notifikasi pengumuman guru saat siswa masuk aplikasi. Berbeda dari <Modal>
   biasa: SENGAJA tidak menutup lewat Esc atau klik latar — anak harus menekan
   tombol tutup dulu (permintaan produk: "selalu muncul sampai tombol tutup
   ditekan"). Presentasional murni (data via props) supaya bisa diuji di
   /dev/kelas tanpa login. */

export default function DialogPengumuman({
  pengumuman,
  onTutup,
}: {
  pengumuman: Pengumuman[];
  onTutup: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const jamak = pengumuman.length > 1;

  return (
    <dialog
      ref={ref}
      // Esc tidak menutup — harus lewat tombol tutup (permintaan produk)
      onCancel={(e) => e.preventDefault()}
      aria-labelledby="pengumuman-judul"
      className={[
        "m-auto w-[min(92vw,480px)] rounded-xl border-2 border-border",
        "bg-surface text-fg p-0",
        "backdrop:bg-black/50 backdrop:backdrop-blur-[2px]",
        "open:motion-safe:animate-[pengumuman-pop_200ms_ease-out]",
      ].join(" ")}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2
            id="pengumuman-judul"
            className="font-display text-xl font-extrabold flex items-center gap-2"
          >
            <span aria-hidden="true">📣</span>
            Pengumuman dari Guru
          </h2>
          <button
            onClick={onTutup}
            aria-label="Tutup pengumuman"
            className={[
              "shrink-0 w-11 h-11 -mt-1 -mr-1 rounded-full",
              "flex items-center justify-center text-lg font-bold",
              "bg-surface-2 text-muted border-2 border-border",
              "hover:text-fg hover:border-primary",
              "active:translate-y-[2px] transition-colors duration-150",
            ].join(" ")}
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-16 h-16 shrink-0 text-4xl rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center"
            aria-hidden="true"
          >
            <GambarEmoji
              src="/assets/mascot/tayo-hello.png"
              emoji="🐆"
              className="w-full h-full object-cover"
            />
          </span>
          <p className="font-bold text-muted text-sm">
            {jamak
              ? "Ada pesan dari Bapak/Ibu Guru untukmu. Yuk dibaca dulu, ya!"
              : "Ada pesan dari Bapak/Ibu Guru untukmu. Yuk dibaca, ya!"}
          </p>
        </div>

        <ul className="flex flex-col gap-3 list-none max-h-[45vh] overflow-y-auto">
          {pengumuman.map((p) => (
            <li key={p.id}>
              <div className="flex items-start gap-3 rounded-lg border-2 border-accent bg-surface-2 p-4">
                <span className="text-2xl shrink-0" aria-hidden="true">
                  📌
                </span>
                <p className="font-bold whitespace-pre-wrap break-words min-w-0">
                  {p.teks}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Button fullWidth className="mt-6" onClick={onTutup}>
          Oke, sudah baca! 👍
        </Button>
      </div>

      <style>{`
        @keyframes pengumuman-pop {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </dialog>
  );
}
