// ============================================
// COMPLETE AddPayment.jsx with Sequential Fee System
// ============================================

import React, { useState, useEffect } from "react";
import { getStudents, addPayment, updateStudent, getPayments } from "../services/api";
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
} from "lucide-react";
import Select from "../components/Select";
import { courses as initialCourses, getCourseById } from "../data/courses";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLayout from "../components/PageLayout";

const AddPayment = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]); // ADDED: Track all payments
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedPaymentCourse, setSelectedPaymentCourse] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsData, paymentsData] = await Promise.all([
        getStudents(),
        getPayments()
      ]);
      setStudents(studentsData);
      setPayments(paymentsData);
    } catch (error) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // CRITICAL: Function to determine which semesters can be paid
  const getAvailableSemesters = (student) => {
    if (!student) return [];

    const currentSemester = parseInt(student.semester) || 1;
    const semesterFees = student.semesterFees || [];

    // Check each semester from 1 to current semester
    for (let sem = 1; sem <= currentSemester; sem++) {
      const semFee = semesterFees.find(sf => parseInt(sf.semester) === sem);

      if (!semFee) continue;

      // Calculate paid amount for this semester
      const semesterPayments = payments.filter(
        (p) =>
          p.studentId === student.id &&
          parseInt(p.semester) === sem &&
          p.status === "Completed"
      );
      const paidAmount = semesterPayments.reduce((sum, p) => sum + p.amount, 0);

      // If this semester is not fully paid, BLOCK here
      if (paidAmount < semFee.amount) {
        const remainingAmount = semFee.amount - paidAmount;
        return [{
          semester: sem,
          paidAmount,
          totalAmount: semFee.amount,
          remainingAmount,
          isBlocked: sem < currentSemester // True if it's a past semester
        }];
      }
    }

    // All semesters paid up to current
    return [];
  };

  const getCourses = () => {
    const savedCourses = localStorage.getItem("courses");
    return savedCourses ? JSON.parse(savedCourses) : initialCourses;
  };

  const courses = getCourses();

  const handleStudentChange = (e) => {
    const studentId = e.target.value;

    if (!studentId) {
      setSelectedStudent(null);
      setSelectedPaymentCourse(null);
      resetForm();
      return;
    }

    const student = students.find((s) => s.id === studentId);

    if (student) {
      setSelectedStudent(student);

      let courseId = "";
      let courseName = "";
      let courseObj = null;

      if (student.courseId) {
        courseObj = getCourseById(student.courseId);
        if (courseObj) {
          courseId = student.courseId;
          courseName = courseObj.name;
          setSelectedPaymentCourse(courseObj);
        }
      }

      if (!courseObj && student.course) {
        courseObj = courses.find((c) => c.name === student.course);
        if (courseObj) {
          courseId = courseObj.id;
          courseName = courseObj.name;
          setSelectedPaymentCourse(courseObj);
        } else {
          courseName = student.course;
          setSelectedPaymentCourse(null);
        }
      }

      // Get available semester (the first unpaid one)
      const availableSemesters = getAvailableSemesters(student);
      const semester = availableSemesters.length > 0 
        ? availableSemesters[0].semester.toString() 
        : student.semester || "1";

      setFormData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
        courseId,
        course: courseName,
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

  const resetForm = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "courseId") {
      const course = courses.find((c) => c.id === value);
      if (course) {
        setSelectedPaymentCourse(course);
        setFormData({
          ...formData,
          courseId: value,
          course: course.name,
        });
      } else {
        setSelectedPaymentCourse(null);
        setFormData({ ...formData, courseId: "", course: "" });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedStudent) return setError("Please select a student");

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) return setError("Enter a valid amount");

    // CRITICAL VALIDATION: Check if the semester is payable
    const availableSemesters = getAvailableSemesters(selectedStudent);
    const selectedSemesterNum = parseInt(formData.semester);

    if (availableSemesters.length === 0) {
      return setError("All semester fees are already paid up to the current semester!");
    }

    const payableSemester = availableSemesters.find(s => s.semester === selectedSemesterNum);

    if (!payableSemester) {
      return setError(
        `Cannot pay for Semester ${selectedSemesterNum}. You must first clear Semester ${availableSemesters[0].semester} (${formatCurrency(availableSemesters[0].remainingAmount)} remaining).`
      );
    }

    // Check if amount exceeds remaining for this semester
    if (amount > payableSemester.remainingAmount) {
      return setError(
        `Amount exceeds remaining fees for Semester ${selectedSemesterNum}: ${formatCurrency(payableSemester.remainingAmount)}`
      );
    }

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

      await addPayment(paymentData);

      // Update student's overall fees
      const updatedStudent = {
        ...selectedStudent,
        paidFees: (selectedStudent.paidFees || 0) + amount,
        pendingFees: Math.max(0, (selectedStudent.pendingFees || selectedStudent.totalFees) - amount),
      };

      await updateStudent(selectedStudent.id, updatedStudent);

      setSuccess(true);
      resetForm();
      setSelectedStudent(null);
      setSelectedPaymentCourse(null);
      
      // Refresh data
      await fetchData();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Payment error:", error);
      setError("Failed to process payment");
      setTimeout(() => setError(""), 3000);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (loading) return <LoadingSpinner message="Loading payment data..." />;

  return (
    <PageLayout
      title="Add Payment"
      description="Process a new payment for a student. Students must clear previous semester fees before paying current semester."
      icon={<DollarSign className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
    >
      <div className="max-w-3xl mx-auto">
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">Payment processed successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SELECT STUDENT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Select Student <span className="text-red-500">*</span>
              </label>
              <select
                onChange={handleStudentChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                required
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.rollNumber} (Pending: {formatCurrency(student.pendingFees)})
                  </option>
                ))}
              </select>
            </div>

            {/* STUDENT INFO */}
            {selectedStudent && (
              <div className="bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Name</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedStudent.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Roll Number</p>
                    <p className="font-semibold font-mono text-gray-900 dark:text-white">
                      {selectedStudent.rollNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Course</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedStudent.course || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Current Semester</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedStudent.semester || "Not set"}
                    </p>
                  </div>

                  {/* Course Extra Info */}
                  {selectedPaymentCourse && (
                    <div className="col-span-2 mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                        Course Information:
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Department: {selectedPaymentCourse.department} | Fee per Semester: ₹
                        {selectedPaymentCourse.semesterFees.toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}

                  {/* FEES */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Fees</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedStudent.totalFees)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Paid Fees</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedStudent.paidFees || 0)}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Pending Fees</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(selectedStudent.pendingFees)}
                    </p>

                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div
                        className="bg-gray-600 dark:bg-gray-300 h-2.5 rounded-full"
                        style={{
                          width: `${
                            selectedStudent.totalFees > 0
                              ? ((selectedStudent.paidFees || 0) / selectedStudent.totalFees) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      {selectedStudent.totalFees > 0
                        ? `${Math.round(
                            ((selectedStudent.paidFees || 0) / selectedStudent.totalFees) * 100
                          )}% paid`
                        : "0% paid"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT FORM FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Payment Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Payment Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Select
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  icon={CreditCard}
                  darkMode
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "Online", label: "Online Transfer" },
                    { value: "Check", label: "Check" },
                    { value: "Card", label: "Debit/Credit Card" },
                  ]}
                />
              </div>

              {/* Course for Payment */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Course for Payment *
                </label>
                <Select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  icon={BookOpen}
                  darkMode
                  options={[
                    { value: "", label: "Select course..." },
                    ...courses.map((course) => ({
                      value: course.id,
                      label: course.name,
                    })),
                  ]}
                />

                {selectedPaymentCourse && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                          {selectedPaymentCourse.name}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Department: {selectedPaymentCourse.department} | Fee per Semester: ₹
                          {selectedPaymentCourse.semesterFees.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Semester - SEQUENTIAL PAYMENT ENFORCEMENT */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Semester *
                  {selectedStudent && getAvailableSemesters(selectedStudent).length > 0 && getAvailableSemesters(selectedStudent)[0].isBlocked && (
                    <span className="text-red-600 text-xs ml-2 font-bold">
                      ⚠️ Previous semester dues must be cleared first!
                    </span>
                  )}
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    disabled={!selectedStudent || getAvailableSemesters(selectedStudent).length === 0}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select semester...</option>
                    {selectedStudent &&
                      getAvailableSemesters(selectedStudent).map(({ semester, paidAmount, totalAmount, remainingAmount }) => (
                        <option key={semester} value={semester}>
                          Semester {semester} - Paid: ₹{paidAmount.toLocaleString("en-IN")} / ₹
                          {totalAmount.toLocaleString("en-IN")} (Remaining: ₹{remainingAmount.toLocaleString("en-IN")})
                        </option>
                      ))}
                  </select>
                </div>
                {selectedStudent && getAvailableSemesters(selectedStudent).length === 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    All semester fees up to current semester are fully paid!
                  </p>
                )}
                {selectedStudent && getAvailableSemesters(selectedStudent).length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> You can only pay for the earliest unpaid semester. Complete all previous semester payments first.
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Additional Payment Details (Optional)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                    placeholder="Enter transaction ID"
                  />
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                    placeholder="Enter reference number"
                  />
                </div>

                {/* Bank Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg"
                    placeholder="Enter bank name"
                  />
                </div>

                {/* Remarks */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Remarks / Notes
                  </label>
                  <textarea
                    name="remarks"
                    rows="3"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg resize-none"
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={!selectedStudent || getAvailableSemesters(selectedStudent).length === 0}
                className="w-full bg-gray-800 dark:bg-gray-600 text-white py-3.5 rounded-lg 
                font-semibold hover:bg-gray-900 dark:hover:bg-gray-500 transition-all shadow-lg 
                flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign className="w-5 h-5" />
                Process Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default AddPayment;