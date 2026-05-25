"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      // Failed silently for clean production environments
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors shadow-xs"
      title="Sign Out"
    >
      <LogOut className="size-3.5" /> Sign Out
    </button>
  );
}
