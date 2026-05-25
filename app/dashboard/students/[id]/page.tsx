import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import StudentProfileClient from "@/components/students/StudentProfileClient";
import { Button } from "@/components/ui/button";

interface StudentProfilePageProps {
  params: Promise<{ id: string }>;
}

async function getStudentProfile(id: string) {
  return await prisma.student.findUnique({
    where: { id },
    include: {
      exams: {
        orderBy: { dateTaken: "desc" },
      },
      projects: {
        orderBy: { completedAt: "desc" },
      },
      sponsor: true,
      topUpUniversities: {
        orderBy: { createdAt: "desc" },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  const session = await getSession();
  const userRole = session?.role || "STAFF";

  const { id } = await params;
  const student = await getStudentProfile(id);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          The student record you are looking for does not exist or has been deleted from the database.
        </p>
        <Button render={<Link href="/dashboard" />} nativeButton={false}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Parse Date objects to string for client-side consumption
  const serializedStudent = {
    ...student,
    dateEnrolled: student.dateEnrolled.toISOString(),
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString(),
    exams: student.exams.map((e) => ({
      ...e,
      dateTaken: e.dateTaken.toISOString(),
      createdAt: e.createdAt.toISOString(),
    })),
    projects: student.projects.map((p) => ({
      ...p,
      completedAt: p.completedAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
    })),
    sponsor: student.sponsor
      ? {
          ...student.sponsor,
          createdAt: student.sponsor.createdAt.toISOString(),
        }
      : null,
    topUpUniversities: student.topUpUniversities.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    })),
    auditLogs: student.auditLogs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
  };

  return (
    <StudentProfileClient
      initialStudent={serializedStudent}
      userRole={userRole}
    />
  );
}
