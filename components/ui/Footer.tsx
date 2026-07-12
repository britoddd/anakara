import Squiggle from "@/components/deko/Squiggle";

/* Footer situs dengan baris hak cipta: tagline produk, kredit, lalu
   "© <tahun> Anakara" (tahun mengikuti waktu render). Dipakai di landing;
   bisa ditaruh di halaman publik lain tanpa props. */

export default function Footer({ className = "" }: { className?: string }) {
  const tahun = new Date().getFullYear();

  return (
    <footer className={`text-center text-sm text-muted px-6 py-8 ${className}`}>
      <Squiggle className="block w-24 mx-auto mb-3 text-green-bright" />
      <p className="font-display font-bold text-fg">
        Anakara — Belajar Gizi &amp; Hidup Sehat
      </p>
      <p className="mt-1">
        Dibuat dengan <span aria-hidden="true">💚</span> untuk siswa SD kelas
        1–2 (Fase A)
      </p>
      <p className="mt-3">© {tahun} Anakara. Hak cipta dilindungi.</p>
    </footer>
  );
}
