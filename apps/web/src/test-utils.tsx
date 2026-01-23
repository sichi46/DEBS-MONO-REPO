import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";

// Create a fresh QueryClient for each test
function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

// All providers wrapper component
interface AllProvidersProps {
    children: React.ReactNode;
    queryClient?: QueryClient;
}

function AllProviders({ children, queryClient }: AllProvidersProps) {
    const client = queryClient || createTestQueryClient();

    return (
        <QueryClientProvider client={client}>
            <RecoilRoot>
                <BrowserRouter>{children}</BrowserRouter>
            </RecoilRoot>
        </QueryClientProvider>
    );
}

// Custom render function that wraps component with all providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    queryClient?: QueryClient;
}

export function renderWithProviders(
    ui: ReactElement,
    options: CustomRenderOptions = {}
) {
    const { queryClient, ...renderOptions } = options;

    return render(ui, {
        wrapper: ({ children }) => (
            <AllProviders queryClient={queryClient}>{children}</AllProviders>
        ),
        ...renderOptions,
    });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";

// Export the providers for manual composition if needed
export { AllProviders, createTestQueryClient };
