import React, { useState, useEffect } from "react";
import { usePayments } from "../services/api";
import { useBoolean } from "../hooks/useBoolean";
import {
  Filter,
  Calendar,
  ArrowUpDown,
  DollarSign,
  CreditCard,
  FileText,
  X,
  Eye,
} from "lucide-react";
import SearchBar from "../components/Search";
import Select from "../components/Select";
import ReceiptModal from "../components/ReceiptModal";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLayout from "../components/PageLayout";

const Payments = () => {
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [isReceiptModalOpen, { on: openReceiptModal, off: closeReceiptModal }] =
    useBoolean(false);

  const { data: payments = [], isLoading } = usePayments();

  useEffect(() => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Payment method filter
    if (filterMethod !== "All") {
      filtered = filtered.filter(
        (payment) => payment.paymentMethod === filterMethod
      );
    }

    // Date range filter
    if (fromDate) {
      filtered = filtered.filter((payment) => payment.paymentDate >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter((payment) => payment.paymentDate <= toDate);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.paymentDate);
      const dateB = new Date(b.paymentDate);
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredPayments(filtered);
  }, [searchTerm, filterMethod, fromDate, toDate, sortOrder, payments]);

  const paginatedItems = filteredPayments;
  const tableColumns = [
    "Student",
    "Amount",
    "Payment Date",
    "Method",
    "Semester",
    "Status",
    "Actions",
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  if (isLoading) {
    return <LoadingSpinner message="Getting Payment data" />;
  }

  return (
    <PageLayout
      title="Payments"
      subtitle={"Manage and review student payments"}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredPayments.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Amount
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white top-0 sticky dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            Filters & Search
          </h2>
          {(searchTerm || filterMethod !== "All" || fromDate || toDate) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterMethod("All");
                setFromDate("");
                setToDate("");
              }}
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchBar
            label="Search"
            placeholder="Search by name or roll number..."
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className=""
          />

          <Select
            label="Payment Method"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            icon={Filter}
            options={[
              { value: "All", label: "All Payment Methods" },
              { value: "Cash", label: "Cash" },
              { value: "Online", label: "Online" },
              { value: "Check", label: "Check" },
              { value: "Card", label: "Card" },
            ]}
          />

          <div className="w-full">
            <label
              htmlFor="from-date"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              From Date
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="From Date"
              />
            </div>
          </div>

          <div className="w-full">
            <label
              htmlFor="to-date"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              To Date
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors" />
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="To Date"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-4 flex-wrap">
          <Select
            label="Sort By"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            icon={ArrowUpDown}
            options={[
              { value: "latest", label: "Latest First" },
              { value: "oldest", label: "Oldest First" },
            ]}
            className="min-w-[200px]"
          />

          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Date Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Section with Infinite Scroll */}

      <DataTable
        columns={tableColumns}
        data={paginatedItems}
        loading={isLoading}
        emptyMessage="No payments found"
        emptyIcon={FileText}
        className="overflow-auto"
        renderRow={(payment, index) => (
          <tr
            key={payment.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 group"
          >
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="flex items-center">
                <div className="shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-xs mr-2">
                  {payment.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900 dark:text-white">
                    {payment.studentName}
                  </div>
                  <div className="text-[12px] text-gray-500 dark:text-gray-400">
                    {payment.rollNumber}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="flex items-center text-[11px] font-semibold text-gray-900 dark:text-white">
                <DollarSign className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex items-center text-[11px] text-gray-700 dark:text-gray-300">
                <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
                <span className="font-medium">
                  {formatDate(payment.paymentDate)}
                </span>
              </div>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex items-center">
                <CreditCard className="w-3 h-3 mr-1.5 text-gray-400" />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  {payment.paymentMethod}
                </span>
              </div>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              <span className="px-2 py-1 inline-flex text-[10px] leading-4 font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                Sem {payment.semester}
              </span>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              <span className="px-2 py-1 inline-flex items-center text-[10px] leading-4 font-medium rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                {payment.status}
              </span>
            </td>
            <td className="px-3 py-2 whitespace-nowrap">
              <button
                onClick={() => {
                  setSelectedPayment(payment);
                  openReceiptModal();
                }}
                className="px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-1.5 text-[11px]"
              >
                <Eye className="w-3 h-3" />
                View
              </button>
            </td>
          </tr>
        )}
        renderCard={(payment, index) => (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header with Student Info */}
            <div className="bg-linear-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {payment.studentName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{payment.studentName}</h3>
                  <p className="text-green-100 text-sm">
                    Roll: {payment.rollNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 space-y-4">
              {/* Amount - Highlighted */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Amount Paid
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              </div>

              {/* Other Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Payment Date
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(payment.paymentDate)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Semester
                  </span>
                  <span className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    Sem {payment.semester}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </span>
                  <span className="px-3 py-1 inline-flex items-center text-xs font-medium rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {payment.status}
                  </span>
                </div>
              </div>

              {/* View Receipt Button */}
              <button
                onClick={() => {
                  setSelectedPayment(payment);
                  openReceiptModal();
                }}
                className="w-full mt-4 px-4 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Receipt
              </button>
            </div>
          </div>
        )}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        payment={selectedPayment}
        isOpen={isReceiptModalOpen}
        onClose={() => {
          closeReceiptModal();
          setSelectedPayment(null);
        }}
      />
    </PageLayout>
  );
};

export default Payments;
