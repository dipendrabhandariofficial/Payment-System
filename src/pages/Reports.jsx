import React, { useState, useEffect } from "react";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import { getStudents, getPayments } from "../services/api";
import { Download, FileText } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Button } from "../components/button/Button";

const Reports = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCollected: 0,
    totalPending: 0,
    paymentsByMethod: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const students = await getStudents();
      const payments = await getPayments();

      const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalPending = students.reduce((sum, s) => sum + s.pendingFees, 0);

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
        totalCollected,
        totalPending,
        paymentsByMethod,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  const downloadReport = () => {
    const reportData = `
Student Fee Payment Report
=========================
Total Students: ${stats.totalStudents}
Total Collected: ₹${stats.totalCollected}
Total Pending: ₹${stats.totalPending}

Payment Methods Breakdown:
${stats.paymentsByMethod.map((m) => `${m.name}: ₹${m.value}`).join("\n")}
    `;

    const blob = new Blob([reportData], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fee-report.txt";
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 ">
        <main className="flex-1 bg-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Reports & Analytics
            </h1>
             <Button leftIcon={<Download/>} colorScheme="green" onClick={downloadReport}>Download</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalStudents}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Collected</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{stats.totalCollected}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Pending</p>
                  <p className="text-3xl font-bold text-red-600">
                    ₹{stats.totalPending}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-red-600" />
              </div>
            </div>
          </div>

          <div className="flex w-full gap-2">

          <div className="bg-white p-6  rounded-lg shadow-md flex-2 h-[80vh]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Methods Distribution
            </h2>
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className=" bg-white p-6 rounded-lg shadow-md flex-1 h-[80vh]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Collection Rate</span>
                <span className="text-lg font-semibold text-blue-600">
                  {stats.totalCollected > 0
                    ? (
                        (stats.totalCollected /
                          (stats.totalCollected + stats.totalPending)) *
                        100
                      ).toFixed(2)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Pending Rate</span>
                <span className="text-lg font-semibold text-red-600">
                  {stats.totalPending > 0
                    ? (
                        (stats.totalPending /
                          (stats.totalCollected + stats.totalPending)) *
                        100
                      ).toFixed(2)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Average Fee per Student</span>
                <span className="text-lg font-semibold text-green-600">
                  ₹
                  {stats.totalStudents > 0
                    ? Math.round(
                        (stats.totalCollected + stats.totalPending) /
                          stats.totalStudents
                      )
                    : 0}
                </span>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
