"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock, Loader2, Building2, Wallet, User, X, Eye, Mail, Calendar as CalendarIcon, Award } from "lucide-react";
import { toast } from "sonner";
import { IWithdrawal, WithdrawalStatus, WithdrawalType, BankDetails, CryptoDetails } from "@/models/Withdrawal";

// Interface for populated user data
interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

// Extended interface to include populated user data
interface WithdrawalWithUser extends Omit<IWithdrawal, 'userId' | 'createdAt' | 'updatedAt' | '_id'> {
  _id: string;
  userId: PopulatedUser;
  createdAt: string;
  updatedAt: string;
}

// Navigation Imports
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";
import AdminHeader from "@/components/admin-dashboard/AdminHeader";

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalWithUser | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter })
      });
      
      const response = await fetch(`/api/admin/withdrawals?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        toast.error('Failed to fetch withdrawals');
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setLoadingUser(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        setUserDetails(userData);
      } else {
        toast.error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    } finally {
      setLoadingUser(false);
    }
  };

  const openWithdrawalDetails = async (withdrawal: WithdrawalWithUser) => {
    setSelectedWithdrawal(withdrawal);
    setUserDetails(null);
    setShowModal(true);
    await fetchUserDetails(withdrawal.userId._id);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedWithdrawal(null);
    setUserDetails(null);
  };

  const handleApprove = async (withdrawalId: string) => {
    try {
      setUpdatingId(withdrawalId);
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: WithdrawalStatus.APPROVED })
      });

      if (response.ok) {
        toast.success('Withdrawal approved successfully');
        fetchWithdrawals();
        closeModal();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve withdrawal');
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      setUpdatingId(withdrawalId);
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: WithdrawalStatus.REJECTED })
      });

      if (response.ok) {
        toast.success('Withdrawal rejected successfully');
        fetchWithdrawals();
        closeModal();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject withdrawal');
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.PENDING:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case WithdrawalStatus.APPROVED:
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case WithdrawalStatus.REJECTED:
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.PENDING:
        return Clock;
      case WithdrawalStatus.APPROVED:
        return CheckCircle;
      case WithdrawalStatus.REJECTED:
        return XCircle;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.withdrawalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.amount.toString().includes(searchQuery) ||
    (w.bankDetails?.bankName && w.bankDetails.bankName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.cryptoDetails?.network && w.cryptoDetails.network.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.userId.name && w.userId.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (w.userId.email && w.userId.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && withdrawals.length === 0) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold">Withdrawals</h1>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-muted border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/20"
                  />
                </div>
                
                <div className="flex gap-2">
                  {["all", WithdrawalStatus.PENDING, WithdrawalStatus.APPROVED, WithdrawalStatus.REJECTED].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as WithdrawalStatus | "all")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        statusFilter === status
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Withdrawals List */}
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : filteredWithdrawals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No withdrawals found.' : 'No withdrawals found.'}
                </div>
              ) : (
                filteredWithdrawals.map((withdrawal) => (
                  <div key={withdrawal._id} className="bg-card border border-border rounded-lg p-3 sm:p-4 hover:shadow-sm transition-all">
                    {/* Ultra Simple Mobile Layout */}
                    <div className="space-y-2 sm:space-y-3">
                      {/* User Name and Amount - Top Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground text-sm sm:text-base truncate">{withdrawal.userId.name}</div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <div className="font-semibold text-foreground text-sm sm:text-base">
                            {withdrawal.amount.toLocaleString()} TP
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            ${withdrawal.convertedAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Type and Status - Middle Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="p-1 rounded-lg bg-muted">
                            {withdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? (
                              <Building2 className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Wallet className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm font-medium">
                            {withdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? 'Bank' : 'USDT'}
                          </span>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(withdrawal.status)}`}>
                          {(() => {
                            const Icon = getStatusIcon(withdrawal.status);
                            return <Icon className="w-2.5 h-2.5" />;
                          })()}
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </div>
                      </div>

                      {/* Email and View Button - Bottom Row */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                        <div className="text-xs text-muted-foreground min-w-0 truncate">
                          {withdrawal.userId.email}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </div>
                          <button
                            onClick={() => openWithdrawalDetails(withdrawal)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-4">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-muted border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors text-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-muted border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Details Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Withdrawal Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Details */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </h3>
                {loadingUser ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : userDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{userDetails.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{userDetails.email}</span>
                    </div>
                    {userDetails.username && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Username:</span>
                        <span className="font-medium">{userDetails.username}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="font-medium">{userDetails.taskPoints?.toLocaleString() || 0} TP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Member Since:</span>
                      <span className="font-medium">
                        {userDetails.createdAt ? formatDate(userDetails.createdAt) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-medium">{userDetails.role || 'user'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Failed to load user details</div>
                )}
              </div>

              {/* Withdrawal Details */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  {selectedWithdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                  Withdrawal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">
                      {selectedWithdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? 'Bank Transfer' : 'USDT Crypto'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-medium text-red-500">
                      -{selectedWithdrawal.amount.toLocaleString()} TP (${selectedWithdrawal.convertedAmount.toFixed(2)})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedWithdrawal.status)}`}>
                      {(() => {
                        const Icon = getStatusIcon(selectedWithdrawal.status);
                        return <Icon className="w-3 h-3" />;
                      })()}
                      {selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2 font-medium">{formatDate(selectedWithdrawal.createdAt)}</span>
                  </div>
                  
                  {selectedWithdrawal.bankDetails && (
                    <>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Bank Name:</span>
                        <span className="ml-2 font-medium">{selectedWithdrawal.bankDetails.bankName}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Account Name:</span>
                        <span className="ml-2 font-medium">{selectedWithdrawal.bankDetails.accountName}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Account Number:</span>
                        <span className="ml-2 font-medium font-mono">{selectedWithdrawal.bankDetails.accountNumber}</span>
                      </div>
                    </>
                  )}
                  
                  {selectedWithdrawal.cryptoDetails && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Network:</span>
                        <span className="ml-2 font-medium">{selectedWithdrawal.cryptoDetails.network}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Wallet Address:</span>
                        <span className="ml-2 font-medium font-mono text-xs">{selectedWithdrawal.cryptoDetails.walletAddress}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedWithdrawal.status === WithdrawalStatus.PENDING && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => handleApprove(selectedWithdrawal._id)}
                    disabled={updatingId === selectedWithdrawal._id}
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updatingId === selectedWithdrawal._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  
                  <button
                    onClick={() => handleReject(selectedWithdrawal._id)}
                    disabled={updatingId === selectedWithdrawal._id}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updatingId === selectedWithdrawal._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
