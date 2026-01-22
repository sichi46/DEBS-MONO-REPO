import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useSetRecoilState } from "recoil";
import { authApi } from "../api";
import { userAtom, tokenAtom, isAuthenticatedAtom } from "../state/atoms";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Shield } from "lucide-react";

export function RegisterForm() {
    const navigate = useNavigate();
    const setUser = useSetRecoilState(userAtom);
    const setToken = useSetRecoilState(tokenAtom);
    const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [apiError, setApiError] = useState<string | null>(null);

    const registerMutation = useMutation({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            if (data.success && data.data) {
                localStorage.setItem("token", data.data.token);
                setToken(data.data.token);
                setUser(data.data.user);
                setIsAuthenticated(true);
                navigate("/dashboard");
            }
        },
        onError: (error: Error) => {
            setApiError(error.message || "Registration failed. Please try again.");
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);

        if (formData.password !== formData.confirmPassword) {
            setApiError("Passwords do not match!");
            return;
        }

        const name = `${formData.firstName} ${formData.lastName}`.trim();
        if (!name) {
            setApiError("Name is required");
            return;
        }

        registerMutation.mutate({
            name,
            email: formData.email,
            password: formData.password
        });
    };

    return (
        <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-[#E2E8F0]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-[#0057B7] rounded-lg flex items-center justify-center">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl text-[#0057B7]">Debs Insurance</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">
                            Create Your Account
                        </CardTitle>
                        <p className="text-center text-[#64748B]">
                            Join Debs Insurance and secure your future
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="bg-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="bg-white"
                                />
                            </div>

                            {apiError && (
                                <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                                    <p className="text-sm text-destructive">{apiError}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                            </Button>

                            <div className="text-center text-sm text-[#64748B]">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="text-[#0057B7] hover:underline"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
