"use client";

import { useEffect } from "react";

/* Mendaftarkan service worker (public/sw.js) — fondasi PWA offline.
   Hanya di production: saat `next dev`, service worker gampang menyajikan
   chunk basi & bikin bingung. Deploy (next build && start) mengaktifkannya. */

export default function RegistrasiSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;

    const daftar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // gagal daftar (mis. konteks non-secure) → app tetap jalan tanpa offline
      });
    };

    if (document.readyState === "complete") daftar();
    else window.addEventListener("load", daftar, { once: true });
    return () => window.removeEventListener("load", daftar);
  }, []);

  return null;
}
