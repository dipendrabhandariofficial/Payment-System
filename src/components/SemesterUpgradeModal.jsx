import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import {
  GraduationCap,
  Check,
  AlertCircle,
  Calendar,
  CreditCard,
  X,
} from "lucide-react";

const SemesterUpgradeModal = ({
  isOpen,
  onClose,
  students = [],
  payments = [],
  onUpgrade,
}) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate eligibility for each student
  const eligibleStudents = useMemo(() => {
    return students
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
  }, [students, payments]);

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
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Total Students
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {students.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              Eligible for Upgrade
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {eligibleCount}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              Selected
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {selectedStudents.length}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                eligibleCount > 0 && selectedStudents.length === eligibleCount
              }
              onChange={handleSelectAll}
              disabled={eligibleCount === 0}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select all eligible ({eligibleCount})
            </span>
          </div>
        </div>

        {/* Student List */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Sem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {eligibleStudents.length > 0 ? (
                eligibleStudents.map((student) => (
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
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
