"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/students/StatusBadge";
import TrackBadge from "@/components/students/TrackBadge";
import { Student, Status, TrackType } from "@prisma/client";

// The shape we get back from the API (includes _count)
type StudentWithCount = Student & {
  _count: { exams: number; projects: number };
};

interface StudentTableProps {
  students: StudentWithCount[];
}

export default function StudentTable({ students }: StudentTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [trackFilter, setTrackFilter] = useState<TrackType | "ALL">("ALL");

  // ---- Filtering logic ----
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

    const matchesTrack = trackFilter === "ALL" || s.trackType === trackFilter;

    return matchesSearch && matchesStatus && matchesTrack;
  });

  return (
    <div className="space-y-4">
      {/* ---- Search & Filters ---- */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name or student ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="DROPPED">Dropped</option>
        </select>

        {/* Track filter */}
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value as TrackType | "ALL")}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All Tracks</option>
          <option value="FAST_TRACK">Fast Track</option>
          <option value="NORMAL_TRACK">Normal Track</option>
          <option value="SHORT_COURSE">Short Course</option>
        </select>
      </div>

      {/* ---- Table ---- */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Track</TableHead>
              <TableHead className="text-center">Exams Done</TableHead>
              <TableHead className="text-center">Projects Done</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                >
                  {students.length === 0
                    ? "No students yet. Add your first student!"
                    : "No students match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm font-medium">
                    {student.studentId}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">
                    {student.course}
                  </TableCell>
                  <TableCell>
                    <TrackBadge track={student.trackType} />
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                      {student._count.exams}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                      {student._count.projects}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={student.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button render={<Link href={`/dashboard/students/${student.id}`} />} size="sm" variant="ghost">
                      View →
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Row count */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t text-sm text-muted-foreground">
            Showing {filtered.length} of {students.length} students
          </div>
        )}
      </div>
    </div>
  );
}
