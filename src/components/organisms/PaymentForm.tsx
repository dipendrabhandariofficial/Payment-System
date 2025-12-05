import React, { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  CreditCard,
  GraduationCap,
  BookOpen,
  XCircle,
} from "lucide-react";
import Select from "../atoms/Select";
import SearchBar from "../molecules/Search";
import { Student, Payment, Course } from "../../types";
import { getCourseById } from "../../data/courses";
import {
  advancedPaymentSchema,
  getValidationErrors,
} from "../../schemas/payment.schema";
import { createContextualPaymentSchema } from "../../schemas/contextual-payment.schema";
import { useTemporaryMessage } from "@/hooks";

interface PaymentFormData {
  amount: string;
  paymentDate: string;
  paymentMethod: "Cash" | "Online" | "Check" | "Card";
  courseId: string;
  course: string;
  semester: string;
  transactionId: string;
  referenceNumber: string;
  bankName: string;
  remarks: string;
}

interface PaymentData {
  studentId: string;
  studentName: string;
  rollNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "Cash" | "Online" | "Check" | "Card";
  courseId: string | null;
  course: string;
  semester: string;
  receiptNumber: string;
  transactionId: string | null;
  referenceNumber: string | null;
  bankName: string | null;
  remarks: string | null;
  status: "Completed" | "Pending" | "Failed";
}

