"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/* Status online/offline global (dipakai banner atas + popup penjaga fitur).
   Sumber kebenaran: navigator.onLine + event 'online'/'offline'. Nilai awal
   selalu `true` (SSR & render pertama) agar tak ada mismatch hidrasi — status
   nyata dikoreksi di useEffect segera setelah mount. */

interface OnlineState {
  /** true = ada koneksi (asumsikan online sampai terbukti sebaliknya) */
  online: boolean;
  /** true kalau online; kalau offline, buka popup "butuh internet" & return false.
      Pola pakai: onClick={(e) => { if (!mintaOnline()) e.preventDefault(); }} */
  mintaOnline: (pesan?: string) => boolean;
  /** teks popup aktif (null = popup tertutup) — dibaca PopupButuhInternet */
  pesanPopup: string | null;
  tutupPopup: () => void;
}

const PESAN_DEFAULT =
  "Fitur ini butuh internet. Sambungkan dulu ke Wi-Fi atau data, ya!";

const OnlineContext = createContext<OnlineState>({
  online: true,
  mintaOnline: () => true,
  pesanPopup: null,
  tutupPopup: () => {},
});

export function useOnline() {
  return useContext(OnlineContext);
}

export default function OnlineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [pesanPopup, setPesanPopup] = useState<string | null>(null);

  useEffect(() => {
    const perbarui = () => setOnline(navigator.onLine);
    perbarui(); // koreksi status nyata setelah mount
    window.addEventListener("online", perbarui);
    window.addEventListener("offline", perbarui);
    return () => {
      window.removeEventListener("online", perbarui);
      window.removeEventListener("offline", perbarui);
    };
  }, []);

  /* Tandai <html data-offline> supaya CSS bisa memberi ruang untuk banner
     (globals.css: --tinggi-banner-offline) tanpa perlu prop ke tiap halaman. */
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-offline",
      online ? "false" : "true"
    );
  }, [online]);

  /* Kalau tiba-tiba online lagi, popup "butuh internet" tak relevan → tutup. */
  useEffect(() => {
    if (online) setPesanPopup(null);
  }, [online]);

  const mintaOnline = useCallback(
    (pesan?: string) => {
      if (navigator.onLine) return true;
      setPesanPopup(pesan ?? PESAN_DEFAULT);
      return false;
    },
    []
  );

  const tutupPopup = useCallback(() => setPesanPopup(null), []);

  return (
    <OnlineContext.Provider
      value={{ online, mintaOnline, pesanPopup, tutupPopup }}
    >
      {children}
    </OnlineContext.Provider>
  );
}
