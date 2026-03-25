import { useState } from "react";
import { User, Bell, Shield, Building, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { mockAdminUser } from "@/lib/mock-data";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
});

const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  supportEmail: z.string().email("Please enter a valid email"),
  supportPhone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormErrors = Record<string, string>;

export function AdminSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [claimAlerts, setClaimAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [newUserAlerts, setNewUserAlerts] = useState(false);
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [companyErrors, setCompanyErrors] = useState<FormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const simulateSave = async (
    schema: z.ZodSchema,
    data: Record<string, unknown>,
    setErrors: (e: FormErrors) => void,
    setLoading: (b: boolean) => void,
    successMsg: string,
  ) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = String(err.path[0]);
        if (!errors[field]) errors[field] = err.message;
      });
      setErrors(errors);
      return;
    }
    setErrors({});
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success(successMsg);
  };

  return (
    <div className="space-y-6" data-testid="admin-settings-page">
      {/* Header */}
      <div>
        <p className="text-muted-foreground">
          Manage your account and system preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                  {mockAdminUser.avatarInitials}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    defaultValue={mockAdminUser.name}
                    className={profileErrors.name ? "border-destructive" : ""}
                  />
                  {profileErrors.name && (
                    <p className="text-sm text-destructive">
                      {profileErrors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={mockAdminUser.email}
                    className={profileErrors.email ? "border-destructive" : ""}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-destructive">
                      {profileErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue={mockAdminUser.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value="Administrator" disabled />
                </div>
              </div>

              <Button
                className="pr-5"
                disabled={savingProfile}
                onClick={() => {
                  const name = (
                    document.getElementById("name") as HTMLInputElement
                  )?.value;
                  const email = (
                    document.getElementById("email") as HTMLInputElement
                  )?.value;
                  const phone = (
                    document.getElementById("phone") as HTMLInputElement
                  )?.value;
                  simulateSave(
                    profileSchema,
                    { name, email, phone },
                    setProfileErrors,
                    setSavingProfile,
                    "Profile saved successfully",
                  );
                }}
              >
                {savingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Alert Preferences
              </CardTitle>
              <CardDescription>
                Configure when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for important updates
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Claim Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new claims are submitted
                  </p>
                </div>
                <Switch
                  checked={claimAlerts}
                  onCheckedChange={setClaimAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about payment activities
                  </p>
                </div>
                <Switch
                  checked={paymentAlerts}
                  onCheckedChange={setPaymentAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New User Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new users register
                  </p>
                </div>
                <Switch
                  checked={newUserAlerts}
                  onCheckedChange={setNewUserAlerts}
                />
              </div>

              <Button
                disabled={savingAlerts}
                className="pr-5"
                onClick={async () => {
                  setSavingAlerts(true);
                  await new Promise((r) => setTimeout(r, 1000));
                  setSavingAlerts(false);
                  toast.success("Alert preferences saved successfully");
                }}
              >
                {savingAlerts ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {savingAlerts ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription>
                Manage company details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    defaultValue="DEBS Insurance"
                    className={
                      companyErrors.companyName ? "border-destructive" : ""
                    }
                  />
                  {companyErrors.companyName && (
                    <p className="text-sm text-destructive">
                      {companyErrors.companyName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Support Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    defaultValue="support@debsinsurance.com"
                    className={
                      companyErrors.supportEmail ? "border-destructive" : ""
                    }
                  />
                  {companyErrors.supportEmail && (
                    <p className="text-sm text-destructive">
                      {companyErrors.supportEmail}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Support Phone</Label>
                  <Input id="company-phone" defaultValue="+260 211 123 456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    defaultValue="www.debsinsurance.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Textarea
                  id="company-address"
                  defaultValue="123 Cairo Road, Lusaka, Zambia"
                  rows={3}
                />
              </div>

              <Button
                className="pr-5"
                disabled={savingCompany}
                onClick={() => {
                  const companyName = (
                    document.getElementById("company-name") as HTMLInputElement
                  )?.value;
                  const supportEmail = (
                    document.getElementById("company-email") as HTMLInputElement
                  )?.value;
                  const supportPhone = (
                    document.getElementById("company-phone") as HTMLInputElement
                  )?.value;
                  const website = (
                    document.getElementById(
                      "company-website",
                    ) as HTMLInputElement
                  )?.value;
                  const address = (
                    document.getElementById(
                      "company-address",
                    ) as HTMLTextAreaElement
                  )?.value;
                  simulateSave(
                    companySchema,
                    {
                      companyName,
                      supportEmail,
                      supportPhone,
                      website,
                      address,
                    },
                    setCompanyErrors,
                    setSavingCompany,
                    "Company info saved successfully",
                  );
                }}
              >
                {savingCompany ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {savingCompany ? "Saving..." : "Save Company Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Change Password */}
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">
                        Update your password regularly for security
                      </p>
                    </div>
                    {!showPasswordForm && (
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordForm(true)}
                      >
                        Change
                      </Button>
                    )}
                  </div>

                  {showPasswordForm && (
                    <div className="space-y-4 pt-2 border-t">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="current-pw">Current Password</Label>
                          <Input
                            id="current-pw"
                            type="password"
                            className={
                              passwordErrors.currentPassword
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {passwordErrors.currentPassword && (
                            <p className="text-sm text-destructive">
                              {passwordErrors.currentPassword}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-pw">New Password</Label>
                          <Input
                            id="new-pw"
                            type="password"
                            className={
                              passwordErrors.newPassword
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {passwordErrors.newPassword && (
                            <p className="text-sm text-destructive">
                              {passwordErrors.newPassword}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-pw">Confirm Password</Label>
                          <Input
                            id="confirm-pw"
                            type="password"
                            className={
                              passwordErrors.confirmPassword
                                ? "border-destructive"
                                : ""
                            }
                          />
                          {passwordErrors.confirmPassword && (
                            <p className="text-sm text-destructive">
                              {passwordErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          disabled={savingPassword}
                          onClick={() => {
                            const currentPassword = (
                              document.getElementById(
                                "current-pw",
                              ) as HTMLInputElement
                            )?.value;
                            const newPassword = (
                              document.getElementById(
                                "new-pw",
                              ) as HTMLInputElement
                            )?.value;
                            const confirmPassword = (
                              document.getElementById(
                                "confirm-pw",
                              ) as HTMLInputElement
                            )?.value;
                            const result = passwordSchema.safeParse({
                              currentPassword,
                              newPassword,
                              confirmPassword,
                            });
                            if (!result.success) {
                              const errors: FormErrors = {};
                              result.error.errors.forEach((err) => {
                                const field = String(err.path[0]);
                                if (!errors[field]) errors[field] = err.message;
                              });
                              setPasswordErrors(errors);
                              return;
                            }
                            setPasswordErrors({});
                            setSavingPassword(true);
                            setTimeout(() => {
                              setSavingPassword(false);
                              setShowPasswordForm(false);
                              toast.success("Password changed successfully");
                            }, 1000);
                          }}
                        >
                          {savingPassword ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {savingPassword ? "Updating..." : "Update Password"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordErrors({});
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Sessions */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Active Sessions</p>
                    <p className="text-sm text-muted-foreground">
                      You are currently logged in on this device
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    1 session
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
