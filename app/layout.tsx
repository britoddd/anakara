import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import AuthProvider from "@/features/auth/AuthProvider";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nunito",
  display: "swap",
});

/* URL produksi untuk OG/Twitter absolut. Set NEXT_PUBLIC_SITE_URL saat deploy;
   fallback ke domain placeholder agar metadataBase tidak pernah undefined. */
const situs = process.env.NEXT_PUBLIC_SITE_URL ?? "https://anakara.app";

const judul = "Anakara — Belajar Gizi Seru";
const deskripsi =
  "Belajar makanan bergizi dan pola hidup sehat lewat game seru bersama Tayo si Macan Kecil. Untuk siswa SD kelas 1-2.";

export const metadata: Metadata = {
  metadataBase: new URL(situs),
  title: judul,
  description: deskripsi,
  applicationName: "Anakara",
  openGraph: {
    type: "website",
    siteName: "Anakara",
    locale: "id_ID",
    url: "/",
    title: judul,
    description: deskripsi,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Anakara — Belajar Gizi & Hidup Sehat bareng Tayo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: judul,
    description: deskripsi,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F8E7" },
    { media: "(prefers-color-scheme: dark)", color: "#12271B" },
  ],
};

/* Dijalankan sebelum paint agar tema tersimpan tidak "berkedip" (no-flash). */
const themeInitScript = `
try {
  var t = localStorage.getItem("anakara-theme");
  if (t !== "light" && t !== "dark") {
    t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${baloo.variable} ${nunito.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <a href="#konten-utama" className="skip-link">
          Langsung ke konten
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
