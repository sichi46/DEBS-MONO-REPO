import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    User,
    Bell,
    Shield,
    Smartphone,
    Save,
} from "lucide-react";
import { mockUser } from "@/lib/mock-data";
import { toast } from "sonner";

export function SettingsPage() {
    const handleSave = () => {
        toast.success("Settings saved successfully!");
    };

    return (
        <div className="space-y-6" data-testid="settings-page">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                {mockUser.avatarInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <Button variant="outline" size="sm">
                                Change Photo
                            </Button>
                            <p className="mt-1 text-sm text-muted-foreground">
                                JPG, PNG or GIF. Max 2MB.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" defaultValue={mockUser.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                defaultValue={mockUser.email}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                defaultValue="+260 97 123 4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                defaultValue="123 Cairo Road, Lusaka"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Notification Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive updates about your policies and claims via email
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive important alerts via SMS
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Payment Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified before payment due dates
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Marketing Updates</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive news about new products and promotions
                            </p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            Enable
                        </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Change Password</Label>
                            <p className="text-sm text-muted-foreground">
                                Update your password regularly for security
                            </p>
                        </div>
                        <Button variant="outline" size="sm">
                            Update
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Connected Devices */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        Connected Devices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Windows PC - Chrome</p>
                                    <p className="text-sm text-muted-foreground">
                                        Lusaka, Zambia • Active now
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary">Current</Badge>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">iPhone 15 Pro</p>
                                    <p className="text-sm text-muted-foreground">
                                        Lusaka, Zambia • Last active 2 hours ago
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive">
                                Remove
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
