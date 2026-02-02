"use client";

import feather from "feather-icons";
import { Edit, Eye, Trash2, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";

interface Task {
  _id: string;
  title: string;
  category: string;
  reward: number;
  status: 'Active' | 'Draft' | 'Paused';
  participants: number;
  description?: string;
  instructions?: string;
  proofType?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

const ManageTasks = () => {
  /* ------------------ API FUNCTIONS ------------------ */
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    feather.replace();
    fetchTasks();
  }, []);

  /* ------------------ STATE ------------------ */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [viewTask, setViewTask] = useState<any>(null);
  const [editTask, setEditTask] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [reward, setReward] = useState<number | "">("");
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Paused'>('Draft');
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [proofType, setProofType] = useState('Screenshot');

  /* ------------------ HANDLERS ------------------ */
  const openViewModal = (task: any) => {
    setViewTask(task);
    setShowViewModal(true);
  };

  const openEditModal = (task: any) => {
    setEditTask(task);
    setShowEditModal(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          category,
          reward: Number(reward),
          status,
          description,
          instructions,
          proofType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const data = await response.json();
      toast.success('Task created successfully!');
      
      // Reset form
      setTitle("");
      setCategory("");
      setReward("");
      setStatus('Draft');
      setDescription("");
      setInstructions("");
      setProofType('Screenshot');
      setShowCreateModal(false);
      
      // Refresh tasks list
      fetchTasks();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;

    try {
      const response = await fetch(`/api/admin/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
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
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
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
                      <tr key={task._id} className="border-t hover:bg-muted/40">
                        <td className="px-6 py-4 font-medium">{task.title}</td>
                        <td className="px-6 py-4">{task.category}</td>
                        <td className="px-6 py-4">{task.reward} TP</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'Active' ? 'bg-green-100 text-green-800' :
                            task.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{task.participants}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => openViewModal(task)}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEditModal(task)}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteTask(task._id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                    value={reward}
                    onChange={(e) =>
                      setReward(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    required
                  />

                  <select
                    className="w-full border rounded px-3 py-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Draft' | 'Paused')}
                    required
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>

                  <textarea
                    className="w-full border rounded px-3 py-2"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />

                  <textarea
                    className="w-full border rounded px-3 py-2"
                    placeholder="Instructions (optional)"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                  />

                  <select
                    className="w-full border rounded px-3 py-2"
                    value={proofType}
                    onChange={(e) => setProofType(e.target.value)}
                  >
                    <option value="Screenshot">Screenshot</option>
                    <option value="Username">Username</option>
                    <option value="Text">Text</option>
                    <option value="Link">Link</option>
                  </select>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border rounded"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        'Create'
                      )}
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
                  <p><b>Reward:</b> {viewTask.reward} TP</p>
                  <p><b>Status:</b> {viewTask.status}</p>
                  <p><b>Participants:</b> {viewTask.participants}</p>
                  {viewTask.description && <p><b>Description:</b> {viewTask.description}</p>}
                  {viewTask.instructions && <p><b>Instructions:</b> {viewTask.instructions}</p>}
                  {viewTask.proofType && <p><b>Proof Type:</b> {viewTask.proofType}</p>}
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
