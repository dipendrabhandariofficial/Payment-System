import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  useStudents,
  usePayments,
  useCreatePayment,
  useUpdateStudent,
} from "../services/api/index";
import {
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  CreditCard,
  User,
  GraduationCap,
  BookOpen,
  Info,
  Filter,
  Search,
  Users,
} from "lucide-react";
import Select from "../components/atoms/Select";
import { courses as initialCourses, getCourseById } from "../data/courses";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import PageLayout from "../components/templates/PageLayout";
import SearchBar from "../components/molecules/Search";
import { useBoolean } from "../hooks/useBoolean";

const AddPayment = () => {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const createPayment = useCreatePayment();
  const updateStudentMutation = useUpdateStudent();

  const [availableCourses, setAvailableCourses] = useState(initialCourses);

  const [filterCourse, setFilterCourse] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPaymentCourse, setSelectedPaymentCourse] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
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

  const [success, setSuccess] = useBoolean(false);
  const [error, setError] = useState("");
  const [showExtra, setShowExtra] = useState(false);

  const loading = studentsLoading || paymentsLoading;

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) setAvailableCourses(JSON.parse(savedCourses));
  }, []);

  // Filtered students
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

  useEffect(() => {
    if (filteredStudents.length === 1) {
      // auto select the only available student
      const single = filteredStudents[0];
      setSelectedStudent(single);

      const courseObj = getCourseById(single.courseId);
      setSelectedPaymentCourse(courseObj || null);

      const availableSemesters = getAvailableSemesters(single);
      const semester =
        availableSemesters.length > 0
          ? availableSemesters[0].semester.toString()
          : single.semester || "1";

      setFormData((prev) => ({
        ...prev,
        courseId: single.courseId,
        course: courseObj ? courseObj.name : single.course,
        semester,
      }));
    }
  }, [filteredStudents]);

  const getAvailableSemesters = (student) => {
    if (!student) return [];
    const currentSemester = parseInt(student.semester) || 1;
    const semesterFees = student.semesterFees || [];
    for (let sem = 1; sem <= currentSemester; sem++) {
      const semFee = semesterFees.find((sf) => parseInt(sf.semester) === sem);
      if (!semFee) continue;
      const semesterPayments = payments.filter(
        (p) =>
          p.studentId === student.id &&
          parseInt(p.semester) === sem &&
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

  const option = filteredStudents.map((student) => ({
    label: `${student.name} (${student.rollNumber}) - Pending: ${student.pendingFees}`,
    value: student.id,
  }));

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    if (!studentId) {
      setSelectedStudent(null);
      setSelectedPaymentCourse(null);
      resetPaymentForm();
      return;
    }

    const student = students.find((s) => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      const courseObj = getCourseById(student.courseId);
      setSelectedPaymentCourse(courseObj || null);

      const availableSemesters = getAvailableSemesters(student);
      const semester =
        availableSemesters.length > 0
          ? availableSemesters[0].semester.toString()
          : student.semester || "1";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "courseId") {
      const course = availableCourses.find((c) => c.id === value);
      setSelectedPaymentCourse(course || null);
      setFormData((prev) => ({ ...prev, course: course ? course.name : "" }));
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedStudent) return setError("Please select a student");
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) return setError("Enter a valid amount");

    const availableSemesters = getAvailableSemesters(selectedStudent);
    const selectedSemesterNum = parseInt(formData.semester);

    if (!availableSemesters.length) {
      setError("All semester fees are already paid!");

      setTimeout(() => {
        setError(""); // Clear after 3 seconds
      }, 3000);

      return;
    }

    const payableSemester = availableSemesters.find(
      (s) => s.semester === selectedSemesterNum
    );
    if (!payableSemester)
      return setError(`Pay Semester ${availableSemesters[0].semester} first.`);

    if (amount > payableSemester.remainingAmount)
      return setError(
        `Amount exceeds remaining fees: ${formatCurrency(
          payableSemester.remainingAmount
        )}`
      );

    try {
      const paymentData = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        rollNumber: selectedStudent.rollNumber,
        amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        courseId: formData.courseId || selectedStudent.courseId || null,
        course: formData.course,
        semester: formData.semester,
        receiptNumber: `RCP${Date.now()}`,
        transactionId: formData.transactionId || null,
        referenceNumber: formData.referenceNumber || null,
        bankName: formData.bankName || null,
        remarks: formData.remarks || null,
        status: "Completed",
      };
      await createPayment.mutateAsync(paymentData);

      const updatedStudent = {
        ...selectedStudent,
        paidFees: (selectedStudent.paidFees || 0) + amount,
        pendingFees: Math.max(
          0,
          (selectedStudent.pendingFees || selectedStudent.totalFees) - amount
        ),
      };
      await updateStudentMutation.mutateAsync({
        id: selectedStudent.id,
        data: updatedStudent,
      });

      setSuccess(true);
      resetPaymentForm();
      setSelectedStudent(null);
      setSelectedPaymentCourse(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to process payment");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) return <LoadingSpinner message="Loading payment data..." />;

  return (
    <PageLayout
      title="Add Payment"
      description="Process a new payment for a student. Use filters to find students quickly."
      icon={<DollarSign className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-lg flex items-center shadow-sm">
            <CheckCircle className="w-5 h-5 mr-3" />
            Payment processed successfully!
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        {/* FILTER */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Department"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            icon={BookOpen}
            options={[
              { value: "", label: "All Courses" },
              ...availableCourses.map((c) => ({
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
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
              { value: "6", label: "6" },
              { value: "7", label: "7" },
              { value: "8", label: "8" },
            ]}
            className="w-full"
          />
          <SearchBar
            searchTerm={searchQuery}
            label={"Search"}
            setSearchTerm={setSearchQuery}
            placeholder="Search by name or roll number..."
            className="w-full "
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
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full border rounded px-2 py-2"
                />
              </div>
              <div>
                <label>Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-2 py-2"
                />
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
                    className="w-full border rounded px-2 py-2"
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
                  <input
                    type="text"
                    placeholder="Transaction ID"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    className="border rounded px-2 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="border rounded px-2 py-2"
                  />
                  <textarea
                    placeholder="Remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="border rounded px-2 py-2 md:col-span-2"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Process Payment
            </button>
          </form>
        )}
      </div>
    </PageLayout>
  );
};

export default AddPayment;
