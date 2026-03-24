import { atom } from "recoil";
import { User } from "../types";

// Check if user is authenticated on load
const getInitialAuthState = (): boolean => {
  return !!localStorage.getItem("accessToken");
};

export const userAtom = atom<User | null>({
  key: "auth/user",
  default: null,
});

export const accessTokenAtom = atom<string | null>({
  key: "auth/accessToken",
  default: localStorage.getItem("accessToken"),
});

export const refreshTokenAtom = atom<string | null>({
  key: "auth/refreshToken",
  default: localStorage.getItem("refreshToken"),
});

export const isAuthenticatedAtom = atom<boolean>({
  key: "auth/isAuthenticated",
  default: getInitialAuthState(),
});

export const isLoadingAtom = atom<boolean>({
  key: "auth/isLoading",
  default: false,
});

// Legacy export for backward compatibility
export const tokenAtom = accessTokenAtom;
