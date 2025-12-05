import { z } from "zod";

/**
 * STUDENT VALIDATION SCHEMAS USING ZOD
 *
 * Validation schemas for student data with comprehensive rules
 */

// ============================================
// 1. STUDENT FORM SCHEMA
// ============================================

/**
 * Schema for validating student form input
 * Accepts string inputs from forms and transforms where needed
 */
export const studentFormSchema = z.object({
  // Personal Information
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-+()]+$/, "Please enter a valid phone number")
    .refine((val) => val.replace(/\D/g, "").length >= 10, {
      message: "Phone number must have at least 10 digits",
    }),

  // Academic Information
  courseId: z.string().min(1, "Please select a course"),

  course: z.string().min(1, "Course name is required"),

  semester: z
    .string()
    .min(1, "Semester is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 8;
    }, "Semester must be between 1 and 8"),

  // Financial Information
  totalFees: z
    .string()
    .min(1, "Total fees is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: "Total fees must be a positive number",
    })
    .transform((val) => parseFloat(val)),

  // Optional Fields
  rollNumber: z.string().optional(),
  admissionDate: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
});

// ============================================
// 2. COMPLETE STUDENT SCHEMA
// ============================================

/**
 * Complete student data schema for API submissions
 */
export const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string(),
  rollNumber: z.string(),
  courseId: z.string(),
  course: z.string(),
  semester: z.union([z.string(), z.number()]),
  totalFees: z.number().nonnegative(),
  paidFees: z.number().nonnegative().default(0),
  pendingFees: z.number().nonnegative(),
  admissionDate: z.string(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
  semesterFees: z
    .array(
      z.object({
        semester: z.number(),
        amount: z.number(),
        dueDate: z.string(),
        paid: z.boolean().optional(),
      })
    )
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ============================================
// 3. TYPE INFERENCE
// ============================================

export type StudentFormInput = z.infer<typeof studentFormSchema>;
export type StudentData = z.infer<typeof studentSchema>;

// ============================================
// 4. VALIDATION HELPERS
// ============================================

/**
 * Validate student form data
 */
export const validateStudentForm = (data: unknown) => {
  return studentFormSchema.safeParse(data);
};

/**
 * Get user-friendly error messages from Zod error
 */
export const getStudentValidationErrors = (error: z.ZodError) => {
  return error.issues.reduce((acc: Record<string, string>, err: z.ZodIssue) => {
    const path = err.path.join(".");
    acc[path] = err.message;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Validate individual field
 */
export const validateStudentField = (
  fieldName: keyof StudentFormInput,
  value: unknown
) => {
  const fieldSchema = studentFormSchema.shape[fieldName];
  if (!fieldSchema) return { success: true, error: null };

  const result = fieldSchema.safeParse(value);
  return {
    success: result.success,
    error: result.success
      ? null
      : result.error.issues[0]?.message || "Invalid value",
  };
};
