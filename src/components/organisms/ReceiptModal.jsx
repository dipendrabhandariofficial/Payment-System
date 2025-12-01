import React, { useRef } from "react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { X, Download, Printer, School } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const ReceiptModal = ({ payment, isOpen, onClose }) => {
  const toast = useToast();
  const receiptRef = useRef(null);

  if (!isOpen || !payment) return null;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = receiptRef.current;

      // Use html-to-image which supports modern CSS (like oklch from Tailwind v4)
      const imgData = await toJpeg(element, {
        quality: 0.75,
        backgroundColor: "#ffffff",
        pixelRatio: 2, // Higher resolution
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Calculate height based on element aspect ratio
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;
      const pdfHeight = (elementHeight * pdfWidth) / elementWidth;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // Sanitize filename to remove invalid characters
      const safeReceiptNumber = (payment.receiptNumber || "unknown").replace(
        /[^a-z0-9]/gi,
        "_"
      );
      pdf.save(`Receipt_${safeReceiptNumber}.pdf`);

      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF receipt");
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header (No Print) */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 no-print">
            <h2 className="text-lg font-semibold text-gray-800">
              Receipt Preview
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Content (Printable Area) */}
          <div className="p-8 bg-gray-50 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div
              id="receipt-content"
              ref={receiptRef}
              className="bg-white p-8 md:p-12 shadow-lg mx-auto max-w-[210mm] min-h-[297mm] relative text-gray-800"
              style={{ width: "100%" }}
            >
              {/* Receipt Header */}
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <School className="w-10 h-10" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Nepal Commerce Campus
                    </h1>
                    <p className="text-sm text-gray-500">
                      MinBhawan , Baneshwor Kathmandy
                    </p>
                    <p className="text-sm text-gray-500">
                      contact@institute.edu | +91 98765 43210
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-gray-200 tracking-widest uppercase">
                    Receipt
                  </h2>
                  <p className="text-blue-600 font-medium mt-2">
                    #{payment.receiptNumber}
                  </p>
                </div>
              </div>

              {/* Bill To & Details */}
              <div className="flex justify-between mb-12">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Bill To
                  </h3>
                  <p className="text-lg font-bold text-gray-900">
                    {payment.studentName}
                  </p>
                  <p className="text-gray-600">Roll No: {payment.rollNumber}</p>
                  <p className="text-gray-600">Semester: {payment.semester}</p>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Date
                    </span>
                    <span className="font-medium">
                      {formatDate(payment.paymentDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Payment Method
                    </span>
                    <span className="font-medium capitalize">
                      {payment.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Table */}
              <div className="mb-12">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-3 text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-right py-3 text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 text-gray-700">
                        <p className="font-medium text-gray-900">
                          Semester Fee Payment
                        </p>
                        <p className="text-sm text-gray-500">
                          Tuition and other academic fees for Semester{" "}
                          {payment.semester}
                        </p>
                        {payment.remarks && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            Note: {payment.remarks}
                          </p>
                        )}
                      </td>
                      <td className="py-4 text-right font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-16">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Tax (0%)</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-[35%] right-12 transform rotate-[-15deg] opacity-20 pointer-events-none">
                <div
                  className={`border-4 ${
                    payment.status === "Completed"
                      ? "border-green-600 text-green-600"
                      : "border-red-600 text-red-600"
                  } px-8 py-2 rounded-xl text-6xl font-black uppercase tracking-widest`}
                >
                  {payment.status}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-8 border-t border-gray-200">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Terms & Conditions:
                    </p>
                    <p className="text-xs text-gray-400 max-w-xs">
                      This receipt is electronically generated and valid without
                      signature. Fees once paid are non-refundable unless
                      specified otherwise.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-16 border-b border-gray-400 w-48 mb-2"></div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Authorized Signature
                    </p>
                  </div>
                </div>
                <div className="text-center mt-12 text-xs text-gray-400">
                  <p>Thank you for your payment!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer (Actions) */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3 no-print">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptModal;
