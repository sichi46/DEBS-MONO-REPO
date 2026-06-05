import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const DEFAULT_STEPS = ["Submitted", "Reviewing", "Assessment", "Paid"];

interface ClaimsTrackerProps {
  currentStep: number; // 0-indexed; e.g. 0 = Submitted, 3 = Paid
  steps?: string[];
  compact?: boolean; // compact = smaller dots, no labels
  className?: string;
}

export function ClaimsTracker({
  currentStep,
  steps = DEFAULT_STEPS,
  compact = false,
  className,
}: ClaimsTrackerProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const pending = i > currentStep;

        return (
          <div
            key={step}
            className={cn(
              "flex items-center",
              i < steps.length - 1 ? "flex-1" : "",
            )}
          >
            {/* Dot */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border-2 shrink-0",
                  compact ? "h-4 w-4" : "h-7 w-7",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary/10 text-primary",
                  pending && "border-muted bg-background text-muted-foreground",
                )}
              >
                {done && !compact && <Check className="h-3.5 w-3.5" />}
                {!done && !compact && (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              {!compact && (
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    done || active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step}
                </span>
              )}
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "tracker-line mx-1",
                  compact ? "mb-0" : "mb-4",
                  done ? "active" : "",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
