"use client";

import React, { useEffect, useState } from "react";
import AdminHeader from "@/components/admin-dashboard/AdminHeader";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";
import Chart from "chart.js/auto";
import { Users, Award, FileText, CheckCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [rewardPoints, setRewardPoints] = useState<number | "">("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let userGrowthChart: Chart | null = null;
    let taskChartInstance: Chart | null = null;

    const growthCanvas = document.getElementById("userGrowthChart") as HTMLCanvasElement;
    if (growthCanvas) {
      userGrowthChart = new Chart(growthCanvas, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: "Total Users",
            data: [1200, 1900, 3000, 5000, 8600, 12840],
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            tension: 0.4,
            fill: true,
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });
    }

    const taskCanvas = document.getElementById("taskChart") as HTMLCanvasElement;
    if (taskCanvas) {
      taskChartInstance = new Chart(taskCanvas, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Pending", "Failed"],
          datasets: [{
            data: [75, 15, 10],
            backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
            borderWidth: 0,
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: "75%", plugins: { legend: { position: "bottom" } } },
      });
    }

    return () => {
      userGrowthChart?.destroy();
      taskChartInstance?.destroy();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black tracking-tight">System Dashboard</h2>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-transform active:scale-95">
              <Plus className="w-5 h-5" />
              <span className="font-bold">Create Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard icon={<Users />} color="bg-indigo-500" label="Total Users" value="12,840" />
            <StatCard icon={<CheckCircle />} color="bg-emerald-500" label="Verified Tasks" value="4,520" />
            <StatCard icon={<FileText />} color="bg-amber-500" label="Pending Approval" value="86" />
            <StatCard icon={<Award />} color="bg-blue-500" label="Points Issued" value="125,000" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-card rounded-[2.5rem] p-8 border border-border h-96">
                <h3 className="font-bold mb-4">User Acquisition</h3>
                <div className="h-full pb-8"><canvas id="userGrowthChart"></canvas></div>
            </div>
            <div className="bg-card rounded-[2.5rem] p-8 border border-border h-96">
                <h3 className="font-bold mb-4">Task Distribution</h3>
                <div className="h-full pb-8"><canvas id="taskChart"></canvas></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon, color, label, value }: any) => (
  <div className="bg-card rounded-[2rem] p-6 border border-border flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`p-3 rounded-2xl ${color} text-white`}>{React.cloneElement(icon, { size: 20 })}</div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <h3 className="text-2xl font-black">{value}</h3>
    </div>
  </div>
);

export default Dashboard;