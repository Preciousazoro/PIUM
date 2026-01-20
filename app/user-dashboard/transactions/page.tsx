"use client";

import { useState, useEffect } from "react";
import type { FormEvent, JSX } from "react";
import { ArrowUp, ArrowDown, Gift, ShoppingCart, Search, X, CheckCircle, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";

// Navigation Imports
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

type IconName = "ArrowUp" | "ArrowDown" | "Gift" | "ShoppingCart";
type Transaction = {
  id: string;
  createdAt: string;
  type: "earned" | "withdrawn" | "bonus" | "spent";
  description: string;
  amount: number;
  status: "approved" | "pending" | "failed";
  reference?: string;
};

export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock Data
  const [transactions] = useState<Transaction[]>([
    { id: "1", createdAt: new Date().toISOString(), type: "earned", description: "X Follow Task", amount: 50, status: "approved", reference: "REF-9921" },
    { id: "2", createdAt: new Date().toISOString(), type: "withdrawn", description: "Withdrawal to Wallet", amount: -500, status: "pending", reference: "WDR-0012" },
    { id: "3", createdAt: new Date().toISOString(), type: "bonus", description: "Daily Login Bonus", amount: 10, status: "approved", reference: "BNS-4412" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getIconByType = (type: Transaction["type"]): IconName => {
    switch (type) {
      case "earned": return "ArrowUp";
      case "withdrawn": return "ArrowDown";
      case "bonus": return "Gift";
      default: return "ShoppingCart";
    }
  };

  const getIcon = (iconName: IconName): JSX.Element => {
    const icons = { ArrowUp, ArrowDown, Gift, ShoppingCart };
    const Icon = icons[iconName];
    return <Icon className="w-4 h-4" />;
  };

  const handleWithdraw = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
                  <div className="text-4xl font-black text-primary mb-2">1,250 TP</div>
                  <div className="text-sm text-muted-foreground">≈ $0.75 USD (1 TP = $0.0006)</div>
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
                    <input placeholder="Search..." className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/20" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-muted group-hover:bg-primary/10 transition-colors rounded-xl p-3">
                            {getIcon(getIconByType(t.type))}
                        </div>
                        <div>
                          <div className="font-bold">{t.description}</div>
                          <div className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">{t.reference}</div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(t.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black ${t.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                          {t.amount > 0 ? "+" : ""}{t.amount} TP
                        </div>
                        <div className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded ${
                            t.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                            {t.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Withdrawal Request Submitted!</span>
          </div>
        </div>
      )}
    </div>
  );
}