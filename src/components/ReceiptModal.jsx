import React from "react";
import { X, FileText, Download, Calendar, DollarSign, CreditCard, User, Hash } from "lucide-react";

const ReceiptModal = ({ payment, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-content, .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div
        className="fixed top-0 inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 text-white p-6 rounded-t-lg flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-lg p-2">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Payment Receipt</h2>
              <p className="text-gray-300 text-sm">Receipt #{payment.receiptNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-8 print:p-4 receipt-content">
          {/* Receipt Header */}
          <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fee Management System</h1>
            <p className="text-gray-600">Payment Receipt</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-6">
            {/* Receipt Info */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Receipt Number</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">{payment.receiptNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(payment.paymentDate)}</p>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Student Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Student Name:</span>
                  <span className="font-semibold text-gray-900">{payment.studentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Roll Number:</span>
                  <span className="font-semibold text-gray-900 font-mono">{payment.rollNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Semester:</span>
                  <span className="font-semibold text-gray-700">{payment.semester}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method:
                  </span>
                  <span className="font-semibold text-gray-900">{payment.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Status:
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md font-medium text-sm border border-gray-200">
                    {payment.status}
                  </span>
                </div>
                {payment.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-semibold text-gray-900 font-mono text-sm">{payment.transactionId}</span>
                  </div>
                )}
                {payment.referenceNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reference Number:</span>
                    <span className="font-semibold text-gray-900 font-mono text-sm">{payment.referenceNumber}</span>
                  </div>
                )}
                {payment.bankName && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-semibold text-gray-900">{payment.bankName}</span>
                  </div>
                )}
                {payment.remarks && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-600 mb-1">Remarks:</p>
                    <p className="text-gray-900 text-sm">{payment.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t-2 border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                This is a computer-generated receipt. No signature is required.
              </p>
              <p className="text-xs text-gray-400">
                Generated on {new Date().toLocaleDateString("en-US", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Print / Download
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default ReceiptModal;

