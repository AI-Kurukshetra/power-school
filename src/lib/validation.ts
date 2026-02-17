import { z } from "zod";
import { getTodayISODate } from "@/lib/date";

export const attendanceSchema = z.object({
  student_id: z.string().uuid({ message: "Invalid student reference." }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date." }),
  status: z.enum(["Present", "Absent", "Tardy"]),
});

export const studentSchema = z.object({
  name: z.string().min(1, { message: "Student name is required." }),
  grade_level: z.string().min(1, { message: "Grade level is required." }),
  parent_contact: z
    .string()
    .email({ message: "Use a valid email address." })
    .optional()
    .or(z.literal("")),
});

export const feeSchema = z.object({
  student_id: z.string().uuid({ message: "Select a student." }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than 0." }),
  status: z.enum(["Paid", "Pending"]),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid due date." })
    .refine((value) => value >= getTodayISODate(), {
      message: "Due date cannot be in the past.",
    }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(6, { message: "Password is required." }),
});

export const studentLinkSchema = z.object({
  student_id: z.string().uuid({ message: "Select a student." }),
  auth_user_id: z
    .string()
    .uuid({ message: "Enter a valid auth user id." })
    .optional()
    .or(z.literal("")),
  intent: z.enum(["link", "unlink"]),
});

export type FieldErrors = Record<string, string[]>;

export type FormState = {
  error: string | null;
  success: string | null;
  fieldErrors: FieldErrors;
};

export const emptyFormState: FormState = {
  error: null,
  success: null,
  fieldErrors: {},
};
