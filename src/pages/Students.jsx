import React, { useState, useEffect } from "react";
import PageLayout from "../components/PageLayout";
import Modal from "../components/Modal";
import StudentForm from "../components/StudentForm";
import StudentViewModal from "../components/StudentViewModal";
import BulkStudentImport from "../components/BulkStudentImport";
import ActionMenu from "../components/ActionMenu";
import DataTable from "../components/DataTable";
import MessageAlert from "../components/MessageAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/Search";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../services/api";
import { Plus, User, Edit, Loader2, Upload } from "lucide-react";
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
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
    } finally {
      setLoading(false);
    }
  };

  // const { data: studentsData, isPending: studentsPending, error: studentsError } = useQuery({
  //   queryKey: ['students'],
  //   queryFn: getStudents,
  // })

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

      return true;
    } catch (error) {
      console.error("Error importing students:", error);
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
    setError("");
    setSuccess(false);
    setSubmitting(true);

    if (!formData.courseId) {
      setError("Please select a course before adding the student.");
      setSubmitting(false);
      return;
    }

    if (!formData.rollNumber) {
      setError(
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

      await addStudent(studentData);
      setSuccess(true);
      fetchStudents();

      setTimeout(() => {
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
        setSuccess(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding student:", error);
      setError("Failed to add student. Please try again.");
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
      setError("");
      setSuccess(false);
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);

    if (!student.courseId) {
      setError(
        "This student was added without a course. Please select a course to update."
      );
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
      } catch (error) {
        console.error("Error deleting student:", error);
        setError("Failed to delete student. Please try again.");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    if (!formData.courseId) {
      setError("Please select a course before updating the student.");
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
      setSuccess(true);
      fetchStudents();

      setTimeout(() => {
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
        setSuccess(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating student:", error);
      setError("Failed to update student. Please try again.");
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
      setError("");
      setSuccess(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const tableColumns = [
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
                !e.target.closest(".action-menu")
              ) {
                handleView(student);
              }
            }}
            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {student.rollNumber}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {student.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {student.course}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {student.semester}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {formatCurrency(student.totalFees || 0)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
              {formatCurrency(student.paidFees || 0)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {formatCurrency(student.pendingFees || 0)}
            </td>
            <td
              className="px-6 py-4 whitespace-nowrap text-sm"
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
          <MessageAlert
            type="success"
            message={success ? "Student added successfully!" : ""}
          />
          <MessageAlert type="error" message={error} />
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
          <MessageAlert
            type="success"
            message={success ? "Student updated successfully!" : ""}
          />
          <MessageAlert type="error" message={error} />
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
    </PageLayout>
  );
};

export default Students;
