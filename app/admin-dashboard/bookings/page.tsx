"use client";

import { useEffect, useState } from "react";
import React from "react";
import feather from "feather-icons";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { Pagination } from "@/components/ui/Pagination";
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */

interface Booking {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'completed';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    userAgent?: string;
    ip?: string;
    [key: string]: any;
  };
}

/* ---------------- COMPONENT ---------------- */

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "pending" | "contacted" | "completed"
  >("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    feather.replace();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/booking");
      
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      let allBookings = data.bookings || [];

      // Apply status filter
      let filteredBookings = allBookings;
      if (statusFilter !== "All") {
        filteredBookings = allBookings.filter(
          (booking: Booking) => booking.status === statusFilter
        );
      }

      // Calculate pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
      
      setBookings(paginatedBookings);
      setTotalPages(Math.ceil(filteredBookings.length / itemsPerPage));
      setTotalFilteredItems(filteredBookings.length);
      
      // Store total filtered count for pagination
      return { filteredBookings, paginatedBookings };
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
      return { filteredBookings: [], paginatedBookings: [] };
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setIsUpdating(bookingId);
      
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      const data = await response.json();
      
      // Update local state immediately
      setBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus as any, updatedAt: data.booking.updatedAt }
            : booking
        )
      );

      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking status");
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`;
      case "contacted":
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400`;
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateMessage = (message?: string) => {
    if (!message) return "—";
    return message.length > 50 ? message.substring(0, 50) + "..." : message;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {["All", "pending", "contacted", "completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              
              <button
                onClick={fetchBookings}
                className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                <i data-feather="refresh-cw" className="w-4 h-4"></i>
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : bookings.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <i data-feather="calendar" className="w-8 h-8 text-muted-foreground"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {statusFilter === "All" 
                    ? "No booking requests have been submitted yet."
                    : `No bookings with status "${statusFilter}" found.`
                  }
                </p>
              </div>
            ) : (
              /* Bookings Table */
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-foreground">
                              {booking.companyName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-foreground">
                              {booking.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-muted-foreground">
                              {booking.phone || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-muted-foreground max-w-xs">
                              {booking.message && booking.message.length > 50 ? (
                                <div>
                                  {truncateMessage(booking.message)}
                                  <button
                                    onClick={() => {
                                      // You could implement a modal here to show full message
                                      alert(booking.message);
                                    }}
                                    className="text-primary hover:text-primary/80 ml-1"
                                  >
                                    View more
                                  </button>
                                </div>
                              ) : (
                                truncateMessage(booking.message)
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-muted-foreground">
                              {formatDate(booking.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {booking.status === "pending" && (
                                <button
                                  onClick={() => updateBookingStatus(booking._id, "contacted")}
                                  disabled={isUpdating === booking._id}
                                  className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isUpdating === booking._id ? "Updating..." : "Mark Contacted"}
                                </button>
                              )}
                              {booking.status === "contacted" && (
                                <button
                                  onClick={() => updateBookingStatus(booking._id, "completed")}
                                  disabled={isUpdating === booking._id}
                                  className="px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isUpdating === booking._id ? "Updating..." : "Mark Complete"}
                                </button>
                              )}
                              {booking.status === "completed" && (
                                <span className="text-xs text-muted-foreground">Completed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && bookings.length > 0 && totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalFilteredItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
