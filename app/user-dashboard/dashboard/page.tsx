"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, ExternalLink, Trophy, CheckCircle2, Flame, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { RecentActivity } from "@/components/user-dashboard/RecentActivity";


// Directly import the Sidebar and Header here
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. Sidebar */}
      <UserSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. Header */}
        <UserHeader />

        {/* 3. Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Welcome back, <span className="text-primary">User</span>! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                You have <span className="text-foreground font-semibold">1,250 TP</span> available to redeem.
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold">1,250 TP</p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Tasks Done</p>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold">24</p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Global Rank</p>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-3xl font-bold">#42</p>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Available Tasks</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-3xl p-6 border border-border hover:border-primary/50 transition-all flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      Social
                    </span>
                    <div className="text-[10px] font-medium bg-muted px-2 py-1 rounded text-foreground">
                      50 TP
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">Follow TaskKash on X</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    Follow our official handle to stay updated with the latest rewards.
                  </p>
                  <button className="mt-auto w-full py-3 rounded-xl text-white bg-gradient-to-r from-green-500 to-purple-600 font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                    Submit Proof
                  </button>
                </div>
              ))}
            </div>

            {/* 4. Recent Activity Section */}
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}