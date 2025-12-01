import React, { useState, useEffect } from "react";
import { useStudents, usePayments } from "../services/api";
import {
  Download,
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Button } from "@dipendrabhandari/react-ui-library";
import Loader from "../components/atoms/Loader";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import PageLayout from "../components/templates/PageLayout";
import StatCard from "../components/molecules/StatCard";
import QuickStat from "../components/molecules/QuickStat";

const Reports = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsWithPayments: 0,
    totalCollected: 0,
    totalPending: 0,
    paymentsByMethod: [],
  });
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const loading = studentsLoading || paymentsLoading;

  useEffect(() => {
    if (!loading) {
      calculateStats();
    }
  }, [students, payments, loading]);

  const calculateStats = () => {
    try {
      const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalPending = students.reduce(
        (sum, s) => sum + (s.pendingFees || 0),
        0
      );

      // Count unique students who made payments
      const studentsWithPayments = new Set(payments.map((p) => p.studentId))
        .size;

      const methodCount = payments.reduce((acc, payment) => {
        acc[payment.paymentMethod] =
          (acc[payment.paymentMethod] || 0) + payment.amount;
        return acc;
      }, {});

      const paymentsByMethod = Object.entries(methodCount).map(
        ([name, value]) => ({
          name,
          value,
        })
      );

      setStats({
        totalStudents: students.length,
        studentsWithPayments,
        totalCollected,
        totalPending,
        paymentsByMethod,
      });
    } catch (error) {
      console.error("Error calculating report data:", error);
    }
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  const downloadReport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // === HEADER ===
    const logoUrl = "logo.png";

    // Add logo
    const imgWidth = 25;
    const imgHeight = 25;
    try {
      doc.addImage(logoUrl, "PNG", 14, 10, imgWidth, imgHeight);
    } catch (error) {
      console.log("Logo not found, skipping...");
    }

    // Add report title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Student Fee Payment Report", 105, 20, { align: "center" });

    // Subheading
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Generated on: ${date}`, 105, 27, { align: "center" });

    // Line separator
    doc.setDrawColor(60, 141, 188);
    doc.line(14, 35, 196, 35);

    // === SUMMARY SECTION ===
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Total Students Enrolled: ${stats.totalStudents}`, 14, 55);
    doc.text(`Students with Payments: ${stats.studentsWithPayments}`, 14, 62);
    doc.text(
      `Total Collected: ₹${stats.totalCollected.toLocaleString("en-IN")}`,
      14,
      69
    );
    doc.text(
      `Total Pending: ₹${stats.totalPending.toLocaleString("en-IN")}`,
      14,
      76
    );

    const collectionRate =
      stats.totalCollected > 0
        ? (
            (stats.totalCollected /
              (stats.totalCollected + stats.totalPending)) *
            100
          ).toFixed(2)
        : 0;
    doc.text(`Collection Rate: ${collectionRate}%`, 14, 83);

    // === TABLE ===
    const tableData = stats.paymentsByMethod.map((m) => [
      m.name,
      `₹${m.value.toLocaleString("en-IN")}`,
    ]);

    autoTable(doc, {
      startY: 95,
      head: [["Payment Method", "Amount"]],
      body: tableData,
      theme: "grid",
      styles: { halign: "center", fontSize: 11 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    // === FOOTER ===
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Generated on ${date}`, 14, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }

    // Save file
    doc.save(
      `Fee_Payment_Report_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner message="Getting Reports Data " />;
  }

  return (
    <PageLayout
      title={"Reports & Analytics"}
      subtitle={"omprehensive overview of all-time statistics"}
      actionButton={
        <Button
          colorScheme="green"
          onClick={downloadReport}
          leftIcon={<Download />}
        >
          <span className="hidden sm:inline">Download PDF</span>
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Enrolled
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalStudents}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All students
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                With Payments
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.studentsWithPayments}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Made at least 1 payment
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Collected
              </p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.totalCollected)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All-time revenue
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Total Pending
              </p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.totalPending)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Outstanding fees
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1  lg:grid-cols-2 w-full h-full gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex-1 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Payment Methods Distribution
          </h2>
          {stats.paymentsByMethod.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={stats.paymentsByMethod}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.paymentsByMethod.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-gray-500 dark:text-gray-400">
                No payment data available
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex-1 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Financial Summary
          </h2>
          <div className="space-y-4">
            <QuickStat
              title="Collection Rate"
              description="Percentage of total collected vs pending"
              value={
                stats.totalCollected > 0
                  ? (
                      (stats.totalCollected /
                        (stats.totalCollected + stats.totalPending)) *
                      100
                    ).toFixed(2) + "%"
                  : "0%"
              }
              valueClassName="text-blue-600"
            />

            <QuickStat
              title="Pending Rate"
              description="Percentage of remaining unpaid fees"
              value={
                stats.totalPending > 0
                  ? (
                      (stats.totalPending /
                        (stats.totalCollected + stats.totalPending)) *
                      100
                    ).toFixed(2) + "%"
                  : "0%"
              }
              valueClassName="text-red-600"
            />

            <QuickStat
              title="Avg Fee per Student"
              description="Total fee divided by number of students"
              value={formatCurrency(
                stats.totalStudents > 0
                  ? Math.round(
                      (stats.totalCollected + stats.totalPending) /
                        stats.totalStudents
                    )
                  : 0
              )}
              valueClassName="text-green-600"
            />

            <QuickStat
              title="Payment Coverage"
              description="Students who have made payments"
              value={
                stats.totalStudents > 0
                  ? (
                      (stats.studentsWithPayments / stats.totalStudents) *
                      100
                    ).toFixed(1) + "%"
                  : "0%"
              }
              valueClassName="text-purple-600"
            />

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Quick Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Revenue:
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(stats.totalCollected + stats.totalPending)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Students without payments:
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {stats.totalStudents - stats.studentsWithPayments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Reports;
