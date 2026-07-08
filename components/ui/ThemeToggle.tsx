"use client";

import { useEffect, useState } from "react";

/* Sinkron dengan script no-flash di app/layout.tsx (key: anakara-theme). */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("anakara-theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className={[
        "w-11 h-11 rounded-full flex items-center justify-center text-xl",
        "bg-surface-2 border-2 border-border",
        "hover:border-primary active:translate-y-[2px]",
        "transition-colors duration-150",
      ].join(" ")}
    >
      {/* sebelum hydration selesai, tampilkan ikon netral agar tak salah */}
      {theme === null ? "◐" : theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
