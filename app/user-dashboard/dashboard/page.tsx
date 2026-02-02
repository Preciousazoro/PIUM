"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, ExternalLink, Trophy, CheckCircle2, Flame, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TaskDocument, TaskCard, transformTaskToCard } from "@/types/shared-task";
import { Task } from "@/lib/taskState";
import { TaskCard as TaskCardComponent } from "@/components/tasks/TaskCard";
import { TaskPreviewModal } from "@/components/tasks/TaskPreviewModal";
import { RecentActivity } from "@/components/user-dashboard/RecentActivity";

// Directly import the Sidebar and Header here
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskPoints, setTaskPoints] = useState<number>(50); // Start with welcome bonus
  const [tasksCompleted, setTasksCompleted] = useState<number>(0);
  const [tasks, setTasks] = useState<TaskDocument[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try the new balance API first
        let response = await fetch('/api/user/balance');
        let data;
        
        if (!response.ok) {
          // If new API fails, fall back to the original approve API
          console.log('Falling back to original API');
          response = await fetch('/api/tasks/approve');
        }
        
        if (response.ok) {
          data = await response.json();
          setTaskPoints(data.taskPoints || 50); // Fallback to 50 if undefined
          setTasksCompleted(data.tasksCompleted || 0);
          
          // Show welcome bonus notification if it was just applied
          if (data.welcomeBonusApplied) {
            console.log('Welcome bonus of 50 TP has been applied!');
          }
        } else {
          // If both APIs fail, set default values
          console.warn('API calls failed, using default values');
          setTaskPoints(50);
          setTasksCompleted(0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default values on error
        setTaskPoints(50);
        setTasksCompleted(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Set up periodic updates
    const interval = setInterval(fetchUserData, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Fetch active tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Keep sample tasks as fallback
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Sample task data - fallback if API fails
  const sampleTasks: Task[] = [
    {
      id: "task-1",
      title: "Follow TaskKash on X",
      description: "Follow our official handle to stay updated with the latest rewards and announcements. Make sure to follow and stay engaged for future opportunities.",
      reward: 50,
      category: "social",
      url: "https://twitter.com/taskkash",
      proofRequired: true
    },
    {
      id: "task-2", 
      title: "Join our Discord Community",
      description: "Become part of our growing community on Discord. Participate in discussions, get support, and be the first to know about new features and rewards.",
      reward: 75,
      category: "social",
      url: "https://discord.gg/taskkash",
      proofRequired: true
    },
    {
      id: "task-3",
      title: "Create Content About TaskKash",
      description: "Create a short video or post about TaskKash and share it on your social media. Show your creativity and earn rewards!",
      reward: 150,
      category: "content", 
      url: "https://taskkash.com/content-creator",
      proofRequired: true
    },
    {
      id: "task-4",
      title: "Refer a Friend",
      description: "Invite your friends to join TaskKash and earn rewards when they complete their first task. Share your unique referral link and track your referrals.",
      reward: 100,
      category: "social", 
      url: "https://taskkash.com/referrals",
      proofRequired: true
    },
    {
      id: "task-5",
      title: "Complete a Purchase",
      description: "Make a purchase from one of our partner stores and earn cashback in TP. The more you shop, the more you earn!",
      reward: 200,
      category: "commerce", 
      url: "https://taskkash.com/partners",
      proofRequired: true
    },
    {
      id: "task-6",
      title: "Complete Your Profile",
      description: "Fill out your complete profile information including avatar, bio, and preferences. This helps us match you with better tasks.",
      reward: 25,
      category: "social", 
      url: "https://taskkash.com/profile",
      proofRequired: false
    }
  ];

  // Use real tasks if available, otherwise fallback to sample tasks
  const displayTasks: Task[] = tasks.length > 0 
    ? tasks.map(transformTaskToCard) 
    : sampleTasks;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleStartTask = (task: Task) => {
    // This will be handled by the TaskCard component
    // The modal will also handle starting tasks
    handleTaskClick(task);
  };

  const handleSubmitProof = (task: Task) => {
    // This will be handled by the TaskCard component
    // The modal will also handle proof submission
    handleTaskClick(task);
  };

  if (isLoading || tasksLoading) {
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
                Welcome back! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                You've earned <span className="text-foreground font-semibold">{taskPoints.toLocaleString()} TP</span> total (including 50 TP welcome bonus).
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold">{taskPoints.toLocaleString()} TP</p>
                <p className="text-xs text-muted-foreground mt-1">Includes 50 TP welcome bonus</p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Tasks Done</p>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{tasksCompleted}</p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-3xl font-bold">{taskPoints.toLocaleString()} TP</p>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Available Tasks</h2>
              {tasks.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {tasks.length} active tasks available
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTasks.map((task) => (
                <TaskCardComponent 
                  key={task.id} 
                  task={task} 
                  onClick={handleTaskClick}
                  onStartTask={handleStartTask}
                  onSubmitProof={handleSubmitProof}
                />
              ))}
            </div>

            {/* 4. Recent Activity Section */}
            <RecentActivity />
          </div>
        </main>
      </div>

      {/* Task Preview Modal */}
      <TaskPreviewModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}