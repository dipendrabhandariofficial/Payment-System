import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import MainLayout from "../layouts/Mainlayout";

import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Students from "../pages/Students.jsx";
import Payments from "../pages/Payments.jsx";
import AddPayment from "../pages/AddPayement.jsx";
import Reports from "../pages/Reports.jsx";
import Courses from "../pages/Courses.jsx";
import DuePayments from "../pages/DuePayments.jsx";
import ZodPractice from "../pages/ZodPractice";
import VirtualizationDemo from "../pages/VirtualizationDemo";
import NotFound from "../pages/NotFound";

const Approute: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
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
        <Route path="/courses" element={<Courses />} />
        <Route path="/due-payments" element={<DuePayments />} />
        <Route path="/zod-practice" element={<ZodPractice />} />
        <Route path="/virtualization" element={<VirtualizationDemo />} />
      </Route>

      {/* 404 Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Approute;
