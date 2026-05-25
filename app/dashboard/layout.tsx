export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">
                A
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">Aptech Tracker</h1>
              <p className="text-xs text-muted-foreground">
                Center Academic Head
              </p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date().toDateString()}
          </span>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
