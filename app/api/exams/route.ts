import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { examName, semester, dateTaken, studentId } = body;

    if (!examName || !semester || !studentId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (examName, semester, studentId)" },
        { status: 400 }
      );
    }

    const studentExists = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!studentExists) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const exam = await prisma.$transaction(async (tx) => {
      // 1. Create exam
      const newExam = await tx.exam.create({
        data: {
          examName,
          semester,
          dateTaken: dateTaken ? new Date(dateTaken) : new Date(),
          studentId,
        },
      });

      // 2. Add audit log
      await tx.auditLog.create({
        data: {
          studentId,
          action: "Exam Added",
          details: `Added exam "${examName}" under ${semester}`,
          performedBy: session.email,
        },
      });

      return newExam;
    });

    return NextResponse.json({ success: true, data: exam }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create exam record", error },
      { status: 500 }
    );
  }
}
