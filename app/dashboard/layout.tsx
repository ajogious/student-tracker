import { ToastProvider } from "@/components/ui/toast";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userLabel = session?.role === "ADMIN" ? "Center Academic Head (CAH)" : "Staff Member";
  const userEmail = session?.email || "";

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {/* Top Nav */}
        <header className="border-b bg-card px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  A
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none">Aptech Tracker</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {userLabel}
                </p>
              </div>
            </div>

            {/* Profile & Logout Section */}
            <div className="flex items-center gap-4">
              {userEmail && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-foreground">{userEmail}</p>
                  <p className="text-[10px] text-muted-foreground">Logged In</p>
                </div>
              )}
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
