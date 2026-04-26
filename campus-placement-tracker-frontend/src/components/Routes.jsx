import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "./Feedback.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const dashboardFor = (role) =>
  role === "RECRUITER" ? "/recruiter/dashboard" : "/student/dashboard";

export function ProtectedRoute({ roles }) {
  const { user, isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <LoadingState label="Checking session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={dashboardFor(user.role)} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) return <LoadingState label="Checking session" />;

  if (isAuthenticated) {
    return <Navigate to={dashboardFor(user.role)} replace />;
  }

  return <Outlet />;
}

export function RoleRedirect() {
  const { user, isAuthenticated, initializing } = useAuth();

  if (initializing) return <LoadingState label="Opening workspace" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardFor(user.role)} replace />;
}
