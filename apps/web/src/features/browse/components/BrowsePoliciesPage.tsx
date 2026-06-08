import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
  Car,
  Home,
  Plane,
  Briefcase,
  Heart,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { mockAvailablePolicies } from "@/lib/mock-data";

// ---------- icon / gradient maps ----------
const policyIconMap: Record<string, LucideIcon> = {
  car: Car,
  home: Home,
  plane: Plane,
  briefcase: Briefcase,
  heart: Heart,
};

type GradientTone = "blue" | "green" | "amber" | "purple" | "rose";

const cardGradients: GradientTone[] = [
  "blue",
  "green",
  "amber",
  "purple",
  "rose",
];

const gradientMap: Record<GradientTone, string> = {
  blue: "linear-gradient(135deg, #0057B7 0%, #003A7D 100%)",
  green: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)",
  amber: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
  purple: "linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)",
  rose: "linear-gradient(135deg, #EC4899 0%, #9D174D 100%)",
};

// ---------- browse API ----------
const browseApi = {
  getAvailable: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return mockAvailablePolicies;
  },
};

// ---------- Segmented control ----------
type Tab = "all" | "popular";

function Segmented({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All plans" },
    { key: "popular", label: "Popular" },
  ];
  return (
    <div className="bg-muted rounded-lg p-1 flex gap-1" style={{ width: 280 }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`flex-1 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all ${
            active === t.key
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Product card skeleton ----------
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-[18px] space-y-2">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-muted rounded w-24" />
          <div className="h-8 bg-muted rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function BrowsePoliciesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");

  const { data: policies, isLoading } = useQuery({
    queryKey: ["browse", "policies"],
    queryFn: browseApi.getAvailable,
  });

  // "Popular" = first 2 entries for demo
  const displayed =
    tab === "popular" ? (policies ?? []).slice(0, 2) : (policies ?? []);

  return (
    <div className="space-y-[22px]" data-testid="browse-policies-page">
      {/* Gradient hero card */}
      <div
        className="rounded-[22px] p-[30px_32px] text-white overflow-hidden relative"
        style={{
          background:
            "linear-gradient(120deg, var(--color-brand-accent), var(--color-brand-accent-deep))",
        }}
      >
        {/* decorative icon */}
        <Sparkles
          className="absolute pointer-events-none"
          style={{
            width: 150,
            height: 150,
            right: 20,
            top: -10,
            opacity: 0.2,
          }}
        />
        <p
          className="font-bold uppercase tracking-widest text-[11px] mb-2"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Explore plans
        </p>
        <h2 className="text-[30px] font-extrabold leading-tight mt-2">
          Cover for every part of life
        </h2>
        <p
          className="mt-2 text-[15px] leading-relaxed max-w-[480px]"
          style={{ opacity: 0.92 }}
        >
          Find the right protection for you and your family — from health and
          auto to travel and business cover.
        </p>
        <div className="mt-5">
          <Segmented active={tab} onChange={setTab} />
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : displayed.map((policy, idx) => {
              const Icon = policyIconMap[policy.icon] ?? Briefcase;
              const tone = cardGradients[idx % cardGradients.length];
              const grad = gradientMap[tone];
              const isPopular = idx === 1;

              return (
                <div
                  key={policy.id}
                  className="lift cursor-pointer overflow-hidden rounded-2xl border border-border bg-card"
                  onClick={() => navigate(`/dashboard/browse/${policy.id}`)}
                >
                  {/* Image area */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{ aspectRatio: "16/9", background: grad }}
                  >
                    <Icon
                      className="text-white"
                      style={{ width: 52, height: 52 }}
                    />
                    {isPopular && (
                      <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-[18px]">
                    <p className="font-bold text-[16px] leading-snug">
                      {policy.type}
                    </p>
                    <p
                      className="text-[13px] text-muted-foreground mt-1 leading-relaxed"
                      style={{ minHeight: 38 }}
                    >
                      {policy.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className="font-bold text-[17px] text-primary"
                        style={{ fontFamily: "var(--font-serif, serif)" }}
                      >
                        {policy.startingPremium}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/browse/${policy.id}`);
                        }}
                      >
                        Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
