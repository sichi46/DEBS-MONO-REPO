import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { IconChip } from "../../components/ui/icon-chip";
import {
  Shield,
  Wallet,
  TrendingUp,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle,
  Star,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

const trustStats = [
  { value: "ZMW 2B+", label: "Claims paid out" },
  { value: "10,000+", label: "Families covered" },
  { value: "98%", label: "Claim approval rate" },
  { value: "< 5 days", label: "Avg. claim settlement" },
];

const testimonials = [
  {
    quote:
      "Filing my claim was so easy. Within 4 days I received my payout. Debs has given my family real peace of mind.",
    name: "Grace M.",
    role: "Life Insurance policyholder, Lusaka",
  },
  {
    quote:
      "I can see all my policies in one place and pay my premiums from my phone. Finally, insurance that works for me.",
    name: "Chanda K.",
    role: "Health & Auto customer, Ndola",
  },
  {
    quote:
      "The team was helpful and transparent throughout. No hidden fees, no surprises — exactly what I needed.",
    name: "Mwale B.",
    role: "Home Insurance customer, Kitwe",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const onNavigate = (path: string) => {
    if (path === "login") navigate("/login");
    else if (path === "register") navigate("/register");
    else navigate(path);
  };

  const features = [
    {
      icon: Shield,
      tone: "primary" as const,
      title: "Comprehensive Policy Management",
      description:
        "Manage all your insurance policies in one secure place. Track coverage, premiums, and renewal dates with ease.",
    },
    {
      icon: Wallet,
      tone: "accent" as const,
      title: "Seamless Payment Processing",
      description:
        "Pay premiums securely online — Mobile Money, bank transfer, or card. Set up auto-pay and never miss a payment.",
    },
    {
      icon: FileCheck,
      tone: "success" as const,
      title: "Quick Claims Processing",
      description:
        "Submit and track claims digitally. Get real-time updates on your claim status and faster payouts.",
    },
    {
      icon: TrendingUp,
      tone: "warning" as const,
      title: "Investment Tracking",
      description:
        "Monitor your investment-linked policies and watch your wealth grow. Access detailed performance reports anytime.",
    },
  ];

  const articles = [
    {
      title: "Understanding Life Insurance in Zambia",
      excerpt:
        "Learn about the different types of life insurance and how to choose the right coverage for your family.",
      date: "Oct 15, 2025",
    },
    {
      title: "Planning for Your Financial Future",
      excerpt:
        "Discover key strategies for building long-term wealth and securing your family's financial independence.",
      date: "Oct 10, 2025",
    },
    {
      title: "How to File an Insurance Claim",
      excerpt:
        "A step-by-step guide to filing claims quickly and efficiently to get the support you need.",
      date: "Oct 5, 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-primary">
                Debs Insurance
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-7">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </a>
              <a
                href="#education"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Resources
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("login")}
              >
                Log in
              </Button>
              <Button size="sm" onClick={() => onNavigate("register")}>
                Get started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-[color:var(--color-primary-700)] text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
                Zambia's modern insurer
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                Secure Your Future,
                <br />
                Simply.
              </h1>
              <p className="text-lg text-primary-foreground/80 leading-relaxed">
                The transparent, modern way to manage insurance and investments
                — built for Zambian families.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => onNavigate("register")}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Get started free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  Learn more
                </Button>
              </div>
            </div>
            <div className="relative h-[380px] rounded-xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1609843502380-e39ddeaff979?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZmFtaWx5JTIwc2VjdXJpdHl8ZW58MXx8fHwxNzYwODMxMjE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Happy family"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust stats strip */}
      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-primary">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[380px] rounded-xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1747114936280-257b662bfe72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN1cmFuY2UlMjBwcm90ZWN0aW9ufGVufDF8fHx8MTc2MDgzMTIxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Insurance and protection"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                About Debs
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                What is Debs Insurance?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Debs Insurance is Zambia's modern insurance and investment
                platform, designed to bring transparency, accessibility, and
                peace of mind to every Zambian family.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We combine traditional insurance values with cutting-edge
                technology to help you protect what matters most and build
                lasting wealth for your family's future.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <IconChip icon={Users} tone="primary" size="md" />
                <div>
                  <p className="text-sm font-semibold">
                    10,000+ families covered
                  </p>
                  <p className="text-xs text-muted-foreground">
                    and growing every day
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              What we offer
            </p>
            <h2 className="text-3xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="text-muted-foreground mt-2">
              Powerful features to manage your insurance and investments
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <IconChip
                    icon={f.icon}
                    tone={f.tone}
                    size="lg"
                    className="mb-3"
                  />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Testimonials
            </p>
            <h2 className="text-3xl font-bold text-foreground">
              What our customers say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className="h-4 w-4 fill-[color:var(--color-brand-accent)] text-[color:var(--color-brand-accent)]"
                      />
                    ))}
                  </div>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed italic"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    "{t.quote}"
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Hub */}
      <section id="education" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Learn
            </p>
            <h2 className="text-3xl font-bold text-foreground">
              Knowledge Hub
            </h2>
            <p className="text-muted-foreground mt-2">
              Learn more about insurance and financial planning
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((a, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <p className="text-xs font-medium text-primary mb-1">
                    {a.date}
                  </p>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {a.excerpt}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary text-sm"
                  >
                    Read more →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <CheckCircle key={i} className="h-5 w-5 text-white/70" />
            ))}
          </div>
          <h2 className="text-3xl font-bold">Ready to Take Control?</h2>
          <p className="text-primary-foreground/80 mt-3 mb-8">
            Join thousands of Zambians who trust Debs Insurance for their
            financial security and peace of mind.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onNavigate("register")}
            className="bg-white text-primary hover:bg-white/90"
          >
            Create your free account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">Debs Insurance</span>
              </div>
              <p className="text-sm opacity-60">
                Securing your future with transparent, modern insurance
                solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Company</h3>
              <ul className="space-y-2 text-sm opacity-60">
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Resources</h3>
              <ul className="space-y-2 text-sm opacity-60">
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Help Centre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Contact</h3>
              <ul className="space-y-2 text-sm opacity-60">
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>+260 123 456 789</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span>hello@debsinsurance.zm</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Lusaka, Zambia</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm opacity-40">
            © 2025 Debs Insurance. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
