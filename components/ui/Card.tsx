import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** true = kartu bisa diklik: naik sedikit saat hover (plus afordans non-hover dari isi kartu) */
  interactive?: boolean;
  children: ReactNode;
}

export default function Card({
  interactive = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        "bg-surface border-2 border-border rounded-lg p-6",
        "shadow-[0_2px_8px_rgba(16,32,43,0.06)]",
        interactive
          ? "transition-[transform,box-shadow] duration-200 ease-out " +
            "hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(16,32,43,0.12)] " +
            "hover:border-primary cursor-pointer"
          : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
