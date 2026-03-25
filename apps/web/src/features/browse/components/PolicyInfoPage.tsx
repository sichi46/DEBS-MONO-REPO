import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Phone,
  Car,
  Home,
  Plane,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { mockAvailablePolicies } from "@/lib/mock-data";

const policyIconMap: Record<string, LucideIcon> = {
  car: Car,
  home: Home,
  plane: Plane,
  briefcase: Briefcase,
};

export function PolicyInfoPage() {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();

  const policy = mockAvailablePolicies.find((p) => p.id === policyId);

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

  // Mock benefits for demonstration
  const benefits = [
    "Comprehensive coverage for peace of mind",
    "Flexible payment options (monthly, quarterly, annually)",
    "Quick and easy claims process",
    "24/7 customer support",
    "No waiting period for accidents",
    "Coverage across all provinces",
  ];

  return (
    <div className="space-y-6" data-testid="policy-info-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard/browse")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            {(() => {
              const Icon = policyIconMap[policy.icon];
              return Icon ? <Icon className="h-7 w-7 text-primary" /> : null;
            })()}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{policy.type}</h2>
            <p className="text-muted-foreground">
              Starting from {policy.startingPremium}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{policy.description}</p>
          <p className="mt-4 text-muted-foreground">
            DEBS Insurance provides comprehensive {policy.type.toLowerCase()}{" "}
            coverage designed to protect you and your loved ones. Our policies
            are tailored to meet your specific needs with competitive premiums
            and extensive coverage options.
          </p>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Key Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">Basic</h4>
              <p className="mt-1 text-2xl font-bold text-primary">
                {policy.startingPremium}
              </p>
              <p className="text-sm text-muted-foreground">
                Essential coverage
              </p>
            </div>
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
              <div className="mb-1 text-xs font-semibold text-primary">
                POPULAR
              </div>
              <h4 className="font-semibold">Standard</h4>
              <p className="mt-1 text-2xl font-bold text-primary">
                ZMW {parseInt(policy.startingPremium.replace(/\D/g, "")) * 1.5}
                /mo
              </p>
              <p className="text-sm text-muted-foreground">
                Recommended coverage
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">Premium</h4>
              <p className="mt-1 text-2xl font-bold text-primary">
                ZMW {parseInt(policy.startingPremium.replace(/\D/g, "")) * 2}/mo
              </p>
              <p className="text-sm text-muted-foreground">
                Maximum protection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          className="flex-1 pr-5"
          size="lg"
          onClick={() =>
            toast.success("Quote request sent! We'll contact you shortly.")
          }
        >
          Get a Quote
        </Button>
        <Button
          variant="outline"
          className="flex-1 pr-5"
          size="lg"
          onClick={() => {
            window.location.href = "tel:+260211123456";
            toast.success("Connecting you to an advisor...");
          }}
        >
          <Phone className="mr-2 h-4 w-4" />
          Talk to an Advisor
        </Button>
      </div>
    </div>
  );
}
