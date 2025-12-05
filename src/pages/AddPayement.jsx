import React, { useState, useEffect } from "react";
import {
  useStudents,
  usePayments,
  useCreatePayment,
  useUpdateStudent,
} from "../services/api/index";
import { CheckCircle, DollarSign } from "lucide-react";
import { courses as initialCourses } from "../data/courses";
import LoadingSpinner from "../components/atoms/LoadingSpinner";
import PageLayout from "../components/templates/PageLayout";
import PaymentForm from "../components/organisms/PaymentForm";
import { useBoolean } from "../hooks/useBoolean";

const AddPayment = () => {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const createPayment = useCreatePayment();
  const updateStudentMutation = useUpdateStudent();

  const [availableCourses, setAvailableCourses] = useState(initialCourses);
  const [success, { on: onSuccess, off: offSuccess }] = useBoolean(false);
  const [submitting, setSubmitting] = useState(false);

  const loading = studentsLoading || paymentsLoading;

  useEffect(() => {
    const savedCourses = localStorage.getItem("courses");
    if (savedCourses) setAvailableCourses(JSON.parse(savedCourses));
  }, []);

  const handlePaymentSubmit = async (paymentData, updatedStudent) => {
    setSubmitting(true);
    try {
      await createPayment.mutateAsync(paymentData);
      await updateStudentMutation.mutateAsync({
        id: updatedStudent.id,
        data: updatedStudent,
      });

      onSuccess();
      setTimeout(() => offSuccess(), 3000);
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading payment data..." />;

  return (
    <PageLayout
      title="Add Payment"
      description="Process a new payment for a student. Use filters to find students quickly."
      icon={<DollarSign className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-lg flex items-center shadow-sm">
            <CheckCircle className="w-5 h-5 mr-3" />
            Payment processed successfully!
          </div>
        )}

        <PaymentForm
          students={students}
          payments={payments}
          courses={availableCourses}
          onSubmit={handlePaymentSubmit}
          submitting={submitting}
        />
      </div>
    </PageLayout>
  );
};

export default AddPayment;
