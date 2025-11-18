// Bachelor Degree Courses 
export const courses = [
  {
    id: "bsc-cs",
    name: "Bachelor of Science in Computer Science",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 50000, // Fee per semester
    totalFees: 300000,
    description: "Comprehensive computer science program covering programming, algorithms, data structures, and software engineering.",
    department: "Computer Science",
  },
  {
    id: "bsc-it",
    name: "Bachelor of Science in Information Technology",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 48000,
    totalFees: 288000,
    description: "IT-focused program covering networking, database management, web technologies, and IT infrastructure.",
    department: "Information Technology",
  },
  {
    id: "bcom",
    name: "Bachelor of Commerce",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 35000,
    totalFees: 210000,
    description: "Commerce program covering accounting, finance, economics, and business management.",
    department: "Commerce",
  },
  {
    id: "bba",
    name: "Bachelor of Business Administration",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 42000,
    totalFees: 252000,
    description: "Business administration program focusing on management, marketing, HR, and entrepreneurship.",
    department: "Business Administration",
  },
  {
    id: "bsc-math",
    name: "Bachelor of Science in Mathematics",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 40000,
    totalFees: 240000,
    description: "Mathematics program covering pure mathematics, applied mathematics, statistics, and computational methods.",
    department: "Mathematics",
  },
  {
    id: "bsc-physics",
    name: "Bachelor of Science in Physics",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 38000,
    totalFees: 228000,
    description: "Physics program covering classical mechanics, quantum physics, electromagnetism, and modern physics.",
    department: "Physics",
  },
  {
    id: "bsc-chemistry",
    name: "Bachelor of Science in Chemistry",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 38000,
    totalFees: 228000,
    description: "Chemistry program covering organic, inorganic, physical chemistry, and analytical methods.",
    department: "Chemistry",
  },
  {
    id: "ba-english",
    name: "Bachelor of Arts in English",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 30000,
    totalFees: 180000,
    description: "English literature program covering classical and modern literature, linguistics, and creative writing.",
    department: "English",
  },
  {
    id: "bsc-economics",
    name: "Bachelor of Science in Economics",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 36000,
    totalFees: 216000,
    description: "Economics program covering microeconomics, macroeconomics, econometrics, and economic policy.",
    department: "Economics",
  },
  {
    id: "bsc-bio",
    name: "Bachelor of Science in Biology",
    degreeType: "Bachelor",
    duration: "3 Years",
    totalSemesters: 6,
    semesterFees: 40000,
    totalFees: 240000,
    description: "Biology program covering cell biology, genetics, microbiology, ecology, and biotechnology.",
    department: "Biology",
  },
];

// Helper function to get course by ID
export const getCourseById = (courseId) => {
  return courses.find((course) => course.id === courseId);
};

// Helper function to get course by name
export const getCourseByName = (courseName) => {
  return courses.find((course) => course.name === courseName);
};

// Helper function to generate semester fees structure for a course
export const generateSemesterFees = (course, admissionDate) => {
  const semesterFees = [];
  const admission = new Date(admissionDate);
  
  for (let i = 1; i <= course.totalSemesters; i++) {
    // Calculate due date (6 months after admission for first semester, then every 6 months)
    const dueDate = new Date(admission);
    dueDate.setMonth(admission.getMonth() + (i - 1) * 6);
    
    semesterFees.push({
      semester: i.toString(),
      amount: course.semesterFees,
      dueDate: dueDate.toISOString().split("T")[0],
      paid: false,
    });
  }
  
  return semesterFees;
};

