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

export function LoginForm() {
    const navigate = useNavigate();
    const setUser = useSetRecoilState(userAtom);
    const setToken = useSetRecoilState(tokenAtom);
    const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [apiError, setApiError] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: authApi.login,
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
            setApiError(error.message || "Invalid credentials");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);
        loginMutation.mutate({ email, password });
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
                            Welcome Back
                        </CardTitle>
                        <p className="text-center text-[#64748B]">
                            Log in to your Debs Insurance account
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    className="text-sm text-[#0057B7] hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            {apiError && (
                                <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                                    <p className="text-sm text-destructive">{apiError}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                {loginMutation.isPending ? "Logging in..." : "Login"}
                            </Button>

                            <div className="text-center text-sm text-[#64748B]">
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="text-[#0057B7] hover:underline"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
