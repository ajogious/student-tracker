import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// ---- PATCH update an exam ----
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { examName, semester, dateTaken } = body;

    const existing = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Exam record not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedExam = await tx.exam.update({
        where: { id },
        data: {
          examName: examName !== undefined ? examName : existing.examName,
          semester: semester !== undefined ? semester : existing.semester,
          dateTaken: dateTaken ? new Date(dateTaken) : existing.dateTaken,
        },
      });

      await tx.auditLog.create({
        data: {
          studentId: existing.studentId,
          action: "Exam Updated",
          details: `Updated exam "${existing.examName}" details`,
          performedBy: session.email,
        },
      });

      return updatedExam;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update exam record", error },
      { status: 500 }
    );
  }
}

// ---- DELETE an exam ----
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Exam record not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.exam.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          studentId: existing.studentId,
          action: "Exam Deleted",
          details: `Deleted exam "${existing.examName}"`,
          performedBy: session.email,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Exam record deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete exam record", error },
      { status: 500 }
    );
  }
}
