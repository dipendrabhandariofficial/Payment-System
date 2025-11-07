// src/MainRouter.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import MainLayout from "../layouts/Mainlayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Payments from "../pages/Payments";
import AddPayment from "../pages/AddPayement";
import Reports from "../pages/Reports";

function Approute() {
  return (
    <Routes>
      {/* Base redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes (accessible only when not logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/add-payment" element={<AddPayment />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default Approute;
