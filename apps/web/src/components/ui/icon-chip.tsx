import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone =
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info";

interface IconChipProps {
  icon: LucideIcon;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  accent:
    "bg-[color:var(--color-brand-accent-tint)] text-[color:var(--color-brand-accent)]",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-primary/10 text-primary",
};

const sizeClasses: Record<"sm" | "md" | "lg", { wrap: string; icon: string }> =
  {
    sm: { wrap: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
    md: { wrap: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
    lg: { wrap: "h-12 w-12 rounded-xl", icon: "h-6 w-6" },
  };

export function IconChip({
  icon: Icon,
  tone = "primary",
  size = "md",
  className,
}: IconChipProps) {
  const s = sizeClasses[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        s.wrap,
        toneClasses[tone],
        className,
      )}
    >
      <Icon className={s.icon} />
    </div>
  );
}
