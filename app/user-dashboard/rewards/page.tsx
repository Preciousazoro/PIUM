"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Loader2, Gift, Lock, CheckCircle2, Trophy, 
  Zap, Star, ArrowUpRight, Crown, Sparkles 
} from "lucide-react";

// Navigation Imports
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";
import { ContentOnlySkeleton } from "@/components/ui/LoadingSkeleton";

export default function EnhancedRewardsPage() {
  const [perf, setPerf] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Fetch user data and set up rewards
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user's actual taskPoints and tasksCompleted
        let response = await fetch('/api/user/balance');
        let userData;
        
        if (!response.ok) {
          // If new API fails, fall back to the original approve API
          response = await fetch('/api/tasks/approve');
        }
        
        if (response.ok) {
          userData = await response.json();
          const taskPoints = userData.taskPoints || 50; // Fallback to 50
          const tasksCompleted = userData.tasksCompleted || 0;
          
          // Calculate user level based on taskPoints
          let level = "Beginner";
          let nextLevel = "Intermediate";
          let nextLevelPoints = 3000;
          let progress = 0;
          
          if (taskPoints >= 15000) {
            level = "Expert";
            nextLevel = "Max";
            nextLevelPoints = 15000;
            progress = 100;
          } else if (taskPoints >= 8000) {
            level = "Advanced";
            nextLevel = "Expert";
            nextLevelPoints = 15000;
            progress = ((taskPoints - 8000) / (15000 - 8000)) * 100;
          } else if (taskPoints >= 3000) {
            level = "Intermediate";
            nextLevel = "Advanced";
            nextLevelPoints = 8000;
            progress = ((taskPoints - 3000) / (8000 - 3000)) * 100;
          } else {
            progress = (taskPoints / 3000) * 100;
          }
          
          setPerf({
            tp: taskPoints,
            level: level,
            nextLevel: nextLevel,
            progress: Math.min(progress, 100),
            tasksCompleted: tasksCompleted
          });
          
          // Set up rewards based on user's actual taskPoints
          setRewards([
            { 
              id: "1", 
              title: "Early Access Badge", 
              desc: "Get priority access to high-paying premium tasks.", 
              minTP: 5000, 
              type: "Badge", 
              tier: "Common", 
              locked: taskPoints < 5000, 
              claimed: taskPoints >= 5000,
              claimable: taskPoints >= 5000 && taskPoints < 10000 
            },
            { 
              id: "2", 
              title: "1.5x Multiplier", 
              desc: "Boost all TaskPoints earned by 50% for 24 hours.", 
              minTP: 10000, 
              type: "Boost", 
              tier: "Rare", 
              locked: taskPoints < 10000, 
              claimed: false, 
              claimable: taskPoints >= 10000 && taskPoints < 25000 
            },
            { 
              id: "3", 
              title: "Exclusive NFT Avatar", 
              desc: "A unique digital collectible for Expert level users.", 
              minTP: 25000, 
              type: "NFT", 
              tier: "Legendary", 
              locked: taskPoints < 25000, 
              claimed: false 
            },
          ]);
        } else {
          // If both APIs fail, set default values
          console.warn('API calls failed, using default values');
          const taskPoints = 50;
          const tasksCompleted = 0;
          
          setPerf({
            tp: taskPoints,
            level: "Beginner",
            nextLevel: "Intermediate",
            progress: (taskPoints / 3000) * 100,
            tasksCompleted: tasksCompleted
          });
          
          setRewards([
            { 
              id: "1", 
              title: "Early Access Badge", 
              desc: "Get priority access to high-paying premium tasks.", 
              minTP: 5000, 
              type: "Badge", 
              tier: "Common", 
              locked: true, 
              claimed: false,
              claimable: false
            },
            { 
              id: "2", 
              title: "1.5x Multiplier", 
              desc: "Boost all TaskPoints earned by 50% for 24 hours.", 
              minTP: 10000, 
              type: "Boost", 
              tier: "Rare", 
              locked: true, 
              claimed: false, 
              claimable: false
            },
            { 
              id: "3", 
              title: "Exclusive NFT Avatar", 
              desc: "A unique digital collectible for Expert level users.", 
              minTP: 25000, 
              type: "NFT", 
              tier: "Legendary", 
              locked: true, 
              claimed: false 
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default values on error
        const taskPoints = 50;
        const tasksCompleted = 0;
        
        setPerf({
          tp: taskPoints,
          level: "Beginner",
          nextLevel: "Intermediate",
          progress: (taskPoints / 3000) * 100,
          tasksCompleted: tasksCompleted
        });
        
        setRewards([
          { 
            id: "1", 
            title: "Early Access Badge", 
            desc: "Get priority access to high-paying premium tasks.", 
            minTP: 5000, 
            type: "Badge", 
            tier: "Common", 
            locked: true, 
            claimed: false,
            claimable: false
          },
          { 
            id: "2", 
            title: "1.5x Multiplier", 
            desc: "Boost all TaskPoints earned by 50% for 24 hours.", 
            minTP: 10000, 
            type: "Boost", 
            tier: "Rare", 
            locked: true, 
            claimed: false, 
            claimable: false
          },
          { 
            id: "3", 
            title: "Exclusive NFT Avatar", 
            desc: "A unique digital collectible for Expert level users.", 
            minTP: 25000, 
            type: "NFT", 
            tier: "Legendary", 
            locked: true, 
            claimed: false 
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Sidebar */}
        <UserSidebar />

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <UserHeader />

          {/* Content Skeleton */}
          <ContentOnlySkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <UserSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <UserHeader />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
          
          {/* HERO SECTION: USER PROGRESS */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border p-8 md:p-12">
            {/* Abstract Background Glows */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
              {/* Left: Level Info */}
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                  <Star className="w-3 h-3 fill-primary" />
                  {perf?.level} Rank
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                  Your Journey to <span className="text-primary">{perf?.nextLevel}</span>
                </h1>
                
                <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-muted-foreground">{perf?.tp.toLocaleString()} TP</span>
                    <span className="text-primary">
                      {perf?.nextLevel === "Max" ? "Max Level" : `Next Rank: ${perf?.nextLevel === "Max" ? "15,000" : perf?.nextLevel === "Expert" ? "15,000" : perf?.nextLevel === "Advanced" ? "8,000" : "3,000"} TP`}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-muted rounded-full p-1 border border-border">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${perf?.progress}%` }}
                      className="h-full bg-linear-to-r from-primary via-purple-500 to-primary rounded-full relative"
                    >
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full m-0.5 shadow-sm animate-pulse" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right: Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <StatCard label="Earnings" value={`${perf?.tp.toLocaleString()}`} icon={<Zap className="text-yellow-500" />} />
                <StatCard label="Completed" value={perf?.tasksCompleted} icon={<CheckCircle2 className="text-green-500" />} />
              </div>
            </div>
          </section>

          {/* REWARDS GRID */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary text-white">
                  <Gift className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black">Unlocked Perks</h2>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Updated every 24h</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {rewards.map((reward, idx) => (
                  <RewardCard 
                    key={reward.id} 
                    reward={reward} 
                    onClaim={() => {}} 
                    isClaiming={claimingId === reward.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon }: { label: string, value: any, icon: any }) {
  return (
    <div className="bg-muted/30 border border-border/50 p-6 rounded-[2rem] min-w-[160px] text-center lg:text-left transition-hover hover:bg-muted/50">
      <div className="mb-4 inline-flex p-2 rounded-xl bg-background border border-border shadow-sm">
        {icon}
      </div>
      <p className="text-2xl font-black block">{value}</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
    </div>
  );
}

function RewardCard({ reward, onClaim, isClaiming }: { reward: any, onClaim: any, isClaiming: boolean }) {
  const isLocked = reward.locked;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative flex flex-col bg-card border border-border rounded-[2.5rem] p-6 transition-all duration-300 ${isLocked ? 'grayscale opacity-75' : 'hover:border-primary hover:shadow-2xl hover:shadow-primary/5'}`}
    >
      {/* Tier Tag */}
      <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border z-10 ${
        reward.tier === 'Legendary' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' :
        reward.tier === 'Rare' ? 'bg-purple-500/10 border-purple-500/50 text-purple-500' :
        'bg-primary/10 border-primary/50 text-primary'
      }`}>
        {reward.tier}
      </div>

      {/* Reward Icon/Art Placeholder */}
      <div className="aspect-4/3 rounded-3xl bg-muted mb-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
        {isLocked ? (
          <Lock className="w-12 h-12 text-muted-foreground animate-pulse" />
        ) : reward.claimed ? (
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        ) : (
          <Sparkles className="w-12 h-12 text-primary" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-xl font-black group-hover:text-primary transition-colors">{reward.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{reward.desc}</p>
      </div>

      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Requirement</span>
          <span className="text-sm font-black">{reward.minTP.toLocaleString()} TP</span>
        </div>

        <button
          disabled={isLocked || reward.claimed || isClaiming}
          onClick={onClaim}
          className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
            reward.claimed 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : isLocked 
              ? 'bg-border text-muted-foreground'
              : 'bg-foreground text-background hover:scale-105 active:scale-95 shadow-lg shadow-black/10'
          }`}
        >
          {reward.claimed ? 'CLAIMED' : isLocked ? 'LOCKED' : isClaiming ? '...' : 'CLAIM NOW'}
          {!reward.claimed && !isLocked && <ArrowUpRight className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  );
}