"use client";

import { useEffect, useState } from "react";
import React from "react";
import feather from "feather-icons";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { Pagination } from "@/components/ui/Pagination";
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  subscribedToUpdates: boolean;
  status: 'new' | 'read' | 'responded';
  createdAt: string;
  updatedAt: string;
}

/* ---------------- COMPONENT ---------------- */

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "new" | "read" | "responded"
  >("All");

  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    feather.replace();
    fetchMessages();
  }, [statusFilter, pagination.page, pagination.limit]);

  /* ---------------- DATA FETCHING ---------------- */

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (statusFilter !== "All") {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/contact?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contact messages');
      
      const data = await response.json();
      setMessages(data.messages);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STATUS UPDATE ---------------- */

  const updateMessageStatus = async (messageId: string, status: 'new' | 'read' | 'responded') => {
    try {
      setUpdating(messageId);
      
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update message status');
      
      const result = await response.json();
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, status, updatedAt: new Date().toISOString() }
          : msg
      ));

      // Show success message
      toast.success(`Message marked as ${status}`);
      
    } catch (error) {
      console.error('Error updating message status:', error);
      toast.error('Failed to update message status');
    } finally {
      setUpdating(null);
    }
  };

  /* ---------------- RENDER ---------------- */

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case 'new':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'read':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'responded':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {["All", "new", "read", "responded"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st as any);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    statusFilter === st
                      ? "bg-purple-600 text-white"
                      : "bg-muted hover:bg-muted/80"
                  } disabled:opacity-50`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Table */}
          <div className="bg-card border rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-muted-foreground">Loading contact messages...</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Subject</th>
                        <th className="text-left p-4 font-medium">Message</th>
                        <th className="text-left p-4 font-medium">Newsletter</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-muted-foreground">
                            No contact messages found
                          </td>
                        </tr>
                      ) : (
                        messages.map((message) => (
                          <React.Fragment key={message._id}>
                            <tr className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-4 font-medium">{message.name}</td>
                              <td className="p-4 text-sm">{message.email}</td>
                              <td className="p-4 text-sm">{message.subject}</td>
                              <td className="p-4 text-sm">
                                {expandedMessage === message._id 
                                  ? message.message 
                                  : truncateMessage(message.message)
                                }
                              </td>
                              <td className="p-4 text-sm">
                                {message.subscribedToUpdates ? (
                                  <span className="text-green-600">Yes</span>
                                ) : (
                                  <span className="text-muted-foreground">No</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={getStatusBadge(message.status)}>
                                  {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setExpandedMessage(
                                      expandedMessage === message._id ? null : message._id
                                    )}
                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                    title={expandedMessage === message._id ? "Hide message" : "View full message"}
                                  >
                                    <i data-feather="eye" className="w-4 h-4"></i>
                                  </button>
                                  
                                  {message.status !== 'read' && (
                                    <button
                                      onClick={() => updateMessageStatus(message._id, 'read')}
                                      disabled={updating === message._id}
                                      className="text-yellow-500 hover:text-yellow-700 transition-colors disabled:opacity-50"
                                      title="Mark as read"
                                    >
                                      <i data-feather="check" className="w-4 h-4"></i>
                                    </button>
                                  )}
                                  
                                  {message.status !== 'responded' && (
                                    <button
                                      onClick={() => updateMessageStatus(message._id, 'responded')}
                                      disabled={updating === message._id}
                                      className="text-green-500 hover:text-green-700 transition-colors disabled:opacity-50"
                                      title="Mark as responded"
                                    >
                                      <i data-feather="check-circle" className="w-4 h-4"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expanded Message Row */}
                            {expandedMessage === message._id && (
                              <tr>
                                <td colSpan={8} className="p-4 bg-muted/20">
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="font-semibold text-sm mb-2">Full Message:</h4>
                                      <div className="bg-background border rounded-lg p-3 text-sm whitespace-pre-wrap">
                                        {message.message}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Submitted: {new Date(message.createdAt).toLocaleString()}</span>
                                      <span>Updated: {new Date(message.updatedAt).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden">
                  {messages.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No contact messages found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {messages.map((message) => (
                        <div key={message._id} className="p-4 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{message.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {message.email}
                              </div>
                            </div>
                            <span className={getStatusBadge(message.status)}>
                              {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                            </span>
                          </div>

                          {/* Subject */}
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{message.subject}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Message */}
                          <div className="text-sm">
                            {expandedMessage === message._id 
                              ? message.message 
                              : truncateMessage(message.message, 80)
                            }
                          </div>

                          {/* Newsletter */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Newsletter:</span>
                            {message.subscribedToUpdates ? (
                              <span className="text-green-600">Subscribed</span>
                            ) : (
                              <span className="text-muted-foreground">Not subscribed</span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setExpandedMessage(
                                expandedMessage === message._id ? null : message._id
                              )}
                              className="flex-1 text-blue-500 text-sm hover:text-blue-700 transition-colors py-2 px-3 border border-blue-200 rounded-lg hover:bg-blue-50"
                            >
                              {expandedMessage === message._id ? 'Hide' : 'View'}
                            </button>
                            
                            {message.status !== 'read' && (
                              <button
                                onClick={() => updateMessageStatus(message._id, 'read')}
                                disabled={updating === message._id}
                                className="flex-1 text-yellow-500 text-sm hover:text-yellow-700 transition-colors py-2 px-3 border border-yellow-200 rounded-lg hover:bg-yellow-50 disabled:opacity-50"
                              >
                                {updating === message._id ? '...' : 'Mark Read'}
                              </button>
                            )}
                            
                            {message.status !== 'responded' && (
                              <button
                                onClick={() => updateMessageStatus(message._id, 'responded')}
                                disabled={updating === message._id}
                                className="flex-1 text-green-500 text-sm hover:text-green-700 transition-colors py-2 px-3 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50"
                              >
                                {updating === message._id ? '...' : 'Responded'}
                              </button>
                            )}
                          </div>

                          {/* Expanded Message */}
                          {expandedMessage === message._id && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                              <div>
                                <h4 className="font-semibold text-sm mb-2">Full Message:</h4>
                                <div className="bg-muted/30 rounded-lg p-3 text-sm whitespace-pre-wrap">
                                  {message.message}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Submitted: {new Date(message.createdAt).toLocaleString()}</span>
                                <span>Updated: {new Date(message.updatedAt).toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {messages.length > 0 && (
                  <div className="p-4 border-t">
                    <Pagination
                      currentPage={pagination.page}
                      totalItems={pagination.total}
                      itemsPerPage={pagination.limit}
                      onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
