"use client";

import { Bell, Menu, User, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ModeToggle from "@/components/ui/ModeToggle";

export default function UserHeader({ title }: { title?: string }) {
  const [points] = useState<number>(1250); // Simulated Points
  const [notifOpen, setNotifOpen] = useState(false);
  const [newCount, setNewCount] = useState<number>(3);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = () => {
    // Plain code logout simulation
    router.push("/auth/login");
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="sticky top-0 z-40 py-4 px-6 flex justify-between items-center border-b bg-background text-foreground border-border transition-colors duration-300">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <img
            src="/taskkash-logo.png"
            alt="TaskKash Logo"
            className="w-12 h-12 object-contain"
          />
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-purple-600 ml-2 tracking-tight">
          TASKKASH
        </span>
      </div>

      {title && (
        <div className="hidden md:block text-lg font-semibold tracking-tight">{title}</div>
      )}

      <div className="hidden md:flex items-center space-x-4">
        <ModeToggle />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="p-2 rounded-full hover:bg-muted transition relative"
            onClick={() => {
              setNotifOpen((v) => !v);
              setNewCount(0);
            }}
          >
            <Bell className="w-5 h-5 text-foreground" />
            {newCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-green-500 text-black text-[10px] flex items-center justify-center font-semibold">
                {newCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-border text-sm font-semibold">Notifications</div>
              <div className="p-4 text-center text-sm text-muted-foreground">
                No new tasks right now.
              </div>
            </div>
          )}
        </div>

        {/* Points + User Icon */}
        <div className="flex items-center space-x-3 pl-2 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{points} TP</p>
            <p className="text-[10px] text-green-500 font-medium">Balance</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border">
            <User className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Toggle */}
      <div className="md:hidden flex items-center gap-3">
        <ModeToggle />
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-sidebar"))}
          className="p-2 rounded bg-muted hover:bg-muted/80 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
}