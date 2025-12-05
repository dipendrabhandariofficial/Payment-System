import { z } from "zod";
import { advancedPaymentSchema } from "./payment.schema";
import { Student } from "../types";

export interface PaymentValidationContext {
  selectedStudent: Student | null;
  availableSemesters: Array<{
    semester: number;
    paidAmount: number;
    totalAmount: number;
    remainingAmount: number;
  }>;
}

/**
 * Format currency for error messages
 */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Create a contextual payment schema that validates against business rules
 */
export const createContextualPaymentSchema = (
  context: PaymentValidationContext
) => {
  return advancedPaymentSchema.superRefine((data, ctx) => {
    // 1. Student selection validation
    if (!context.selectedStudent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a student",
        path: ["student"],
      });
      return;
    }

    // 2. Amount validation - parse and check positivity
    const amount = parseFloat(data.amount as any);
    if (!amount || amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid amount",
        path: ["amount"],
      });
      return;
    }

    const selectedSemesterNum = parseInt(data.semester);

    // 3. Check if all semester fees are paid
    if (!context.availableSemesters.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "All semester fees are already paid!",
        path: ["semester"],
      });
      return;
    }

    // 4. Check semester payment order
    const payableSemester = context.availableSemesters.find(
      (s) => s.semester === selectedSemesterNum
    );

    if (!payableSemester) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Pay Semester ${context.availableSemesters[0].semester} first.`,
        path: ["semester"],
      });
      return;
    }

    // 5. Check if amount exceeds remaining fees
    if (amount > payableSemester.remainingAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Amount exceeds remaining fees: ${formatCurrency(
          payableSemester.remainingAmount
        )}`,
        path: ["amount"],
      });
    }
  });
};
