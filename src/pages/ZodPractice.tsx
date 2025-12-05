import React, { useState } from "react";
import {
  paymentFormSchema,
  advancedPaymentSchema,
  getValidationErrors,
} from "../schemas/payment.schema";
import { CheckCircle, XCircle } from "lucide-react";

const ZodPractice = () => {
  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    course: "",
    semester: "",
    transactionId: "",
    referenceNumber: "",
    bankName: "",
    remarks: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [validatedData, setValidatedData] = useState<any>(null);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate with basic schema
  const handleBasicValidation = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationSuccess(false);
    setValidatedData(null);

    const result = paymentFormSchema.safeParse(formData);

    if (!result.success) {
      // Validation failed - show errors
      const validationErrors = getValidationErrors(result.error);
      setErrors(validationErrors);
      console.log("❌ Validation Errors:", validationErrors);
    } else {
      // Validation passed!
      setErrors({});
      setValidationSuccess(true);
      setValidatedData(result.data);
      console.log("✅ Validated Data:", result.data);
      console.log("Notice: amount is now a number:", typeof result.data.amount);
    }
  };

  // Validate with advanced schema (conditional validation)
  const handleAdvancedValidation = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationSuccess(false);
    setValidatedData(null);

    const result = advancedPaymentSchema.safeParse(formData);

    if (!result.success) {
      const validationErrors = getValidationErrors(result.error);
      setErrors(validationErrors);
      console.log("❌ Advanced Validation Errors:", validationErrors);
    } else {
      setErrors({});
      setValidationSuccess(true);
      setValidatedData(result.data);
      console.log("✅ Advanced Validation Passed:", result.data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            🎓 Zod Validation Practice
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Learn how to validate forms with Zod. Try entering invalid data to
            see validation in action!
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            📚 How to Practice:
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
            <li>1. Fill out the form with test data</li>
            <li>2. Try "Basic Validation" first to see simple validation</li>
            <li>
              3. Try "Advanced Validation" to see conditional rules (e.g.,
              Online payment needs Transaction ID)
            </li>
            <li>
              4. Check the browser console (F12) to see detailed validation
              results
            </li>
            <li>5. Try invalid inputs like negative amounts or future dates</li>
          </ul>
        </div>

        {/* Success Message */}
        {validationSuccess && (
          <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 mb-6 rounded flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-300">
                ✅ Validation Passed!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                Check the console to see the validated data. Notice how the
                amount was transformed from string to number!
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Amount *
              </label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 5000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.amount
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.paymentDate
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.paymentDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errors.paymentDate}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online Transfer</option>
                <option value="Check">Check</option>
                <option value="Card">Debit/Credit Card</option>
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Course *
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.course
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.course && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errors.course}
                </p>
              )}
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Semester *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.semester
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem.toString()}>
                    {sem}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errors.semester}
                </p>
              )}
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Transaction ID
                {(formData.paymentMethod === "Online" ||
                  formData.paymentMethod === "Card") && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="Required for Online/Card"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.transactionId
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.transactionId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errors.transactionId}
                </p>
              )}
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Reference/Check Number
                {formData.paymentMethod === "Check" && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="Required for Check"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.referenceNumber
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.referenceNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errors.referenceNumber}
                </p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Optional notes (max 500 characters)"
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                  errors.remarks
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.remarks && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errors.remarks}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleBasicValidation}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔍 Basic Validation
            </button>
            <button
              type="button"
              onClick={handleAdvancedValidation}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Advanced Validation
            </button>
          </div>
        </form>

        {/* Validated Data Display */}
        {validatedData && (
          <div className="bg-gray-800 text-green-400 rounded-xl p-6 mt-6 font-mono text-sm overflow-auto">
            <h3 className="text-white font-bold mb-2">
              Validated Data (Check Console for Details):
            </h3>
            <pre>{JSON.stringify(validatedData, null, 2)}</pre>
          </div>
        )}

        {/* Tips */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mt-6 rounded">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            💡 Try These Test Cases:
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-200 space-y-1">
            <li>• Enter a negative amount (-100)</li>
            <li>• Select a future payment date</li>
            <li>• Leave required fields empty</li>
            <li>
              • Select "Online" payment without Transaction ID (Advanced
              Validation)
            </li>
            <li>
              • Select "Check" payment without Reference Number (Advanced
              Validation)
            </li>
            <li>• Enter more than 500 characters in remarks</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ZodPractice;
