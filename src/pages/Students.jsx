import React, { useState, useEffect } from "react";
import PageLayout from "../components/templates/PageLayout";
import Modal from "../components/molecules/Modal";
import StudentForm from "../components/organisms/StudentForm";
import StudentViewModal from "../components/organisms/StudentViewModal";
import BulkStudentImport from "../components/organisms/BulkStudentImport";
import SemesterUpgradeModal from "../components/organisms/SemesterUpgradeModal";
import ActionMenu from "../components/molecules/ActionMenu";
import DataTable from "../components/organisms/DataTable";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import SearchBar from "../components/molecules/Search";
import ConfirmDialog from "../components/molecules/ConfirmDialog";
import { Button } from "@dipendrabhandari/react-ui-library";
import useBoolean from "../hooks/useBoolean";
import useStudentFilters from "../hooks/useStudentFilters";
import useStudentFormLogic from "../hooks/useStudentFormLogic";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useBulkDeleteStudents,
  useSemesterUpgrade,
  useBulkImportStudents,
  usePayments,
} from "../services/api";
import {
  Plus,
  User,
  Edit,
  Loader2,
  Upload,
  Trash2,
  FileSpreadsheet,
  X,
  GraduationCap,
} from "lucide-react";
import {
  formatCurrency,
  exportStudentsToExcel,
  generateRollNumber,
} from "../utils/studentUtils";
import { courses as initialCourses } from "../data/courses";

