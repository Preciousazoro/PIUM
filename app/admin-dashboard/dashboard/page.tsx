"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import AdminHeader from "@/components/admin-dashboard/AdminHeader";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";
import { AdminDashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import Chart from "chart.js/auto";
import {
  Users,
  FileText,
  CheckCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */
type Task = {
  id: string;
  title: string;
  category: string;
  rewardPoints: number;
  createdAt: string;
};

type DashboardMetrics = {
  totalUsers: number;
  tasksCompleted: number;
  pendingReviews: number;
  lastUpdated: string;
};

/* ---------------- COMPONENT ---------------- */
const Dashboard = () => {
  /* ---------- UI STATE ---------- */
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* ---------- FORM STATE ---------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<'social' | 'content' | 'commerce'>('social');
  const [rewardPoints, setRewardPoints] = useState<number | "">("");
  const [validationType, setValidationType] = useState("");
  const [instructions, setInstructions] = useState("");
  const [taskLink, setTaskLink] = useState("");
  const [alternateUrl, setAlternateUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<'active' | 'expired' | 'disabled'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- LOCAL DATA ---------- */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesTotalPages, setActivitiesTotalPages] = useState(1);
  
  // Chart refs
  const userGrowthChartRef = useRef<HTMLCanvasElement>(null);
  const taskCompletionChartRef = useRef<HTMLCanvasElement>(null);
  const userGrowthChartInstance = useRef<Chart | null>(null);
  const taskCompletionChartInstance = useRef<Chart | null>(null);

  /* ---------- FETCH METRICS ---------- */
  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      setMetricsError(null);
      
      const response = await fetch('/api/admin/metrics');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetricsError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to load dashboard metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  /* ---------- FETCH ACTIVITIES ---------- */
  const fetchActivities = async (page: number = 1) => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      
      const response = await fetch(`/api/admin/activities?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.activities) {
        setActivities(data.activities);
        setActivitiesTotalPages(data.pagination.totalPages);
        setActivitiesPage(page);
      } else {
        throw new Error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivitiesError(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to load recent activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    fetchMetrics();
    fetchActivities();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- STATS ---------- */
  const stats = useMemo(() => {
    if (metrics) {
      return {
        totalUsers: metrics.totalUsers,
        tasksCompleted: metrics.tasksCompleted,
        pendingReviews: metrics.pendingReviews,
      };
    }
    
    // Fallback to calculated values if metrics not loaded
    return {
      totalUsers: 0,
      tasksCompleted: tasks.length * 5,
      pendingReviews: tasks.length,
    };
  }, [metrics, tasks]);

  /* ---------- CHARTS ---------- */
  useEffect(() => {
    // Only initialize charts after component is mounted and metrics are loaded
    if (metricsLoading || metricsError) return;

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const userGrowthCanvas = userGrowthChartRef.current;
      const taskCompletionCanvas = taskCompletionChartRef.current;

      if (!userGrowthCanvas || !taskCompletionCanvas) {
        console.warn('Chart canvas elements not found');
        return;
      }

      // Destroy existing chart instances if they exist
      if (userGrowthChartInstance.current) {
        userGrowthChartInstance.current.destroy();
      }
      if (taskCompletionChartInstance.current) {
        taskCompletionChartInstance.current.destroy();
      }

      // Create User Growth Chart
      const userGrowthCtx = userGrowthCanvas.getContext('2d');
      if (userGrowthCtx) {
        userGrowthChartInstance.current = new Chart(userGrowthCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Users",
              data: metrics ? 
                [Math.floor(metrics.totalUsers * 0.15), Math.floor(metrics.totalUsers * 0.30), 
                 Math.floor(metrics.totalUsers * 0.45), Math.floor(metrics.totalUsers * 0.60), 
                 Math.floor(metrics.totalUsers * 0.80), metrics.totalUsers] :
                [120, 240, 380, 540, 690, 820],
              borderColor: "#a855f7",
              backgroundColor: "rgba(168,85,247,.15)",
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 4,
              fill: true,
              tension: 0.35,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#6b7280", font: { size: 11 } },
            },
            y: {
              grid: { color: "rgba(255,255,255,0.05)" },
              ticks: { color: "#6b7280", font: { size: 11 } },
            },
          },
        },
      });
    }

    // Create Task Completion Chart
    const taskCompletionCtx = taskCompletionCanvas.getContext('2d');
    if (taskCompletionCtx) {
      taskCompletionChartInstance.current = new Chart(taskCompletionCtx, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Pending"],
          datasets: [
            {
              data: metrics ? 
                [metrics.tasksCompleted, metrics.pendingReviews] :
                [70, 30],
              backgroundColor: ["#22c55e", "#facc15"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#9ca3af",
                boxWidth: 10,
                padding: 12,
                font: { size: 11 },
              },
            },
          },
        },
      });
      }
    }, 100); // 100ms delay

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (userGrowthChartInstance.current) {
        userGrowthChartInstance.current.destroy();
        userGrowthChartInstance.current = null;
      }
      if (taskCompletionChartInstance.current) {
        taskCompletionChartInstance.current.destroy();
        taskCompletionChartInstance.current = null;
      }
    };
  }, [metricsLoading, metricsError, metrics]);

  /* ---------- CREATE TASK ---------- */
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic client-side validation before sending
    if (!title.trim()) {
      toast.error('Title is required');
      setIsSubmitting(false);
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      setIsSubmitting(false);
      return;
    }

    if (!taskLink.trim() && !alternateUrl.trim()) {
      toast.error('At least one link is required (Task Link or Alternate URL)');
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        title: title.trim(),
        description: description.trim(),
        category,
        rewardPoints: Number(rewardPoints),
        validationType: validationType.trim(),
        instructions: instructions.trim(),
        taskLink: taskLink.trim(),
        alternateUrl: alternateUrl.trim() || '',
        deadline: deadline || null,
        status: status || 'active'
      };

      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details?.join(', ') || 'Failed to create task');
      }

      const data = await response.json();
      toast.success('Task created successfully!');
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory('social');
      setRewardPoints("");
      setValidationType("");
      setInstructions("");
      setTaskLink("");
      setAlternateUrl("");
      setDeadline("");
      setStatus('active');
      setShowCreateModal(false);
      
      // Refresh activities to show the new task creation
      fetchActivities();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- UI ---------- */
  if (metricsLoading || activitiesLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6 space-y-8 animate-in fade-in duration-500">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              System Dashboard
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-linear-to-r from-green-500 to-purple-500 hover:opacity-90"
            >
              <Plus size={16} />
              Create Task
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {metricsLoading ? (
              <>
                <StatSkeleton label="Total Users" />
                <StatSkeleton label="Tasks Completed" />
                <StatSkeleton label="Pending Reviews" />
              </>
            ) : metricsError ? (
              <div className="col-span-full">
                <div className="bg-card border rounded-2xl p-5 text-center">
                  <p className="text-red-500 text-sm">Failed to load metrics</p>
                  <button 
                    onClick={fetchMetrics}
                    className="mt-2 text-xs text-blue-500 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Stat icon={<Users />} label="Total Users" value={stats.totalUsers} />
                <Stat icon={<CheckCircle />} label="Tasks Completed" value={stats.tasksCompleted} />
                <Stat icon={<FileText />} label="Pending Reviews" value={stats.pendingReviews} />
              </>
            )}
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-card border rounded-2xl p-5 h-[360px] flex flex-col">
              <div className="flex justify-between mb-3">
                <h3 className="text-sm font-semibold">User Growth</h3>
                <span className="text-xs text-muted-foreground">
                  Last 6 months
                </span>
              </div>
              <div className="flex-1">
                <canvas 
                  ref={userGrowthChartRef}
                  width={400}
                  height={300}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            <div className="bg-card border rounded-2xl p-5 h-[360px] flex flex-col">
              <div className="flex justify-between mb-3">
                <h3 className="text-sm font-semibold">
                  Task Completion
                </h3>
                <span className="text-xs text-muted-foreground">
                  Overview
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <canvas
                  ref={taskCompletionChartRef}
                  width={260}
                  height={260}
                  className="max-w-[260px] max-h-[260px]"
                />
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="bg-linear-to-r from-purple-500/10 to-blue-500/10 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Recent Activity
              </h3>
            </div>

            <div className="p-6">
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activitiesError ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-500 text-sm mb-4">{activitiesError}</p>
                  <button 
                    onClick={() => fetchActivities(activitiesPage)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-muted-foreground text-2xl">📋</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No recent activity
                  </p>
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="hidden md:flex items-center gap-4 px-4 py-3 bg-muted/20 rounded-lg border border-border/30 mb-3">
                    <div className="w-10"></div>
                    <div className="flex-1 grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground">
                      <div>Activity</div>
                      <div>User</div>
                      <div>Date & Time</div>
                      <div>Status</div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div
                        key={activity._id}
                        className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-all duration-200 hover:shadow-sm hover:border-border"
                      >
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            {activity.user?.avatarUrl ? (
                              <img 
                                src={activity.user.avatarUrl} 
                                alt={activity.user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-background"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-white">
                                {activity.user?.name?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                            activity.type === 'task_approved' ? 'bg-green-500' :
                            activity.type === 'task_rejected' ? 'bg-red-500' :
                            activity.type === 'task_submitted' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
                          {/* Activity Column */}
                          <div className="min-w-0">
                            <p className="font-medium text-sm leading-tight">
                              {activity.title}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden mt-1">
                              {activity.user?.name || 'Unknown User'}
                            </p>
                          </div>
                          
                          {/* User Column */}
                          <div className="hidden md:block min-w-0">
                            <p className="text-sm text-muted-foreground truncate">
                              {activity.user?.name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {activity.user?.email || 'No email'}
                            </p>
                          </div>
                          
                          {/* Date & Time Column */}
                          <div className="hidden md:block min-w-0">
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          
                          {/* Status Column */}
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              activity.type === 'task_approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                              activity.type === 'task_rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                              activity.type === 'task_submitted' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                              'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                activity.type === 'task_approved' ? 'bg-green-500' :
                                activity.type === 'task_rejected' ? 'bg-red-500' :
                                activity.type === 'task_submitted' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }`}></span>
                              {activity.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {activitiesTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-border/50">
                      <button
                        onClick={() => fetchActivities(activitiesPage - 1)}
                        disabled={activitiesPage <= 1}
                        className="px-4 py-2 text-sm font-medium border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors hover:border-border"
                      >
                        ← Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, activitiesTotalPages))].map((_, i) => {
                          let pageNum;
                          if (activitiesTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (activitiesPage <= 3) {
                            pageNum = i + 1;
                          } else if (activitiesPage >= activitiesTotalPages - 2) {
                            pageNum = activitiesTotalPages - 4 + i;
                          } else {
                            pageNum = activitiesPage - 2 + i;
                          }
                          
                          const isActive = pageNum === activitiesPage;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => fetchActivities(pageNum)}
                              className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                                isActive 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => fetchActivities(activitiesPage + 1)}
                        disabled={activitiesPage >= activitiesTotalPages}
                        className="px-4 py-2 text-sm font-medium border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors hover:border-border"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-black p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] space-y-6 text-white overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-center sticky top-0 bg-black pb-4 border-b border-gray-700">Create Task</h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Title</label>
              <input
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Category</label>
              <select
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'social' | 'content' | 'commerce')}
                required
              >
                <option value="" className="bg-gray-800">Select category</option>
                <option value="social" className="bg-gray-800">Social</option>
                <option value="content" className="bg-gray-800">Content</option>
                <option value="commerce" className="bg-gray-800">Commerce</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Description</label>
              <textarea
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 resize-none"
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Reward Points */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Reward Points</label>
              <input
                type="number"
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                placeholder="Enter reward points"
                value={rewardPoints}
                onChange={(e) =>
                  setRewardPoints(e.target.value === "" ? "" : Number(e.target.value))
                }
                required
              />
            </div>

            {/* Validation Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Validation Type</label>
              <select
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                value={validationType}
                onChange={(e) => setValidationType(e.target.value)}
                required
              >
                <option value="" className="bg-gray-800">Select validation type</option>
                <option value="screenshot" className="bg-gray-800">Screenshot</option>
                <option value="username" className="bg-gray-800">Username</option>
                <option value="text" className="bg-gray-800">Text</option>
                <option value="link" className="bg-gray-800">Link</option>
              </select>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Instructions</label>
              <textarea
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 resize-none"
                placeholder="Enter task instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Task Links */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Task Link (preferred)</label>
                <input
                  type="url"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                  placeholder="https://example.com/task"
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Alternate URL</label>
                <input
                  type="url"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                  placeholder="https://example.com/alternate"
                  value={alternateUrl}
                  onChange={(e) => setAlternateUrl(e.target.value)}
                />
              </div>

              <p className="text-xs text-gray-400 bg-black p-3 rounded-lg border border-gray-700">
                ⚠️ At least one link is required (Task Link or Alternate URL)
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Deadline</label>
              <input
                type="datetime-local"
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
              />
            </div>

            {/* Form Actions - Sticky at bottom */}
            <div className="sticky bottom-0 bg-black pt-6 border-t border-gray-700">
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-linear-to-r from-green-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* ---------------- SMALL COMPONENTS ---------------- */
const Stat = ({ icon, label, value }: any) => (
  <div className="bg-card border rounded-2xl p-5 flex items-center gap-4">
    <div className="p-3 rounded-full bg-primary/20">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">
        {label}
      </p>
      <h3 className="text-xl font-semibold">
        {value.toLocaleString()}
      </h3>
    </div>
  </div>
);

const StatSkeleton = ({ label }: { label: string }) => (
  <div className="bg-card border rounded-2xl p-5 flex items-center gap-4">
    <div className="p-3 rounded-full bg-primary/20 animate-pulse">
      <Loader2 className="animate-spin" size={20} />
    </div>
    <div className="flex-1">
      <p className="text-sm text-muted-foreground mb-1">
        {label}
      </p>
      <div className="h-6 bg-muted rounded animate-pulse w-16" />
    </div>
  </div>
);

export default Dashboard;
