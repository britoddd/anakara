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

export const metadata: Metadata = {
  title: "Anakara — Belajar Gizi Seru",
  description:
    "Belajar makanan bergizi dan pola hidup sehat lewat game seru bersama Tayo si Macan Kecil. Untuk siswa SD kelas 1-2.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F9FE" },
    { media: "(prefers-color-scheme: dark)", color: "#10202B" },
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
