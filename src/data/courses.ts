import { Course, SemesterFee } from "../types";

// Bachelor Degree Courses 
export const courses: Course[] = [
  {
    id: "bsc-cs",
    name: "Bachelor of Science in Computer Science",
    totalSemesters: 6,
    semesterFees: 50000,
    totalFees: 300000,
    department: "Computer Science",
  },
  {
    id: "bsc-it",
    name: "Bachelor of Science in Information Technology",
    totalSemesters: 6,
    semesterFees: 48000,
    totalFees: 288000,
    department: "Information Technology",
  },
  {
    id: "bcom",
    name: "Bachelor of Commerce",
    totalSemesters: 6,
    semesterFees: 35000,
    totalFees: 210000,
    department: "Commerce",
  },
  {
    id: "bba",
    name: "Bachelor of Business Administration",
    totalSemesters: 6,
    semesterFees: 42000,
    totalFees: 252000,
    department: "Business Administration",
  },
  {
    id: "bsc-math",
    name: "Bachelor of Science in Mathematics",
    totalSemesters: 6,
    semesterFees: 40000,
    totalFees: 240000,
    department: "Mathematics",
  },
  {
    id: "bsc-physics",
    name: "Bachelor of Science in Physics",
    totalSemesters: 6,
    semesterFees: 38000,
    totalFees: 228000,
    department: "Physics",
  },
  {
    id: "bsc-chemistry",
    name: "Bachelor of Science in Chemistry",
    totalSemesters: 6,
    semesterFees: 38000,
    totalFees: 228000,
    department: "Chemistry",
  },
  {
    id: "ba-english",
    name: "Bachelor of Arts in English",
    totalSemesters: 6,
    semesterFees: 30000,
    totalFees: 180000,
    department: "English",
  },
  {
    id: "bsc-economics",
    name: "Bachelor of Science in Economics",
    totalSemesters: 6,
    semesterFees: 36000,
    totalFees: 216000,
    department: "Economics",
  },
  {
    id: "bsc-bio",
    name: "Bachelor of Science in Biology",
    totalSemesters: 6,
    semesterFees: 40000,
    totalFees: 240000,
    department: "Biology",
  },
];

/**
 * Get course by ID
 */
export const getCourseById = (courseId: string): Course | undefined => {
  return courses.find((course) => course.id === courseId);
};

/**
 * Get course by name
 */
export const getCourseByName = (courseName: string): Course | undefined => {
  return courses.find((course) => course.name === courseName);
};

/**
 * Generate semester fees structure for a course
 */
export const generateSemesterFees = (
  course: Course,
  admissionDate: string
): SemesterFee[] => {
  const semesterFees: SemesterFee[] = [];
  const admission = new Date(admissionDate);

  for (let i = 1; i <= course.totalSemesters; i++) {
    const dueDate = new Date(admission);
    dueDate.setMonth(admission.getMonth() + (i - 1) * 6);

    semesterFees.push({
      semester: i.toString(),
      amount: course.semesterFees || course.totalFees / course.totalSemesters,
      dueDate: dueDate.toISOString().split("T")[0],
      paid: false,
    });
  }

  return semesterFees;
};
