import { useState, forwardRef } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../api";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, CheckCircle, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ElementType;
  error?: string;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, id, type = "text", placeholder, icon: Icon, error, ...props },
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
            "w-full h-10 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-3",
            Icon ? "pl-9" : "pl-3",
            error ? "border-destructive" : "border-border",
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});

function AsidePanel() {
  return (
    <div
      className="hidden lg:flex w-[44%] max-w-[560px] shrink-0 flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0057B7 0%, #003A7D 70%)",
        color: "#fff",
      }}
    >
      <div className="absolute right-[-50px] top-[-30px] opacity-[.10] pointer-events-none">
        <Shield strokeWidth={1} className="h-[320px] w-[320px] text-white" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 90% at 100% 0%, color-mix(in srgb, #DB8E2C 28%, transparent), transparent 55%)",
        }}
      />
      <div className="relative px-11 pt-10 pb-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">Debs Insurance</span>
        </Link>
      </div>
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
          We'll help you get back into your account securely — no hassle, no
          wait.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <div className="h-10 w-10 rounded-full bg-emerald-500/80 flex items-center justify-center text-white text-sm font-bold shrink-0">
            DS
          </div>
          <div>
            <p className="text-sm font-bold">Debs Support</p>
            <p className="text-xs opacity-80">Lusaka, Zambia</p>
          </div>
        </div>
      </div>
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

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) =>
      authApi.forgotPassword(data.email),
    onSuccess: () => setSent(true),
    onError: () => {},
  });

  return (
    <div className="flex min-h-screen">
      <AsidePanel />

      <div className="flex-1 flex flex-col items-center justify-center px-10 py-12 bg-background">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-7 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-bold text-primary">
                Debs Insurance
              </span>
            </Link>
          </div>

          {!sent ? (
            <>
              {/* Lock icon */}
              <div className="h-[60px] w-[60px] rounded-[18px] bg-primary/10 flex items-center justify-center mb-[18px]">
                <Lock className="h-7 w-7 text-primary" />
              </div>

              <h1 className="text-[26px] font-bold text-foreground">
                Reset password
              </h1>
              <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed">
                Enter your email and we'll send a secure reset link.
              </p>

              <form
                onSubmit={handleSubmit((data) => mutation.mutate(data))}
                className="space-y-4"
              >
                {mutation.error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm text-destructive">
                      {mutation.error.message}
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
                <Button
                  type="submit"
                  className="w-full mt-2"
                  size="lg"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <div className="text-center mt-[18px]">
                <Link
                  to="/login"
                  className="text-[13.5px] font-bold text-primary hover:underline"
                >
                  Back to log in
                </Link>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="h-[84px] w-[84px] rounded-[26px] bg-success/10 flex items-center justify-center mx-auto mb-[18px]">
                <Mail className="h-10 w-10 text-success" />
              </div>
              <h1 className="text-[24px] font-bold text-foreground">
                Check your email
              </h1>
              <p className="text-sm text-muted-foreground mt-2.5 leading-[1.55] max-w-[280px] mx-auto">
                We've sent a reset link to your email. It expires in 30 minutes.
              </p>
              <Button className="w-full mt-6" size="lg" asChild>
                <Link to="/login">Back to log in</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
