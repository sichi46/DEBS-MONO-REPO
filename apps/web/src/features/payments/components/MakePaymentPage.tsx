import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Wallet,
  ArrowRight,
  Check,
  Lock,
  Smartphone,
  Building2,
  Phone,
  Shield,
  HeartPulse,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconChip } from "@/components/ui/icon-chip";
import { mockPolicies } from "@/lib/mock-data";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

type Method = "momo" | "card" | "bank";

// Active policies only
const activePolicies = mockPolicies.filter((p) => p.status === "Active");

// Parse "ZMW 1,200" → 1200
function parseAmount(str: string): number {
  return Number(str.replace(/[^0-9.]/g, ""));
}

function formatZMW(n: number): string {
  return "ZMW " + n.toLocaleString("en-ZM");
}

const totalAmount = activePolicies.reduce(
  (sum, p) => sum + parseAmount(p.premiumAmount),
  0,
);

function policyIcon(policyType: string): {
  Icon: LucideIcon;
  tone: "danger" | "success" | "primary";
} {
  const t = policyType.toLowerCase();
  if (t.includes("life") || t.includes("lp")) {
    return { Icon: HeartPulse, tone: "danger" };
  }
  if (t.includes("health") || t.includes("hi")) {
    return { Icon: Activity, tone: "success" };
  }
  return { Icon: Shield, tone: "primary" };
}

const methodLabel: Record<Method, string> = {
  momo: "Mobile Money",
  card: "Card",
  bank: "Bank Transfer",
};

// Reference for the receipt
const REF = "DEBS-JM-" + Math.random().toString(36).slice(2, 7).toUpperCase();

