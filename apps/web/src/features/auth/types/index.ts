export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    name: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    success: boolean;
    data?: {
        token: string;
        user: User;
    };
    error?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}
