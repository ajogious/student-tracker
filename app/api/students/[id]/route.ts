import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { TrackType, Status } from "@prisma/client";

// ---- GET a single student profile ----
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
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

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch student", error },
      { status: 500 }
    );
  }
}

// ---- PATCH update student profile ----
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

    const {
      name,
      course,
      trackType,
      dateEnrolled,
      status,
      counsellor,
      sponsorName,
      sponsorPhone,
      sponsorEmail,
      university,
      universityApproved,
    } = body;

    // Verify student exists
    const existing = await prisma.student.findUnique({
      where: { id },
      include: { sponsor: true, topUpUniversities: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const performer = session.email;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update primary student details
      const studentUpdateData: any = {};
      const changes: string[] = [];

      if (name !== undefined && name !== existing.name) {
        studentUpdateData.name = name;
        changes.push(`Name changed from "${existing.name}" to "${name}"`);
      }
      if (course !== undefined && course !== existing.course) {
        studentUpdateData.course = course;
        changes.push(`Course changed to "${course}"`);
      }
      if (trackType !== undefined && trackType !== existing.trackType) {
        studentUpdateData.trackType = trackType as TrackType;
        changes.push(`Track type updated to ${trackType}`);
      }
      if (dateEnrolled !== undefined) {
        const newDate = new Date(dateEnrolled);
        if (newDate.getTime() !== new Date(existing.dateEnrolled).getTime()) {
          studentUpdateData.dateEnrolled = newDate;
          changes.push(`Enrollment date updated`);
        }
      }
      if (status !== undefined && status !== existing.status) {
        studentUpdateData.status = status as Status;
        changes.push(`Status updated from ${existing.status} to ${status}`);
      }
      if (counsellor !== undefined && counsellor !== existing.counsellor) {
        studentUpdateData.counsellor = counsellor || null;
        changes.push(`Counsellor changed to "${counsellor || "Unassigned"}"`);
      }

      const updatedStudent = await tx.student.update({
        where: { id },
        data: studentUpdateData,
      });

      // 2. Update/create sponsor
      if (sponsorName !== undefined || sponsorPhone !== undefined || sponsorEmail !== undefined) {
        if (existing.sponsor) {
          const sponsorChanges: string[] = [];
          if (sponsorName !== undefined && sponsorName !== existing.sponsor.sponsorName) {
            sponsorChanges.push(`Sponsor name updated to "${sponsorName}"`);
          }
          await tx.sponsor.update({
            where: { studentId: id },
            data: {
              sponsorName: sponsorName || "N/A",
              phone: sponsorPhone || null,
              email: sponsorEmail || null,
            },
          });
          if (sponsorChanges.length > 0) {
            changes.push(...sponsorChanges);
          } else {
            changes.push("Sponsor contact details updated");
          }
        } else if (sponsorName || sponsorPhone || sponsorEmail) {
          await tx.sponsor.create({
            data: {
              studentId: id,
              sponsorName: sponsorName || "N/A",
              phone: sponsorPhone || null,
              email: sponsorEmail || null,
            },
          });
          changes.push(`Sponsor "${sponsorName || "N/A"}" added`);
        }
      }

      // 3. Update top up university
      if (university !== undefined) {
        const existingTopUp = existing.topUpUniversities[0];
        await tx.topUpUniversity.deleteMany({
          where: { studentId: id },
        });

        if (university) {
          await tx.topUpUniversity.create({
            data: {
              studentId: id,
              university,
              approved: universityApproved !== undefined ? !!universityApproved : false,
            },
          });
          changes.push(`Degree top-up selected: ${university.replace(/_/g, " ")}`);
        } else if (existingTopUp) {
          changes.push("Degree top-up removed");
        }
      } else if (universityApproved !== undefined) {
        const topUp = await tx.topUpUniversity.findFirst({
          where: { studentId: id },
        });
        if (topUp && topUp.approved !== !!universityApproved) {
          await tx.topUpUniversity.update({
            where: { id: topUp.id },
            data: { approved: !!universityApproved },
          });
          changes.push(universityApproved ? "Top-up enrollment APPROVED" : "Top-up enrollment UNAPPROVED");
        }
      }

      // 4. Create Audit Log entries for all changes
      if (changes.length > 0) {
        await tx.auditLog.create({
          data: {
            studentId: id,
            action: changes.length === 1 && changes[0].startsWith("Status") ? "Status Update" : "Profile Updated",
            details: changes.join("; "),
            performedBy: performer,
          },
        });
      }

      return updatedStudent;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update student", error },
      { status: 500 }
    );
  }
}
