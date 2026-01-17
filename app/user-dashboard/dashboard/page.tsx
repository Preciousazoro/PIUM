"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, ExternalLink, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  // Static dummy data for the UI
  const tasks = [
    {
      id: "1",
      title: "Follow TaskKash on X",
      description: "Follow our official handle to stay updated with the latest Web3 tasks and rewards.",
      category: "Social",
      rewardPoints: 50,
      validationType: "Screenshot",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Join Discord Community",
      description: "Become a member of our growing community and participate in exclusive giveaways.",
      category: "Community",
      rewardPoints: 100,
      validationType: "Username",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Review Platform Features",
      description: "Provide honest feedback about our new dashboard layout to earn extra points.",
      category: "Feedback",
      rewardPoints: 150,
      validationType: "Text",
      createdAt: new Date().toISOString(),
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="text-muted-foreground">
            Complete tasks to earn TaskPoints (TP) and redeem rewards
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Total Points</p>
          <p className="text-2xl font-bold mt-1">1,250 TP</p>
          <p className="text-xs text-green-400 mt-1">+150 this week</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Tasks Completed</p>
          <p className="text-2xl font-bold mt-1">24</p>
          <p className="text-xs text-green-400 mt-1">+3 this week</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">Current Rank</p>
          <p className="text-2xl font-bold mt-1">#42</p>
          <p className="text-xs text-green-400 mt-1">Top 10%</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Available Tasks</h2>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-card rounded-2xl p-6 border border-border hover:border-green-400 cursor-pointer transition-colors flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                {task.category}
              </span>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Just now
              </span>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold mb-2 truncate">{task.title}</h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {task.description}
            </p>

            {/* Footer Stats */}
            <div className="flex justify-between items-center mt-auto">
              <div className="flex items-center text-sm text-muted-foreground">
                <LinkIcon className="w-4 h-4 mr-1 shrink-0" />
                <span className="truncate">{task.validationType} proof</span>
              </div>
              <div className="flex items-center shrink-0">
                <span className="font-bold text-green-400 mr-1">
                  {task.rewardPoints}
                </span>
                <span className="text-xs text-muted-foreground">TP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2">
                <ExternalLink className="w-3 h-3" />
                Start Task
              </button>
              <button className="py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium">
                View Details
              </button>
              <button className="col-span-2 w-full py-2 rounded-lg text-white bg-gradient-to-r from-green-500 to-purple-600 hover:opacity-90 font-medium transition">
                Submit Proof
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Load More Placeholder */}
      <div className="flex justify-center mt-10">
        <button className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
          Load More Tasks
        </button>
      </div>

      <div className="mt-12 p-8 border border-dashed border-border rounded-2xl text-center">
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <p className="text-muted-foreground text-sm">Your task submission history will appear here.</p>
      </div>
    </>
  );
}

