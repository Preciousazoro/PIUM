"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Loader2,
  Building2,
  Wallet,
  Calendar,
  User,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { WithdrawalStatus, WithdrawalType, CryptoNetwork } from "@/models/Withdrawal";

// Navigation Imports
import AdminHeader from "@/components/admin-dashboard/AdminHeader";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";

interface Withdrawal {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  amount: number;
  convertedAmount: number;
  withdrawalType: WithdrawalType;
  status: WithdrawalStatus;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  cryptoDetails?: {
    network: CryptoNetwork;
    walletAddress: string;
  };
  processingTime?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [adminNote, setAdminNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, filter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filter !== 'all' && { status: filter })
      });
      
      const response = await fetch(`/api/admin/payments?${params}`);
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

  const handleStatusUpdate = async (withdrawalId: string, status: WithdrawalStatus, note?: string) => {
    try {
      setUpdatingId(withdrawalId);
      
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawalId,
          status,
          adminNote: note
        }),
      });

      if (response.ok) {
        // Update local state
        setWithdrawals(prev => 
          prev.map(w => 
            w._id === withdrawalId 
              ? { ...w, status, adminNote: note, updatedAt: new Date().toISOString() }
              : w
          )
        );
        
        toast.success(`Withdrawal ${status === WithdrawalStatus.APPROVED ? 'approved' : 'rejected'} successfully`);
        setShowNoteModal(false);
        setAdminNote('');
        setSelectedWithdrawal(null);
        setActionType(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update withdrawal');
      }
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast.error('Failed to update withdrawal');
    } finally {
      setUpdatingId(null);
    }
  };

  const openActionModal = (withdrawal: Withdrawal, action: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setShowNoteModal(true);
    setAdminNote('');
  };

  const confirmAction = () => {
    if (!selectedWithdrawal || !actionType) return;
    
    const status = actionType === 'approve' ? WithdrawalStatus.APPROVED : WithdrawalStatus.REJECTED;
    handleStatusUpdate(selectedWithdrawal._id, status, adminNote);
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    const styles = {
      [WithdrawalStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      [WithdrawalStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      [WithdrawalStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };

    const icons = {
      [WithdrawalStatus.PENDING]: <Clock className="w-3 h-3" />,
      [WithdrawalStatus.APPROVED]: <CheckCircle className="w-3 h-3" />,
      [WithdrawalStatus.REJECTED]: <XCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.userId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.amount.toString().includes(searchQuery)
  );

  if (loading && withdrawals.length === 0) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
                <p className="text-muted-foreground mt-2">Manage user withdrawal requests</p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                <span className="text-2xl font-bold">{withdrawals.length} Requests</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  placeholder="Search by name, email, or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/20"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Withdrawals List */}
            <div className="space-y-4">
              {filteredWithdrawals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No withdrawal requests found</p>
                </div>
              ) : (
                filteredWithdrawals.map((withdrawal) => (
                  <div key={withdrawal._id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* User Avatar */}
                          {withdrawal.userId.avatarUrl ? (
                            <img
                              src={withdrawal.userId.avatarUrl}
                              alt={withdrawal.userId.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                              {withdrawal.userId.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          
                          <div>
                            <h3 className="font-semibold">{withdrawal.userId.name}</h3>
                            <p className="text-sm text-muted-foreground">{withdrawal.userId.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Amount Info */}
                          <div className="text-right">
                            <div className="font-bold text-lg">{withdrawal.amount.toLocaleString()} TP</div>
                            <div className="text-sm text-muted-foreground">${withdrawal.convertedAmount.toFixed(2)} USD</div>
                          </div>

                          {/* Status */}
                          {getStatusBadge(withdrawal.status)}

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedId(expandedId === withdrawal._id ? null : withdrawal._id)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {withdrawal.status === WithdrawalStatus.PENDING && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openActionModal(withdrawal, 'approve')}
                                  disabled={updatingId === withdrawal._id}
                                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm"
                                >
                                  {updatingId === withdrawal._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Approve'
                                  )}
                                </button>
                                <button
                                  onClick={() => openActionModal(withdrawal, 'reject')}
                                  disabled={updatingId === withdrawal._id}
                                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedId === withdrawal._id && (
                        <div className="mt-6 pt-6 border-t border-border space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Withdrawal Details */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                {withdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? (
                                  <Building2 className="w-4 h-4" />
                                ) : (
                                  <Wallet className="w-4 h-4" />
                                )}
                                Withdrawal Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Method:</span>
                                  <span className="font-medium">
                                    {withdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? 'Bank Transfer' : 'USDT Crypto'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Processing Time:</span>
                                  <span className="font-medium">{withdrawal.processingTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Requested:</span>
                                  <span className="font-medium">
                                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {withdrawal.updatedAt !== withdrawal.createdAt && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span className="font-medium">
                                      {new Date(withdrawal.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Payment Details */}
                            <div>
                              <h4 className="font-medium mb-3">Payment Information</h4>
                              {withdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? (
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Bank Name:</span>
                                    <p className="font-medium">{withdrawal.bankDetails?.bankName}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Account Name:</span>
                                    <p className="font-medium">{withdrawal.bankDetails?.accountName}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Account Number:</span>
                                    <p className="font-medium">{withdrawal.bankDetails?.accountNumber}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Network:</span>
                                    <p className="font-medium">{withdrawal.cryptoDetails?.network}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Wallet Address:</span>
                                    <p className="font-medium break-all">{withdrawal.cryptoDetails?.walletAddress}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Admin Note */}
                          {withdrawal.adminNote && (
                            <div className="bg-muted/30 border border-border rounded-lg p-4">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Admin Note
                              </h4>
                              <p className="text-sm">{withdrawal.adminNote}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-muted border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-muted border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showNoteModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-bold">{selectedWithdrawal.amount.toLocaleString()} TP</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="font-medium">{selectedWithdrawal.userId.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Method:</span>
                  <span className="font-medium">
                    {selectedWithdrawal.withdrawalType === WithdrawalType.BANK_TRANSFER ? 'Bank Transfer' : 'USDT Crypto'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Admin Note {actionType === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={actionType === 'reject' ? 'Reason for rejection...' : 'Add any notes...'}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/20 resize-none"
                  rows={3}
                  required={actionType === 'reject'}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setAdminNote('');
                    setSelectedWithdrawal(null);
                    setActionType(null);
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionType === 'reject' && !adminNote.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
