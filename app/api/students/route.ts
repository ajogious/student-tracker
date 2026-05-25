import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { TrackType } from "@prisma/client";

// ---- GET all students ----
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { exams: true, projects: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch students", error },
      { status: 500 },
    );
  }
}

// ---- POST create new student ----
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      studentId,
      name,
      course,
      trackType,
      dateEnrolled,
      counsellor,
      sponsorName,
      sponsorPhone,
      sponsorEmail,
    } = body;

    // --- Basic server-side validation ---
    if (!studentId || !name || !course || !trackType || !dateEnrolled) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // --- Student ID format check: Student followed by 7 digits ---
    const studentIdRegex = /^Student\d{7}$/;
    if (!studentIdRegex.test(studentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Student ID must be in format Student1234567",
        },
        { status: 400 },
      );
    }

    // --- Check for duplicate Student ID ---
    const existing = await prisma.student.findUnique({
      where: { studentId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A student with this ID already exists" },
        { status: 409 },
      );
    }

    // --- Create student + sponsor in one transaction ---
    const student = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          studentId,
          name,
          course,
          trackType: trackType as TrackType,
          dateEnrolled: new Date(dateEnrolled),
          counsellor: counsellor || null,
        },
      });

      // Only create sponsor record if at least one sponsor field is filled
      if (sponsorName || sponsorPhone || sponsorEmail) {
        await tx.sponsor.create({
          data: {
            studentId: newStudent.id,
            sponsorName: sponsorName || "N/A",
            phone: sponsorPhone || null,
            email: sponsorEmail || null,
          },
        });
      }

      return newStudent;
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create student", error },
      { status: 500 },
    );
  }
}
