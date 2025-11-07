import React, { useState, useEffect } from "react";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import { getStudents, addPayment, updateStudent } from "../services/api";
import { CheckCircle, AlertCircle } from "lucide-react";
import Dropdown from "../components/dropdown/Dropdown";
import { Button } from "../components/button/Button";

const AddPayment = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    semester: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);


  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;

    if (!studentId) {
      setSelectedStudent(null);
      setFormData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Cash",
        semester: "",
      });
      return;
    }

    const student = students.find((s) => s.id === studentId);

    if (student) {
      setSelectedStudent(student);
      setFormData({
        ...formData,
        semester: student.semester || "",
      });
      setError("");
    } else {
      setError("Student not found");
      setSelectedStudent(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Reset old states
  setError("");
  setSuccess(false);

  if (!selectedStudent) {
    setError("Please select a student");
    return;
  }

  const amount = parseFloat(formData.amount);
  if (isNaN(amount) || amount <= 0) {
    setError("Please enter a valid amount");
    return;
  }

  if (amount > selectedStudent.pendingFees) {
    setError(`Amount cannot exceed pending fees (₹${selectedStudent.pendingFees})`);
    return;
  }

  try {
    const paymentData = {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      rollNumber: selectedStudent.rollNumber,
      amount,
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      semester: formData.semester,
      receiptNumber: `RCP${Date.now()}`,
      status: "Completed",
    };

    await addPayment(paymentData);

    const updatedStudent = {
      ...selectedStudent,
      paidFees: (selectedStudent.paidFees || 0) + amount,
      pendingFees:
        (selectedStudent.pendingFees || selectedStudent.totalFees) - amount,
    };

    await updateStudent(selectedStudent.id, updatedStudent);

    // ✅ Payment succeeded
    setSuccess(true);
    setError(""); // make sure no leftover error remains

    setFormData({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Cash",
      semester: "",
    });
    setSelectedStudent(null);

    await fetchStudents();
  } catch (err) {
    console.error("Error processing payment:", err);
    setError("Failed to process payment. Please try again.");
  }
};

  useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(timer);
  }
}, [success]);

useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }
}, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 ">
        <main className="flex-1  bg-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Payment</h1>

          <div className="max-w-2xl mx-auto">
            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Payment processed successfully!</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Student
                  </label>
                  <select
                    onChange={handleStudentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.rollNumber} (Pending: ₹
                        {student.pendingFees})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStudent && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Student Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600">Course:</p>
                      <p className="text-gray-800 font-medium">
                        {selectedStudent.course}
                      </p>
                      <p className="text-gray-600">Total Fees:</p>
                      <p className="text-gray-800 font-medium">
                        ₹{selectedStudent.totalFees}
                      </p>
                      <p className="text-gray-600">Paid:</p>
                      <p className="text-green-600 font-medium">
                        ₹{selectedStudent.paidFees}
                      </p>
                      <p className="text-gray-600">Pending:</p>
                      <p className="text-red-600 font-medium">
                        ₹{selectedStudent.pendingFees}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="[&_label]:font-bold [&_label]:text-gray-700">
                   <label className="block text-gray-700 font-medium mb-2">
                    Payment Method
                  </label>
                  <Dropdown
                    options={["Cash", "Online Transfer", "Cheque", "Card"]}
                    value={formData.paymentMethod}
                    onSelect={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                    required
                    width="full"
                  >
                    Payment Method
                  </Dropdown>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter semester"
                    required
                  />
                </div>

                <Button type="submit" colorScheme="blue" className="w-full">
                  Process Payment
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddPayment;
