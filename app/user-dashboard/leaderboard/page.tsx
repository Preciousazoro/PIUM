"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { PodiumPosition } from "@/components/user-dashboard/PodiumPosition";

// Navigation Imports
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

type Entry = { 
  id?: string; 
  rank: number; 
  username: string; 
  handle?: string; 
  tasks: number; 
  tp: number; 
  level: string; 
  avatar?: string | number 
};

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"All" | "Beginner" | "Advanced" | "Intermediate" | "Expert">("All");
  const [levelOpen, setLevelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Mock Data
  const top: Entry[] = [
    { rank: 1, username: "CryptoKing", handle: "@ck_wealth", tasks: 142, tp: 15400, level: "Expert", avatar: "https://i.pravatar.cc/150?u=1" },
    { rank: 2, username: "TaskMaster", handle: "@tm_pro", tasks: 120, tp: 12850, level: "Expert", avatar: "https://i.pravatar.cc/150?u=2" },
    { rank: 3, username: "Zelda_99", handle: "@zelda_tasks", tasks: 98, tp: 10200, level: "Advanced", avatar: "https://i.pravatar.cc/150?u=3" },
  ];

  const items: Entry[] = [
    ...top,
    { rank: 4, username: "DevGamer", tasks: 85, tp: 9400, level: "Advanced" },
    { rank: 5, username: "Sarah_S", tasks: 72, tp: 8200, level: "Intermediate" },
    { rank: 6, username: "KashFlow", tasks: 60, tp: 7500, level: "Intermediate" },
    { rank: 7, username: "Web3Whale", tasks: 45, tp: 5200, level: "Beginner" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. SIDEBAR */}
      <UserSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. HEADER */}
        <UserHeader />

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            
            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-purple-600">
                  Global Leaderboard
                </h1>
                <p className="text-muted-foreground mt-1">Check how you stack up against the top earners.</p>
              </div>
              
              <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search users..."
                    className="bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm w-full lg:w-64 focus:ring-2 ring-primary/20 outline-none"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80">
                      Sort: TP
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Total TP</DropdownMenuItem>
                    <DropdownMenuItem>Tasks Completed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-purple-600 text-white font-bold text-sm hover:opacity-90">
                      {level === "All" ? "All Levels" : level}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {(["All", "Beginner", "Intermediate", "Advanced", "Expert"] as const).map((opt) => (
                      <DropdownMenuItem key={opt} onSelect={() => setLevel(opt)}>
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Podium Layout */}
            <section className="relative w-full max-w-5xl mx-auto pt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end px-4">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <PodiumPosition user={top[1]} rank={2} isFirst={false} />
                </motion.div>
                
                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                >
                  <PodiumPosition user={top[0]} rank={1} isFirst={true} />
                </motion.div>
                
                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <PodiumPosition user={top[2]} rank={3} isFirst={false} />
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
            </section>

            {/* Table Section */}
            <section className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
              <h3 className="text-xl font-bold mb-6">Top Performers</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left pb-4 font-bold uppercase tracking-wider text-[10px] w-16">Rank</th>
                      <th className="text-left pb-4 font-bold uppercase tracking-wider text-[10px]">User</th>
                      <th className="text-right pb-4 font-bold uppercase tracking-wider text-[10px] hidden sm:table-cell">Tasks</th>
                      <th className="text-right pb-4 font-bold uppercase tracking-wider text-[10px]">Points</th>
                      <th className="text-right pb-4 font-bold uppercase tracking-wider text-[10px] hidden sm:table-cell">Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((user, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4">
                          <span className={`font-black ${index < 3 ? 'text-primary text-lg' : 'text-muted-foreground'}`}>
                            #{user.rank}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full overflow-hidden border border-border">
                              {user.avatar ? (
                                <img src={user.avatar as string} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                  {user.username.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="font-bold">{user.username}</div>
                          </div>
                        </td>
                        <td className="py-4 text-right hidden sm:table-cell font-medium">
                          {user.tasks}
                        </td>
                        <td className="py-4 text-right">
                          <span className="font-bold text-primary">{user.tp.toLocaleString()} TP</span>
                        </td>
                        <td className="py-4 text-right hidden sm:table-cell">
                          <span className="px-2 py-1 rounded-md bg-muted text-[10px] font-bold uppercase">
                            {user.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}