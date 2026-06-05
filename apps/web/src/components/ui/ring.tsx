import { cn } from "@/lib/utils";

interface RingProps {
  value: number; // 0–100
  size?: number; // px, default 96
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  tone?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

const toneStroke: Record<string, string> = {
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-destructive)",
};

export function Ring({
  value,
  size = 96,
  strokeWidth = 8,
  label,
  sublabel,
  tone = "primary",
  className,
}: RingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const dash = (pct / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={toneStroke[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      {/* Center labels */}
      {(label || sublabel) && (
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{ transform: "none" }}
        >
          {label && (
            <span className="text-base font-bold leading-none text-foreground">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
