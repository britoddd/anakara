"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/* Utilitas uji dev: paksa tema lalu redirect — dipakai screenshot headless
   (browser headless selalu ikut tema OS, tak bisa dipaksa via flag).
   Contoh: /dev/tema?set=light&ke=/dev/komponen
   Bukan bagian produk — jangan ditautkan dari halaman siswa/guru. */

function IsiTema() {
  const params = useSearchParams();

  useEffect(() => {
    const tema = params.get("set") === "dark" ? "dark" : "light";
    localStorage.setItem("anakara-theme", tema);
    document.documentElement.setAttribute("data-theme", tema);
    window.location.replace(params.get("ke") ?? "/");
  }, [params]);

  return <p className="p-8 font-bold">Menyetel tema…</p>;
}

export default function DevTemaPage() {
  return (
    <Suspense fallback={null}>
      <IsiTema />
    </Suspense>
  );
}
