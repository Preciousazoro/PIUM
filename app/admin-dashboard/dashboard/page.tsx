"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin-dashboard/AdminHeader";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";
import Chart from "chart.js/auto";
import {
  Users,
  Award,
  FileText,
  CheckCircle,
  Plus,
  Search,
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

/* ---------------- COMPONENT ---------------- */
const Dashboard = () => {
  /* ---------- UI STATE ---------- */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");

  /* ---------- FORM STATE ---------- */
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [rewardPoints, setRewardPoints] = useState<number | "">("");

  /* ---------- LOCAL DATA ---------- */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  /* ---------- STATS ---------- */
  const stats = useMemo(() => {
    return {
      totalUsers: 1280,
      tasksCompleted: tasks.length * 5,
      pendingReviews: tasks.length,
      rewardsIssued: tasks.reduce(
        (sum, t) => sum + t.rewardPoints,
        0
      ),
    };
  }, [tasks]);

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
    setRecent((prev) => [
      {
        id: newTask.id,
        message: `New task created: "${newTask.title}"`,
        time: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    toast.success("Task created successfully");

    setTitle("");
    setCategory("");
    setRewardPoints("");
    setShowCreateModal(false);
  };

  const filteredRecent = recent.filter((r) =>
    r.message.toLowerCase().includes(search.toLowerCase())
  );

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
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-green-500 to-purple-500 hover:opacity-90"
            >
              <Plus size={16} />
              Create Task
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stat icon={<Users />} label="Total Users" value={stats.totalUsers} />
            <Stat icon={<CheckCircle />} label="Tasks Completed" value={stats.tasksCompleted} />
            <Stat icon={<FileText />} label="Pending Reviews" value={stats.pendingReviews} />
            <Stat icon={<Award />} label="Rewards Issued" value={stats.rewardsIssued} />
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
              <div className="flex items-center gap-2">
                <Search size={14} />
                <input
                  className="bg-background border rounded px-2 py-1 text-sm"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {filteredRecent.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No recent activity
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {filteredRecent.map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between"
                  >
                    <span>📌 {r.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.time}
                    </span>
                  </li>
                ))}
              </ul>
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
                className="px-4 py-2 text-white rounded bg-gradient-to-r from-green-500 to-purple-500"
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
        {value}
      </h3>
    </div>
  </div>
);

export default Dashboard;
