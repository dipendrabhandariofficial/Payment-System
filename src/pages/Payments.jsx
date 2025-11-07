import React, { useState, useEffect } from "react";
import Navbar from "../layouts/Navbar";
import Sidebar from "../layouts/Sidebar";
import PaymentCard from "../components/PaymentCard";
import { getPayments } from "../services/api";
import { Search, Filter } from "lucide-react";
import SearchBar from "../components/Search";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.studentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMethod !== "All") {
      filtered = filtered.filter(
        (payment) => payment.paymentMethod === filterMethod
      );
    }

    setFilteredPayments(filtered);
  }, [searchTerm, filterMethod, payments]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1  bg-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Payment History
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}

            <SearchBar
              placeholder="Search by student name or roll number..."
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Check">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No payments found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Payments;
