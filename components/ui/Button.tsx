import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "success" | "ghost" | "danger";
/* "sm" untuk UI padat guru (Phase 10) — halaman siswa tetap md/lg (target 48px+) */
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

/* Efek "pop": tepi 3D via box-shadow; saat ditekan tombol turun 3px
   dan tepinya hilang (transform+shadow saja — hemat, FOUNDATION §4.3). */
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary shadow-[0_4px_0_var(--primary-active)] " +
    "hover:bg-primary-hover active:translate-y-[3px] active:shadow-none",
  accent:
    "bg-accent text-on-accent shadow-[0_4px_0_var(--accent-edge)] " +
    "hover:brightness-95 active:translate-y-[3px] active:shadow-none",
  success:
    "bg-success text-on-success shadow-[0_4px_0_var(--success-hover)] " +
    "hover:bg-success-hover active:translate-y-[3px] active:shadow-none",
  ghost:
    "bg-transparent text-primary border-2 border-primary " +
    "hover:bg-surface-2 active:translate-y-[2px]",
  danger:
    "bg-danger text-white shadow-[0_4px_0_rgba(0,0,0,0.25)] " +
    "hover:brightness-95 active:translate-y-[3px] active:shadow-none",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-[36px] px-4 text-sm",
  md: "min-h-[48px] px-6 text-base",
  lg: "min-h-[56px] px-8 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full",
        "font-display font-bold select-none",
        "transition-[transform,box-shadow,background-color,filter] duration-150 ease-out",
        "disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
