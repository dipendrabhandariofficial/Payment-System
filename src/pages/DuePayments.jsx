import React, { useState, useEffect, useMemo } from "react";
import { useStudents, usePayments } from "../services/api";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  Filter,
} from "lucide-react";
import Select from "../components/atoms/Select";
import SearchBar from "../components/molecules/Search";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import PageLayout from "../components/templates/PageLayout";
import StatCard from "../components/molecules/StatCard";
import DataTable from "../components/organisms/DataTable";

const DuePayments = () => {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const loading = studentsLoading || paymentsLoading;
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const getPayableSemester = (student) => {
    const currentSemester = parseInt(student.semester) || 1;
    const semesterFees = student.semesterFees || [];

    for (let sem = 1; sem <= currentSemester; sem++) {
      const semFee = semesterFees.find((sf) => parseInt(sf.semester) === sem);
      if (!semFee) continue;

      const semesterPayments = payments.filter(
        (p) =>
          p.studentId === student.id &&
          parseInt(p.semester) === sem &&
          p.status === "Completed"
      );
      const paidAmount = semesterPayments.reduce((sum, p) => sum + p.amount, 0);

      if (paidAmount < semFee.amount) {
        return sem;
      }
    }

    return null;
  };

  const calculateDuePayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const duePayments = students
      .map((student) => {
        const currentSemester = parseInt(student.semester) || 1;
        const payableSemester = getPayableSemester(student);

        if (!payableSemester) return [];

        const semesterFees = student.semesterFees || [];
        const semFee = semesterFees.find(
          (sf) => parseInt(sf.semester) === payableSemester
        );

        if (!semFee) return [];

        const dueDate = semFee.dueDate ? new Date(semFee.dueDate) : null;
        if (dueDate) dueDate.setHours(0, 0, 0, 0);

        const daysUntilDue = getDaysUntilDue(semFee.dueDate);
        const isOverdue = dueDate && dueDate < today;

        const semesterPayments = payments.filter(
          (p) =>
            p.studentId === student.id &&
            parseInt(p.semester) === payableSemester &&
            p.status === "Completed"
        );
        const paidAmount = semesterPayments.reduce(
          (sum, p) => sum + p.amount,
          0
        );
        const remainingAmount = semFee.amount - paidAmount;

        if (remainingAmount <= 0) return [];

        return [
          {
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
            isBlocked: payableSemester < currentSemester,
          },
        ];
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
        if (filterType === "upcoming")
          return (
            !item.isOverdue &&
            item.daysUntilDue !== null &&
            item.daysUntilDue <= 30
          );
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
  const totalDueAmount = calculateDuePayments.reduce(
    (sum, p) => sum + p.dueAmount,
    0
  );
  const totalOverdueAmount = calculateDuePayments
    .filter((p) => p.isOverdue)
    .reduce((sum, p) => sum + p.dueAmount, 0);

  const columns = [
    "Student",
    "Course",
    "Semester",
    "Due Amount",
    "Due Date",
    "Status",
    "Progress",
  ];

  const renderRow = (item, index) => (
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
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md ${
              item.isBlocked
                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            }`}
          >
            Semester {item.semester}
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
              ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
              : item.daysUntilDue !== null && item.daysUntilDue <= 7
              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200"
              : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
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
  );

  const renderCard = (item, index) => (
    <div
      key={`${item.studentId}-${item.semester}-card-${index}`}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
        item.isOverdue
          ? "border-red-200 dark:border-red-800"
          : item.daysUntilDue !== null && item.daysUntilDue <= 7
          ? "border-yellow-200 dark:border-yellow-800"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
              {item.studentName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {item.rollNumber}
            </p>
          </div>
          <span
            className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${
              item.isOverdue
                ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                : item.daysUntilDue !== null && item.daysUntilDue <= 7
                ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200"
                : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
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
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-4 space-y-3">
        {/* Course */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Course
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {item.course}
          </span>
        </div>

        {/* Semester */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Semester
          </span>
          <div className="text-right">
            <span
              className={`px-2 py-1 inline-flex text-xs font-medium rounded-md ${
                item.isBlocked
                  ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              Sem {item.semester}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Current: Sem {item.currentSemester}
            </p>
            {item.isBlocked && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                ⚠️ Must clear first
              </p>
            )}
          </div>
        </div>

        {/* Due Amount */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Due Amount
          </span>
          <div className="text-right">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(item.dueAmount)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              of {formatCurrency(item.totalSemesterFee)}
            </p>
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Due Date
          </span>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(item.dueDate)}
              </p>
            </div>
            {item.daysUntilDue !== null && (
              <p
                className={`text-xs mt-1 font-medium ${
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

        {/* Progress */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Payment Progress
            </span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {Math.round((item.paidAmount / item.totalSemesterFee) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                item.isOverdue
                  ? "bg-red-500 dark:bg-red-600"
                  : item.daysUntilDue !== null && item.daysUntilDue <= 7
                  ? "bg-yellow-500 dark:bg-yellow-600"
                  : "bg-blue-500 dark:bg-blue-600"
              }`}
              style={{
                width: `${(item.paidAmount / item.totalSemesterFee) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            {formatCurrency(item.paidAmount)} paid
          </p>
        </div>
      </div>
    </div>
  );

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

      {calculateDuePayments.length > 0 ? (
        <DataTable
          columns={columns}
          data={calculateDuePayments}
          loading={loading}
          renderRow={renderRow}
          renderCard={renderCard}
          emptyMessage="No due payments found"
          emptyIcon={AlertCircle}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
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
    </PageLayout>
  );
};

export default DuePayments;
