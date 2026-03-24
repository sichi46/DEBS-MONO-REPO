import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { authApi } from "../api";
import { userAtom, isAuthenticatedAtom } from "../state/atoms";

/**
 * Runs once on app mount. If an accessToken exists in localStorage,
 * fetches the user profile to hydrate userAtom. This ensures the user
 * object is available after a page refresh.
 */
export function AuthInitializer() {
  const setUser = useSetRecoilState(userAtom);
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    authApi
      .getProfile()
      .then((response) => {
        if (response.data?.user) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        // Refresh token flow in axios interceptor will handle expiry.
        // If that also fails, the interceptor clears tokens and redirects to /login.
        setIsAuthenticated(false);
        setUser(null);
      });
  }, []);

  return null;
}
