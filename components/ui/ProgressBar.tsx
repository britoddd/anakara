interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Nama yang dibacakan screen reader, mis. "Kemajuan level" */
  label: string;
  /** Tampilkan angka persen di kanan */
  showValue?: boolean;
  variant?: "primary" | "success" | "accent";
}

const fillClasses = {
  primary: "bg-primary",
  success: "bg-success",
  accent: "bg-accent",
};

export default function ProgressBar({
  value,
  label,
  showValue = false,
  variant = "primary",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-3 w-full">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 h-4 rounded-full bg-surface-2 border-2 border-border overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${fillClasses[variant]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showValue && (
        <span className="text-sm font-bold text-muted tabular-nums w-[4ch] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
