import { DollarSign, Calendar, CreditCard } from "lucide-react";
import { Payment } from "@/types";

const PaymentCard = ({ payment }: { payment: Payment }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {payment.studentName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {payment.rollNumber}
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
          {payment.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="font-semibold">Amount: ₹{payment.amount}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Date: {payment.paymentDate}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <CreditCard className="w-4 h-4 mr-2" />
          <span>Method: {payment.paymentMethod}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Receipt: <span className="font-medium">{payment.receiptNumber}</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentCard;
