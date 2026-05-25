import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            exams: true,
            projects: true,
          },
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
