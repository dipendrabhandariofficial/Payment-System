import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { User, DollarSign, Loader2, Receipt } from "lucide-react";
import { getPayments } from "../services/api";

const StudentViewModal = ({ student, isOpen, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      fetchPayments();
    } else {
      setPayments([]);
    }
  }, [student, isOpen]);

  const fetchPayments = async () => {
    if (!student?.id) return;
    
    setLoadingPayments(true);
    try {
      // Get all payments and filter for this student
      const allPayments = await getPayments();
      const studentPayments = allPayments.filter(
        (payment) => payment.studentId === student.id
      );
      
      // Sort by payment date (most recent first)
      const sortedPayments = studentPayments.sort((a, b) => {
        return new Date(b.paymentDate) - new Date(a.paymentDate);
      });
      
      setPayments(sortedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate which semesters have been paid based on payment records
  const getSemesterPaymentStatus = () => {
    if (!student.semesterFees || !payments.length) {
      return student.semesterFees || [];
    }

    // Get completed payments grouped by semester
    const completedPayments = payments.filter(p => p.status === 'Completed');
    const paymentsBySemester = {};
    
    completedPayments.forEach(payment => {
      const sem = payment.semester;
      if (sem) {
        if (!paymentsBySemester[sem]) {
          paymentsBySemester[sem] = 0;
        }
        paymentsBySemester[sem] += payment.amount;
      }
    });

    // Update semester fees with payment status
    return student.semesterFees.map(semFee => {
      const paidAmount = paymentsBySemester[semFee.semester] || 0;
      const isPaid = paidAmount >= semFee.amount;
      
      return {
        ...semFee,
        paid: isPaid,
        paidAmount: paidAmount,
        remainingAmount: Math.max(0, semFee.amount - paidAmount)
      };
    });
  };

  if (!student) return null;

  const progressPercentage = student.totalFees > 0 
    ? ((student.paidFees || 0) / student.totalFees) * 100 
    : 0;

  // Calculate completed payments total
  const completedPayments = payments.filter(p => p.status === 'Completed');
  const totalPaidFromPayments = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Get updated semester fees with payment status
  const semesterFeesWithStatus = getSemesterPaymentStatus();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Details"
      subtitle={student.name}
      icon={User}
      size="large"
    >
      <div className="space-y-6">
        {/* Student Info */}
        <div>
          <h3 className="-z-10 text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <p className="text-xs text-gray-500 mb-1">Roll Number</p>
              <p className="font-semibold text-gray-900">{student.rollNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-900 text-sm break-all">{student.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="font-semibold text-gray-900">{student.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Course</p>
              <p className="font-semibold text-gray-900 text-sm">{student.course || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Current Semester</p>
              <p className="font-semibold text-gray-900">{student.semester}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Admission Date</p>
              <p className="font-semibold text-gray-900">
                {student.admissionDate 
                  ? new Date(student.admissionDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              Payment Status
            </h3>
            <span className="text-sm font-semibold text-gray-700">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-gray-600 to-gray-800 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Fees</p>
              <p className="font-bold text-gray-900 text-lg">{formatCurrency(student.totalFees || 0)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <p className="text-xs text-green-600 mb-1 uppercase tracking-wide">Paid</p>
              <p className="font-bold text-green-700 text-lg">{formatCurrency(student.paidFees || 0)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <p className="text-xs text-red-600 mb-1 uppercase tracking-wide">Pending</p>
              <p className="font-bold text-red-700 text-lg">{formatCurrency(student.pendingFees || 0)}</p>
            </div>
          </div>
        </div>

        {/* Semester-wise Breakdown */}
        {semesterFeesWithStatus.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Semester-wise Fee Structure</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {semesterFeesWithStatus.filter(s => s.paid).length} / {semesterFeesWithStatus.length} Paid
              </span>
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {semesterFeesWithStatus.map((semFee, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-md transition-all ${
                      semFee.paid 
                        ? 'bg-green-100 border border-green-300' 
                        : semFee.paidAmount > 0
                        ? 'bg-yellow-50 border border-yellow-300'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        semFee.paid 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        Sem {semFee.semester}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(semFee.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(semFee.dueDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        {semFee.paidAmount > 0 && !semFee.paid && (
                          <p className="text-xs text-amber-600 font-medium mt-1">
                            Partial: {formatCurrency(semFee.paidAmount)} paid, {formatCurrency(semFee.remainingAmount)} remaining
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        semFee.paid 
                          ? 'bg-green-600 text-white' 
                          : semFee.paidAmount > 0
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}>
                        {semFee.paid ? '✓ Paid' : semFee.paidAmount > 0 ? 'Partial' : 'Pending'}
                      </span>
                      {semFee.paidAmount > 0 && (
                        <span className="text-xs text-gray-500">
                          {formatCurrency(semFee.paidAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gray-600" />
            Payment History
            {payments.length > 0 && (
              <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {payments.length} {payments.length === 1 ? 'payment' : 'payments'}
              </span>
            )}
          </h3>
          {loadingPayments ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Loading payment history...</p>
            </div>
          ) : payments.length > 0 ? (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Semester</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {payment.paymentMethod}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 bg-gray-200 rounded text-xs font-semibold text-gray-700">
                            Sem {payment.semester || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'Completed' 
                              ? 'bg-green-100 text-green-700 border border-green-300' 
                              : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-mono text-xs">
                          #{payment.receiptNumber || payment.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan="5" className="px-4 py-3 text-right font-semibold text-gray-700">
                        Total Paid (from payments):
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {formatCurrency(totalPaidFromPayments)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">No payment records found</p>
              <p className="text-gray-500 text-sm mt-1">This student hasn't made any payments yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default StudentViewModal;