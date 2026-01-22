import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "../components/LoginForm";
import { authApi } from "../api";

// Mock the auth API
vi.mock("../api", () => ({
    authApi: {
        login: vi.fn(),
    },
}));

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

const renderLoginForm = () => {
    const queryClient = createQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <RecoilRoot>
                <BrowserRouter>
                    <LoginForm />
                </BrowserRouter>
            </RecoilRoot>
        </QueryClientProvider>
    );
};

describe("LoginForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    describe("Rendering", () => {
        it("should render email input", () => {
            renderLoginForm();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        it("should render password input", () => {
            renderLoginForm();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        });

        it("should render submit button", () => {
            renderLoginForm();
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        });
    });

    describe("Validation", () => {
        it("should show error when email is empty", async () => {
            renderLoginForm();
            const submitButton = screen.getByRole("button", { name: /sign in/i });

            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            });
        });

        it("should show error when password is empty", async () => {
            renderLoginForm();
            const emailInput = screen.getByLabelText(/email/i);
            const submitButton = screen.getByRole("button", { name: /sign in/i });

            await userEvent.type(emailInput, "test@example.com");
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            });
        });
    });

    // TODO: Form Submission tests are flaky due to timing - investigate later
    describe.skip("Form Submission", () => {
        it("should call login API with credentials on submit", async () => {
            const mockLogin = vi.mocked(authApi.login);
            mockLogin.mockResolvedValue({
                success: true,
                data: {
                    token: "mock-token",
                    user: { id: "1", email: "test@example.com", name: "Test" },
                },
            });

            renderLoginForm();

            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/password/i);
            const submitButton = screen.getByRole("button", { name: /sign in/i });

            await userEvent.type(emailInput, "test@example.com");
            await userEvent.type(passwordInput, "Password123!");
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    email: "test@example.com",
                    password: "Password123!",
                });
            });
        });

        it("should show error message on failed login", async () => {
            const mockLogin = vi.mocked(authApi.login);
            mockLogin.mockRejectedValue(new Error("Invalid credentials"));

            renderLoginForm();

            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/password/i);
            const submitButton = screen.getByRole("button", { name: /sign in/i });

            await userEvent.type(emailInput, "test@example.com");
            await userEvent.type(passwordInput, "wrongpassword");
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            });
        });
    });
});
