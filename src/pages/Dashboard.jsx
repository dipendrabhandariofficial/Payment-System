import React, { useState, useEffect } from "react";
import Navbar from "../layouts/Navbar";
import Dropdown from "../components/dropdown/Dropdown";
import Sidebar from "../layouts/Sidebar";
import { getStudents, getPayments } from "../services/api";
import { Users, DollarSign, AlertCircle, Clock8 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCollected: 0,
    totalPending: 0,
    recentPayments: [],
    studentsWithDue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { t } = useTranslation();

  const options = ["Monthly", "Quarterly", "Yearly"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const students = await getStudents();
      const payments = await getPayments();

      const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalPending = students.reduce((sum, s) => sum + s.pendingFees, 0);
      const recentPayments = payments.slice(-5).reverse();
      const studentsWithDue = students.filter((s) => s.pendingFees > 0).length;

      const months = [
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
      const monthlyTotals = {};

      payments.forEach((p) => {
        const monthIndex = new Date(p.paymentDate).getMonth();
        const monthName = months[monthIndex];
        monthlyTotals[monthName] = (monthlyTotals[monthName] || 0) + p.amount;
      });

      const formattedChartData = months.map((m) => ({
        name: m,
        amount: monthlyTotals[m] || 0,
      }));

      setStats({
        totalStudents: students.length,
        totalCollected,
        totalPending,
        recentPayments,
        studentsWithDue,
      });
      setChartData(formattedChartData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        <div className="flex flex-1">
          <main className="flex-1  p-6">
            <div className="flex justify-between items-start flex-wrap gap-4 pr-10">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  {t("dashboard.title")}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("dashboard.description")}
                </p>
              </div>
              <Dropdown
                label= {t("dashboard.period")}
                options={options}
                defaultValue="Yearly"
                onSelect={(value) => console.log("Selected:", value)}
                darkMode={darkMode}
              >
                {t("dashboard.period")}
                </Dropdown>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {[
                {
                  title: t("dashboard.students"),
                  value: stats.totalStudents,
                  icon: <Users className="w-10 h-10 text-blue-500" />,
                },
                {
                  title: t("dashboard.collection"),
                  value: `₹${stats.totalCollected}`,
                  icon: <DollarSign className="w-10 h-10 text-green-500" />,
                },
                {
                  title: t("dashboard.pending"),
                  value: `₹${stats.totalPending}`,
                  icon: <AlertCircle className="w-10 h-10 text-yellow-500" />,
                },
                {
                  title: t("dashboard.studentdue"),
                  value: stats.studentsWithDue,
                  icon: <Clock8 className="w-10 h-10 text-red-500" />,
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                        {card.value}
                      </p>
                    </div>
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts & Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Payment Trends */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  {t("dashboard.paymenttrends")}
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#374151" : "#e5e7eb"}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={darkMode ? "#d1d5db" : "#374151"}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={darkMode ? "#d1d5db" : "#374151"}
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#fff",
                        border: darkMode
                          ? "1px solid #374151"
                          : "1px solid #e5e7eb",
                        color: darkMode ? "#f9fafb" : "#111827",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Payments */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  {t("dashboard.recentpayments")}
                </h2>
                <div className="space-y-3">
                  {stats.recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.studentName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.paymentDate}
                        </p>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ₹{payment.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
