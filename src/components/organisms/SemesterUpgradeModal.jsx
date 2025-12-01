import React, { useState, useMemo } from "react";
import Modal from "../molecules/Modal";
import {
  GraduationCap,
  Check,
  AlertCircle,
  Calendar,
  CreditCard,
  X,
  Filter,
  Users,
} from "lucide-react";
import Select from "../atoms/Select";
import DataTable from "./DataTable";
import StatCard from "../molecules/StatCard";

const SemesterUpgradeModal = ({
  isOpen,
  onClose,
  students = [],
  payments = [],
  onUpgrade,
}) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedSemester, setSelectedSemester] = useState("All");

  // Extract unique courses and semesters for filters
  const courses = useMemo(() => {
    const uniqueCourses = [
      ...new Set(students.map((s) => s.course).filter(Boolean)),
    ];
    return ["All", ...uniqueCourses.sort()];
  }, [students]);

  const semesters = useMemo(() => {
    const uniqueSemesters = [
      ...new Set(students.map((s) => s.semester).filter(Boolean)),
    ];
    return [
      "All",
      ...uniqueSemesters.sort((a, b) => parseInt(a) - parseInt(b)),
    ];
  }, [students]);

  // Calculate eligibility for each student
  const eligibleStudents = useMemo(() => {
    return students
      .filter((student) => {
        // Apply filters
        if (selectedCourse !== "All" && student.course !== selectedCourse)
          return false;
        if (selectedSemester !== "All" && student.semester !== selectedSemester)
          return false;
        return true;
      })
      .map((student) => {
        // 1. Check time eligibility (6 months in current semester)
        const admissionDate = new Date(student.admissionDate);
        const currentDate = new Date();
        const monthsSinceAdmission =
          (currentDate.getFullYear() - admissionDate.getFullYear()) * 12 +
          (currentDate.getMonth() - admissionDate.getMonth());

        const currentSemester = parseInt(student.semester || "1");
        const expectedSemester = Math.floor(monthsSinceAdmission / 6) + 1;

        // Time eligible if they should be in a higher semester than they are
        const isTimeEligible = expectedSemester > currentSemester;

        // 2. Check payment eligibility (must have paid all fees for current semester)
        // Filter payments for this student
        const studentPayments = payments.filter(
          (p) => p.studentId === student.id
        );
        const totalPaid = studentPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount || 0),
          0
        );

        // Calculate total fees due up to current semester
        // Assuming semesterFees is stored in student object or calculated
        // For simplicity, using the totalFees / totalSemesters * currentSemester logic if specific structure isn't available
        // Or checking if pendingFees is 0
        const isPaymentEligible = (student.pendingFees || 0) <= 0;

        // 3. Check if not in final semester (e.g. 6)
        const isNotFinalSemester = currentSemester < 6;

        const isEligible =
          isTimeEligible && isPaymentEligible && isNotFinalSemester;

        let reason = "";
        if (!isTimeEligible) reason = "Not enough time in current semester";
        else if (!isPaymentEligible) reason = "Pending fees";
        else if (!isNotFinalSemester) reason = "Already in final semester";

        return {
          ...student,
          isEligible,
          reason,
          currentSemester,
          nextSemester: currentSemester + 1,
        };
      })
      .filter((s) => s.currentSemester < 6); // Only show students who can potentially upgrade
  }, [students, payments, selectedCourse, selectedSemester]);

  const handleSelectAll = () => {
    if (
      selectedStudents.length ===
      eligibleStudents.filter((s) => s.isEligible).length
    ) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(
        eligibleStudents.filter((s) => s.isEligible).map((s) => s.id)
      );
    }
  };

  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents((prev) => prev.filter((sId) => sId !== id));
    } else {
      setSelectedStudents((prev) => [...prev, id]);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onUpgrade(selectedStudents);
      onClose();
      setSelectedStudents([]);
    } catch (error) {
      console.error("Upgrade failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const eligibleCount = eligibleStudents.filter((s) => s.isEligible).length;

  const tableColumns = [
    <input
      type="checkbox"
      checked={eligibleCount > 0 && selectedStudents.length === eligibleCount}
      onChange={handleSelectAll}
      disabled={eligibleCount === 0}
      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
    />,
    "Student",
    "Current Sem",
    "Status",
    "Reason",
  ];

  const renderRow = (student) => (
    <tr
      key={student.id}
      className={
        !student.isEligible
          ? "opacity-60 bg-gray-50 dark:bg-gray-800/50"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedStudents.includes(student.id)}
          onChange={() => handleSelectStudent(student.id)}
          disabled={!student.isEligible}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {student.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {student.rollNumber}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {student.course}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          Sem {student.currentSemester}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {student.isEligible ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <Check className="w-3 h-3" /> Eligible
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <Calendar className="w-3 h-3" /> Wait
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {student.isEligible ? (
          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
            Ready for Sem {student.nextSemester}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3 h-3" /> {student.reason}
          </span>
        )}
      </td>
    </tr>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Semester Upgrade Manager"
      subtitle="Review and upgrade eligible students to the next semester"
      icon={GraduationCap}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Students"
            value={students.length}
            icon={Users}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            valueColor="text-blue-700 dark:text-blue-300"
          />
          <StatCard
            title="Eligible for Upgrade"
            value={eligibleCount}
            icon={Check}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            valueColor="text-green-700 dark:text-green-300"
          />
          <StatCard
            title="Selected"
            value={selectedStudents.length}
            icon={GraduationCap}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            valueColor="text-purple-700 dark:text-purple-300"
          />
        </div>

        {/* Filters and Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                eligibleCount > 0 && selectedStudents.length === eligibleCount
              }
              onChange={handleSelectAll}
              disabled={eligibleCount === 0}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select all eligible ({eligibleCount})
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="items-center gap-2 hidden sm:flex">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Filters:</span>
            </div>

            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              options={courses.map((course) => ({
                value: course,
                label: course === "All" ? "All Courses" : course,
              }))}
              placeholder="Select Course"
              className="w-full sm:w-48"
            />

            <Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              options={semesters.map((semester) => ({
                value: semester,
                label:
                  semester === "All" ? "All Semesters" : `Semester ${semester}`,
              }))}
              placeholder="Select Semester"
              className="w-full sm:w-48"
            />
          </div>
        </div>

        {/* Student List */}
        <DataTable
          columns={tableColumns}
          data={eligibleStudents}
          renderRow={renderRow}
          emptyMessage="No students found matching filters."
          emptyIcon={GraduationCap}
        />

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedStudents.length === 0 || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Upgrading..."
              : `Upgrade Selected (${selectedStudents.length})`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SemesterUpgradeModal;
