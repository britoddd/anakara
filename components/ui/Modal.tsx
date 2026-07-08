"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/* Pakai <dialog> native: fokus terkunci di dalam, Esc menutup, backdrop gratis. */
export default function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // klik area backdrop (di luar kotak isi) = tutup
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="modal-judul"
      className={[
        "m-auto w-[min(92vw,480px)] rounded-xl border-2 border-border",
        "bg-surface text-fg p-0",
        "backdrop:bg-black/50 backdrop:backdrop-blur-[2px]",
        "open:motion-safe:animate-[modal-pop_200ms_ease-out]",
      ].join(" ")}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 id="modal-judul" className="font-display text-xl font-extrabold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
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
        {children}
      </div>
      <style>{`
        @keyframes modal-pop {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </dialog>
  );
}
