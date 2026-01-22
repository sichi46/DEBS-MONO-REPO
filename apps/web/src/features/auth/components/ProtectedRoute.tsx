import { Navigate, Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isAuthenticatedAtom } from "../state/atoms";

export function ProtectedRoute() {
    const isAuthenticated = useRecoilValue(isAuthenticatedAtom);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
