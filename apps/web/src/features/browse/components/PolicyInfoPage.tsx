import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  Plus,
  Headphones,
  Car,
  Home,
  Plane,
  Briefcase,
  Heart,
  ArrowLeft,
  Star,
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

const featuresMap: Record<string, string[]> = {
  "avail-001": [
    "Collision and comprehensive cover",
    "Third-party liability",
    "Theft and fire protection",
    "24/7 roadside assistance",
    "No-claim bonus",
    "Coverage across Zambia",
  ],
  "avail-002": [
    "Structure and rebuild cover",
    "Contents and valuables",
    "Fire, flood and natural disasters",
    "Theft and burglary protection",
    "Temporary accommodation",
    "Nationwide coverage",
  ],
  "avail-003": [
    "Trip cancellation cover",
    "Emergency medical expenses",
    "Lost or delayed luggage",
    "Flight delay compensation",
    "Personal accident cover",
    "24/7 travel assistance",
  ],
  "avail-004": [
    "Property and equipment cover",
    "Public liability protection",
    "Business interruption cover",
    "Employee liability",
    "Cyber risk cover",
    "Flexible premium options",
  ],
};

const defaultFeatures = [
  "Comprehensive coverage",
  "Flexible payment options",
  "Quick claims process",
  "24/7 customer support",
  "No waiting period",
  "Coverage across all provinces",
];

const testimonialMap: Record<string, { quote: string; author: string }> = {
  "avail-001": {
    quote:
      "Filing my claim after an accident was seamless. DEBS had me back on the road within days.",
    author: "Samuel K., Lusaka",
  },
  "avail-002": {
    quote:
      "When our roof was damaged in a storm, DEBS covered the repairs fully. Incredible service.",
    author: "Ruth M., Kitwe",
  },
  "avail-003": {
    quote:
      "Lost my luggage on a trip to Johannesburg. DEBS reimbursed me within 48 hours.",
    author: "Grace P., Lusaka",
  },
  "avail-004": {
    quote:
      "DEBS business cover gives us confidence to grow. Claims handled professionally every time.",
    author: "David T., Ndola",
  },
};

const defaultTestimonial = {
  quote:
    "DEBS Insurance gave me real peace of mind. The team was professional and my claim was handled quickly.",
  author: "Grace P., Lusaka",
};

export function PolicyInfoPage() {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();

  const policy = mockAvailablePolicies.find((p) => p.id === policyId);
  const policyIndex = mockAvailablePolicies.findIndex((p) => p.id === policyId);

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium">Policy not found</p>
        <Button className="mt-4" variant="outline" asChild>
          <Link to="/dashboard/browse">Back to Browse</Link>
        </Button>
      </div>
    );
  }

  const Icon = policyIconMap[policy.icon] ?? Briefcase;
  const tone = cardGradients[policyIndex % cardGradients.length];
  const grad = gradientMap[tone];
  const isPopular = policyIndex === 1;
  const features = featuresMap[policy.id] ?? defaultFeatures;
  const testimonial = testimonialMap[policy.id] ?? defaultTestimonial;

  return (
    <div className="space-y-[18px]" data-testid="policy-info-page">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate("/dashboard/browse")}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] items-start">
        {/* LEFT */}
        <div className="grid gap-[18px]">
          {/* Hero card */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div
              className="relative flex items-center justify-center w-full"
              style={{ aspectRatio: "21/9", background: grad }}
            >
              <Icon className="text-white" style={{ width: 64, height: 64 }} />
              {isPopular && (
                <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
            </div>
            <div className="p-[26px]">
              {isPopular && (
                <span className="inline-block mb-3 text-[11px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Most popular
                </span>
              )}
              <h1 className="text-[26px] font-extrabold leading-tight">
                {policy.type}
              </h1>
              <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">
                {policy.description} DEBS Insurance provides comprehensive{" "}
                {policy.type.toLowerCase()} coverage designed to protect you and
                your loved ones with competitive premiums and extensive coverage
                options.
              </p>
            </div>
          </div>

          {/* What is covered */}
          <div className="bg-card border border-border rounded-2xl p-[22px]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-semibold text-[15px]">What is covered</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                    <ShieldCheck className="h-3 w-3 text-success" />
                  </span>
                  <span className="text-[14px] leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-muted rounded-2xl p-[22px]">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  style={{ color: "#F59E0B", fill: "#F59E0B" }}
                />
              ))}
            </div>
            <p
              className="text-[15px] italic leading-relaxed"
              style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
            >
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <p className="mt-3 text-[13px] text-muted-foreground">
              &mdash; {testimonial.author}
            </p>
          </div>
        </div>

        {/* RIGHT sticky */}
        <div className="sticky top-[90px]">
          <div className="bg-card border border-border rounded-2xl p-[22px]">
            <p className="text-[13px] text-muted-foreground mb-1">
              Starts from
            </p>
            <p
              className="text-[34px] font-extrabold text-primary leading-none"
              style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
            >
              {policy.startingPremium.split("/")[0]}
              <span className="text-[16px] font-normal text-muted-foreground ml-1">
                /{policy.startingPremium.split("/")[1] ?? "mo"}
              </span>
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() =>
                  toast.success(
                    "Plan added! An advisor will reach out shortly.",
                  )
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Get this plan
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => toast.info("Connecting you to an agent...")}
              >
                <Headphones className="h-4 w-4 mr-2" />
                Talk to an agent
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-4">
              <ShieldCheck
                className="shrink-0"
                style={{ width: 15, height: 15, color: "var(--color-success)" }}
              />
              <span className="text-[12px] text-muted-foreground">
                No medical exam &middot; cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
