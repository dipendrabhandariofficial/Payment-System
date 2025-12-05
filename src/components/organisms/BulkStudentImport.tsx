import { useState, useMemo } from "react";
import {
  Upload,
  X,
  Download,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import type { Course, Student, StudentFormData } from "../../types";

interface ExcelRow {
  Name?: string;
  Email?: string;
  Phone?: string | number;
  "Course ID"?: string;
  Semester?: string | number;
  Address?: string;
  "Guardian Name"?: string;
  "Guardian Phone"?: string | number;
  "Guardian Relation"?: string;
}

interface PreviewStudent extends StudentFormData {
  rowNum: number;
}

interface BulkStudentImportProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onImport: (students: StudentFormData[]) => Promise<void> | void;
  generateRollNumber: (courseName: string, admissionDate: string) => string;
  existingStudents: Student[];
}

export default function BulkStudentImport({
  isOpen,
  onClose,
  courses,
  onImport,
  generateRollNumber,
  existingStudents,
}: BulkStudentImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<PreviewStudent[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const existingRollNumbers = useMemo(() => {
    return new Set([
      ...(existingStudents?.map((s) => s.rollNumber) || []),
      ...preview.map((p) => p.rollNumber),
    ]);
  }, [existingStudents, preview]);

  const downloadTemplate = () => {
    const template: ExcelRow[] = [
      {
        Name: "John Doe",
        Email: "john@example.com",
        Phone: "9876543210",
        "Course ID": "bsc-cs",
        Semester: "1",
        Address: "Kathmandu",
        "Guardian Name": "Jane Doe",
        "Guardian Phone": "9876543211",
        "Guardian Relation": "Mother",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Student_Import_Template.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer) return;

      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);

      if (jsonData.length === 0) {
        setErrors(["Spreadsheet is empty."]);
        return;
      }

      validateAndPreview(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const validateAndPreview = (rows: ExcelRow[]) => {
    const validated: PreviewStudent[] = [];
    const errorList: string[] = [];
    const usedRolls = new Set<string>();

    rows.forEach((row, index) => {
      const rowNum = index + 2;
      const rowErrors: string[] = [];

      if (!row.Name?.trim()) rowErrors.push("Name required");
      if (!row.Email?.trim()) rowErrors.push("Email required");
      if (!row.Phone) rowErrors.push("Phone required");
      if (!row["Course ID"]?.trim()) rowErrors.push("Course ID required");
      if (!row.Semester) rowErrors.push("Semester required");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (row.Email && !emailRegex.test(row.Email)) {
        rowErrors.push("Invalid email");
      }

      const phoneNum = row.Phone?.toString().trim();
      if (phoneNum && !/^\d{10}$/.test(phoneNum)) {
        rowErrors.push("Phone must be 10 digits");
      }

      const course = courses.find((c) => c.id === row["Course ID"]?.trim());
      if (!course) rowErrors.push(`Course ID "${row["Course ID"]}" not found`);

      if (rowErrors.length > 0) {
        errorList.push(`Row ${rowNum}: ${rowErrors.join(", ")}`);
        return;
      }

      if (!course) return;

      const today = new Date().toISOString().split("T")[0];

      let roll = generateRollNumber(course.name, today);
      let attempt = 0;

      while (existingRollNumbers.has(roll) || usedRolls.has(roll)) {
        attempt++;
        roll = `${generateRollNumber(course.name, today)}-${attempt}`;
      }

      usedRolls.add(roll);

      if (validated.some((s) => s.email === row.Email?.trim())) {
        errorList.push(`Row ${rowNum}: Duplicate email "${row.Email}"`);
        return;
      }

      const student: PreviewStudent = {
        name: row.Name!.trim(),
        email: row.Email!.trim(),
        phone: phoneNum!,
        courseId: course.id,
        course: course.name,
        admissionDate: today,
        semester: row.Semester!.toString(),
        address: row.Address?.trim() || "",
        guardianName: row["Guardian Name"]?.trim() || "",
        guardianPhone: row["Guardian Phone"]?.toString().trim() || "",
        guardianRelation: row["Guardian Relation"]?.trim() || "",
        rollNumber: roll,
        totalFees: course.totalFees,
        semesterFees: generateSemesterFees(course, today),
        paidFees: 0,
        pendingFees: course.totalFees,
        rowNum,
      };

      validated.push(student);
    });

    setErrors(errorList);
    setPreview(validated);
  };

  const generateSemesterFees = (course: Course, admissionDate: string) => {
    const fees: {
      semester: string;
      amount: number;
      dueDate: string;
      paid: boolean;
    }[] = [];

    const start = new Date(admissionDate);

    for (let i = 1; i <= course.totalSemesters; i++) {
      const due = new Date(start);
      due.setMonth(start.getMonth() + (i - 1) * 6);

      fees.push({
        semester: i.toString(),
        amount: course.semesterFees || course.totalFees / course.totalSemesters,
        dueDate: due.toISOString().split("T")[0],
        paid: false,
      });
    }

    return fees;
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);

    try {
      await onImport(preview);
      setSuccess(true);
      setTimeout(handleClose, 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown import error";
      setErrors([`Import failed: ${message}`]);
    }

    setImporting(false);
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bulk Student Import</h2>
          <button onClick={handleClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col items-center border-2 border-dashed p-6 rounded-lg">
          <FileSpreadsheet className="w-10 h-10 text-gray-500 mb-2" />
          <p className="text-gray-600 mb-3">Upload Excel (.xlsx) File</p>

          <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
            <Upload size={18} />
            Select File
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {file && <p className="mt-3 text-sm text-gray-700">{file.name}</p>}
        </div>

        {preview.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Preview ({preview.length})</h3>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-3 text-sm">
              {preview.map((p) => (
                <div
                  key={p.rowNum}
                  className="border-b py-2 flex justify-between"
                >
                  <span>
                    {p.rowNum}. {p.name} — {p.email} — {p.course} — Sem{" "}
                    {p.semester}
                  </span>
                  <span className="font-mono">{p.rollNumber}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-6 bg-red-50 text-red-800 p-3 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" /> Errors ({errors.length})
            </h3>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Import Successful
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2"
          >
            <Download size={18} /> Download Template
          </button>

          <button
            disabled={preview.length === 0 || importing}
            onClick={handleImport}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
              importing ? "bg-blue-400" : "bg-blue-600"
            }`}
          >
            {importing && <Loader2 className="animate-spin w-5 h-5" />}
            Import Students
          </button>
        </div>
      </div>
    </div>
  );
}
