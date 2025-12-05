import { useState, useMemo } from "react";
import { Student } from "../types";

/**
 * Return type for the useStudentFilters hook
 */
export interface UseStudentFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredStudents: Student[];
}

/**
 * Custom hook for managing student search and filtering.
 * Uses useMemo to prevent unnecessary re-renders when filtering.
 *
 * @param students - List of all students
 * @returns Object containing searchTerm, setSearchTerm, and filteredStudents
 */
export const useStudentFilters = (
  students: Student[] = []
): UseStudentFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Memoize filtered students to prevent double renders
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) {
      return students;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return students.filter(
      (student) =>
        student.name?.toLowerCase().includes(lowerSearchTerm) ||
        student.rollNumber?.toLowerCase().includes(lowerSearchTerm) ||
        student.course?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, students]);

  return {
    searchTerm,
    setSearchTerm,
    filteredStudents,
  };
};

export default useStudentFilters;
