import { Course, Student } from "./index";

/**
 * FORM-RELATED TYPE DEFINITIONS
 *
 * Shared TypeScript interfaces for form components
 */

// ============================================
// STUDENT FORM TYPES
// ============================================

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  courseId: string;
  course: string;
  semester: string;
  totalFees: string;
  rollNumber: string;
  admissionDate: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  semesterFees?: SemesterFee[];
}

export interface SemesterFee {
  semester: number;
  amount: number;
  dueDate: string;
  paid?: boolean;
}

export interface StudentFormProps {
  isEditMode?: boolean;
  formData: StudentFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  courses: Course[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  submitting?: boolean;
  showPersonalInfo?: boolean;
  showGuardianInfo?: boolean;
  onValidationChange?: (
    isValid: boolean,
    errors: Record<string, string>
  ) => void;
  onCancel?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitButtonText?: string;
  submitButtonIcon?: React.ComponentType<{ className?: string }>;
}

// ============================================
// PAYMENT FORM TYPES
// ============================================

export type PaymentMethod = "Cash" | "Online" | "Check" | "Card";

export interface PaymentFormData {
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  courseId: string;
  course: string;
  semester: string;
  transactionId: string;
  referenceNumber: string;
  bankName: string;
  remarks: string;
}

export interface PaymentData {
  studentId: string;
  studentName: string;
  rollNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  courseId: string | null;
  course: string;
  semester: string;
  receiptNumber: string;
  transactionId: string | null;
  referenceNumber: string | null;
  bankName: string | null;
  remarks: string | null;
  status: "Completed" | "Pending" | "Failed";
}

export interface PaymentFormProps {
  students: Student[];
  payments: any[];
  courses: Course[];
  onSubmit: (paymentData: PaymentData) => Promise<void>;
  onCancel?: () => void;
  submitting?: boolean;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}
