import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);

    // Verify session exists and role is ADMIN (CAH)
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only Center Academic Head (CAH) can delete students." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if student exists
    const existing = await prisma.student.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Delete student (Prisma Cascade schema will automatically remove sponsor, exams, projects, audit logs, etc.)
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Student '${existing.name}' and all associated records deleted successfully.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete student", error },
      { status: 500 }
    );
  }
}
