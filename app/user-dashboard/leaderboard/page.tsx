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
  rank: number; 
  username: string; 
  tasks: number; 
  tp: number; 
  level: string; 
  avatar?: string | null 
};

type LeaderboardResponse = {
  topThree: Entry[];
  topTen: Entry[];
};

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"All" | "Beginner" | "Advanced" | "Intermediate" | "Expert">("All");
  const [levelOpen, setLevelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const result = await response.json();
        
        if (result.success) {
          // Transform API data to match existing Entry format
          const transformData = (data: any[]): Entry[] => 
            data.map(item => ({
              rank: item.rank,
              username: item.username,
              tasks: item.tasksCompleted,
              tp: item.taskPoints,
              level: item.level,
              avatar: item.avatar
            }));
          
          setLeaderboardData({
            topThree: transformData(result.data.topThree),
            topTen: transformData(result.data.topTen)
          });
        } else {
          setError('Failed to load leaderboard data');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error || !leaderboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'No data available'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const top = leaderboardData.topThree;
  const items = leaderboardData.topTen;

  // Filter and search logic
  const filteredItems = items.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(q.toLowerCase());
    const matchesLevel = level === "All" || user.level === level;
    return matchesSearch && matchesLevel;
  });

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
            <section className="relative w-full max-w-7xl mx-auto pt-24 sm:pt-32">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16 items-end px-6 sm:px-12">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="order-2 sm:order-1"
                >
                  <PodiumPosition user={top[1]} rank={2} isFirst={false} />
                </motion.div>
                
                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="order-1 sm:order-2"
                >
                  <PodiumPosition user={top[0]} rank={1} isFirst={true} />
                </motion.div>
                
                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="order-3 sm:order-3"
                >
                  <PodiumPosition user={top[2]} rank={3} isFirst={false} />
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
            </section>

            {/* Table Section */}
            <section className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-sm overflow-hidden">
              <h3 className="text-xl font-bold mb-6">Top Performers</h3>
              
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left pb-4 font-bold uppercase tracking-wider text-[10px] w-16">Rank</th>
                      <th className="text-left pb-4 font-bold uppercase tracking-wider text-[10px]">User</th>
                      <th className="text-right pb-4 font-bold uppercase tracking-wider text-[10px]">Tasks</th>
                      <th className="text-right pb-4 font-bold uppercase tracking-wider text-[10px]">Points</th>
                      <th className="text-right pb-4 font-bold uppercase tracking-wider text-[10px]">Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((user, index) => (
                        <tr key={`${user.rank}-${user.username}`} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4">
                            <span className={`font-black ${user.rank <= 3 ? 'text-primary text-lg' : 'text-muted-foreground'}`}>
                              #{user.rank}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-muted rounded-full overflow-hidden border border-border flex-shrink-0">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="font-bold truncate max-w-[150px]">{user.username}</div>
                            </div>
                          </td>
                          <td className="py-4 text-right font-medium">
                            {user.tasks}
                          </td>
                          <td className="py-4 text-right">
                            <span className="font-bold text-primary">{user.tp.toLocaleString()} TP</span>
                          </td>
                          <td className="py-4 text-right">
                            <span className={`px-2 py-1 rounded-md bg-muted text-[10px] font-bold uppercase ${
                              user.level === 'Expert' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30' :
                              user.level === 'Advanced' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30' :
                              user.level === 'Intermediate' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {user.level}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No users found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredItems.length > 0 ? (
                  filteredItems.map((user, index) => (
                    <div key={`${user.rank}-${user.username}`} className="bg-muted/30 rounded-lg p-4 border border-border/50 space-y-3">
                      {/* Rank and User Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`font-black ${user.rank <= 3 ? 'text-primary text-lg' : 'text-muted-foreground'} flex-shrink-0`}>
                            #{user.rank}
                          </span>
                          <div className="w-10 h-10 bg-muted rounded-full overflow-hidden border border-border flex-shrink-0">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="font-bold truncate">{user.username}</div>
                        </div>
                        
                        {/* Level Badge */}
                        <span className={`px-2 py-1 rounded-md bg-muted text-[10px] font-bold uppercase flex-shrink-0 ${
                          user.level === 'Expert' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30' :
                          user.level === 'Advanced' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30' :
                          user.level === 'Intermediate' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {user.level}
                        </span>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Tasks</p>
                            <p className="font-bold">{user.tasks}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Points</p>
                            <p className="font-bold text-primary">{user.tp.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria.
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}