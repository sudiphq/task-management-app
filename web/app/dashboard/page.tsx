"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-semibold">Task Manager</h1>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            <span className="hidden sm:block">Sign out</span>
          </Button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8"></main>
    </div>
  );
}
