import { useState } from "react";
import { User, Bell, Shield, Building, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { mockAdminUser } from "@/lib/mock-data";

export function AdminSettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [claimAlerts, setClaimAlerts] = useState(true);
    const [paymentAlerts, setPaymentAlerts] = useState(true);
    const [newUserAlerts, setNewUserAlerts] = useState(false);

    const handleSave = () => {
        toast.success("Settings saved successfully");
    };

    return (
        <div className="space-y-6" data-testid="admin-settings-page">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Admin Settings
                </h1>
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
                                <Button variant="outline">Change Avatar</Button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" defaultValue={mockAdminUser.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={mockAdminUser.email} />
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

                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
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

                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Preferences
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
                                    <Input id="company-name" defaultValue="DEBS Insurance" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company-email">Support Email</Label>
                                    <Input
                                        id="company-email"
                                        type="email"
                                        defaultValue="support@debsinsurance.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company-phone">Support Phone</Label>
                                    <Input id="company-phone" defaultValue="+260 211 123 456" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company-website">Website</Label>
                                    <Input id="company-website" defaultValue="www.debsinsurance.com" />
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

                            <Button onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Company Info
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
                            <CardDescription>
                                Manage your account security
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Change Password</p>
                                        <p className="text-sm text-muted-foreground">
                                            Update your password regularly for security
                                        </p>
                                    </div>
                                    <Button variant="outline">Change</Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">
                                            Add an extra layer of security
                                        </p>
                                    </div>
                                    <Button variant="outline">Enable</Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Active Sessions</p>
                                        <p className="text-sm text-muted-foreground">
                                            Manage devices logged into your account
                                        </p>
                                    </div>
                                    <Button variant="outline">View All</Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Audit Log</p>
                                        <p className="text-sm text-muted-foreground">
                                            View recent admin activities
                                        </p>
                                    </div>
                                    <Button variant="outline">View Log</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
