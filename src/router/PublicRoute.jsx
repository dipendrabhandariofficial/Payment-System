// src/components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/atoms/Loader";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Prevent flicker before auth initializes
  if (loading) {
    return <Loader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
