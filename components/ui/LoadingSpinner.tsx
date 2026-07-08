import GambarEmoji from "./GambarEmoji";

interface LoadingSpinnerProps {
  /** Teks di bawah maskot; default ramah anak */
  label?: string;
  size?: "sm" | "md";
}

/* Maskot Tayo berlari (tayo-run.png, latar putih → dibingkai lingkaran putih)
   melompat-lompat selama memuat; fallback emoji 🐆 kalau file gagal dimuat. */
export default function LoadingSpinner({
  label = "Tunggu sebentar ya…",
  size = "md",
}: LoadingSpinnerProps) {
  const boxSize = size === "sm" ? "w-12 h-12" : "w-20 h-20";
  const emojiSize = size === "sm" ? "text-2xl" : "text-4xl";
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 p-6">
      <span
        aria-hidden="true"
        className={`${boxSize} ${emojiSize} rounded-full bg-white border-2 border-border overflow-hidden flex items-center justify-center motion-safe:animate-bounce`}
      >
        <GambarEmoji
          src="/assets/mascot/tayo-run.png"
          emoji="🐆"
          className="w-full h-full object-cover"
        />
      </span>
      <p className="text-muted font-bold text-sm">{label}</p>
      <span className="sr-only">Sedang memuat</span>
    </div>
  );
}
