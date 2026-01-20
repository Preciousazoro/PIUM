"use client";

import feather from "feather-icons";
import { Edit, Eye, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";

/* ------------------ MOCK DATA ------------------ */
const MOCK_TASKS = [
  {
    id: "1",
    title: "Follow us on X",
    category: "Social",
    rewardPoints: 50,
    status: "Active",
    deadline: new Date().toISOString(),
    participants: 120,
    description: "Follow our official X account",
    instructions: "Take a screenshot after following",
    proofType: "Screenshot",
  },
  {
    id: "2",
    title: "Join Telegram",
    category: "Community",
    rewardPoints: 30,
    status: "Draft",
    deadline: "",
    participants: 45,
    description: "Join our Telegram community",
    instructions: "Provide username",
    proofType: "Username",
  },
];

const ManageTasks = () => {
  useEffect(() => {
    feather.replace();
  }, []);

  /* ------------------ STATE ------------------ */
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [viewTask, setViewTask] = useState<any>(null);
  const [editTask, setEditTask] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [rewardPoints, setRewardPoints] = useState<number | "">("");

  /* ------------------ HANDLERS ------------------ */
  const openViewModal = (task: any) => {
    setViewTask(task);
    setShowViewModal(true);
  };

  const openEditModal = (task: any) => {
    setEditTask(task);
    setShowEditModal(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();

    const newTask = {
      id: Date.now().toString(),
      title,
      category,
      rewardPoints,
      status: "Active",
      participants: 0,
      deadline: "",
      description: "",
      instructions: "",
      proofType: "Screenshot",
    };

    setTasks((prev) => [newTask, ...prev]);
    setShowCreateModal(false);
    setTitle("");
    setCategory("");
    setRewardPoints("");
  };

  const handleDeleteTask = (id: string) => {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Tasks</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-500 to-purple-500 text-white px-4 py-2 rounded-lg"
              >
                + Create Task
              </button>
            </div>

            {/* Tasks Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {[
                      "Title",
                      "Category",
                      "Reward",
                      "Status",
                      "Participants",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-t hover:bg-muted/40">
                      <td className="px-6 py-4 font-medium">{task.title}</td>
                      <td className="px-6 py-4">{task.category}</td>
                      <td className="px-6 py-4">{task.rewardPoints} TP</td>
                      <td className="px-6 py-4">{task.status}</td>
                      <td className="px-6 py-4">{task.participants}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openViewModal(task)}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEditModal(task)}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                <form
                  onSubmit={handleCreateTask}
                  className="bg-card p-6 rounded-2xl w-full max-w-lg space-y-4"
                >
                  <h3 className="text-xl font-bold">Create Task</h3>

                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <select
                    className="w-full border rounded px-3 py-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    <option>Social</option>
                    <option>Community</option>
                    <option>Referral</option>
                  </select>

                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Reward Points"
                    value={rewardPoints}
                    onChange={(e) =>
                      setRewardPoints(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    required
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
                      className="px-4 py-2 bg-purple-600 text-white rounded"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW MODAL */}
            {showViewModal && viewTask && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                <div className="bg-card p-6 rounded-2xl w-full max-w-lg space-y-3">
                  <h3 className="text-xl font-bold">Task Details</h3>
                  <p><b>Title:</b> {viewTask.title}</p>
                  <p><b>Category:</b> {viewTask.category}</p>
                  <p><b>Reward:</b> {viewTask.rewardPoints} TP</p>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="mt-4 px-4 py-2 border rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageTasks;
