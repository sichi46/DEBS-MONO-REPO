// =============================================================================
// Auth Types (aligned with backend)
// =============================================================================

export type UserRole = "ADMIN" | "AGENT" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// Backend API Response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponseData {
  user: User;
  tokens: TokenPair;
}

export type AuthResponse = ApiResponse<AuthResponseData>;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Profile update
export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  address?: string;
}