export function MakePaymentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [method, setMethod] = useState<Method>("momo");
  const [network, setNetwork] = useState<"Airtel" | "MTN" | "Zamtel">("Airtel");

  // ── Step 2: Success ────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="max-w-[520px] mx-auto text-center py-10">
        <div className="bg-card border border-border rounded-2xl p-10 grid gap-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-[90px] h-[90px] rounded-[28px] bg-success/10 flex items-center justify-center">
              <Check
                className="text-success"
                style={{ width: 48, height: 48 }}
              />
            </div>
          </div>

          {/* Heading */}
          <div className="grid gap-2">
            <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
              Payment successful
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your premiums are paid. A receipt has been emailed to you.
            </p>
          </div>

          {/* Receipt box */}
          <div className="bg-muted rounded-[14px] p-[18px] grid gap-[9px] text-left">
            <div className="flex justify-between" style={{ fontSize: 13.5 }}>
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-foreground">
                {formatZMW(totalAmount)}
              </span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 13.5 }}>
              <span className="text-muted-foreground">Method</span>
              <span className="font-semibold text-foreground">
                {methodLabel[method]}
              </span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 13.5 }}>
              <span className="text-muted-foreground">Reference</span>
              <span className="font-semibold text-foreground font-mono">
                {REF}
              </span>
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/dashboard/payments")}
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  // ── Steps 0 & 1 ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-[620px] mx-auto grid gap-[18px]">
      {/* Panel: What you are paying */}
      <div className="bg-card border border-border rounded-2xl p-[22px]">
        {/* Panel header */}
        <div className="flex items-center gap-3 mb-4">
          <IconChip icon={CreditCard} tone="primary" size="md" />
          <span className="font-semibold text-[15px]">What you are paying</span>
        </div>

        {/* Policy rows */}
        <div>
          {activePolicies.map((policy) => {
            const { Icon, tone } = policyIcon(policy.policyType);
            return (
              <div
                key={policy.policyNumber}
                className="border-b border-border last:border-0 py-3 flex items-center gap-3"
              >
                <IconChip
                  icon={Icon}
                  tone={tone}
                  size="md"
                  className="h-10 w-10"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] leading-tight truncate">
                    {policy.policyType}
                  </p>
                  <p className="text-muted-foreground text-[12px] mt-0.5">
                    Due Nov 1
                  </p>
                </div>
                <span
                  className="font-serif font-bold ml-auto shrink-0"
                  style={{ fontSize: 14 }}
                >
                  {policy.premiumAmount}
                </span>
              </div>
            );
          })}
        </div>

        {/* Total row */}
        <div className="flex justify-between items-center pt-3.5 mt-0.5">
          <span className="font-bold text-[17px]">Total</span>
          <span
            className="font-serif font-bold text-primary"
            style={{ fontSize: 20 }}
          >
            {formatZMW(totalAmount)}
          </span>
        </div>
      </div>

      {/* Step 0: Payment method */}
      {step === 0 && (
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          {/* Panel header */}
          <div className="flex items-center gap-3 mb-4">
            <IconChip icon={Wallet} tone="primary" size="md" />
            <span className="font-semibold text-[15px]">Payment method</span>
          </div>

          {/* Method buttons */}
          <div className="grid gap-2.5">
            {(
              [
                {
                  id: "momo" as Method,
                  icon: Smartphone,
                  tone: "success",
                  title: "Mobile Money",
                  sub: "Airtel · MTN · Zamtel",
                },
                {
                  id: "card" as Method,
                  icon: CreditCard,
                  tone: "info",
                  title: "Card",
                  sub: "Visa, Mastercard",
                },
                {
                  id: "bank" as Method,
                  icon: Building2,
                  tone: "primary",
                  title: "Bank Transfer",
                  sub: "Direct from your account",
                },
              ] as const
            ).map(({ id, icon, tone, title, sub }) => {
              const selected = method === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-card text-left cursor-pointer transition-all w-full"
                  style={{
                    border: selected
                      ? "1.5px solid var(--color-primary)"
                      : "1.5px solid var(--color-border)",
                    boxShadow: selected
                      ? "0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)"
                      : undefined,
                  }}
                >
                  <IconChip
                    icon={icon}
                    tone={tone}
                    size="lg"
                    className="h-11 w-11 rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14.5px] leading-tight">
                      {title}
                    </p>
                    <p className="text-muted-foreground text-[12px] mt-0.5">
                      {sub}
                    </p>
                  </div>
                  {/* Radio circle */}
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      width: 22,
                      height: 22,
                      border: selected
                        ? "2px solid var(--color-primary)"
                        : "2px solid var(--color-border)",
                      background: selected
                        ? "var(--color-primary)"
                        : "transparent",
                    }}
                  >
                    {selected && (
                      <div
                        className="rounded-full bg-white"
                        style={{ width: 8, height: 8 }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue */}
          <div className="mt-5">
            <Button size="lg" className="w-full" onClick={() => setStep(1)}>
              Continue
              <ArrowRight className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Confirm payment */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-2xl p-[22px]">
          {/* Panel header */}
          <div className="flex items-center gap-3 mb-5">
            <IconChip icon={Lock} tone="primary" size="md" />
            <span className="font-semibold text-[15px]">Confirm payment</span>
          </div>

          {/* Mobile Money fields */}
          {method === "momo" && (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-[13px] font-medium text-foreground">
                  Mobile number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input defaultValue="+260 97 123 4567" className="pl-9" />
                </div>
              </div>
              {/* Network segmented */}
              <div className="grid gap-1.5">
                <label className="text-[13px] font-medium text-foreground">
                  Network
                </label>
                <div className="bg-muted rounded-lg p-1 flex gap-1">
                  {(["Airtel", "MTN", "Zamtel"] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNetwork(n)}
                      className={
                        "flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all " +
                        (network === n
                          ? "bg-card text-primary shadow-sm"
                          : "text-muted-foreground")
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Card fields */}
          {method === "card" && (
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-[13px] font-medium text-foreground">
                  Card number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input placeholder="1234 5678 9012 3456" className="pl-9" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
                <div className="grid gap-1.5">
                  <label className="text-[13px] font-medium text-foreground">
                    Expiry
                  </label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-[13px] font-medium text-foreground">
                    CVV
                  </label>
                  <Input placeholder="123" />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer info */}
          {method === "bank" && (
            <div className="bg-muted rounded-[14px] p-[18px] grid gap-[9px]">
              <div className="flex justify-between" style={{ fontSize: 13.5 }}>
                <span className="text-muted-foreground">Bank</span>
                <span className="font-semibold text-foreground">
                  Zambia National Bank
                </span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 13.5 }}>
                <span className="text-muted-foreground">Account</span>
                <span className="font-semibold text-foreground font-mono">
                  0123 4567 8901
                </span>
              </div>
              <div className="flex justify-between" style={{ fontSize: 13.5 }}>
                <span className="text-muted-foreground">Reference</span>
                <span className="font-semibold text-foreground font-mono">
                  DEBS-ML-001
                </span>
              </div>
            </div>
          )}

          {/* Trust line */}
          <div className="flex items-center justify-center gap-1.5 my-4">
            <Lock className="text-success" style={{ width: 14, height: 14 }} />
            <span className="text-muted-foreground text-[12px]">
              Secured with bank-level encryption
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(0)}
              className="shrink-0"
            >
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                toast.success("Payment processed successfully!");
                setStep(2);
              }}
            >
              <Check className="mr-1" />
              Pay {formatZMW(totalAmount)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
