"use client";

import { useState, useEffect } from "react";
import type { FormEvent, JSX } from "react";
import { ArrowUp, ArrowDown, Gift, ShoppingCart, Search, X, CheckCircle, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { toast } from "sonner";

// Navigation Imports
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";
import TransactionCard, { Transaction } from "@/components/transactions/TransactionCard";


export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskPoints, setTaskPoints] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user data and transactions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user balance
        const balanceResponse = await fetch('/api/user/balance');
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setTaskPoints(balanceData.taskPoints || 0);
        }

        // Fetch transactions
        await fetchTransactions();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const fetchTransactions = async (page = currentPage) => {
    try {
      setTransactionsLoading(true);
      const response = await fetch(`/api/transactions?page=${page}&limit=10&sort=desc`);
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        console.error('Failed to fetch transactions');
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleWithdraw = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowModal(false);
      toast.success('Withdrawal request submitted successfully!');
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. SIDEBAR */}
      <UserSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. HEADER */}
        <UserHeader />

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            <h1 className="text-3xl font-bold tracking-tight">My Transactions</h1>

            {/* Balance Card */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total TaskPoints</h2>
                  <div className="text-4xl font-black text-primary mb-2">{taskPoints.toLocaleString()} TP</div>
                  <div className="text-sm text-muted-foreground">≈ ${(taskPoints * 0.0006).toFixed(2)} USD (1 TP = $0.0006)</div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowModal(true)} 
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
                  >
                    Withdraw TP
                  </button>
                  <button className="px-8 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all">
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Transaction History</h3>
                <div className="relative w-64">
                    <input 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/20" 
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
                {transactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No transactions found matching your search.' : 'No transactions yet. Start completing tasks to earn points!'}
                  </div>
                ) : (
                  filteredTransactions.map((t) => (
                    <TransactionCard key={t._id} transaction={t} />
                  ))
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-muted border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-muted border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Withdraw Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">Withdraw TP</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Amount (TP)</label>
                <input required min="500" type="number" placeholder="Min 500 TP" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Wallet Address</label>
                <input required type="text" placeholder="Enter Address" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20" />
              </div>

              <button type="submit" disabled={isProcessing} className="w-full py-4 bg-gradient-to-r from-green-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                {isProcessing ? "Processing..." : "Confirm Withdrawal"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}