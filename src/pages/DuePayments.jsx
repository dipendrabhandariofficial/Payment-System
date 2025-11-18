// ============================================
// 1. UPDATED DuePayments.jsx
// ============================================

import React, { useState, useEffect, useMemo } from "react";
import { getStudents, getPayments } from "../services/api";
import { AlertCircle, Calendar, DollarSign, Clock, TrendingUp, Users, Filter } from "lucide-react";
import Select from "../components/Select";
import SearchBar from "../components/Search";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";

const DuePayments = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsData, paymentsData] = await Promise.all([
        getStudents(),
        getPayments(),
      ]);
      setStudents(studentsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate which semester a student can pay (must clear previous semesters first)
  const getPayableSemester = (student) => {
    const currentSemester = parseInt(student.semester) || 1;
    const semesterFees = student.semesterFees || [];
    
    // Check each semester from 1 to current semester
    for (let sem = 1; sem <= currentSemester; sem++) {
      const semFee = semesterFees.find(sf => parseInt(sf.semester) === sem);
      
      if (!semFee) continue;
      
      // Calculate paid amount for this semester
      const semesterPayments = payments.filter(
        (p) =>
          p.studentId === student.id &&
          parseInt(p.semester) === sem &&
          p.status === "Completed"
      );
      const paidAmount = semesterPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // If this semester is not fully paid, this is the payable semester
      if (paidAmount < semFee.amount) {
        return sem;
      }
    }
    
    // All semesters up to current are paid
    return null;
  };

  const calculateDuePayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const duePayments = students
      .map((student) => {
        const currentSemester = parseInt(student.semester) || 1;
        const payableSemester = getPayableSemester(student);
        
        // Only show the earliest unpaid semester (blocking system)
        if (!payableSemester) return [];
        
        const semesterFees = student.semesterFees || [];
        const semFee = semesterFees.find(sf => parseInt(sf.semester) === payableSemester);
        
        if (!semFee) return [];
        
        const dueDate = semFee.dueDate ? new Date(semFee.dueDate) : null;
        if (dueDate) dueDate.setHours(0, 0, 0, 0);
        
        const daysUntilDue = getDaysUntilDue(semFee.dueDate);
        const isOverdue = dueDate && dueDate < today;
        
        // Calculate paid amount for this semester
        const semesterPayments = payments.filter(
          (p) =>
            p.studentId === student.id &&
            parseInt(p.semester) === payableSemester &&
            p.status === "Completed"
        );
        const paidAmount = semesterPayments.reduce((sum, p) => sum + p.amount, 0);
        const remainingAmount = semFee.amount - paidAmount;
        
        if (remainingAmount <= 0) return [];
        
        return [{
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          course: student.course,
          semester: payableSemester.toString(),
          semesterNumber: payableSemester,
          currentSemester: currentSemester,
          dueAmount: remainingAmount,
          dueDate: semFee.dueDate,
          daysUntilDue,
          isOverdue,
          paidAmount,
          totalSemesterFee: semFee.amount,
          isBlocked: payableSemester < currentSemester, // Blocked if not current semester
        }];
      })
      .flat()
      .filter((item) => {
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            item.studentName.toLowerCase().includes(searchLower) ||
            item.rollNumber.toLowerCase().includes(searchLower) ||
            item.course.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .filter((item) => {
        if (filterType === "overdue") return item.isOverdue;
        if (filterType === "upcoming") return !item.isOverdue && item.daysUntilDue !== null && item.daysUntilDue <= 30;
        return true;
      })
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
      });

    return duePayments;
  }, [students, payments, searchTerm, filterType]);

  const overdueCount = calculateDuePayments.filter((p) => p.isOverdue).length;
  const upcomingCount = calculateDuePayments.filter(
    (p) => !p.isOverdue && p.daysUntilDue !== null && p.daysUntilDue <= 30
  ).length;
  const totalDueAmount = calculateDuePayments.reduce((sum, p) => sum + p.dueAmount, 0);
  const totalOverdueAmount = calculateDuePayments
    .filter((p) => p.isOverdue)
    .reduce((sum, p) => sum + p.dueAmount, 0);

  if (loading) {
    return <LoadingSpinner message="Loading due payments..." />;
  }

  return (
    <PageLayout
      title="Due Payments"
      subtitle="Manage and track due payments for students. Students must clear previous semester fees before paying current semester."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard
          title="Total Due"
          value={formatCurrency(totalDueAmount)}
          icon={DollarSign}
          iconBg="bg-gray-100"
          iconColor="text-gray-700"
          valueColor="text-gray-900 dark:text-gray-100"
        />
        <StatCard
          title="Overdue Amount"
          value={formatCurrency(totalOverdueAmount)}
          icon={AlertCircle}
          iconBg="bg-red-100"
          iconColor="text-red-700"
          valueColor="text-red-600"
        />
        <StatCard
          title="Overdue Count"
          value={overdueCount}
          icon={Users}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          valueColor="text-red-600"
        />
        <StatCard
          title="Due Soon (30 days)"
          value={upcomingCount}
          icon={Clock}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          valueColor="text-yellow-600"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-200" />
            Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar
            label="Search"
            placeholder="Search by name, roll number, or course..."
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Select
            value={filterType}
            label="Filter by Type"
            onChange={(e) => setFilterType(e.target.value)}
            icon={TrendingUp}
            options={[
              { value: "all", label: "All Due Payments" },
              { value: "overdue", label: "Overdue Only" },
              { value: "upcoming", label: "Upcoming (30 days)" },
            ]}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {calculateDuePayments.length > 0 ? (
            <>
              <table className="w-full hidden md:table">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Student
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Course
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Semester
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Due Amount
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Due Date
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {calculateDuePayments.map((item, index) => (
                    <tr
                      key={`${item.studentId}-${item.semester}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {item.studentName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {item.rollNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {item.course}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md ${
                            item.isBlocked 
                              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                          }`}>
                            Semester {item.semester}
                            {item.isBlocked && ' ⚠️'}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Current: Sem {item.currentSemester}
                          </p>
                          {item.isBlocked && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                              Must clear first
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.dueAmount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {formatCurrency(item.totalSemesterFee)}
                        </p>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-200">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <div>
                            <p className="font-medium">{formatDate(item.dueDate)}</p>
                            {item.daysUntilDue !== null && (
                              <p
                                className={`text-xs ${
                                  item.isOverdue
                                    ? "text-red-600 dark:text-red-400"
                                    : item.daysUntilDue <= 7
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {item.isOverdue
                                  ? `${Math.abs(item.daysUntilDue)} days overdue`
                                  : `${item.daysUntilDue} days remaining`}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-md ${
                            item.isOverdue
                              ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-200"
                              : item.daysUntilDue !== null && item.daysUntilDue <= 7
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border border-yellow-200"
                              : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-200"
                          }`}
                        >
                          {item.isOverdue ? (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Overdue
                            </>
                          ) : item.daysUntilDue !== null && item.daysUntilDue <= 7 ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Due Soon
                            </>
                          ) : (
                            "Pending"
                          )}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gray-600 dark:bg-gray-300 h-2 rounded-full"
                              style={{
                                width: `${(item.paidAmount / item.totalSemesterFee) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Math.round((item.paidAmount / item.totalSemesterFee) * 100)}% paid
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile view */}
              <div className="md:hidden p-3 space-y-3">
                {calculateDuePayments.map((item, idx) => (
                  <div
                    key={`${item.studentId}-${item.semester}-card-${idx}`}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {item.studentName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {item.rollNumber} • {item.course}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Semester {item.semester} • Current: Sem {item.currentSemester}
                        </p>
                        {item.isBlocked && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                            ⚠️ Must clear this semester first
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.dueAmount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {formatCurrency(item.totalSemesterFee)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gray-600 dark:bg-gray-300 h-2 rounded-full"
                          style={{
                            width: `${(item.paidAmount / item.totalSemesterFee) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {Math.round((item.paidAmount / item.totalSemesterFee) * 100)}% paid
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 font-medium text-lg mb-2">
                No due payments found
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "All payments are up to date"}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DuePayments;