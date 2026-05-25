"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newStudentSchema,
  NewStudentFormValues,
} from "@/lib/validations/student";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export default function NewStudentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<NewStudentFormValues>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      studentId: "",
      name: "",
      course: "",
      trackType: undefined,
      dateEnrolled: undefined,
      counsellor: "",
      sponsorName: "",
      sponsorPhone: "",
      sponsorEmail: "",
    },
  });

  async function onSubmit(values: NewStudentFormValues) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          dateEnrolled: values.dateEnrolled.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Something went wrong. Try again.");
        return;
      }

      // Redirect to the new student's profile page
      router.push(`/dashboard/students/${data.data.id}`);
      router.refresh();
    } catch {
      setServerError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ---- Server Error Alert ---- */}
        {serverError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            ⚠️ {serverError}
          </div>
        )}

        {/* ======================== CARD 1: Personal Info ======================== */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Basic details about the student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student ID */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Student ID <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Student1234567"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        const prefix = "Student";
                        let formatted = "";
                        for (let i = 0; i < val.length; i++) {
                          if (i < prefix.length && val[i].toLowerCase() === prefix[i].toLowerCase()) {
                            formatted += prefix[i];
                          } else {
                            formatted += val[i];
                          }
                        }
                        field.onChange(formatted);
                      }}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Format: Student followed by 7 digits (e.g. Student1234567)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Obiahukwu John Aguiyi"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course Enrolled */}
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Course Enrolled <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Java Programming 1 & 2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Enrolled */}
            <FormField
              control={form.control}
              name="dateEnrolled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date Enrolled <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select enrollment date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Track Type */}
            <FormField
              control={form.control}
              name="trackType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Track Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col sm:flex-row gap-4 pt-1"
                    >
                      {[
                        { value: "FAST_TRACK", label: "⚡ Fast Track" },
                        { value: "NORMAL_TRACK", label: "📘 Normal Track" },
                        { value: "SHORT_COURSE", label: "📋 Short Course" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className={`flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                            field.value === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          }`}
                          onClick={() => field.onChange(option.value)}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <label
                            htmlFor={option.value}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Counsellor */}
            <FormField
              control={form.control}
              name="counsellor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Counsellor Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Assigned counsellor (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ======================== CARD 2: Sponsor Info ======================== */}
        <Card>
          <CardHeader>
            <CardTitle>Sponsor Information</CardTitle>
            <CardDescription>
              Optional — fill in if student has a sponsor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="sponsorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name of sponsor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sponsorPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsor Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+234 800 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsor Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="sponsor@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ======================== Submit Buttons ======================== */}
        <Separator />
        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Register Student →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
