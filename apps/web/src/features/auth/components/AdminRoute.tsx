import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isAuthenticatedAtom, userAtom } from "../state/atoms";

/**
 * Protects routes that require the ADMIN role.
 * Redirects unauthenticated users to /login and non-admins to /dashboard.
 */
export function AdminRoute() {
  const isAuthenticated = useRecoilValue(isAuthenticatedAtom);
  const user = useRecoilValue(userAtom);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // While user is still being hydrated (page refresh), wait before deciding
  if (isAuthenticated && user === null) {
    return null;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
