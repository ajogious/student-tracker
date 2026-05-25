import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

// ---- PATCH update a project ----
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
    const { projectName, semester, completedAt } = body;

    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Project record not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id },
        data: {
          projectName: projectName !== undefined ? projectName : existing.projectName,
          semester: semester !== undefined ? semester : existing.semester,
          completedAt: completedAt ? new Date(completedAt) : existing.completedAt,
        },
      });

      await tx.auditLog.create({
        data: {
          studentId: existing.studentId,
          action: "Project Updated",
          details: `Updated project "${existing.projectName}" details`,
          performedBy: session.email,
        },
      });

      return updatedProject;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update project record", error },
      { status: 500 }
    );
  }
}

// ---- DELETE a project ----
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

    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Project record not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          studentId: existing.studentId,
          action: "Project Deleted",
          details: `Deleted project "${existing.projectName}"`,
          performedBy: session.email,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Project record deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete project record", error },
      { status: 500 }
    );
  }
}
