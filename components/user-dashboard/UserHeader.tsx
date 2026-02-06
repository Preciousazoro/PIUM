"use client";

import { Bell, Menu, User, LogOut, CheckCircle, AlertCircle, Gift, CheckSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ModeToggle from "@/components/ui/ModeToggle";
import { useSession } from "next-auth/react";

export default function UserHeader({ title }: { title?: string }) {
  const [taskPoints, setTaskPoints] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userData, setUserData] = useState<any>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = () => {
    // Plain code logout simulation
    router.push("/auth/login");
  };

  // Fetch user data and notifications
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      
      try {
        // Fetch user profile
        const profileResponse = await fetch('/api/user/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserData(profileData);
          setTaskPoints(profileData.taskPoints || 50);
        }

        // Fetch notifications
        const notifResponse = await fetch('/api/notifications?limit=5');
        if (notifResponse.ok) {
          const notifData = await notifResponse.json();
          setNotifications(notifData.notifications || []);
          setUnreadCount(notifData.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up periodic updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [session]);

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

  const handleNotificationClick = async () => {
    setNotifOpen((v) => !v);
    if (unreadCount > 0) {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAllAsRead: true })
        });
        setUnreadCount(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare className="w-4 h-4 text-blue-500" />;
      case 'reward': return <Gift className="w-4 h-4 text-green-500" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <nav className="sticky top-0 z-40 py-4 px-6 flex justify-between items-center border-b bg-background text-foreground border-border transition-colors duration-300">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <img
            src="/taskkash-logo.png"
            alt="TaskKash Logo"
            className="w-12 h-12 object-contain"
          />
        <span className="hidden sm:block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-purple-600 ml-2 tracking-tight">
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
            onClick={handleNotificationClick}
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-green-500 text-black text-[10px] flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border text-sm font-semibold flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${
                        !notif.isRead ? 'bg-blue-500/5' : ''
                      }`}
                      onClick={() => {
                        if (notif.actionUrl) {
                          router.push(notif.actionUrl);
                        }
                        setNotifOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{notif.title}</p>
                            {!notif.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Points + User Icon */}
        <div className="flex items-center space-x-3 pl-2 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">
              {isLoading ? '...' : `${taskPoints} TP`}
            </p>
            <p className="text-[10px] text-green-500 font-medium">Balance</p>
          </div>
          <button
            onClick={() => router.push('/user-dashboard/profile')}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border hover:border-primary transition-colors"
            title="Go to Profile"
          >
            {userData?.avatarUrl ? (
              <img 
                src={userData.avatarUrl} 
                alt={userData.name || userData.username || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </button>
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
        <div className="flex items-center space-x-2 pl-2 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">
              {isLoading ? '...' : `${taskPoints} TP`}
            </p>
            <p className="text-[10px] text-green-500 font-medium">Balance</p>
          </div>
        </div>
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