import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import StatsBar from "@/components/dashboard/StatsBar";
import StudentTable from "@/components/dashboard/StudentTable";

async function getStudents() {
  return await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sponsor: true,
      _count: {
        select: { exams: true, projects: true },
      },
    },
  });
}

export default async function DashboardPage() {
  const students = await getStudents();

  // Compute exams taken this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const examsThisMonth = await prisma.exam.count({
    where: {
      dateTaken: {
        gte: startOfMonth,
      },
    },
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "ACTIVE").length,
    completed: students.filter((s) => s.status === "COMPLETED").length,
    examsThisMonth,
  };

  return (
    <div>
      {/* ---- Page Header ---- */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Student Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage all enrolled students
          </p>
        </div>
        <Button render={<Link href="/dashboard/students/new" />} nativeButton={false}>
          + New Student
        </Button>
      </div>

      {/* ---- Stats Bar ---- */}
      <StatsBar {...stats} />

      {/* ---- Student Table ---- */}
      <StudentTable students={students} />
    </div>
  );
}
