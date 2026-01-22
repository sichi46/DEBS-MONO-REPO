import { api } from "@/lib/axios";
import { LoginCredentials, RegisterCredentials, AuthResponse } from "../types";

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await api.post("/auth/login", credentials);
        return data;
    },

    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const { data } = await api.post("/auth/register", credentials);
        return data;
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem("token");
    },
};
