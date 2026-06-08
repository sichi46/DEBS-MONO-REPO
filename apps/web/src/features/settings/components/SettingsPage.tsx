import { useState } from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  UserCircle,
  Users,
  Wallet,
  Moon,
  Bell,
  Fingerprint,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/ui/icon-chip";

import {
  userAtom,
  accessTokenAtom,
  refreshTokenAtom,
  isAuthenticatedAtom,
} from "@/features/auth/state/atoms";

// ---------- WToggle ----------
function WToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
        on ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-all ${
          on ? "left-[23px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

// ---------- helpers ----------
function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function memberSince(createdAt: string | undefined | null): string {
  if (!createdAt) return "Oct 2024";
  const d = new Date(createdAt);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ---------- Panel wrapper ----------
function Panel({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-[22px]">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="font-semibold text-[15px]">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ---------- SettingsRow ----------
function SettingsRow({
  icon,
  label,
  sub,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border last:border-0 py-3.5">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] leading-snug">{label}</p>
        <p className="text-[13px] text-muted-foreground">{sub}</p>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

export function SettingsPage() {
  const [user, setUser] = useRecoilState(userAtom);
  const [, setAccessToken] = useRecoilState(accessTokenAtom);
  const [, setRefreshToken] = useRecoilState(refreshTokenAtom);
  const [, setIsAuthenticated] = useRecoilState(isAuthenticatedAtom);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[18px] items-start"
      data-testid="settings-page"
    >
      {/* LEFT COLUMN */}
      <div className="grid gap-[18px]">
        {/* Account Panel */}
        <Panel
          icon={<IconChip icon={User} tone="primary" size="sm" />}
          title="Account"
        >
          <SettingsRow
            icon={<IconChip icon={UserCircle} tone="primary" size="sm" />}
            label="Personal details"
            sub="Name, phone, address"
            right={
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Edit profile coming soon")}
              >
                Edit
              </Button>
            }
          />
          <SettingsRow
            icon={<IconChip icon={Users} tone="success" size="sm" />}
            label="Beneficiaries"
            sub="4 people across policies"
            right={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
          <SettingsRow
            icon={<IconChip icon={Wallet} tone="info" size="sm" />}
            label="Payment methods"
            sub="Mobile Money · 1 card"
            right={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
          />
        </Panel>

        {/* Preferences Panel */}
        <Panel
          icon={<IconChip icon={ShieldCheck} tone="accent" size="sm" />}
          title="Preferences"
        >
          <SettingsRow
            icon={<IconChip icon={Moon} tone="accent" size="sm" />}
            label="Dark mode"
            sub={darkMode ? "On" : "Off"}
            right={
              <WToggle on={darkMode} onToggle={() => setDarkMode((v) => !v)} />
            }
          />
          <SettingsRow
            icon={<IconChip icon={Bell} tone="warning" size="sm" />}
            label="Notifications"
            sub="Premiums, claims and offers"
            right={
              <WToggle
                on={notifications}
                onToggle={() => setNotifications((v) => !v)}
              />
            }
          />
          <SettingsRow
            icon={<IconChip icon={Fingerprint} tone="primary" size="sm" />}
            label="Biometric login"
            sub="Face ID / fingerprint"
            right={
              <WToggle
                on={biometric}
                onToggle={() => setBiometric((v) => !v)}
              />
            }
          />
        </Panel>
      </div>

      {/* RIGHT COLUMN */}
      <div className="grid gap-[18px]">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-[22px] text-center">
          {/* Avatar */}
          <div
            className="mx-auto flex items-center justify-center rounded-full text-white font-extrabold text-[26px]"
            style={{
              width: 72,
              height: 72,
              background: "var(--color-primary)",
            }}
          >
            {getInitials(user?.name)}
          </div>
          <p className="mt-3 font-extrabold text-[18px] leading-tight">
            {user?.name ?? "—"}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {user?.email ?? "—"}
          </p>
          {/* Member since badge */}
          <span
            className="inline-block mt-3 px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{
              background: "var(--color-primary)/0.1",
              color: "var(--color-primary)",
              backgroundColor: "rgba(0,71,154,0.10)",
            }}
          >
            Member since {memberSince(user?.createdAt)}
          </span>
        </div>

        {/* Support Panel */}
        <Panel
          icon={<IconChip icon={ShieldCheck} tone="neutral" size="sm" />}
          title="Support"
        >
          <div
            className="flex items-center justify-between border-b border-border py-3.5 cursor-pointer"
            onClick={() => toast.info("Help and support coming soon")}
          >
            <span className="text-[14px] font-medium">Help and support</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div
            className="flex items-center justify-between py-3.5 cursor-pointer"
            onClick={() => toast.info("Privacy and terms coming soon")}
          >
            <span className="text-[14px] font-medium">Privacy and terms</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Panel>

        {/* Log out */}
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
}