interface PaymentFormProps {
  students: Student[];
  payments: Payment[];
  courses: Course[];
  onSubmit: (
    paymentData: PaymentData,
    updatedStudent: Student
  ) => Promise<void>;
  submitting?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  students,
  payments,
  courses,
  onSubmit,
  submitting = false,
}) => {
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showExtra, setShowExtra] = useState(false);
  const [error, setError] = useTemporaryMessage();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );

  const [formData, setFormData] = useState<PaymentFormData>({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    courseId: "",
    course: "",
    semester: "",
    transactionId: "",
    referenceNumber: "",
    bankName: "",
    remarks: "",
  });

  // Filtered students based on search and filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (filterCourse && student.courseId !== filterCourse) return false;
      if (filterSemester && student.semester !== filterSemester) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.rollNumber.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [students, filterCourse, filterSemester, searchQuery]);

  // Get available semesters for payment
  const getAvailableSemesters = (student: Student) => {
    if (!student) return [];
    const currentSemester = parseInt(student.semester.toString()) || 1;
    const semesterFees = student.semesterFees || [];

    for (let sem = 1; sem <= currentSemester; sem++) {
      const semFee = semesterFees.find(
        (sf) => parseInt(sf.semester.toString()) === sem
      );
      if (!semFee) continue;

      const semesterPayments = payments.filter(
        (p) =>
          p.studentId === student.id &&
          parseInt(p.semester.toString()) === sem &&
          p.status === "Completed"
      );

      const paidAmount = semesterPayments.reduce((sum, p) => sum + p.amount, 0);

      if (paidAmount < semFee.amount) {
        return [
          {
            semester: sem,
            paidAmount,
            totalAmount: semFee.amount,
            remainingAmount: semFee.amount - paidAmount,
          },
        ];
      }
    }
    return [];
  };

  // Auto-select student if only one matches filters
  useEffect(() => {
    if (filteredStudents.length === 1) {
      const single = filteredStudents[0];
      setSelectedStudent(single);

      const courseObj = getCourseById(single.courseId);

      const availableSemesters = getAvailableSemesters(single);
      const semester =
        availableSemesters.length > 0
          ? availableSemesters[0].semester.toString()
          : single.semester.toString() || "1";

      setFormData((prev) => ({
        ...prev,
        courseId: single.courseId,
        course: courseObj ? courseObj.name : single.course,
        semester,
      }));
    }
  }, [filteredStudents]);

  const resetPaymentForm = () => {
    setFormData({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      courseId: "",
      course: "",
      semester: "",
      transactionId: "",
      referenceNumber: "",
      bankName: "",
      remarks: "",
    });
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    if (!studentId) {
      setSelectedStudent(null);
      resetPaymentForm();
      return;
    }

    const student = students.find((s) => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      console.log(student, "student");

      const courseObj = getCourseById(student.courseId);
      console.log(courseObj, "courseobj");

      const availableSemesters = getAvailableSemesters(student);
      const semester =
        availableSemesters.length > 0
          ? availableSemesters[0].semester.toString()
          : student.semester.toString() || "1";

      setFormData({
        ...formData,
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
        courseId: student.courseId || "",
        course: courseObj ? courseObj.name : student.course,
        semester,
        transactionId: "",
        referenceNumber: "",
        bankName: "",
        remarks: "",
      });

      setError("");
    } else {
      setError("Student not found");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "courseId") {
      const course = courses.find((c) => c.id === value);
      setFormData((prev) => ({ ...prev, course: course ? course.name : "" }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    // Validate on blur
    const result = advancedPaymentSchema.safeParse(formData);
    if (!result.success) {
      const errors = getValidationErrors(result.error);
      setValidationErrors(errors);
    }
  };

  const showError = (fieldName: string) => {
    return touchedFields[fieldName] && validationErrors[fieldName];
  };

  const getInputBorderClass = (fieldName: string) => {
    if (showError(fieldName)) {
      return "border-red-500 focus:ring-red-400 focus:border-red-400";
    }
    return "border-gray-300 dark:border-gray-600";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(formData);

    try {
      e.preventDefault();
      setError("");
      setValidationErrors({});

      // Single Zod validation with business logic context
      const contextualSchema = createContextualPaymentSchema({
        selectedStudent,
        availableSemesters: selectedStudent
          ? getAvailableSemesters(selectedStudent)
          : [],
      });

      const validationResult = contextualSchema.safeParse(formData);

      if (!validationResult.success) {
        const errors = getValidationErrors(validationResult.error);
        setValidationErrors(errors);
        setTouchedFields({
          amount: true,
          paymentDate: true,
          paymentMethod: true,
          course: true,
          semester: true,
          transactionId: true,
          referenceNumber: true,
          remarks: true,
        });

        // Show specific error if student not selected or semester issue
        if (errors.student) {
          setError(errors.student);
        } else if (errors.semester) {
          setError(errors.semester);
        } else if (errors.amount) {
          setError(errors.amount);
        } else {
          setError("Please fix the validation errors before submitting");
        }
        return;
      }

      // All validations passed - proceed with payment processing
      // At this point, validation has confirmed selectedStudent is not null
      const student = selectedStudent!;
      const amount = parseFloat(formData.amount);

      const paymentData: PaymentData = {
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        courseId: formData.courseId || student.courseId || null,
        course: formData.course,
        semester: formData.semester,
        receiptNumber: `RCP${Date.now()}`,
        transactionId: formData.transactionId || null,
        referenceNumber: formData.referenceNumber || null,
        bankName: formData.bankName || null,
        remarks: formData.remarks || null,
        status: "Completed",
      };

      const updatedStudent: Student = {
        ...student,
        paidFees: (student.paidFees || 0) + amount,
        pendingFees: Math.max(
          0,
          (student.pendingFees || student.totalFees) - amount
        ),
      };

      await onSubmit(paymentData, updatedStudent);

      // Reset form and validation state
      resetPaymentForm();
      setSelectedStudent(null);
      setValidationErrors({});
      setTouchedFields({});
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center shadow-sm">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {/* FILTER SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Department"
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          icon={BookOpen}
          options={[
            { value: "", label: "All Courses" },
            ...courses.map((c) => ({
              value: c.id,
              label: c.name,
            })),
          ]}
        />

        <Select
          label="Degree Type"
          value={filterSemester}
          onChange={(e) => {
            setFilterSemester(e.target.value);
            setSelectedStudent(null);
          }}
          icon={GraduationCap}
          options={[
            { value: "", label: "All Semesters" },
            ...Array.from({ length: 8 }, (_, i) => ({
              value: (i + 1).toString(),
              label: (i + 1).toString(),
            })),
          ]}
          className="w-full"
        />

        <SearchBar
          searchTerm={searchQuery}
          label="Search"
          setSearchTerm={setSearchQuery}
          placeholder="Search by name or roll number..."
          className="w-full"
        />

        <div className="md:col-span-3">
          {filteredStudents.length === 0 && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No students match the selected filters.
              </p>
            </div>
          )}

          {filteredStudents.length > 0 && (
            <Select
              label="Select Student"
              value={selectedStudent?.id || ""}
              onChange={handleStudentChange}
              placeholder="Choose a student"
              options={filteredStudents.map((student) => ({
                value: student.id,
                label: `${student.name} (${
                  student.rollNumber
                }) — Pending: ${formatCurrency(student.pendingFees)}`,
              }))}
              className="transition-all duration-200"
            />
          )}
        </div>
      </div>

      {/* PAYMENT FORM */}
      {selectedStudent && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                onBlur={() => handleBlur("amount")}
                min="0"
                step="0.01"
                required
                className={`w-full border-2 rounded px-2 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${getInputBorderClass(
                  "amount"
                )}`}
                disabled={submitting}
              />
              {showError("amount") && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {validationErrors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                onBlur={() => handleBlur("paymentDate")}
                required
                className={`w-full border-2 rounded px-2 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${getInputBorderClass(
                  "paymentDate"
                )}`}
                disabled={submitting}
              />
              {showError("paymentDate") && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {validationErrors.paymentDate}
                </p>
              )}
            </div>

            <div>
              <Select
                label="Payment Method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                icon={CreditCard}
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "Online", label: "Online Transfer" },
                  { value: "Check", label: "Check" },
                  { value: "Card", label: "Debit/Credit Card" },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Semester to Pay
              </label>

              {getAvailableSemesters(selectedStudent).length === 0 ? (
                <p className="text-sm text-green-600 dark:text-green-300 font-medium bg-green-50 dark:bg-green-900/30 border border-green-400 px-3 py-2 rounded">
                  ✅ All semester fees are fully paid. No payment required.
                </p>
              ) : (
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-2 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={submitting}
                >
                  {getAvailableSemesters(selectedStudent).map((s) => (
                    <option key={s.semester} value={s.semester}>
                      Semester {s.semester} — Remaining:{" "}
                      {formatCurrency(s.remainingAmount)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowExtra(!showExtra)}
              className="text-sm text-blue-500 mb-2"
            >
              Show/Hide Extra Details
            </button>
            {showExtra && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Transaction ID"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    onBlur={() => handleBlur("transactionId")}
                    className={`w-full border-2 rounded px-2 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${getInputBorderClass(
                      "transactionId"
                    )}`}
                    disabled={submitting}
                  />
                  {showError("transactionId") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" />
                      {validationErrors.transactionId}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Reference/Check Number"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    onBlur={() => handleBlur("referenceNumber")}
                    className={`w-full border-2 rounded px-2 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${getInputBorderClass(
                      "referenceNumber"
                    )}`}
                    disabled={submitting}
                  />
                  {showError("referenceNumber") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" />
                      {validationErrors.referenceNumber}
                    </p>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="border rounded px-2 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={submitting}
                />
                <div className="md:col-span-2">
                  <textarea
                    placeholder="Remarks (max 500 characters)"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    onBlur={() => handleBlur("remarks")}
                    className={`w-full border-2 rounded px-2 py-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 ${getInputBorderClass(
                      "remarks"
                    )}`}
                    disabled={submitting}
                  />
                  {showError("remarks") && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" />
                      {validationErrors.remarks}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Processing..." : "Process Payment"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;
// function setSelectedPaymentCourse(arg0: Course | null) {
//   setSelectedPaymentCourse(arg0);
// }
