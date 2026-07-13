import type { MetadataRoute } from "next";

/* Web App Manifest (PWA) — dihasilkan Next di /manifest.webmanifest.
   Membuat Anakara bisa "Add to Home Screen" / dipasang & dibuka layar penuh,
   lalu bekerja offline lewat service worker (public/sw.js). Ikon memakai
   logo yang sudah ada; warna senada tema terang. */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anakara — Belajar Gizi Seru",
    short_name: "Anakara",
    description:
      "Belajar gizi & pola hidup sehat lewat game seru bareng Tayo. Bisa dimainkan offline.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "id",
    dir: "ltr",
    background_color: "#F5F8E7",
    theme_color: "#F5F8E7",
    categories: ["education", "games", "kids"],
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
