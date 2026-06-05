import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Shield,
  Wallet,
  TrendingUp,
  FileCheck,
  Star,
} from "lucide-react";

/* ─── DebsMark SVG logo mark ─── */
function DebsMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id="dm-shield"
          x1="24"
          y1="3.5"
          x2="24"
          y2="39"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2D6BD4" />
          <stop offset="1" stopColor="#0D3C85" />
        </linearGradient>
      </defs>
      {/* Shield body */}
      <path
        d="M24 3.5l15 5.2v10.8c0 9.7-6.4 16.8-15 19.5C15.4 36.3 9 29.2 9 19.5V8.7z"
        fill="url(#dm-shield)"
      />
      {/* Upper chevron */}
      <path
        d="M15.5 27.5L24 19l8.5 8.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".95"
        fill="none"
      />
      {/* Lower chevron */}
      <path
        d="M15.5 21L24 12.5l8.5 8.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".42"
        fill="none"
      />
      {/* Amber spark */}
      <circle cx="24" cy="11" r="2.4" fill="#DB8E2C" />
    </svg>
  );
}

const articleGradients = [
  "linear-gradient(135deg,#3E83DA,#0057B7)",
  "linear-gradient(135deg,#34B978,#157A45)",
  "linear-gradient(135deg,#E7A24A,#B26C16)",
];

const features = [
  {
    icon: Shield,
    accentColor: "var(--color-primary)",
    title: "Comprehensive cover",
    body: "Life, health, auto, home & more — all managed from one place.",
  },
  {
    icon: Wallet,
    accentColor: "var(--color-success)",
    title: "Easy Mobile Money",
    body: "Pay premiums in seconds. Smart reminders mean you never miss one.",
  },
  {
    icon: FileCheck,
    accentColor: "var(--color-brand-accent)",
    title: "Guided claims",
    body: "A step-by-step flow, with most claims settled in just five days.",
  },
  {
    icon: TrendingUp,
    accentColor: "var(--color-primary)",
    title: "Grow your wealth",
    body: "Investment-linked plans that build your family's future.",
  },
];

const articles = [
  { title: "Understanding Life Insurance in Zambia", date: "Oct 14, 2025" },
  { title: "Planning for your financial future", date: "Oct 10, 2025" },
  { title: "How to file an insurance claim", date: "Oct 5, 2025" },
];

