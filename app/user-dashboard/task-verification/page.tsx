// app/user-dashboard/task-verification/page.tsx
import { Suspense } from "react";
import SubmitProofWrapper from "./SubmitProofWrapper";
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

export default function SubmitProofPage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. SIDEBAR */}
      <UserSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. HEADER */}
        <UserHeader />

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="space-y-8 animate-pulse">
                {/* Task card skeleton */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="h-8 w-64 bg-muted rounded mb-4" />
                  <div className="h-4 w-full bg-muted rounded mb-2" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
                {/* Form skeleton */}
                <div className="rounded-2xl border border-border bg-card p-6 h-96" />
              </div>
            </div>
          }>
            <SubmitProofWrapper />
          </Suspense>
        </main>
      </div>
    </div>
  );
}