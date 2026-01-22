import { atom } from "recoil";
import { AuthState, User } from "../types";

export const userAtom = atom<User | null>({
    key: "auth/user",
    default: null,
});

export const tokenAtom = atom<string | null>({
    key: "auth/token",
    default: localStorage.getItem("token"),
});

export const isAuthenticatedAtom = atom<boolean>({
    key: "auth/isAuthenticated",
    default: !!localStorage.getItem("token"),
});

export const authStateAtom = atom<AuthState>({
    key: "auth/state",
    default: {
        user: null,
        token: localStorage.getItem("token"),
        isAuthenticated: !!localStorage.getItem("token"),
    },
});