const stats = [
  { value: "ZMW 2B+", label: "Claims paid out" },
  { value: "10,000+", label: "Families protected" },
  { value: "98%", label: "Claims approved" },
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Nav ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "color-mix(in srgb, var(--color-card) 92%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--color-border)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-[1180px] mx-auto px-7 flex items-center justify-between h-[66px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <DebsMark size={30} />
            <span
              className="text-[17px] font-extrabold tracking-tight text-foreground"
              style={{ letterSpacing: "-0.02em" }}
            >
              Debs <span className="text-primary">Insurance</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-[30px]">
            {["Features", "Plans", "About", "Resources"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="relative text-[14.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1 group"
              >
                {l}
                <span className="absolute bottom-0 left-0 w-full h-[2px] rounded-full bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-all"
              style={{ background: "var(--color-brand-accent)", color: "#fff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "var(--color-brand-accent-deep)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--color-brand-accent)")
              }
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          marginTop: -66,
          paddingTop: 66,
          background:
            "radial-gradient(125% 130% at 82% -15%, #00489A 0%, #003A7D 52%, #00264C 100%)",
        }}
      >
        {/* Dot grid overlay */}
        <div className="lp-dot-grid absolute inset-0 pointer-events-none" />

        {/* DebsMark watermark */}
        <div className="absolute right-[-70px] top-[-50px] opacity-[.09] pointer-events-none select-none">
          <DebsMark size={440} />
        </div>

        <div className="relative max-w-[1180px] mx-auto px-7 py-[104px] pb-[110px] grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[.14em] mb-4"
              style={{ color: "#EFB35E" }}
            >
              Zambian. Trusted. Yours.
            </p>
            <h1
              className="text-[clamp(40px,5.2vw,60px)] font-semibold leading-[1.04] mb-5"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Secure Your Future,{" "}
              <span className="italic" style={{ color: "#EFB35E" }}>
                Simply.
              </span>
            </h1>
            <p className="text-[17.5px] opacity-90 leading-relaxed max-w-[460px] mb-8">
              The modern, transparent way for Zambian families to manage
              insurance and investments — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 font-bold text-base px-6 py-[15px] rounded-lg transition-all"
                style={{
                  background: "var(--color-brand-accent)",
                  color: "#fff",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--color-brand-accent-deep)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "var(--color-brand-accent)")
                }
              >
                Get started — free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center font-bold text-base px-6 py-[15px] rounded-lg transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,.4)",
                  background: "rgba(255,255,255,.08)",
                  color: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,.08)";
                }}
              >
                Log in
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {[
                "Regulated by PIA",
                "Bank-level security",
                "10,000+ families",
              ].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 text-[13px] font-semibold opacity-90"
                >
                  <CheckCircle
                    className="h-4 w-4 shrink-0"
                    style={{ color: "#7FD3A6" }}
                  />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — image placeholder with floating cards */}
          <div className="relative hidden lg:block">
            {/* Main image placeholder */}
            <div
              className="relative overflow-hidden"
              style={{
                aspectRatio: "4/3",
                borderRadius: 22,
                background: "rgba(255,255,255,.1)",
                border: "1px solid rgba(255,255,255,.22)",
                boxShadow: "0 34px 70px rgba(0,0,0,.4)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div className="text-center opacity-60">
                <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                <p className="text-xs font-bold uppercase tracking-widest">
                  Zambian family photo
                </p>
              </div>
            </div>

            {/* Floating card 1 — top left */}
            <div
              className="animate-float absolute bg-card text-foreground rounded-xl shadow-lg px-4 py-3 flex items-center gap-3"
              style={{ left: -26, top: 28, minWidth: 190 }}
            >
              <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Policy active
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Family Health Plan
                </p>
              </div>
            </div>

            {/* Floating card 2 — bottom right */}
            <div
              className="animate-float-delayed absolute bg-card text-foreground rounded-xl shadow-lg px-4 py-3 flex items-center gap-3"
              style={{ right: -22, bottom: 36, minWidth: 200 }}
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--color-brand-accent-tint)" }}
              >
                <CheckCircle
                  className="h-5 w-5"
                  style={{ color: "var(--color-brand-accent)" }}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Claim paid · 4 days
                </p>
                <p className="text-[11px] text-muted-foreground">ZMW 45,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-border bg-card">
        <div className="max-w-[1180px] mx-auto px-7 py-10">
          <div className="grid grid-cols-3 gap-6 text-center divide-x divide-border">
            {stats.map((s) => (
              <div key={s.label} className="px-4">
                <p
                  className="text-[46px] font-semibold leading-none text-primary"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-primary mb-3">
              Everything you need
            </p>
            <h2
              className="text-[clamp(26px,3.4vw,36px)] font-semibold text-foreground"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Built around your family
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-card border border-border rounded-2xl p-[22px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg cursor-default"
                >
                  {/* Top accent line */}
                  <div className="lp-feat-line" />

                  {/* Icon chip */}
                  <div
                    className="w-fit mb-[15px] p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: `color-mix(in srgb, ${f.accentColor} 12%, transparent)`,
                    }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: f.accentColor }}
                    />
                  </div>

                  <p className="font-bold text-[15px] text-foreground mb-2">
                    {f.title}
                  </p>
                  <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                    {f.body}
                  </p>

                  {/* Learn more — reveals on hover */}
                  <div className="flex items-center gap-1.5 mt-4 text-[13px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Learn more
                    <ArrowRight className="lp-readmore-arrow h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="py-20"
        style={{ background: "var(--color-primary-tint)" }}
      >
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-primary mb-3">
              What our customers say
            </p>
            <h2
              className="text-[clamp(24px,3vw,32px)] font-semibold text-foreground"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Trusted by Zambian families
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-4 w-4"
                      style={{
                        fill: "var(--color-brand-accent)",
                        color: "var(--color-brand-accent)",
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-sm text-muted-foreground leading-relaxed italic mb-5"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Knowledge Hub ── */}
      <section
        id="resources"
        className="py-20 border-t border-b border-border"
        style={{ background: "var(--color-card)" }}
      >
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-primary mb-3">
              Knowledge Hub
            </p>
            <h2
              className="text-[clamp(24px,3vw,30px)] font-semibold text-foreground"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Learn about financial planning
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {articles.map((a, i) => (
              <div
                key={i}
                className="group bg-background border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
              >
                {/* Gradient image area */}
                <div
                  className="overflow-hidden"
                  style={{ aspectRatio: "16/9" }}
                >
                  <div
                    className="lp-art-img w-full h-full flex items-center justify-center"
                    style={{
                      background: articleGradients[i],
                      aspectRatio: "16/9",
                    }}
                  >
                    <span className="text-3xl opacity-50">📄</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-[18px]">
                  <p className="text-[11.5px] font-semibold text-muted-foreground mb-1.5">
                    {a.date}
                  </p>
                  <p className="text-[15.5px] font-bold text-foreground leading-snug mb-3">
                    {a.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-primary">
                    Read more
                    <ArrowRight className="lp-readmore-arrow h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-7 relative overflow-hidden text-white">
        {/* Same radial gradient as hero */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(125% 130% at 80% -20%, #00489A, #003A7D 60%, #00264C)",
          }}
        />
        {/* Accent overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, #DB8E2C 28%, transparent), transparent 62%)",
          }}
        />
        {/* DebsMark watermark */}
        <div className="absolute right-[-40px] bottom-[-60px] opacity-[.12] pointer-events-none select-none">
          <DebsMark size={300} />
        </div>

        <div className="relative max-w-[640px] mx-auto text-center">
          <h2
            className="text-[clamp(28px,3.6vw,38px)] font-semibold mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Ready to take control?
          </h2>
          <p className="text-[16.5px] opacity-90 mb-8 leading-relaxed">
            Join thousands of Zambians who trust Debs Insurance for their
            financial security and peace of mind.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 font-bold text-base px-7 py-[15px] rounded-lg transition-all"
            style={{ background: "var(--color-brand-accent)", color: "#fff" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "var(--color-brand-accent-deep)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-brand-accent)")
            }
          >
            Create your free account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "var(--color-foreground)",
          color: "var(--color-background)",
        }}
        className="py-12"
      >
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="flex flex-wrap justify-between gap-8">
            {/* Brand */}
            <div className="max-w-[280px]">
              <div className="flex items-center gap-2.5 mb-4">
                <DebsMark size={26} />
                <span
                  className="font-extrabold text-[15px]"
                  style={{ color: "#fff", letterSpacing: "-0.02em" }}
                >
                  Debs Insurance
                </span>
              </div>
              <p className="text-[13px]" style={{ opacity: 0.66 }}>
                Securing your future with transparent, modern insurance
                solutions.
              </p>
            </div>

            {/* Links */}
            {[
              { title: "Company", links: ["About", "Careers", "Press"] },
              {
                title: "Resources",
                links: ["Help Centre", "Privacy", "Terms"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3
                  className="font-bold text-[14px] mb-3"
                  style={{ color: "#fff" }}
                >
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-[13px] hover:opacity-100 transition-opacity"
                        style={{ opacity: 0.66 }}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div>
              <h3
                className="font-bold text-[14px] mb-3"
                style={{ color: "#fff" }}
              >
                Contact
              </h3>
              <ul className="space-y-2 text-[13px]" style={{ opacity: 0.66 }}>
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  <span>+260 123 456</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span>hello@debs.zm</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Lusaka, Zambia</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-10 pt-8 border-t text-[13px] text-center"
            style={{ borderColor: "rgba(255,255,255,.1)", opacity: 0.4 }}
          >
            © 2025 Debs Insurance. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
