import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Apply saved theme before first render to avoid flash
try {
  if (localStorage.getItem("debs-theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch (_e) {
  // localStorage unavailable
}
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RecoilRoot>
    </QueryClientProvider>
  </StrictMode>,
);
