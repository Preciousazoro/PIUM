"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, ExternalLink, Trophy, CheckCircle2, Flame, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { TaskDocument, TaskCard, transformTaskToCard } from "@/types/shared-task";
import { Task } from "@/lib/taskState";
import { TaskCard as TaskCardComponent } from "@/components/tasks/TaskCard";
import { TaskPreviewModal } from "@/components/tasks/TaskPreviewModal";
import { RecentActivity } from "@/components/user-dashboard/RecentActivity";
import { Button } from "@/components/ui/button";

// Directly import the Sidebar and Header here
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskPoints, setTaskPoints] = useState<number>(0);
  const [tasksCompleted, setTasksCompleted] = useState<number>(0);
  const [tasks, setTasks] = useState<TaskDocument[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;
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
          setTaskPoints(data.taskPoints || 0); // Fallback to 0 if undefined
          setTasksCompleted(data.tasksCompleted || 0);
        } else {
          // If both APIs fail, set default values
          console.warn('API calls failed, using default values');
          setTaskPoints(0);
          setTasksCompleted(0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default values on error
        setTaskPoints(0);
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

  // Fetch active tasks with user status
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks/user-dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, []);


  const handleTaskClick = (task: TaskDocument) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleStartTask = (task: TaskDocument) => {
    // This will be handled by TaskCard component
    // The modal will also handle starting tasks
    handleTaskClick(task);
  };

  const handleSubmitProof = (task: TaskDocument) => {
    handleTaskClick(task);
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks;

    // Filter by active tab
    if (activeTab !== 'All') {
      filtered = tasks.filter(task => task.userTaskStatus === activeTab.toLowerCase());
    }

    // Sort tasks
    const sorted = [...filtered].sort((a, b) => {
      if (activeTab === 'All') {
        // In All tab: available/rejected first, then pending, then approved last
        const getSortPriority = (status: string) => {
          if (status === 'available' || status === 'rejected') return 0;
          if (status === 'pending') return 1;
          if (status === 'approved') return 2;
          return 3;
        };
        
        const priorityA = getSortPriority(a.userTaskStatus);
        const priorityB = getSortPriority(b.userTaskStatus);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // If same priority, sort by creation date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        // In other tabs: sort by latest submission date, fallback to task creation date
        const dateA = a.latestSubmission?.submittedAt ? new Date(a.latestSubmission.submittedAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.latestSubmission?.submittedAt ? new Date(b.latestSubmission.submittedAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      }
    });

    return sorted;
  };

  const filteredAndSortedTasks = getFilteredAndSortedTasks();
  const totalPages = Math.ceil(filteredAndSortedTasks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTasks = filteredAndSortedTasks.slice(startIndex, startIndex + pageSize);

  // Reset page when tab changes
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const tabs: Array<typeof activeTab> = ['All', 'Pending', 'Approved', 'Rejected'];

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
                You've earned <span className="text-foreground font-semibold">{taskPoints.toLocaleString()} TP</span> total.
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold">{taskPoints.toLocaleString()} TP</p>
                <p className="text-xs text-muted-foreground mt-1">{taskPoints > 0 ? 'Keep completing tasks to earn more TP' : 'Start completing tasks to earn TP'}</p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Tasks Done</p>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{tasksCompleted}</p>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Tasks</h2>
              {filteredAndSortedTasks.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {filteredAndSortedTasks.length} tasks found
                </span>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((task) => (
                  <TaskCardComponent 
                    key={task._id} 
                    task={task} 
                    onClick={handleTaskClick}
                    onStartTask={handleStartTask}
                    onSubmitProof={handleSubmitProof}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {activeTab === 'All' ? 'No tasks available yet' : `No ${activeTab.toLowerCase()} tasks`}
                    </h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'All' 
                        ? 'Check back later! New tasks are added regularly by administrators.'
                        : `You don't have any ${activeTab.toLowerCase()} tasks.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

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