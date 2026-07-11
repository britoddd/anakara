"use client";

import { useEffect, useState } from "react";

/* Warna chrome browser (mobile) per tema — samakan dgn viewport.themeColor
   di app/layout.tsx. Meta media-query statis tak ikut saat toggle manual
   melawan preferensi OS, jadi kita tulis meta theme-color dinamis yang menang. */
const THEME_COLOR = { light: "#F5F8E7", dark: "#12271B" } as const;

function terapkanThemeColor(theme: "light" | "dark") {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-dynamic]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.setAttribute("data-dynamic", "");
    document.head.appendChild(meta);
  }
  meta.content = THEME_COLOR[theme];
}

/* Sinkron dengan script no-flash di app/layout.tsx (key: anakara-theme). */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(current);
    // koreksi chrome browser bila tema tersimpan beda dari preferensi OS
    terapkanThemeColor(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("anakara-theme", next);
    } catch {}
    terapkanThemeColor(next);
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
