"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin-dashboard/AdminHeader";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";
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
  const [category, setCategory] = useState("");
  const [rewardPoints, setRewardPoints] = useState<number | "">("");

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
      
      const response = await fetch(`/api/admin/activities?page=${page}&limit=5`);
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
    const line = document.getElementById(
      "userGrowthChart"
    ) as HTMLCanvasElement;
    const donut = document.getElementById(
      "taskCompletionChart"
    ) as HTMLCanvasElement;

    if (!line || !donut) return;

    const userGrowth = new Chart(line, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            data: [120, 240, 380, 540, 690, 820],
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

    const taskCompletion = new Chart(donut, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Pending"],
        datasets: [
          {
            data: [70, 30],
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

    return () => {
      userGrowth.destroy();
      taskCompletion.destroy();
    };
  }, []);

  /* ---------- CREATE TASK (LOCAL) ---------- */
  const createTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category || !rewardPoints) {
      toast.error("Please fill all required fields");
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      category,
      rewardPoints: Number(rewardPoints),
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    toast.success("Task created successfully");

    setTitle("");
    setCategory("");
    setRewardPoints("");
    setShowCreateModal(false);
    
    // Refresh activities to show the new task creation
    fetchActivities();
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6 space-y-8 overflow-y-auto">
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
                <canvas id="userGrowthChart" />
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
                  id="taskCompletionChart"
                  className="max-w-[260px] max-h-[260px]"
                />
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                Recent Activity
              </h3>
            </div>

            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activitiesError ? (
              <div className="text-center py-6">
                <p className="text-red-500 text-sm mb-2">{activitiesError}</p>
                <button 
                  onClick={() => fetchActivities(activitiesPage)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No recent activity
              </p>
            ) : (
              <>
                <ul className="space-y-3 text-sm">
                  {activities.map((activity) => (
                    <li
                      key={activity._id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        {activity.user?.avatarUrl ? (
                          <img 
                            src={activity.user.avatarUrl} 
                            alt={activity.user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold">
                            {activity.user?.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {activity.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.type === 'task_approved' ? 'bg-green-100 text-green-800' :
                          activity.type === 'task_rejected' ? 'bg-red-100 text-red-800' :
                          activity.type === 'task_submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* PAGINATION */}
                {activitiesTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
                    <button
                      onClick={() => fetchActivities(activitiesPage - 1)}
                      disabled={activitiesPage <= 1}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {activitiesPage} of {activitiesTotalPages}
                    </span>
                    <button
                      onClick={() => fetchActivities(activitiesPage + 1)}
                      disabled={activitiesPage >= activitiesTotalPages}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={createTask}
            className="bg-background border rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-semibold">
              Create Task
            </h3>

            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              <option>Social</option>
              <option>Referral</option>
              <option>Content</option>
            </select>

            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              placeholder="Reward points"
              value={rewardPoints}
              onChange={(e) =>
                setRewardPoints(Number(e.target.value))
              }
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white rounded bg-linear-to-r from-green-500 to-purple-500"
              >
                Create
              </button>
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
