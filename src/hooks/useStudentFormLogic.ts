import { useState } from "react";
import { generateRollNumber } from "../utils/studentUtils";
import { generateSemesterFees } from "../data/courses";
import { Course, Student, SemesterFee } from "../types";

/**
 * Form data structure for student form
 */
export interface StudentFormData {
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  admissionDate: string;
  courseId: string;
  course: string;
  semester: string;
  totalFees: string;
  semesterFees: SemesterFee[];
}

/**
 * Return type for the useStudentFormLogic hook
 */
export interface UseStudentFormLogicReturn {
  formData: StudentFormData;
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  resetForm: () => void;
  setFormDataForEdit: (student: Student) => void;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
}

/**
 * Custom hook for managing student form state and logic.
 * Handles form data, course selection, and roll number generation.
 *
 * @param courses - List of available courses
 * @param existingStudents - List of existing students (for roll number generation)
 * @returns Form state and handlers
 */
export const useStudentFormLogic = (
  courses: Course[] = [],
  existingStudents: Student[] = []
): UseStudentFormLogicReturn => {
  const [formData, setFormData] = useState<StudentFormData>({
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

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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
          formData.admissionDate || new Date().toISOString().split("T")[0],
          existingStudents
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
      const rollNumber = generateRollNumber(
        selectedCourse.name,
        value,
        existingStudents
      );

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

  const resetForm = () => {
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
  };

  const setFormDataForEdit = (student: Student) => {
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
      semester: String(student.semester) || "1",
      totalFees: student.totalFees.toString(),
      semesterFees: student.semesterFees || [],
    });
  };

  return {
    formData,
    selectedCourse,
    setSelectedCourse,
    handleChange,
    resetForm,
    setFormDataForEdit,
    setFormData,
  };
};

export default useStudentFormLogic;
