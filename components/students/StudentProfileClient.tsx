"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit, Plus, Printer, User, Award, Trash2, Edit2,
  BookOpen, Building2, ShieldAlert, Phone, Mail, Check, Calendar, GraduationCap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import StatusBadge from "@/components/students/StatusBadge";
import TrackBadge from "@/components/students/TrackBadge";
import { TrackType } from "@prisma/client";

interface SerializedExam {
  id: string;
  examName: string;
  semester: string;
  dateTaken: string;
  createdAt: string;
}

interface SerializedProject {
  id: string;
  projectName: string;
  semester: string;
  completedAt: string;
  createdAt: string;
}

interface SerializedSponsor {
  id: string;
  sponsorName: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

interface SerializedTopUpUniversity {
  id: string;
  university: string;
  approved: boolean;
  createdAt: string;
}

interface SerializedAuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  createdAt: string;
}

interface SerializedStudent {
  id: string;
  studentId: string;
  name: string;
  course: string;
  trackType: string;
  dateEnrolled: string;
  status: string;
  counsellor: string | null;
  createdAt: string;
  updatedAt: string;
  exams: SerializedExam[];
  projects: SerializedProject[];
  sponsor: SerializedSponsor | null;
  topUpUniversities: SerializedTopUpUniversity[];
  auditLogs: SerializedAuditLog[];
}

interface StudentProfileClientProps {
  initialStudent: SerializedStudent;
  userRole: string; // ADMIN | STAFF
}

