/* Satu sumber cek preferensi "kurangi gerak" untuk animasi yang digerakkan
   JavaScript (yang TIDAK tercakup blok @media prefers-reduced-motion di
   globals.css — itu hanya memangkas animasi/transisi CSS). Dipakai konfeti &
   sorotan tutorial supaya perilakunya seragam dan aman di server (SSR). */

export function kurangiGerak(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
