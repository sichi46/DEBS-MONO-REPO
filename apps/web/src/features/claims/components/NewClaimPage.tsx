import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Activity,
  Car,
  Shield,
  DollarSign,
  CloudUpload,
  FileText,
  Camera,
  ShieldCheck,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconChip } from "@/components/ui/icon-chip";
import { claimsApi } from "../api";
import type { Policy } from "@/lib/mock-data";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_TITLES = [
  "Which policy?",
  "Claim details",
  "Upload documents",
  "Review and submit",
];

const CLAIM_KINDS = [
  "Medical",
  "Hospital",
  "Critical Illness",
  "Accident",
  "Other",
];

const SIMULATED_FILES = [
  { name: "Medical report.pdf", size: "1.2 MB", type: "pdf" as const },
  { name: "Receipt.jpg", size: "820 KB", type: "img" as const },
  { name: "ID copy.pdf", size: "460 KB", type: "pdf" as const },
];

interface UploadedFile {
  name: string;
  size: string;
  type: "pdf" | "img";
  uploadedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function policyIconAndTone(policyType: string): {
  icon: LucideIcon;
  tone: "danger" | "success" | "info" | "primary";
} {
  const lower = policyType.toLowerCase();
  if (lower.includes("life")) return { icon: HeartPulse, tone: "danger" };
  if (lower.includes("health")) return { icon: Activity, tone: "success" };
  if (lower.includes("auto")) return { icon: Car, tone: "info" };
  return { icon: Shield, tone: "primary" };
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mb-[22px]">
      {STEP_TITLES.map((title, i) => {
        const active = i <= step;
        return (
          <div key={i} className="flex-1 flex flex-col gap-1.5">
            <div
              className={`h-[6px] rounded-full transition-colors ${
                active ? "bg-primary" : "bg-muted"
              }`}
            />
            <span
              className={`text-[11px] font-bold leading-tight ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function NewClaimPage() {
  const navigate = useNavigate();

  // wizard step (0-3 = wizard steps, 4 = success)
  const [step, setStep] = useState(0);

  // step 0
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // step 1
  const [claimKind, setClaimKind] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // step 2
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileIndex, setFileIndex] = useState(0);

  // submission
  const [submitting, setSubmitting] = useState(false);
  const claimRef = "CLM-4851";

  // Load active policies
  useEffect(() => {
    claimsApi.getPoliciesForClaim().then((data) => {
      setPolicies(data);
      setLoadingPolicies(false);
    });
  }, []);

  // Submit when entering success screen
  useEffect(() => {
    if (step !== 4 || !selectedPolicy) return;
    setSubmitting(true);
    claimsApi
      .submitClaim({
        policyNumber: selectedPolicy.policyNumber,
        claimType: claimKind,
        amount: parseFloat(amount) || 0,
        dateOfIncident: new Date().toISOString().split("T")[0],
        description,
      })
      .then(() => {
        toast.success("Claim submitted successfully!");
      })
      .catch(() => {
        toast.error("Failed to submit claim. Please try again.");
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [step]); // eslint-disable-line

  // Can the user proceed?
  const canContinue = (() => {
    if (step === 0) return selectedPolicy !== null;
    if (step === 1)
      return claimKind !== "" && amount !== "" && parseFloat(amount) > 0;
    return true;
  })();

  function handleContinue() {
    setStep((s) => s + 1);
  }

  function handleBack() {
    if (step === 0) navigate(-1);
    else setStep((s) => s - 1);
  }

  // Simulated file upload
  function handleUploadClick() {
    const file = SIMULATED_FILES[fileIndex % SIMULATED_FILES.length];
    const timeStr = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    setUploadedFiles((prev) => [
      ...prev,
      {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: timeStr,
      },
    ]);
    setFileIndex((i) => i + 1);
  }

  function handleRemoveFile(idx: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // -------------------------------------------------------------------------
  // Success screen (step 4)
  // -------------------------------------------------------------------------

  if (step === 4) {
    return (
      <div className="max-w-[560px] mx-auto text-center py-10">
        <div className="bg-card border border-border rounded-2xl p-10">
          <div className="flex justify-center mb-6">
            <div className="w-[90px] h-[90px] bg-success/10 rounded-[28px] flex items-center justify-center">
              <Check size={48} className="text-[var(--color-success)]" />
            </div>
          </div>

          <h1 className="font-extrabold text-[27px] text-foreground mb-3">
            Claim submitted
          </h1>
          <p className="text-muted-foreground text-[15px] mb-6 max-w-[380px] mx-auto">
            Your claim has been received and is now under review. You'll be
            notified once it's processed.
          </p>

          <div className="bg-muted rounded-xl px-5 py-3.5 inline-block mb-8 text-[14px] font-semibold text-foreground">
            Reference: {claimRef}
          </div>

          <div className="flex gap-2.5 justify-center">
            <Button onClick={() => navigate("/dashboard/claims")}>
              Track my claim
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Wizard
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-[680px] mx-auto py-6">
      <StepIndicator step={step} />

      <div className="bg-card border border-border rounded-2xl p-7">
        {/* ---------------------------------------------------------------- */}
        {/* Step 0 — Policy selection                                        */}
        {/* ---------------------------------------------------------------- */}
        {step === 0 && (
          <>
            <h2 className="font-extrabold text-[21px] text-foreground">
              Select a policy
            </h2>
            <p className="text-muted-foreground text-[14px] mt-1 mb-5">
              Choose the active policy you'd like to file a claim against.
            </p>

            {loadingPolicies ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map((k) => (
                  <div
                    key={k}
                    className="h-[76px] rounded-xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {policies.map((policy) => {
                  const { icon, tone } = policyIconAndTone(policy.policyType);
                  const selected =
                    selectedPolicy?.policyNumber === policy.policyNumber;
                  return (
                    <button
                      key={policy.policyNumber}
                      type="button"
                      onClick={() => setSelectedPolicy(policy)}
                      className={`w-full text-left flex items-center gap-3 p-4 rounded-xl bg-card cursor-pointer transition-all ${
                        selected ? "ring-2 ring-primary/20" : ""
                      }`}
                      style={{
                        border: selected
                          ? "1.5px solid var(--color-primary)"
                          : "1.5px solid var(--color-border)",
                      }}
                    >
                      <IconChip icon={icon} tone={tone} size="lg" />

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[15px] text-foreground leading-tight">
                          {policy.policyType}
                        </div>
                        <div className="text-muted-foreground text-[12.5px] mt-0.5">
                          Cover {policy.coverageAmount}
                        </div>
                      </div>

                      <div
                        className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? "border-primary" : "border-border"
                        }`}
                      >
                        {selected && (
                          <div className="w-[11px] h-[11px] rounded-full bg-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Step 1 — Claim details                                           */}
        {/* ---------------------------------------------------------------- */}
        {step === 1 && (
          <>
            <h2 className="font-extrabold text-[21px] text-foreground">
              Claim details
            </h2>
            <p className="text-muted-foreground text-[14px] mt-1 mb-5">
              Tell us what happened and how much you're claiming.
            </p>

            {/* Claim type pills */}
            <div className="mb-5">
              <label className="block text-[13.5px] font-semibold text-foreground mb-2.5">
                Type of claim
              </label>
              <div className="flex flex-wrap gap-2">
                {CLAIM_KINDS.map((kind) => {
                  const active = claimKind === kind;
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setClaimKind(kind)}
                      className={`rounded-full px-4 py-2.5 font-semibold text-[13.5px] cursor-pointer border-[1.5px] transition-colors ${
                        active
                          ? "bg-primary text-white border-primary"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {kind}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-5">
              <label className="block text-[13.5px] font-semibold text-foreground mb-2.5">
                Claim amount (ZMW)
              </label>
              <div className="flex items-center gap-2 border border-border rounded-xl px-3 h-[50px] bg-card focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <DollarSign
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto bg-transparent text-[15px]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13.5px] font-semibold text-foreground mb-2.5">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                rows={4}
                placeholder="Briefly describe what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-vertical border border-border rounded-xl p-3.5 w-full text-[14px]"
              />
            </div>
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Step 2 — Upload documents                                        */}
        {/* ---------------------------------------------------------------- */}
        {step === 2 && (
          <>
            <h2 className="font-extrabold text-[21px] text-foreground">
              Upload documents
            </h2>
            <p className="text-muted-foreground text-[14px] mt-1 mb-5">
              Attach any supporting documents to strengthen your claim.
            </p>

            {/* Drop zone */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="w-full border-2 border-dashed border-border rounded-xl bg-muted p-9 flex flex-col items-center gap-2.5 cursor-pointer hover:bg-muted/70 transition-colors"
            >
              <div className="w-[58px] h-[58px] rounded-[18px] bg-primary/10 flex items-center justify-center">
                <CloudUpload size={30} className="text-primary" />
              </div>
              <span className="font-bold text-[15.5px] text-foreground">
                Drag and drop, or click to upload
              </span>
              <span className="text-muted-foreground text-[12.5px]">
                PDF, JPG or PNG up to 10 MB each
              </span>
            </button>

            {/* Uploaded file list */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-col">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border mt-3"
                  >
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-success/10 flex items-center justify-center shrink-0">
                      {file.type === "pdf" ? (
                        <FileText
                          size={18}
                          className="text-[var(--color-success)]"
                        />
                      ) : (
                        <Camera
                          size={18}
                          className="text-[var(--color-success)]"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13.5px] text-foreground leading-tight truncate">
                        {file.name}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[var(--color-success)]">
                        <Check size={11} />
                        <span className="text-[11px] font-medium">
                          Uploaded {file.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="w-[28px] h-[28px] bg-muted rounded-full flex items-center justify-center hover:bg-border transition-colors shrink-0"
                    >
                      <X size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Step 3 — Review and submit                                       */}
        {/* ---------------------------------------------------------------- */}
        {step === 3 && selectedPolicy && (
          <>
            <h2 className="font-extrabold text-[21px] text-foreground">
              Review and submit
            </h2>
            <p className="text-muted-foreground text-[14px] mt-1 mb-5">
              Please verify your claim details before submitting.
            </p>

            {/* Summary rows */}
            <div className="border border-border rounded-xl overflow-hidden mb-5">
              {[
                { label: "Policy", value: selectedPolicy.policyType },
                { label: "Policy number", value: selectedPolicy.policyNumber },
                { label: "Type", value: claimKind || "—" },
                {
                  label: "Amount",
                  value: amount
                    ? `ZMW ${parseFloat(amount).toLocaleString()}`
                    : "—",
                },
                {
                  label: "Documents",
                  value:
                    uploadedFiles.length > 0
                      ? `${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""} attached`
                      : "None attached",
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex justify-between p-3.5 text-[13.5px] ${
                    i < arr.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-muted-foreground font-medium">
                    {row.label}
                  </span>
                  <span className="font-semibold text-foreground text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Description preview */}
            {description.trim() && (
              <div className="border border-border rounded-xl p-4 mb-5">
                <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Description
                </div>
                <p className="text-[14px] text-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Confirmation banner */}
            <div className="bg-primary/10 rounded-[14px] p-3.5 flex gap-[11px] items-start">
              <ShieldCheck size={20} className="text-primary shrink-0 mt-0.5" />
              <p className="text-[13.5px] text-foreground leading-snug">
                By submitting, you confirm this information is accurate.
              </p>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Navigation row                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={step === 3 ? () => setStep(4) : handleContinue}
            disabled={!canContinue || submitting}
          >
            {step === 3
              ? submitting
                ? "Submitting…"
                : "Submit claim"
              : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
