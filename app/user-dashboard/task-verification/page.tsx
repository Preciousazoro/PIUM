"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

export default function TaskVerificationIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since no specific task is selected
    router.push("/user-dashboard/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <UserSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <UserHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <p>Redirecting to dashboard...</p>
          </div>
        </main>
      </div>
    </div>
  );
}
