import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import Loader from "@/components/atoms/Loader";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, loading, user } = useAuth(); // Assuming 'user' is available in useAuth

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && user.role && !allowedRoles.includes(user.role)) {
    // User is authenticated but doesn't have the permission
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
