import { z } from "zod";

export const newStudentSchema = z.object({
  studentId: z
    .string()
    .min(1, "Student ID is required")
    .regex(
      /^Student\d{7}$/,
      "Must be in format Student1234567 (Student + 7 digits)",
    ),

  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Name is too long"),

  course: z
    .string()
    .min(2, "Course name is required")
    .max(150, "Course name is too long"),

  trackType: z.enum(["FAST_TRACK", "NORMAL_TRACK", "SHORT_COURSE"] as const, {
    error: "Please select a track type",
  }),

  dateEnrolled: z.date({
    error: "Enrollment date is required",
  }),

  counsellor: z.string().max(100).optional().or(z.literal("")),

  // Sponsor fields — all optional
  sponsorName: z.string().max(100).optional().or(z.literal("")),
  sponsorPhone: z.string().max(20).optional().or(z.literal("")),
  sponsorEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

export type NewStudentFormValues = z.infer<typeof newStudentSchema>;