const Students = () => {
  // Boolean states using useBoolean hook for cleaner state management
  const [showModal, { on: openModal, off: closeModal }] = useBoolean();
  const [showViewModal, { on: openViewModal, off: closeViewModal }] =
    useBoolean();
  const [showEditModal, { on: openEditModal, off: closeEditModal }] =
    useBoolean();
  const [
    showBulkImportModal,
    { on: openBulkImportModal, off: closeBulkImportModal },
  ] = useBoolean();

  const [
    showSemesterUpgradeModal,
    { on: openSemesterUpgradeModal, off: closeSemesterUpgradeModal },
  ] = useBoolean();
  const [showBulkActionPopup, bulkActionPopupActions] = useBoolean();
  const [
    showConfirmDialog,
    { on: openConfirmDialog, off: closeConfirmDialog },
  ] = useBoolean();

  const [submitting, setSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const { data: students = [], isLoading } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();

  // Helper function to get courses from localStorage
  function getCourses() {
    const savedCourses = localStorage.getItem("courses");
    return savedCourses ? JSON.parse(savedCourses) : initialCourses;
  }

  const courses = getCourses();

  // Use custom hooks for filtering and form logic
  const { searchTerm, setSearchTerm, filteredStudents } =
    useStudentFilters(students);

  const {
    formData,
    selectedCourse,
    setSelectedCourse,
    handleChange,
    resetForm,
    setFormDataForEdit,
  } = useStudentFormLogic(courses, students);

  const createStudent = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const bulkDelete = useBulkDeleteStudents();
  const semesterUpgradeMutation = useSemesterUpgrade();
  const bulkImport = useBulkImportStudents();

  const handleBulkImport = async (studentsData) => {
    try {
      await bulkImport.mutateAsync(studentsData);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.courseId) {
      toast.error("Please select a course before adding the student.");
      setSubmitting(false);
      return;
    }

    if (!formData.rollNumber) {
      toast.error(
        "Roll number generation failed. Please select a course and admission date."
      );
      setSubmitting(false);
      return;
    }

    try {
      const studentData = {
        ...formData,
        courseId: formData.courseId,
        totalFees: parseFloat(formData.totalFees),
        paidFees: 0,
        pendingFees: parseFloat(formData.totalFees),
        semesterFees: formData.semesterFees || [],
      };
      await createStudent.mutateAsync(studentData);
      closeModal();
      resetForm();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!submitting) {
      closeModal();
      resetForm();
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    openViewModal();
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);

    if (!student.courseId) {
      toast.warning(
        "This student was added without a course. Please select a course to update."
      );
    }

    setFormDataForEdit(student);
    openEditModal();
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await deleteStudentMutation.mutateAsync(student.id);
      } catch (error) {
        console.error("Error in handleDelete:", error);
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.courseId) {
      toast.error("Please select a course before updating the student.");
      setSubmitting(false);
      return;
    }

    try {
      const studentData = {
        ...formData,
        courseId: formData.courseId,
        totalFees: parseFloat(formData.totalFees),
        paidFees: selectedStudent.paidFees || 0,
        pendingFees: Math.max(
          0,
          parseFloat(formData.totalFees) - (selectedStudent.paidFees || 0)
        ),
        semesterFees: formData.semesterFees || [],
      };

      await updateStudentMutation.mutateAsync({
        id: selectedStudent.id,
        data: studentData,
      });
      closeEditModal();
      setSelectedStudent(null);
      resetForm();
    } catch (error) {
      console.error("Error in handleUpdateSubmit:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    if (!submitting) {
      closeEditModal();
      setSelectedStudent(null);
      resetForm();
    }
  };

  // Handle checkbox selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  // Show bulk action popup when students are selected
  useEffect(() => {
    if (selectedStudents.length > 0) {
      bulkActionPopupActions.on();
    } else {
      bulkActionPopupActions.off();
    }
  }, [selectedStudents, bulkActionPopupActions]);

  // Handle bulk delete - show confirmation dialog
  const handleBulkDeleteClick = () => {
    openConfirmDialog();
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      console.log("Deleting students:", selectedStudents);

      await bulkDelete.mutateAsync(selectedStudents);
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error in handleBulkDeleteConfirm:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk export to Excel
  const handleBulkExport = () => {
    try {
      const selectedStudentData = students.filter((s) =>
        selectedStudents.includes(s.id)
      );

      if (selectedStudentData.length === 0) {
        toast.error("No students selected for export");
        return;
      }

      const fileName = exportStudentsToExcel(selectedStudentData);
      console.log("Export successful:", fileName);
      toast.success("Export completed successfully!");
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error exporting students:", error);
      toast.error("Failed to export students. Please try again.");
    }
  };

  // Handle semester upgrade
  const handleSemesterUpgrade = async (selectedStudentIds) => {
    await semesterUpgradeMutation.mutateAsync({
      studentIds: selectedStudentIds,
      students,
    });
  };

  const tableColumns = [
    <input
      type="checkbox"
      checked={
        selectedStudents.length === filteredStudents.length &&
        filteredStudents.length > 0
      }
      onChange={handleSelectAll}
      className="w-4 h-4 cursor-pointer"
    />,
    "Roll Number",
    "Name",
    "Course",
    "Semester",
    "Total Fees",
    "Paid",
    "Pending",
    "Actions",
  ];

  if (isLoading) {
    return <LoadingSpinner message="Loading students..." />;
  }

  return (
    <PageLayout
      title="Students"
      subtitle={"Get the information of the students"}
      actionButton={
        <div className="flex flex-wrap md:inline-flex items-center gap-2 sm:gap-3">
          <Button
            onClick={() => {
              console.log("hello");
              openBulkImportModal();
            }}
            leftIcon={<Upload className="w-4 h-4 sm:w-5 sm:h-5" />}
            colorScheme="green"
            className="text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2"
          >
            <span className="hidden md:inline">Bulk Import</span>
            {/* <span className="md:hidden">Import</span> */}
          </Button>
          <Button
            onClick={openSemesterUpgradeModal}
            leftIcon={<GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />}
            colorScheme="blue"
            className="text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2"
          >
            <span className="hidden md:inline">Semester Upgrade</span>
            {/* <span className="md:hidden">Upgrade</span> */}
          </Button>
          <Button
            onClick={openModal}
            leftIcon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
            colorScheme="gray"
            className="text-xs sm:text-sm px-2 py-1.5 sm:px-4 sm:py-2"
          >
            <span className="hidden md:inline">Add Student</span>
            {/* <span className="md:hidden">Add</span> */}
          </Button>
        </div>
      }
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 dark:bg-gray-800 dark:border-0">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search by name, roll number, or course..."
          className="lg:w-[50%]"
        />
      </div>
      {/*  REACT QUERY: DataTable uses isLoading from useQuery */}
      <DataTable
        columns={tableColumns}
        data={filteredStudents}
        loading={isLoading}
        emptyMessage="No students found"
        renderRow={(student) => (
          <tr
            key={student.id}
            onClick={(e) => {
              if (
                !e.target.closest("button") &&
                !e.target.closest(".action-menu") &&
                !e.target.closest('input[type="checkbox"]')
              ) {
                handleView(student);
              }
            }}
            className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
              selectedStudents.includes(student.id)
                ? "bg-blue-50 dark:bg-blue-900/20"
                : ""
            }`}
          >
            <td
              className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => handleSelectStudent(student.id)}
                className="w-4 h-4 cursor-pointer"
              />
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900 dark:text-white">
              {student.rollNumber || "N/A"}
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-gray-900 dark:text-white">
              {student.name || "N/A"}
            </td>
            <td className="px-2 py-1 sm:px-6 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-gray-600 dark:text-gray-300">
              {student.course || "N/A"}
            </td>
            <td className="px-2 py-1 sm:px-6 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-gray-600 dark:text-gray-300">
              {student.semester}
            </td>
            <td className="px-2 py-1 sm:px-6 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-gray-900 dark:text-white">
              {formatCurrency(student.totalFees || 0)}
            </td>
            <td className="px-2 py-1 sm:px-6 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-green-600 dark:text-green-400">
              {formatCurrency(student.paidFees || 0)}
            </td>
            <td className="px-2 py-1 sm:px-6 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm text-gray-900 dark:text-white">
              {formatCurrency(student.pendingFees || 0)}
            </td>
            <td
              className="px-2 py-1 sm:px-6 sm:py-4 whitespace-nowrap text-[10px] sm:text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ActionMenu
                onView={() => handleView(student)}
                onEdit={() => handleEdit(student)}
                onDelete={() => handleDelete(student)}
                className="right-12 -bottom-3.5"
              />
            </td>
          </tr>
        )}
        renderCard={(student) => (
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={(e) => {
              if (
                !e.target.closest(".action-menu") &&
                !e.target.closest("button")
              ) {
                handleView(student);
              }
            }}
          >
            <div className="bg-linear-to-r from-gray-500 to-gray-600 p-4 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{student.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-blue-100">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Roll:</span>{" "}
                      {student.rollNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Sem:</span>{" "}
                      {student.semester}
                    </span>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    onView={() => handleView(student)}
                    onEdit={() => handleEdit(student)}
                    onDelete={() => handleDelete(student)}
                    className=""
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Course
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {student.course}
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Fees
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(student.totalFees || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paid Fees
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(student.paidFees || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Fees
                </span>
                <span
                  className={`text-sm font-bold ${
                    (student.pendingFees || 0) > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatCurrency(student.pendingFees || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      />
      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Add New Student"
        subtitle="Fill in the student information below"
        icon={User}
        disabled={submitting}
      >
        <StudentForm
          isEditMode={!!selectedStudent}
          formData={formData}
          onChange={handleChange}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          submitting={submitting}
          onCancel={handleCloseModal}
          onSubmit={handleSubmit}
          submitButtonText={submitting ? "Adding" : "Add Student"}
          submitButtonIcon={Plus}
        />
      </Modal>
      <StudentViewModal
        student={selectedStudent}
        isOpen={showViewModal}
        onClose={closeViewModal}
      />
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Student"
        subtitle={
          selectedStudent
            ? `Update ${selectedStudent.name}'s information`
            : "Update student information"
        }
        icon={Edit}
        disabled={submitting}
      >
        <StudentForm
          formData={formData}
          onChange={handleChange}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          submitting={submitting}
          isEditMode={true}
          onCancel={handleCloseEditModal}
          onSubmit={handleUpdateSubmit}
          submitButtonText={submitting ? "Updating" : "Update Student"}
          submitButtonIcon={Edit}
        />
      </Modal>
      <BulkStudentImport
        isOpen={showBulkImportModal}
        onClose={closeBulkImportModal}
        courses={courses}
        onImport={handleBulkImport}
        generateRollNumber={generateRollNumber}
        existingStudents={students}
      />
      {/* Bulk Action Popup */}
      {showBulkActionPopup && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="animate-slide-up">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedStudents.length} selected
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDeleteClick}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>

                <button
                  onClick={handleBulkExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export
                </button>

                <button
                  onClick={() => setSelectedStudents([])}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={closeConfirmDialog}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Students"
        message={`Are you sure you want to delete ${selectedStudents.length} student(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      {/* Semester Upgrade Modal */}
      <SemesterUpgradeModal
        isOpen={showSemesterUpgradeModal}
        onClose={closeSemesterUpgradeModal}
        students={students}
        payments={payments}
        onUpgrade={handleSemesterUpgrade}
      />
    </PageLayout>
  );
};

export default Students;
