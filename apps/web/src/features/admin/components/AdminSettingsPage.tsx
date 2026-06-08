import { Building2, Mail, MapPin, Check } from "lucide-react";
import { toast } from "sonner";

import { IconChip } from "@/components/ui/icon-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminSettingsPage() {
  return (
    <div className="max-w-[680px]" data-testid="admin-settings-page">
      {/* Organisation panel */}
      <div className="bg-card border border-border rounded-2xl p-[22px]">
        {/* Panel header */}
        <div className="flex items-center gap-3 mb-[18px]">
          <IconChip icon={Building2} tone="primary" size="sm" />
          <div>
            <p className="text-[14px] font-semibold text-foreground leading-tight">
              Organisation
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-[14px]">
          <div className="grid gap-1.5">
            <Label htmlFor="org-name">Company name</Label>
            <Input id="org-name" defaultValue="Debs Insurance Ltd" />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="org-email">Support email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="org-email"
                type="email"
                defaultValue="hello@debsinsurance.zm"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="org-office">Office</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="org-office"
                defaultValue="Cairo Road, Lusaka"
                className="pl-9"
              />
            </div>
          </div>

          <Button
            className="justify-self-start gap-2"
            onClick={() => toast.success("Changes saved")}
          >
            <Check className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
