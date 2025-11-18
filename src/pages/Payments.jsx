import React, { useState, useEffect } from "react";
import { getPayments } from "../services/api";
import { Filter, Calendar, ArrowUpDown, DollarSign, CreditCard, FileText, X, TrendingUp, Users, Loader2, Eye } from "lucide-react";
import SearchBar from "../components/Search";
import Select from "../components/Select";
import ReceiptModal from "../components/ReceiptModal";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLayout from "../components/PageLayout";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("latest"); // "latest" or "oldest"
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

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
      filtered = filtered.filter(
        (payment) => payment.paymentDate >= fromDate
      );
    }

    if (toDate) {
      filtered = filtered.filter(
        (payment) => payment.paymentDate <= toDate
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.paymentDate);
      const dateB = new Date(b.paymentDate);
      return sortOrder === "latest" 
        ? dateB - dateA 
        : dateA - dateB;
    });

    setFilteredPayments(filtered);
  }, [searchTerm, filterMethod, fromDate, toDate, sortOrder, payments]);

  const fetchPayments = async () => {
    try {
      const data = await getPayments();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };
  const tableColumns = [
  "Student",
  "Amount",
  "Payment Date",
  "Method",
  "Semester",
  "Status",
  "Actions",
];

  if (loading) {
    return (
      <LoadingSpinner message="" />
    );
  }

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
  if(loading){
    return <LoadingSpinner message="Getting Payment data"/>;
  }


  return (
    <PageLayout
      title="Payments"
      subtitle={"Manage and review student payments"}
      >


          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
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
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
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
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  From Date
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                  <input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
                    placeholder="From Date"
                  />
                </div>
              </div>

              <div className="w-full">
                <label
                  htmlFor="to-date"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  To Date
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                  <input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-all duration-200"
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
                  className="px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Date Filters
                </button>
              )}
            </div>
          </div>

          {/* Table Section */}
          <DataTable
  columns={tableColumns}
  data={filteredPayments}
  loading={loading}
  emptyMessage="No payments found"
  emptyIcon={FileText}
  renderRow={(payment, index) => (
    <tr
      key={payment.id}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold text-sm mr-3">
            {payment.studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {payment.studentName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {payment.rollNumber}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-white">
          <DollarSign className="w-5 h-5 mr-1.5 text-gray-500 dark:text-gray-400" />
          <span>{formatCurrency(payment.amount)}</span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium">{formatDate(payment.paymentDate)}</span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center">
          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {payment.paymentMethod}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
          {payment.semester}
        </span>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <span className="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
          {payment.status}
        </span>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <button
          onClick={() => {
            setSelectedPayment(payment);
            setIsReceiptModalOpen(true);
          }}
          className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Receipt
        </button>
      </td>
    </tr>
  )}
  renderCard={(payment, index) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header with Student Info */}
      <div className="bg-linear-to-r from-green-500 to-green-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
            {payment.studentName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{payment.studentName}</h3>
            <p className="text-green-100 text-sm">Roll: {payment.rollNumber}</p>
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
              {payment.semester}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Status
            </span>
            <span className="px-3 py-1 inline-flex items-center text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              {payment.status}
            </span>
          </div>
        </div>

        {/* View Receipt Button */}
        <button
          onClick={() => {
            setSelectedPayment(payment);
            setIsReceiptModalOpen(true);
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
              setIsReceiptModalOpen(false);
              setSelectedPayment(null);
            }}
          />
    </PageLayout>
  );
};

export default Payments;
