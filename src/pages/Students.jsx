import React, { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";
import Modal from "../components/Modal";
import StudentForm from "../components/StudentForm";
import StudentViewModal from "../components/StudentViewModal";
import BulkStudentImport from "../components/BulkStudentImport";
import ActionMenu from "../components/ActionMenu";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/Search";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../services/api";
import { Plus, User, Edit, Loader2, Upload, Trash2, FileSpreadsheet, X } from "lucide-react";
import * as XLSX from 'xlsx';
import {
  courses as initialCourses,
  generateSemesterFees,
} from "../data/courses";


const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkActionPopup, setShowBulkActionPopup] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    phone: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
    admissionDate: new Date().toISOString().split("T")[0],
    courseId: "",
    course: "",
    semester: "1",
    totalFees: "",
    semesterFees: [],
  });
  const [selectedCourse, setSelectedCourse] = useState();

  useEffect(() => {
    fetchStudents();
  }, []);

  // Get courses from localStorage or use initial courses
  const getCourses = () => {
    const savedCourses = localStorage.getItem("courses");
    return savedCourses ? JSON.parse(savedCourses) : initialCourses;
  };

  const courses = getCourses();

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // Generate unique roll number
  const generateRollNumber = (courseName, admissionDate) => {
    if (!courseName || !admissionDate) return "";

    // Extract course code from course name (first letters of each word)
    const courseCode = courseName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

    // Format date as YYYYMMDD
    const date = new Date(admissionDate);
    const dateCode = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

    // Find existing roll numbers with same course and date pattern
    const similarRolls = students.filter((s) =>
      s.rollNumber?.startsWith(`${courseCode}-${dateCode}`)
    );

    // Generate sequential number
    const nextNum = String(similarRolls.length + 1).padStart(3, "0");

    return `${courseCode}-${dateCode}-${nextNum}`;
  };

  const handleBulkImport = async (studentsData) => {
    try {
      // Import all students one by one
      for (const studentData of studentsData) {
        await addStudent(studentData);
      }

      // Refresh the student list
      await fetchStudents();
      toast.success("Bulk import completed successfully!");
      return true;
    } catch (error) {
      console.error("Error importing students:", error);
      toast.error("Failed to import students");
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle course selection from dropdown
    if (name === "courseId") {
      const selectedId = String(value);
      const course = courses.find((c) => c.id === selectedId);

      if (course) {
        setSelectedCourse(course);

        const semesterFees = generateSemesterFees(
          course,
          formData.admissionDate || new Date().toISOString().split("T")[0]
        );

        // Generate roll number when course is selected
        const rollNumber = generateRollNumber(
          course.name,
          formData.admissionDate || new Date().toISOString().split("T")[0]
        );

        setFormData({
          ...formData,
          courseId: selectedId,
          course: course.name,
          semester: formData.semester || "1",
          totalFees: String(course.totalFees),
          semesterFees,
          rollNumber,
        });
      } else {
        setSelectedCourse(null);
        setFormData({
          ...formData,
          courseId: "",
          course: "",
          totalFees: "",
          semesterFees: [],
          rollNumber: "",
        });
      }
    } else if (name === "admissionDate" && selectedCourse) {
      // Regenerate semester fees and roll number if admission date changes
      const semesterFees = generateSemesterFees(selectedCourse, value);
      const rollNumber = generateRollNumber(selectedCourse.name, value);

      setFormData({
        ...formData,
        [name]: value,
        semesterFees,
        rollNumber,
      });
    } else {
      setFormData({ ...formData, [name]: value });
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
      toast.error("Roll number generation failed. Please select a course and admission date.");
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

      await addStudent(studentData);
      await fetchStudents();
      
      setShowModal(false);
      setFormData({
        name: "",
        rollNumber: "",
        email: "",
        phone: "",
        address: "",
        guardianName: "",
        guardianPhone: "",
        guardianRelation: "",
        admissionDate: new Date().toISOString().split("T")[0],
        courseId: "",
        course: "",
        semester: "1",
        totalFees: "",
        semesterFees: [],
      });
      setSelectedCourse(null);
      toast.success("Student added successfully!");
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setShowModal(false);
      setFormData({
        name: "",
        rollNumber: "",
        email: "",
        phone: "",
        address: "",
        guardianName: "",
        guardianPhone: "",
        guardianRelation: "",
        admissionDate: new Date().toISOString().split("T")[0],
        courseId: "",
        course: "",
        semester: "1",
        totalFees: "",
        semesterFees: [],
      });
      setSelectedCourse(null);
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);

    if (!student.courseId) {
      toast.warning("This student was added without a course. Please select a course to update.");
    }

    const studentCourse = student.courseId
      ? courses.find((c) => c.id === student.courseId)
      : null;
    if (studentCourse) {
      setSelectedCourse(studentCourse);
    } else {
      setSelectedCourse(null);
    }

    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      phone: student.phone,
      address: student.address || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      guardianRelation: student.guardianRelation || "",
      admissionDate:
      student.admissionDate || new Date().toISOString().split("T")[0],
      courseId: student.courseId || "",
      course: student.course || "",
      semester: student.semester || "1",
      totalFees: student.totalFees.toString(),
      semesterFees: student.semesterFees || [],
    });
    setShowEditModal(true);
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await deleteStudent(student.id);
        fetchStudents();
        toast.success("Student deleted successfully");
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("Failed to delete student. Please try again.");
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

      await updateStudent(selectedStudent.id, studentData);
      await fetchStudents();

      setShowEditModal(false);
      setSelectedStudent(null);
      setSelectedCourse(null);
      setFormData({
        name: "",
        rollNumber: "",
        email: "",
        phone: "",
        address: "",
        guardianName: "",
        guardianPhone: "",
        guardianRelation: "",
        admissionDate: new Date().toISOString().split("T")[0],
        courseId: "",
        course: "",
        semester: "1",
        totalFees: "",
        semesterFees: [],
      });
      toast.success("Student updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    if (!submitting) {
      setShowEditModal(false);
      setSelectedStudent(null);
      setSelectedCourse(null);
      setFormData({
        name: "",
        rollNumber: "",
        email: "",
        phone: "",
        address: "",
        guardianName: "",
        guardianPhone: "",
        guardianRelation: "",
        admissionDate: new Date().toISOString().split("T")[0],
        courseId: "",
        course: "",
        semester: "1",
        totalFees: "",
        semesterFees: [],
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle checkbox selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
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
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  // Show bulk action popup when students are selected
  useEffect(() => {
    if (selectedStudents.length > 0) {
      setShowBulkActionPopup(true);
    } else {
      setShowBulkActionPopup(false);
    }
  }, [selectedStudents]);

  // Handle bulk delete - show confirmation dialog
  const handleBulkDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    try {
      setSubmitting(true);
      console.log('Deleting students:', selectedStudents);
      
      // Delete all students in parallel for better performance
      const deletePromises = selectedStudents.map(studentId => 
        deleteStudent(studentId).catch(err => {
          console.error(`Failed to delete student ${studentId}:`, err);
          throw err;
        })
      );
      
      await Promise.all(deletePromises);
      console.log('All students deleted successfully');
      
      // Refresh the student list
      await fetchStudents();
      
      // Clear selection
      setSelectedStudents([]);
      
      // Show success message
      toast.success("Students deleted successfully!");
    } catch (error) {
      console.error("Error deleting students:", error);
      toast.error("Failed to delete students. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle bulk export to Excel
  const handleBulkExport = () => {
    try {
      const selectedStudentData = students.filter(s => selectedStudents.includes(s.id));
      
      if (selectedStudentData.length === 0) {
        toast.error("No students selected for export");
        return;
      }
      
      // Prepare data for export
      const exportData = selectedStudentData.map(student => ({
        'Roll Number': student.rollNumber || '',
        'Name': student.name || '',
        'Email': student.email || '',
        'Phone': student.phone || '',
        'Course': student.course || '',
        'Semester': student.semester || '',
        'Total Fees': student.totalFees || 0,
        'Paid Fees': student.paidFees || 0,
        'Pending Fees': student.pendingFees || 0,
        'Guardian Name': student.guardianName || '',
        'Guardian Phone': student.guardianPhone || '',
        'Guardian Relation': student.guardianRelation || '',
        'Address': student.address || '',
        'Admission Date': student.admissionDate || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 15 }, // Roll Number
        { wch: 20 }, // Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 30 }, // Course
        { wch: 10 }, // Semester
        { wch: 12 }, // Total Fees
        { wch: 12 }, // Paid Fees
        { wch: 12 }, // Pending Fees
        { wch: 20 }, // Guardian Name
        { wch: 15 }, // Guardian Phone
        { wch: 15 }, // Guardian Relation
        { wch: 30 }, // Address
        { wch: 15 }  // Admission Date
      ];
      ws['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Students');

      // Generate file name with current date
      const fileName = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file with explicit bookType
      XLSX.writeFile(wb, fileName, { bookType: 'xlsx', type: 'binary' });

      console.log('Export successful:', fileName);
      
      // Show success message
      toast.success("Export completed successfully!");

      // Clear selection
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error exporting students:", error);
      toast.error("Failed to export students. Please try again.");
    }
  };

  const tableColumns = [
    <input
      type="checkbox"
      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
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


  if (loading) {
    return <LoadingSpinner message="Loading students..." />;
  }

  return (
    <PageLayout
      title="Students"
      subtitle={"Get the information of the students"}
      actionButton={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Bulk Import</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Student</span>
          </button>
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

      <DataTable
        columns={tableColumns}
        data={filteredStudents}
        loading={loading}
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
              selectedStudents.includes(student.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => handleSelectStudent(student.id)}
                className="w-4 h-4 cursor-pointer"
              />
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              {student.rollNumber}
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
              {student.name}
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {student.course}
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {student.semester}
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
              {formatCurrency(student.totalFees || 0)}
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-green-600 dark:text-green-400">
              {formatCurrency(student.paidFees || 0)}
            </td>
            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
              {formatCurrency(student.pendingFees || 0)}
            </td>
            <td
              className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm"
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
                    className="right-3 botton-0"
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
        <form onSubmit={handleSubmit}>
          <StudentForm
            isEditMode={!!selectedStudent} 
            formData={formData}
            onChange={handleChange}
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            submitting={submitting}
          />
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={submitting}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <StudentViewModal
        student={selectedStudent}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
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
        <form onSubmit={handleUpdateSubmit}>
          <StudentForm
            formData={formData}
            onChange={handleChange}
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            submitting={submitting}
            isEditMode={true}
          />
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseEditModal}
              disabled={submitting}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5" />
                  Update Student
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      <BulkStudentImport
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
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
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleBulkDeleteConfirm}
        title="Delete Students"
        message={`Are you sure you want to delete ${selectedStudents.length} student(s)? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </PageLayout>
  );
};

export default Students;