export default function StudentProfileClient({ 
  initialStudent, 
  userRole
}: StudentProfileClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<SerializedStudent>(initialStudent);

  // Modal Open States
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  // Modal Edit Target States
  const [editingExam, setEditingExam] = useState<SerializedExam | null>(null);
  const [editingProject, setEditingProject] = useState<SerializedProject | null>(null);

  // Submitting States
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States - Edit Student Info
  const [editForm, setEditForm] = useState({
    name: student.name,
    course: student.course,
    trackType: student.trackType,
    dateEnrolled: student.dateEnrolled.split("T")[0],
    counsellor: student.counsellor || "",
    sponsorName: student.sponsor?.sponsorName || "",
    sponsorPhone: student.sponsor?.phone || "",
    sponsorEmail: student.sponsor?.email || "",
    university: student.topUpUniversities[0]?.university || "",
    universityApproved: student.topUpUniversities[0]?.approved || false,
  });

  // Form States - Add/Edit Exam
  const [examForm, setExamForm] = useState({
    examName: "",
    semester: "Semester 1",
    dateTaken: new Date().toISOString().split("T")[0],
  });

  // Form States - Add/Edit Project
  const [projectForm, setProjectForm] = useState({
    projectName: "",
    semester: "Semester 1",
    completedAt: new Date().toISOString().split("T")[0],
  });

  // Handle Quick Status Change
  async function handleStatusChange(newStatus: string) {
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Fetch updated student data to refresh state and audit log fully
        const freshRes = await fetch(`/api/students/${student.id}`);
        const freshData = await freshRes.json();
        if (freshRes.ok) {
          setStudent(freshData.data);
        } else {
          setStudent((prev) => ({ ...prev, status: newStatus }));
        }
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
        router.refresh();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error updating status");
    }
  }

  // Handle Quick TopUp Approval toggle
  async function handleTopUpApprovalToggle(approved: boolean) {
    if (student.topUpUniversities.length === 0) return;
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityApproved: approved }),
      });

      if (res.ok) {
        // Fetch updated student data to refresh state and audit log fully
        const freshRes = await fetch(`/api/students/${student.id}`);
        const freshData = await freshRes.json();
        if (freshRes.ok) {
          setStudent(freshData.data);
        } else {
          setStudent((prev) => ({
            ...prev,
            topUpUniversities: prev.topUpUniversities.map((t, idx) => 
              idx === 0 ? { ...t, approved } : t
            ),
          }));
        }
        toast.success(approved ? "Top-up University enrollment approved!" : "Top-up enrollment marked unapproved.");
        router.refresh();
      } else {
        toast.error("Failed to update approval status");
      }
    } catch {
      toast.error("Network error updating approval status");
    }
  }

  // Handle Edit Student Submit
  async function handleEditStudentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        // Fetch updated student data to refresh state and audit log fully
        const freshRes = await fetch(`/api/students/${student.id}`);
        const freshData = await freshRes.json();
        if (freshRes.ok) {
          setStudent(freshData.data);
        }
        setIsEditStudentOpen(false);
        toast.success("Student profile updated successfully");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch {
      toast.error("Network error updating profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Open Add Exam modal
  function openAddExam() {
    setEditingExam(null);
    setExamForm({
      examName: "",
      semester: "Semester 1",
      dateTaken: new Date().toISOString().split("T")[0],
    });
    setIsAddExamOpen(true);
  }

  // Open Edit Exam modal
  function openEditExam(exam: SerializedExam) {
    setEditingExam(exam);
    setExamForm({
      examName: exam.examName,
      semester: exam.semester,
      dateTaken: exam.dateTaken.split("T")[0],
    });
    setIsAddExamOpen(true);
  }

  // Handle Add/Edit Exam Submit
  async function handleExamSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!examForm.examName || !examForm.semester) {
      toast.error("Please fill in all exam fields");
      return;
    }
    setIsSubmitting(true);

    try {
      const url = editingExam ? `/api/exams/${editingExam.id}` : "/api/exams";
      const method = editingExam ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...examForm,
          studentId: student.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Fetch updated student data fully to refresh audit logs
        const freshRes = await fetch(`/api/students/${student.id}`);
        const freshData = await freshRes.json();
        if (freshRes.ok) {
          setStudent(freshData.data);
        }
        setIsAddExamOpen(false);
        toast.success(editingExam ? "Exam record updated!" : "Exam record added successfully!");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to save exam record");
      }
    } catch {
      toast.error("Network error saving exam");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Delete Exam
  async function handleDeleteExam(examId: string, examName: string) {
    if (!confirm(`Are you sure you want to delete exam '${examName}'?`)) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const freshRes = await fetch(`/api/students/${student.id}`);
        const freshData = await freshRes.json();
        if (freshRes.ok) {
          setStudent(freshData.data);
        }
        toast.success("Exam record deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete exam record");
      }
    } catch {
      toast.error("Network error deleting exam");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Open Add Project modal
  function openAddProject() {
    setEditingProject(null);
    setProjectForm({
      projectName: "",
      semester: "Semester 1",
      completedAt: new Date().toISOString().split("T")[0],
    });
    setIsAddProjectOpen(true);
  }

  // Open Edit Project modal
  function openEditProject(proj: SerializedProject) {
    setEditingProject(proj);
    setProjectForm({
      projectName: proj.projectName,
      semester: proj.semester,
      completedAt: proj.completedAt.split("T")[0],
    });
    setIsAddProjectOpen(true);
  }

  // Handle Add/Edit Project Submit
  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectForm.projectName || !projectForm.semester) {
      toast.error("Please fill in all project fields");
      return;
    }
    setIsSubmitting(true);

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
      const method = editingProject ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...projectForm,
          studentId: student.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const freshRes = await fetch(`/api/students/${student.id}`);
        const freshData = await freshRes.json();
        if (freshRes.ok) {
          setStudent(freshData.data);
        }
        setIsAddProjectOpen(false);
        toast.success(editingProject ? "Project record updated!" : "Project record added successfully!");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to save project record");
      }
    } catch {
      toast.error("Network error saving project");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Delete Project
  async function handleDeleteProject(projId: string, projName: string) {
    if (!confirm(`Are you sure you want to delete project '${projName}'?`)) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const freshRes = await fetch(`/api/students/${student.id}`);
        const freshData = await freshRes.json();
        if (freshRes.ok) {
          setStudent(freshData.data);
        }
        toast.success("Project record deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete project record");
      }
    } catch {
      toast.error("Network error deleting project");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Delete Student (ADMIN Only)
  async function handleDeleteStudent() {
    if (!confirm(`⚠️ WARNING: Are you sure you want to permanently delete student '${student.name}'? This deletes all associated sponsor details, exams, projects, and history records. This action CANNOT be undone.`)) {
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/students/${student.id}/delete`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Student record deleted.");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to delete student record.");
      }
    } catch {
      toast.error("Network error during student deletion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format Dates
  const formatDateString = (str: string) => {
    return new Date(str).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* ======================== BREADCRUMB & ACTIONS ======================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">{student.name}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {userRole === "ADMIN" && (
            <Button 
              variant="outline" 
              onClick={handleDeleteStudent}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 border-destructive/30 hover:border-destructive hover:bg-destructive/10 text-destructive text-xs py-1"
            >
              <Trash2 className="size-4 text-destructive" /> Delete Record
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setIsEditStudentOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Edit className="size-4" /> Edit Profile
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="flex items-center gap-1.5"
          >
            <Printer className="size-4" /> Print Record
          </Button>
        </div>
      </div>

      {/* ======================== HEADER SUMMARY CARD ======================== */}
      <div className="p-6 rounded-xl border bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 print:border-none print:shadow-none print:bg-transparent print:p-0">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-extrabold tracking-tight print:text-4xl">{student.name}</h2>
            <span className="print:hidden">
              <TrackBadge track={student.trackType as TrackType} />
            </span>
          </div>
          <div className="flex items-center gap-x-6 gap-y-2 flex-wrap text-sm text-muted-foreground font-medium print:text-foreground print:gap-x-12">
            <div>
              ID: <span className="font-mono font-bold text-foreground print:text-xl">{student.studentId}</span>
            </div>
            <div>
              Course: <span className="text-foreground font-semibold">{student.course}</span>
            </div>
            <div className="hidden print:block">
              Track: <span className="text-foreground font-semibold">{student.trackType.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Status Dropdown / Indicator */}
        <div className="flex items-center gap-3 shrink-0 print:hidden">
          <span className="text-sm font-semibold text-muted-foreground">Status:</span>
          <select
            value={student.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-9 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/50 cursor-pointer shadow-xs focus:ring-2 focus:ring-primary outline-hidden"
          >
            <option value="ACTIVE">🟢 Active</option>
            <option value="IN_PROGRESS">🟡 In Progress</option>
            <option value="COMPLETED">🔵 Completed</option>
            <option value="DROPPED">🔴 Dropped</option>
          </select>
        </div>
        
        {/* Printable Status Badge */}
        <div className="hidden print:block font-bold text-lg">
          Status: {student.status}
        </div>
      </div>

      {/* ======================== TWO COLUMN GRID LAYOUT ======================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-10">
        {/* LEFT COLUMN: Main Academic Records */}
        <div className="lg:col-span-2 space-y-6 print:space-y-10">
          
          {/* EXAMS CARD */}
          <Card className="print:shadow-none print:border print:border-black/20">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-5 text-amber-500" />
                  📝 Exams Done
                </CardTitle>
                <CardDescription className="print:hidden">Completed exams and semesters</CardDescription>
              </div>
              <Button 
                onClick={openAddExam} 
                size="sm" 
                className="flex items-center gap-1 print:hidden"
              >
                <Plus className="size-4" /> Add Exam
              </Button>
            </CardHeader>
            <CardContent>
              {student.exams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                  No exam records registered for this student yet.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden divide-y divide-border print:border-black/20 print:divide-black/20">
                  <div className="grid grid-cols-4 gap-4 bg-muted/40 p-3 text-xs font-bold text-muted-foreground print:bg-black/5 print:text-black">
                    <div className="col-span-2">EXAM NAME</div>
                    <div className="text-center">SEMESTER</div>
                    <div className="text-right">DATE TAKEN</div>
                  </div>
                  {student.exams.map((exam) => (
                    <div key={exam.id} className="grid grid-cols-4 gap-4 p-3.5 text-sm font-medium items-center group/item">
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="font-semibold text-foreground print:text-black">{exam.examName}</span>
                        {/* Edit/Delete Triggers (Inline UI for seamless interactivity) */}
                        <div className="hidden group-hover/item:flex items-center gap-1.5 print:hidden">
                          <button 
                            onClick={() => openEditExam(exam)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors"
                            title="Edit Exam"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteExam(exam.id, exam.examName)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Exam"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-center text-muted-foreground font-semibold print:text-black">
                        {exam.semester}
                      </div>
                      <div className="text-right text-muted-foreground text-xs font-semibold print:text-black">
                        {formatDateString(exam.dateTaken)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* PROJECTS CARD */}
          <Card className="print:shadow-none print:border print:border-black/20">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-indigo-500" />
                  🗂️ Projects Done
                </CardTitle>
                <CardDescription className="print:hidden">Completed term projects & semesters</CardDescription>
              </div>
              <Button 
                onClick={openAddProject} 
                size="sm" 
                className="flex items-center gap-1 print:hidden"
              >
                <Plus className="size-4" /> Add Project
              </Button>
            </CardHeader>
            <CardContent>
              {student.projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                  No project records registered for this student yet.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden divide-y divide-border print:border-black/20 print:divide-black/20">
                  <div className="grid grid-cols-4 gap-4 bg-muted/40 p-3 text-xs font-bold text-muted-foreground print:bg-black/5 print:text-black">
                    <div className="col-span-2">PROJECT NAME</div>
                    <div className="text-center">SEMESTER</div>
                    <div className="text-right">COMPLETED DATE</div>
                  </div>
                  {student.projects.map((proj) => (
                    <div key={proj.id} className="grid grid-cols-4 gap-4 p-3.5 text-sm font-medium items-center group/item">
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="font-semibold text-foreground print:text-black">{proj.projectName}</span>
                        {/* Edit/Delete triggers */}
                        <div className="hidden group-hover/item:flex items-center gap-1.5 print:hidden">
                          <button 
                            onClick={() => openEditProject(proj)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors"
                            title="Edit Project"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(proj.id, proj.projectName)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-center text-muted-foreground font-semibold print:text-black">
                        {proj.semester}
                      </div>
                      <div className="text-right text-muted-foreground text-xs font-semibold print:text-black">
                        {formatDateString(proj.completedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sidebar Metadata Cards */}
        <div className="space-y-6">
          
          {/* PERSONAL INFO CARD */}
          <Card className="print:shadow-none print:border print:border-black/20">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4.5 text-primary" />
                📋 Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground font-medium">Counsellor</span>
                <span className="font-semibold text-foreground">{student.counsellor || "Unassigned"}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground font-medium">Date Enrolled</span>
                <span className="font-semibold text-foreground">{formatDateString(student.dateEnrolled)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Track Program</span>
                <span className="font-semibold text-foreground">{student.trackType.replace("_", " ")}</span>
              </div>
            </CardContent>
          </Card>

          {/* SPONSOR CARD */}
          <Card className="print:shadow-none print:border print:border-black/20">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="size-4.5 text-amber-500" />
                💼 Sponsor Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {!student.sponsor ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No sponsor registered.
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <User className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Sponsor Name</p>
                      <p className="text-sm font-semibold text-foreground">{student.sponsor.sponsorName}</p>
                    </div>
                  </div>
                  {student.sponsor.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Phone className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Contact Phone</p>
                        <p className="text-sm font-semibold text-foreground font-mono">{student.sponsor.phone}</p>
                      </div>
                    </div>
                  )}
                  {student.sponsor.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Mail className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Contact Email</p>
                        <p className="text-sm font-semibold text-foreground break-all">{student.sponsor.email}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* TOP-UP UNIVERSITY CARD */}
          <Card className="print:shadow-none print:border print:border-black/20">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4.5 text-indigo-500" />
                🎓 Top-Up University
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {student.topUpUniversities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Not enrolled in a Top-up degree yet.
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground font-medium">University</span>
                    <span className="font-semibold text-foreground">
                      {student.topUpUniversities[0].university.replace(/_/g, " ")}
                    </span>
                  </div>
                  
                  {/* Approval Toggle */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="space-y-0.5">
                      <label className="text-sm font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                        <GraduationCap className="size-4 text-indigo-500" />
                        Approved By Head
                      </label>
                      <p className="text-xs text-muted-foreground">Authorized for degree upgrade</p>
                    </div>
                    <button
                      onClick={() => handleTopUpApprovalToggle(!student.topUpUniversities[0].approved)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-hidden print:hidden ${
                        student.topUpUniversities[0].approved ? "bg-emerald-500" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          student.topUpUniversities[0].approved ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    {/* Print Only Checkbox */}
                    <div className="hidden print:block font-semibold">
                      {student.topUpUniversities[0].approved ? "✅ Approved" : "❌ Pending"}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* UPDATE HISTORY (AUDIT TRAIL) CARD */}
          <Card className="print:hidden">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-4.5 text-primary" />
                📅 Update History (Audit Trail)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {student.auditLogs.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No modifications recorded yet.
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {student.auditLogs.map((log) => (
                    <div key={log.id} className="relative pl-4 border-l border-border pb-1 text-xs">
                      <div className="absolute -left-[5px] top-[3px] size-2 rounded-full bg-primary" />
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-foreground">{log.action}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{log.details}</p>
                      <p className="text-[9px] font-extrabold text-primary mt-1">Performed by: {log.performedBy}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ======================== DIALOG MODAL DIALOGS =========================== */}
      {/* ========================================================================= */}

      {/* 1. EDIT STUDENT MODAL */}
      {isEditStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Edit Student Profile</h3>
              <button 
                onClick={() => setIsEditStudentOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1 hover:bg-muted rounded-lg"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleEditStudentSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Personal Details Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary tracking-wide uppercase border-b pb-1.5">Academic Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Full Name *</label>
                    <Input 
                      value={editForm.name} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Course Enrolled *</label>
                    <Input 
                      value={editForm.course} 
                      onChange={(e) => setEditForm({ ...editForm, course: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Track Type *</label>
                    <select
                      value={editForm.trackType}
                      onChange={(e) => setEditForm({ ...editForm, trackType: e.target.value })}
                      className="w-full h-10 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold hover:bg-muted/50 focus:ring-2 focus:ring-primary outline-hidden"
                    >
                      <option value="FAST_TRACK">⚡ Fast Track</option>
                      <option value="NORMAL_TRACK">📘 Normal Track</option>
                      <option value="SHORT_COURSE">📋 Short Course</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Enrollment Date *</label>
                    <Input 
                      type="date"
                      value={editForm.dateEnrolled} 
                      onChange={(e) => setEditForm({ ...editForm, dateEnrolled: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground">Counsellor Name</label>
                    <Input 
                      value={editForm.counsellor} 
                      onChange={(e) => setEditForm({ ...editForm, counsellor: e.target.value })} 
                      placeholder="Name of academic counsellor"
                    />
                  </div>
                </div>
              </div>

              {/* Sponsor Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary tracking-wide uppercase border-b pb-1.5">Sponsor Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground">Sponsor Name</label>
                    <Input 
                      value={editForm.sponsorName} 
                      onChange={(e) => setEditForm({ ...editForm, sponsorName: e.target.value })} 
                      placeholder="Full name of sponsor"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Sponsor Phone</label>
                    <Input 
                      value={editForm.sponsorPhone} 
                      onChange={(e) => setEditForm({ ...editForm, sponsorPhone: e.target.value })} 
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Sponsor Email</label>
                    <Input 
                      type="email"
                      value={editForm.sponsorEmail} 
                      onChange={(e) => setEditForm({ ...editForm, sponsorEmail: e.target.value })} 
                      placeholder="sponsor@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Top-up Degree Upgrade */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary tracking-wide uppercase border-b pb-1.5">Top-up University Upgrades</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground">Enroll Degree Top-Up</label>
                    <select
                      value={editForm.university}
                      onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                      className="w-full h-10 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold hover:bg-muted/50 focus:ring-2 focus:ring-primary outline-hidden"
                    >
                      <option value="">-- Select University --</option>
                      <option value="MIDDLESEX">Middlesex University</option>
                      <option value="LINCOLN">Lincoln University College</option>
                      <option value="EASTERN_MEDITERRANEAN">Eastern Mediterranean University</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditStudentOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving Changes..." : "Save Profile →"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD / EDIT EXAM MODAL */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border rounded-xl shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {editingExam ? "Edit Exam Record" : "Add Exam Done"}
              </h3>
              <button 
                onClick={() => setIsAddExamOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1 hover:bg-muted rounded-lg"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleExamSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Exam Name *</label>
                <Input 
                  value={examForm.examName} 
                  onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })} 
                  placeholder="e.g. Java SE Basics (CPISM)"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Semester *</label>
                  <select
                    value={examForm.semester}
                    onChange={(e) => setExamForm({ ...examForm, semester: e.target.value })}
                    className="w-full h-10 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold hover:bg-muted/50 focus:ring-2 focus:ring-primary outline-hidden"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Date Taken *</label>
                  <Input 
                    type="date"
                    value={examForm.dateTaken} 
                    onChange={(e) => setExamForm({ ...examForm, dateTaken: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddExamOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingExam ? "Save Exam" : "Add Exam")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD / EDIT PROJECT MODAL */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border rounded-xl shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {editingProject ? "Edit Project Details" : "Add Term Project"}
              </h3>
              <button 
                onClick={() => setIsAddProjectOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1 hover:bg-muted rounded-lg"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleProjectSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Project Name *</label>
                <Input 
                  value={projectForm.projectName} 
                  onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })} 
                  placeholder="e.g. Aptech Student Portal System"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Semester *</label>
                  <select
                    value={projectForm.semester}
                    onChange={(e) => setProjectForm({ ...projectForm, semester: e.target.value })}
                    className="w-full h-10 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-semibold hover:bg-muted/50 focus:ring-2 focus:ring-primary outline-hidden"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Completion Date *</label>
                  <Input 
                    type="date"
                    value={projectForm.completedAt} 
                    onChange={(e) => setProjectForm({ ...projectForm, completedAt: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddProjectOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingProject ? "Save Project" : "Add Project")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
