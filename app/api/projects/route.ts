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
    const { projectName, semester, completedAt, studentId } = body;

    if (!projectName || !semester || !studentId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (projectName, semester, studentId)" },
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

    const project = await prisma.$transaction(async (tx) => {
      // 1. Create project
      const newProject = await tx.project.create({
        data: {
          projectName,
          semester,
          completedAt: completedAt ? new Date(completedAt) : new Date(),
          studentId,
        },
      });

      // 2. Add audit log
      await tx.auditLog.create({
        data: {
          studentId,
          action: "Project Added",
          details: `Registered completion of "${projectName}" under ${semester}`,
          performedBy: session.email,
        },
      });

      return newProject;
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create project record", error },
      { status: 500 }
    );
  }
}
