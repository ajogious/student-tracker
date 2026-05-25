"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, SlidersHorizontal } from "lucide-react";
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

// Shape matching API and eager loaded sponsor
type StudentWithDetails = Student & {
  sponsor?: {
    sponsorName: string;
    phone: string | null;
    email: string | null;
  } | null;
  _count: { exams: number; projects: number };
};

interface StudentTableProps {
  students: StudentWithDetails[];
}

type SortKey = "name-asc" | "name-desc" | "date-newest" | "date-oldest";

export default function StudentTable({ students }: StudentTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [trackFilter, setTrackFilter] = useState<TrackType | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("date-newest");

  // ---- Filtering logic ----
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

    const matchesTrack = trackFilter === "ALL" || s.trackType === trackFilter;

    return matchesSearch && matchesStatus && matchesTrack;
  });

  // ---- Sorting logic ----
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === "date-newest") {
      return new Date(b.dateEnrolled).getTime() - new Date(a.dateEnrolled).getTime();
    }
    if (sortBy === "date-oldest") {
      return new Date(a.dateEnrolled).getTime() - new Date(b.dateEnrolled).getTime();
    }
    return 0;
  });

  // ---- CSV Export logic ----
  const exportToCSV = () => {
    const headers = [
      "Student ID",
      "Full Name",
      "Course Enrolled",
      "Track Program",
      "Status",
      "Date Enrolled",
      "Counsellor",
      "Sponsor Name",
      "Sponsor Phone",
      "Sponsor Email",
      "Exams Done",
      "Projects Done",
    ];

    const rows = sorted.map((s) => [
      `"${s.studentId}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.course.replace(/"/g, '""')}"`,
      `"${s.trackType}"`,
      `"${s.status}"`,
      `"${new Date(s.dateEnrolled).toLocaleDateString()}"`,
      `"${(s.counsellor || "").replace(/"/g, '""')}"`,
      `"${(s.sponsor?.sponsorName || "N/A").replace(/"/g, '""')}"`,
      `"${s.sponsor?.phone || ""}"`,
      `"${s.sponsor?.email || ""}"`,
      s._count.exams,
      s._count.projects,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Aptech_Student_Report_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* ---- Search, Filters & CSV Export ---- */}
      <div className="flex flex-col xl:flex-row justify-between gap-3 xl:items-center">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs h-9 text-sm"
          />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "ALL")}
            className="h-9 rounded-lg border border-input bg-background hover:bg-muted/50 px-3 py-1.5 text-sm font-semibold cursor-pointer shadow-xs focus:ring-2 focus:ring-primary outline-hidden"
          >
            <option value="ALL">📋 All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
          </select>

          {/* Track filter */}
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as TrackType | "ALL")}
            className="h-9 rounded-lg border border-input bg-background hover:bg-muted/50 px-3 py-1.5 text-sm font-semibold cursor-pointer shadow-xs focus:ring-2 focus:ring-primary outline-hidden"
          >
            <option value="ALL">⚡ All Tracks</option>
            <option value="FAST_TRACK">Fast Track</option>
            <option value="NORMAL_TRACK">Normal Track</option>
            <option value="SHORT_COURSE">Short Course</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-9 rounded-lg border border-input bg-background hover:bg-muted/50 px-3 py-1.5 text-sm font-semibold cursor-pointer shadow-xs focus:ring-2 focus:ring-primary outline-hidden"
          >
            <option value="date-newest">📅 Enrolled: Newest First</option>
            <option value="date-oldest">📅 Enrolled: Oldest First</option>
            <option value="name-asc">👤 Name: A to Z</option>
            <option value="name-desc">👤 Name: Z to A</option>
          </select>
        </div>

        {/* CSV Export Button */}
        <Button 
          onClick={exportToCSV} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1.5 self-start xl:self-auto h-9 font-semibold text-xs py-1 px-3"
        >
          <Download className="size-4" /> Export Report (CSV)
        </Button>
      </div>

      {/* ---- Table ---- */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Student ID</TableHead>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[180px]">Course</TableHead>
                <TableHead className="min-w-[120px]">Track</TableHead>
                <TableHead className="text-center min-w-[100px]">Exams</TableHead>
                <TableHead className="text-center min-w-[100px]">Projects</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="text-right min-w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground font-semibold"
                  >
                    {students.length === 0
                      ? "No students yet. Register your first student!"
                      : "No students match your query."}
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {student.studentId}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground text-sm">{student.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs font-semibold max-w-[200px] truncate">
                      {student.course}
                    </TableCell>
                    <TableCell>
                      <TrackBadge track={student.trackType} />
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold text-foreground ring-1 ring-border">
                        {student._count.exams}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-bold text-foreground ring-1 ring-border">
                        {student._count.projects}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={student.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        render={<Link href={`/dashboard/students/${student.id}`} />} 
                        size="sm" 
                        variant="ghost" 
                        nativeButton={false}
                        className="text-xs font-bold"
                      >
                        View →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Row count */}
        {sorted.length > 0 && (
          <div className="px-4 py-3 border-t text-xs font-bold text-muted-foreground bg-muted/20">
            Showing {sorted.length} of {students.length} students
          </div>
        )}
      </div>
    </div>
  );
}
