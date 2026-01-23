import { api } from "@/lib/axios";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiResponse,
  User,
  ProfileUpdateData,
} from "../types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", credentials);
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  logoutAll: async (): Promise<void> => {
    await api.post("/auth/logout-all");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/refresh", { refreshToken });
    return data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/reset-password", { token, password });
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const { data } = await api.post<ApiResponse>("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const { data } = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return data;
  },

  updateProfile: async (updates: ProfileUpdateData): Promise<ApiResponse<{ user: User }>> => {
    const { data } = await api.patch<ApiResponse<{ user: User }>>("/auth/me", updates);
    return data;
  },
};
