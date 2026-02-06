"use client";

import feather from "feather-icons";
import { Edit, Eye, Trash2, Loader2, Search, CheckSquare } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";

interface Task {
  _id: string;
  title: string;
  description: string;
  category: 'social' | 'content' | 'commerce';
  rewardPoints: number;
  validationType: string;
  instructions: string;
  taskLink: string;
  alternateUrl: string;
  deadline: string | null;
  status: 'active' | 'expired' | 'disabled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const ManageTasks = () => {
  /* ------------------ STATE ------------------ */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [viewTask, setViewTask] = useState<any>(null);
  const [editTask, setEditTask] = useState<any>(null);

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

  /* ------------------ API FUNCTIONS ------------------ */
  const fetchTasks = async (filters?: {
    category?: string;
    status?: string;
    dateRange?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.dateRange && filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const url = params.toString() ? `/api/admin/tasks?${params.toString()}` : '/api/admin/tasks';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data.tasks || []);
      setFilteredTasks(data.tasks || []);
      setPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    feather.replace();
    fetchTasks({ page: currentPage, limit: itemsPerPage });
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      fetchTasks({
        category: categoryFilter,
        status: statusFilter,
        dateRange: dateRangeFilter,
        search: searchQuery,
        page: 1,
        limit: itemsPerPage
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [categoryFilter, statusFilter, dateRangeFilter, searchQuery, itemsPerPage]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchTasks({
      category: categoryFilter,
      status: statusFilter,
      dateRange: dateRangeFilter,
      search: searchQuery,
      page: newPage,
      limit: itemsPerPage
    });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page
    fetchTasks({
      category: categoryFilter,
      status: statusFilter,
      dateRange: dateRangeFilter,
      search: searchQuery,
      page: 1,
      limit: newLimit
    });
  };

  /* ------------------ HANDLERS ------------------ */
  const openViewModal = (task: any) => {
    setViewTask(task);
    setShowViewModal(true);
  };

  const openEditModal = (task: any) => {
    setEditTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setRewardPoints(task.rewardPoints);
    setValidationType(task.validationType);
    setInstructions(task.instructions);
    setTaskLink(task.taskLink);
    setAlternateUrl(task.alternateUrl || '');
    setDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
    setStatus(task.status);
    setShowEditModal(true);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/tasks/${editTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          rewardPoints: Number(rewardPoints),
          validationType,
          instructions,
          taskLink,
          alternateUrl,
          deadline: deadline || null,
          status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      const data = await response.json();
      toast.success('Task updated successfully!');
      
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
      setEditTask(null);
      setShowEditModal(false);
      
      // Refresh tasks list
      fetchTasks({
        category: categoryFilter,
        status: statusFilter,
        dateRange: dateRangeFilter,
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      console.log('Creating task with data:', requestData);

      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || errorData.details?.join(', ') || 'Failed to create task');
      }

      const data = await response.json();
      console.log('Success response:', data);
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
      
      // Refresh tasks list
      fetchTasks({
        category: categoryFilter,
        status: statusFilter,
        dateRange: dateRangeFilter,
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage
      });
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
      fetchTasks({
        category: categoryFilter,
        status: statusFilter,
        dateRange: dateRangeFilter,
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTasks.length === 0) {
      toast.error('Please select tasks and an action');
      return;
    }

    if (!confirm(`Are you sure you want to ${bulkAction} ${selectedTasks.length} task(s)?`)) return;

    try {
      const response = await fetch('/api/admin/tasks/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskIds: selectedTasks,
          action: bulkAction
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      const data = await response.json();
      toast.success(data.message);
      setSelectedTasks([]);
      setBulkAction('');
      
      fetchTasks({
        category: categoryFilter,
        status: statusFilter,
        dateRange: dateRangeFilter,
        search: searchQuery,
        page: currentPage,
        limit: itemsPerPage
      });
    } catch (error: any) {
      console.error('Error performing bulk action:', error);
      toast.error(error.message || 'Failed to perform bulk action');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(task => task._id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchTasks({
      category: categoryFilter,
      status: statusFilter,
      dateRange: dateRangeFilter,
      search: searchQuery,
      page: 1,
      limit: itemsPerPage
    });
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Tasks</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-linear-to-r from-green-500 to-purple-500 text-white px-4 py-2 rounded-lg"
              >
                + Create Task
              </button>
            </div>

            {/* Filters Section */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Category Filter */}
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="commerce">Commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Available</SelectItem>
                      <SelectItem value="expired">In Progress</SelectItem>
                      <SelectItem value="disabled">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">Date Range</label>
                  <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Apply Filters Button */}
                <Button 
                  onClick={applyFilters}
                  className="bg-linear-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>

            {/* Search & Bulk Actions Row */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Search Input */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="flex gap-2 items-center">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Bulk Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delete">Delete Selected</SelectItem>
                      <SelectItem value="approve">Approve Selected</SelectItem>
                      <SelectItem value="reject">Reject Selected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleBulkAction}
                    disabled={!bulkAction || selectedTasks.length === 0}
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <Checkbox
                            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        {[
                          "Title",
                          "Category",
                          "Reward",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTasks.map((task) => (
                        <tr key={task._id} className="border-t hover:bg-muted/40">
                          <td className="px-6 py-4">
                            <Checkbox
                              checked={selectedTasks.includes(task._id)}
                              onCheckedChange={(checked) => handleSelectTask(task._id, checked as boolean)}
                            />
                          </td>
                          <td className="px-6 py-4 font-medium min-w-[200px] max-w-xs truncate">{task.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{task.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{task.rewardPoints} TP</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'active' ? 'bg-green-100 text-green-800' :
                              task.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
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
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalTasks)} of {pagination.totalTasks} tasks</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Show:</label>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                        <SelectTrigger className="w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === pagination.currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CREATE MODAL */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <form
                  onSubmit={handleCreateTask}
                  className="bg-gray-900 p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] space-y-6 text-white overflow-y-auto"
                >
                  <h3 className="text-2xl font-bold text-center sticky top-0 bg-gray-900 pb-4 border-b border-gray-700">Create Task</h3>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">Title</label>
                    <input
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
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
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="https://example.com/task"
                        value={taskLink}
                        onChange={(e) => setTaskLink(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-200">Alternate URL</label>
                      <input
                        type="url"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="https://example.com/alternate"
                        value={alternateUrl}
                        onChange={(e) => setAlternateUrl(e.target.value)}
                      />
                    </div>

                    <p className="text-xs text-gray-400 bg-gray-800 p-3 rounded-lg border border-gray-700">
                      ⚠️ At least one link is required (Task Link or Alternate URL)
                    </p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">Deadline</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  {/* Form Actions - Sticky at bottom */}
                  <div className="sticky bottom-0 bg-gray-900 pt-6 border-t border-gray-700">
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
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

            {/* EDIT MODAL */}
            {showEditModal && editTask && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <form
                  onSubmit={handleEditTask}
                  className="bg-black p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] space-y-6 text-white overflow-y-auto"
                >
                  <h3 className="text-2xl font-bold text-center sticky top-0 bg-black pb-4 border-b border-gray-700">Edit Task</h3>

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

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-200">Status</label>
                    <select
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'expired' | 'disabled')}
                      required
                    >
                      <option value="active" className="bg-gray-800">Active</option>
                      <option value="expired" className="bg-gray-800">Expired</option>
                      <option value="disabled" className="bg-gray-800">Disabled</option>
                    </select>
                  </div>

                  {/* Form Actions - Sticky at bottom */}
                  <div className="sticky bottom-0 bg-black pt-6 border-t border-gray-700">
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditTask(null);
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
                        }}
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
                            Updating...
                          </div>
                        ) : (
                          'Update Task'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW MODAL */}
            {showViewModal && viewTask && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                <div className="bg-card p-6 rounded-2xl w-full max-w-lg space-y-3 max-h-[80vh] overflow-y-auto">
                  <h3 className="text-xl font-bold">Task Details</h3>
                  <p><b>Title:</b> {viewTask.title}</p>
                  <p><b>Description:</b> {viewTask.description}</p>
                  <p><b>Category:</b> {viewTask.category}</p>
                  <p><b>Reward Points:</b> {viewTask.rewardPoints} TP</p>
                  <p><b>Validation Type:</b> {viewTask.validationType}</p>
                  <p><b>Instructions:</b> {viewTask.instructions}</p>
                  <p><b>Task Link:</b> <a href={viewTask.taskLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{viewTask.taskLink}</a></p>
                  {viewTask.alternateUrl && <p><b>Alternate URL:</b> <a href={viewTask.alternateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{viewTask.alternateUrl}</a></p>}
                  {viewTask.deadline && <p><b>Deadline:</b> {new Date(viewTask.deadline).toLocaleString()}</p>}
                  <p><b>Status:</b> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      viewTask.status === 'active' ? 'bg-green-100 text-green-800' :
                      viewTask.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewTask.status}
                    </span>
                  </p>
                  <p><b>Created:</b> {new Date(viewTask.createdAt).toLocaleString()}</p>
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
