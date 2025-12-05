import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import Loader from "@/components/atoms/Loader";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
