import { z } from "zod";

//   Basic payment schema with essential validations
//  This ensures data integrity for payment processing

export const paymentSchema = z.object({
  // Amount validation with custom error messages
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .finite("Amount must be a valid number")
    .max(1000000, "Amount cannot exceed ₹10,00,000"),

  // Payment date validation
  paymentDate: z
    .string()
    .min(1, "Payment date is required")
    .refine(
      (date) => {
        const paymentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return paymentDate <= today;
      },
      { message: "Payment date cannot be in the future" }
    ),

  // Payment method with enum validation
  paymentMethod: z.enum(["Cash", "Online", "Check", "Card"], {
    message: "Invalid payment method",
  }),

  // Student information
  studentId: z.string().min(1, "Student ID is required"),
  studentName: z.string().min(2, "Student name must be at least 2 characters"),
  rollNumber: z.string().min(1, "Roll number is required"),

  // Course information
  courseId: z.string().optional(),
  course: z.string().min(1, "Course name is required"),

  // Semester validation
  semester: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 1 && num <= 8;
  }, "Semester must be between 1 and 8"),

  // Optional fields
  transactionId: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  remarks: z
    .string()
    .max(500, "Remarks cannot exceed 500 characters")
    .optional()
    .nullable(),

  // Auto-generated fields
  receiptNumber: z.string(),
  status: z.enum(["Completed", "Pending", "Failed"]).default("Completed"),
});

// ============================================
// 2. FORM DATA SCHEMA (for user input)
// ============================================

/**
 * Schema for validating form input before submission
 * This is more lenient as it accepts string inputs from forms
 */
export const paymentFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    })
    .transform((val) => parseFloat(val)), // Transform string to number

  paymentDate: z
    .string()
    .min(1, "Payment date is required")
    .refine(
      (date) => {
        // Compare dates as strings to avoid timezone issues
        // Input format is YYYY-MM-DD from date picker
        const today = new Date();
        const todayString = today.toISOString().split("T")[0]; // Get YYYY-MM-DD
        return date <= todayString;
      },
      { message: "Payment date cannot be in the future" }
    ),

  paymentMethod: z.enum(["Cash", "Online", "Check", "Card"]),

  courseId: z.string().optional(),
  course: z.string().min(1, "Course is required"),
  semester: z.string().min(1, "Semester is required"),

  transactionId: z.string().optional(),
  referenceNumber: z.string().optional(),
  bankName: z.string().optional(),
  remarks: z.string().max(500).optional(),
});

// ============================================
// 3. ADVANCED VALIDATIONS
// ============================================

/**
 * Schema with conditional validation based on payment method
 * Online/Card payments require transaction ID
 */
export const advancedPaymentSchema = paymentFormSchema.superRefine(
  (data, ctx) => {
    // If payment method is Online or Card, transaction ID is required
    if (
      (data.paymentMethod === "Online" || data.paymentMethod === "Card") &&
      !data.transactionId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transaction ID is required for online/card payments",
        path: ["transactionId"],
      });
    }

    // If payment method is Check, reference number is required
    if (data.paymentMethod === "Check" && !data.referenceNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Check number is required for check payments",
        path: ["referenceNumber"],
      });
    }
  }
);

// ============================================
// 4. TYPE INFERENCE
// ============================================

/**
 * Automatically infer TypeScript types from Zod schemas
 * This ensures your types always match your validation rules
 */
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentFormData = z.infer<typeof paymentFormSchema>;

// ============================================
// 5. VALIDATION HELPERS
// ============================================

/**
 * Helper function to validate payment data
 * Returns either validated data or error details
 */
export const validatePayment = (data: unknown) => {
  return paymentFormSchema.safeParse(data);
};

/**
 * Helper to get user-friendly error messages
 */
export const getValidationErrors = (error: z.ZodError) => {
  return error.issues.reduce((acc: Record<string, string>, err: z.ZodIssue) => {
    const path = err.path.join(".");
    acc[path] = err.message;
    return acc;
  }, {} as Record<string, string>);
};
