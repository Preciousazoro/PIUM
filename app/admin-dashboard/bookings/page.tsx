"use client";

import { useEffect, useState } from "react";
import React from "react";
import feather from "feather-icons";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { Pagination } from "@/components/ui/Pagination";
import { toast } from "sonner";
import { sanitizePhone } from "@/lib/utils/phoneSanitizer";
import Modal from "@/components/ui/Modal";

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
  
  // Reply modal state
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    feather.replace();
  }, [bookings]); // Re-initialize icons when bookings data changes

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

  const openReplyModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setReplySubject("Regarding Your Booking");
    setReplyMessage("");
    setIsReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedBooking(null);
    setReplySubject("");
    setReplyMessage("");
  };

  const sendReply = async () => {
    if (!selectedBooking || !replySubject.trim() || !replyMessage.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSendingReply(true);
      
      const response = await fetch("/api/admin/bookings/reply", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          subject: replySubject.trim(),
          message: replyMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reply");
      }

      const data = await response.json();
      
      // Update booking in local state
      setBookings(prev => 
        prev.map(booking => 
          booking._id === selectedBooking._id 
            ? { ...booking, status: data.booking.status, updatedAt: data.booking.updatedAt }
            : booking
        )
      );

      toast.success("Reply sent successfully");
      closeReplyModal();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send reply");
    } finally {
      setIsSendingReply(false);
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
              <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                {["All", "pending", "contacted", "completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setCurrentPage(1);
                    }}
                    className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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
                              {/* Communication Icons */}
                              <div className="flex items-center gap-1">
                                {booking.phone && (
                                  <>
                                    <a
                                      href={`tel:${sanitizePhone(booking.phone)}`}
                                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                      title="Call"
                                    >
                                      <i data-feather="phone" className="w-4 h-4"></i>
                                    </a>
                                    <a
                                      href={`https://wa.me/${sanitizePhone(booking.phone)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                      title="Open WhatsApp"
                                    >
                                      <i data-feather="message-circle" className="w-4 h-4"></i>
                                    </a>
                                  </>
                                )}
                                <a
                                  href={`mailto:${booking.email}?subject=Regarding Your Booking`}
                                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                  title="Send Email"
                                >
                                  <i data-feather="mail" className="w-4 h-4"></i>
                                </a>
                              </div>
                              
                              {/* Divider */}
                              <div className="w-px h-4 bg-border"></div>
                              
                              {/* Status Update Actions */}
                              <button
                                onClick={() => openReplyModal(booking)}
                                className="px-3 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 transition-colors"
                              >
                                Reply
                              </button>
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

      {/* Reply Modal */}
      <Modal 
        isOpen={isReplyModalOpen} 
        onClose={closeReplyModal}
        title="Send Reply"
      >
        <div className="space-y-4">
          {selectedBooking && (
            <>
              {/* Recipient Info */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">To:</span>
                    <span className="text-foreground">{selectedBooking.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">Company:</span>
                    <span className="text-foreground">{selectedBooking.companyName}</span>
                  </div>
                  {selectedBooking.phone && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">Phone:</span>
                      <span className="text-foreground">{selectedBooking.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter subject"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Type your message here..."
                />
                <div className="mt-1 text-xs text-muted-foreground text-right">
                  {replyMessage.length}/2000 characters
                </div>
              </div>

              {/* Original Message (if exists) */}
              {selectedBooking.message && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Original Message:</span>
                    <p className="mt-1 text-foreground whitespace-pre-wrap">
                      {selectedBooking.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={sendReply}
                  disabled={isSendingReply || !replySubject.trim() || !replyMessage.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSendingReply ? "Sending..." : "Send Reply"}
                </button>
                <button
                  onClick={closeReplyModal}
                  disabled={isSendingReply}
                  className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
