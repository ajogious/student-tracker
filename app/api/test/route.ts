import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prisma.student.count();
    return NextResponse.json({
      success: true,
      message: "Database connected successfully!",
      studentCount: count,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Database connection failed", error },
      { status: 500 },
    );
  }
}
