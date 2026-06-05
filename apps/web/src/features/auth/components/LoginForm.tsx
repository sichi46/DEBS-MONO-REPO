import { useState, forwardRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useSetRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { authApi } from "../api";
import {
  userAtom,
  accessTokenAtom,
  refreshTokenAtom,
  isAuthenticatedAtom,
} from "../state/atoms";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Mail,
  Lock,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ElementType;
  right?: React.ReactNode;
  error?: string;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, id, type = "text", placeholder, icon: Icon, right, error, ...props },
  ref,
) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          className={cn(
            "w-full h-10 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none",
            "focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
            Icon ? "pl-9" : "pl-3",
            right ? "pr-10" : "pr-3",
            error ? "border-destructive" : "border-border",
          )}
          {...props}
        />
        {right && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {right}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});

/* ── Brand aside panel ── */
function AsidePanel({
  quote,
  who,
  where,
}: {
  quote: string;
  who: string;
  where: string;
}) {
  const initials = who
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className="hidden lg:flex w-[44%] max-w-[560px] shrink-0 flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0057B7 0%, #003A7D 70%)",
        color: "#fff",
      }}
    >
      {/* Watermark */}
      <div className="absolute right-[-50px] top-[-30px] opacity-[.10] pointer-events-none select-none">
        <Shield strokeWidth={1} className="h-[320px] w-[320px] text-white" />
      </div>
      {/* Accent radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 90% at 100% 0%, color-mix(in srgb, #DB8E2C 28%, transparent), transparent 55%)",
        }}
      />

      {/* Logo */}
      <div className="relative px-11 pt-10 pb-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">Debs Insurance</span>
        </Link>
      </div>

      {/* Centre content */}
      <div className="relative flex-1 flex flex-col justify-center px-11">
        <p
          className="text-[11px] font-bold uppercase tracking-[.12em] mb-3"
          style={{ color: "#EFB35E" }}
        >
          Zambian. Trusted. Yours.
        </p>
        <h2
          className="text-[34px] font-semibold leading-[1.18] mb-3.5"
          style={{ fontFamily: "var(--font-serif)", color: "#fff" }}
        >
          Secure your future,{" "}
          <span className="italic" style={{ color: "#EFB35E" }}>
            simply.
          </span>
        </h2>
        <p className="text-[15.5px] leading-relaxed opacity-90 max-w-[380px]">
          {quote}
        </p>
        {/* Testimonial */}
        <div className="flex items-center gap-3 mt-6">
          <div className="h-10 w-10 rounded-full bg-emerald-500/80 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold">{who}</p>
            <p className="text-xs opacity-80">{where}</p>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative px-11 pb-10 flex flex-wrap gap-5">
        {["Regulated by PIA", "Bank-level security", "10,000+ families"].map(
          (t) => (
            <div
              key={t}
              className="flex items-center gap-1.5 text-xs font-semibold opacity-90"
            >
              <CheckCircle
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: "#7FD3A6" }}
              />
              {t}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function LoginForm() {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userAtom);
  const setAccessToken = useSetRecoilState(accessTokenAtom);
  const setRefreshToken = useSetRecoilState(refreshTokenAtom);
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        setUser(user);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(user.role === "ADMIN" ? "/admin" : "/dashboard");
      }
    },
    onError: () => {},
  });

  const onSubmit = (data: LoginInput) => loginMutation.mutate(data);
  const apiError = loginMutation.error?.message;

  return (
    <div className="flex min-h-screen">
      <AsidePanel
        quote="The modern, transparent way for Zambian families to manage insurance and investments — all in one place."
        who="Joseph Mwale"
        where="Kitwe, Zambia"
      />

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 py-12 bg-background">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo + visit website */}
          <div className="flex items-center justify-between mb-7">
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold text-primary">
                Debs Insurance
              </span>
            </Link>
            <Link
              to="/"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground ml-auto"
            >
              Visit website
            </Link>
          </div>

          <h1 className="text-[30px] font-bold text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 mb-7">
            Log in to manage your cover and claims.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {apiError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">
                  {apiError === "Invalid email or password"
                    ? "The email or password you entered is incorrect."
                    : apiError}
                </p>
              </div>
            )}

            <Field
              label="Email"
              id="email"
              type="email"
              placeholder="you@email.com"
              icon={Mail}
              error={errors.email?.message}
              {...register("email")}
            />

            <Field
              label="Password"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              {...register("password")}
            />

            <div className="text-right -mt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            New to Debs?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
