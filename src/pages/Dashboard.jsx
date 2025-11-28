import React, { useState, useEffect, useMemo } from "react";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useStudents, usePayments } from "../services/api";
import { useTranslation } from "react-i18next";
import { Users, DollarSign, AlertCircle, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Select from "../components/Select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [period, setPeriod] = useState("monthly");

  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const loading = studentsLoading || paymentsLoading;

  // Memoize date range calculation
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    return { startDate, endDate };
  }, [period]);

  // Memoize stats calculation
  const stats = useMemo(() => {
    if (students.length === 0 && payments.length === 0) {
      return {
        totalStudents: 0,
        totalCollected: 0,
        totalPending: 0,
        recentPayments: [],
        duePaymentsCount: 0,
        overdueAmount: 0,
      };
    }

    const { startDate, endDate } = dateRange;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter payments within the period (optimized)
    const periodPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    // Get unique student IDs who made payments in this period
    const activeStudentIds = new Set(periodPayments.map((p) => p.studentId));
    const totalStudents = activeStudentIds.size;

    // Total collected in period
    const totalCollected = periodPayments.reduce((sum, p) => sum + p.amount, 0);

    // Total pending across all students
    const totalPending = students.reduce(
      (sum, s) => sum + (s.pendingFees || 0),
      0
    );

    // Calculate due payments - FIXED LOGIC
    const studentsWithDues = new Set();
    let overdueAmount = 0;

    students.forEach((student) => {
      let hasOverdue = false;
      let studentOverdueAmount = 0;

      // Check semester-wise fees
      if (student.semesterFees && Array.isArray(student.semesterFees)) {
        student.semesterFees.forEach((semFee) => {
          if (!semFee.paid && semFee.dueDate) {
            const dueDate = new Date(semFee.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            // Calculate paid amount for this semester
            const semesterPayments = payments.filter(
              (p) =>
                p.studentId === student.id &&
                p.semester === semFee.semester &&
                p.status === "Completed"
            );
            const paidAmount = semesterPayments.reduce(
              (sum, p) => sum + p.amount,
              0
            );

            // If there's remaining amount
            if (paidAmount < semFee.amount) {
              const remainingAmount = semFee.amount - paidAmount;

              // Check if overdue
              if (dueDate < today) {
                hasOverdue = true;
                studentOverdueAmount += remainingAmount;
              }
            }
          }
        });
      } else if (student.pendingFees > 0) {
        // Fallback: if student has pending fees, consider them as having dues
        hasOverdue = true;
        studentOverdueAmount = student.pendingFees;
      }

      // Add student to set only once if they have any overdue payments
      if (hasOverdue) {
        studentsWithDues.add(student.id);
        overdueAmount += studentOverdueAmount;
      }
    });

    // Count unique students with dues (not individual due payments)
    const duePaymentsCount = studentsWithDues.size;

    // Recent payments (last 5)
    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 5);

    return {
      totalStudents,
      totalCollected,
      totalPending,
      recentPayments,
      duePaymentsCount,
      overdueAmount,
    };
  }, [students, payments, dateRange]);

  // Memoize chart data
  const chartData = useMemo(() => {
    const now = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const totalAmount = payments.reduce((sum, payment) => {
        const paymentDate = new Date(payment.paymentDate);
        if (paymentDate >= monthStart && paymentDate <= monthEnd) {
          return sum + payment.amount;
        }
        return sum;
      }, 0);

      months.push({
        name: monthNames[date.getMonth()],
        amount: totalAmount,
      });
    }

    return months;
  }, [payments]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    const now = new Date();
    switch (period) {
      case "monthly":
        return now.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter} ${now.getFullYear()}`;
      case "yearly":
        return now.getFullYear().toString();
      default:
        return "";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <PageLayout
      title={t("dashboard.title")}
      subtitle={t("dashboard.subtitle")}
      actionButton={
        <Select
          label={t("dashboard.period")}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          icon={Calendar}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "yearly", label: "Yearly" },
          ]}
          className="min-w-[180px]"
        />
      }
    >
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {t("dashboard.showingstats")}{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {getPeriodLabel()}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          title={t("dashboard.feepaid")}
          value={stats.totalStudents}
          subtitle={`${t("dashboard.activein")} ${t(`dashboard.${period}`)}`}
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          valueColor="text-blue-600"
        />
        <StatCard
          title={t("dashboard.collection")}
          value={formatCurrency(stats.totalCollected)}
          subtitle={`${t("dashboard.in")} ${t(`dashboard.${period}`)}`}
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          valueColor="text-green-600"
        />
        <StatCard
          title={t("dashboard.pending")}
          value={formatCurrency(stats.totalPending)}
          subtitle={t("dashboard.outstandingfees")}
          icon={AlertCircle}
          valueColor="text-yellow-600"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          onClick={() => navigate("/students")}
        />
        <StatCard
          title={t("dashboard.studentdue")}
          value={stats.duePaymentsCount}
          subtitle={`Overdue: ${formatCurrency(stats.overdueAmount)}`}
          icon={Clock}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          valueColor="text-red-600"
          onClick={() => navigate("/due-payments")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mb-4">
            {t("dashboard.paymenttrends")}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="amount" fill="#4b5563" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:text-white">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t("dashboard.recentpayments")}
          </h2>
          <div className="space-y-3">
            {stats.recentPayments.length > 0 ? (
              stats.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 dark:bg-gray-700 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {payment.studentName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No recent payments
              </p>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
