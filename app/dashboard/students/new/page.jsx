import Link from "next/link";
import NewStudentForm from "@/components/students/NewStudentForm";

export default function NewStudentPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* ---- Breadcrumb ---- */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          href="/dashboard"
          className="hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">New Student</span>
      </div>

      {/* ---- Page Header ---- */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Register New Student</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the student&apos;s academic track record details below
        </p>
      </div>

      {/* ---- Form ---- */}
      <NewStudentForm />
    </div>
  );
}
