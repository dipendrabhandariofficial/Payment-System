import * as XLSX from "xlsx";

/**
 * Generates a unique roll number for a student.
 * Format: COURSE-YYYYMMDD-SEQ (e.g., BCA-20231201-001)
 * 
 * @param {string} courseName - Name of the course
 * @param {string} admissionDate - Date of admission (YYYY-MM-DD)
 * @param {Array} existingStudents - List of existing students to check for collisions
 * @returns {string} Generated roll number
 */
export const generateRollNumber = (courseName, admissionDate, existingStudents = []) => {
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
    const similarRolls = existingStudents.filter((s) =>
        s.rollNumber?.startsWith(`${courseCode}-${dateCode}`)
    );

    // Generate sequential number
    const nextNum = String(similarRolls.length + 1).padStart(3, "0");

    return `${courseCode}-${dateCode}-${nextNum}`;
};

/**
 * Formats a number as Indian Currency (INR).
 * 
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Exports a list of students to an Excel file.
 * 
 * @param {Array} students - List of student objects to export
 * @param {string} fileNamePrefix - Prefix for the file name (default: "students_export")
 */
export const exportStudentsToExcel = (students, fileNamePrefix = "students_export") => {
    try {
        if (!students || students.length === 0) {
            throw new Error("No students data to export");
        }

        // Prepare data for export
        const exportData = students.map((student) => ({
            "Roll Number": student.rollNumber || "",
            Name: student.name || "",
            Email: student.email || "",
            Phone: student.phone || "",
            Course: student.course || "",
            Semester: student.semester || "",
            "Total Fees": student.totalFees || 0,
            "Paid Fees": student.paidFees || 0,
            "Pending Fees": student.pendingFees || 0,
            "Guardian Name": student.guardianName || "",
            "Guardian Phone": student.guardianPhone || "",
            "Guardian Relation": student.guardianRelation || "",
            Address: student.address || "",
            "Admission Date": student.admissionDate || "",
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
            { wch: 15 }, // Admission Date
        ];
        ws["!cols"] = columnWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Students");

        // Generate file name with current date
        const fileName = `${fileNamePrefix}_${new Date().toISOString().split("T")[0]
            }.xlsx`;

        // Save file with explicit bookType
        XLSX.writeFile(wb, fileName, { bookType: "xlsx", type: "binary" });

        return fileName;
    } catch (error) {
        console.error("Error exporting students:", error);
        throw error;
    }
};
