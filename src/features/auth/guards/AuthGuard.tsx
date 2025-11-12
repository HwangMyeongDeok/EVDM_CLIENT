import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { RootState } from "@/app/store";

interface AuthGuardProps {
  allowedRoles?: string[];
  unauthorizedRedirect?: string;
  roleRedirectMap?: Record<string, string>;
  fallbackPath?: string;
}

export default function AuthGuard({
  allowedRoles = [],
  roleRedirectMap = {
    DEALER_STAFF: "/dealer/staff/dashboard",
    DEALER_MANAGER: "/dealer/manager/dashboard",
    EVM_STAFF: "/evm/dashboard",
    ADMIN: "/admin/dashboard",
  },
  fallbackPath = "/login",
  unauthorizedRedirect = "/unauthorized",
}: AuthGuardProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = roleRedirectMap[user.role] || fallbackPath;
    return <Navigate to={redirectPath} replace />;
  }

  const redirectPath = roleRedirectMap[user.role] || "/";
  const isAtRoot = location.pathname === "/" || location.pathname === "";

  if (isAtRoot && redirectPath !== "/") {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}