"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ModeToggle from "@/components/ui/ModeToggle";
import { Bell, ChevronDown, User as UserIcon, Check, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'task_submission' | 'booking' | 'contact_message' | 'new_user' | 'task_approved' | 'task_rejected' | 'system';
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: 'task' | 'booking' | 'user' | 'contact' | 'submission' | 'activity';
  link?: string;
  createdAt: string;
  read: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

const AdminHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);

  // Fetch admin data and notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch admin data
        const adminResponse = await fetch('/api/admin/me');
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          setAdmin(adminData.admin);
        }

        // Fetch notifications
        const notificationsResponse = await fetch('/api/admin/notifications?limit=10');
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData.notifications);
          setUnreadCount(notificationsData.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetch('/api/admin/notifications?limit=10')
        .then(res => res.json())
        .then(data => {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        })
        .catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Close profile menu
      if (isOpen && menuRef.current && triggerRef.current &&
          !menuRef.current.contains(target) && !triggerRef.current.contains(target)) {
        setIsOpen(false);
      }
      
      // Close notifications dropdown
      if (notificationsOpen && notificationsRef.current && notificationsTriggerRef.current &&
          !notificationsRef.current.contains(target) && !notificationsTriggerRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, notificationsOpen]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications?id=${notificationId}`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications?readAll=true', {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 p-4 flex items-center justify-between border-b bg-background text-foreground border-border">
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

      {/* Spacer */}
      <div className="mx-4 hidden md:block" />

      {/* Actions (desktop) */}
      <div className="hidden md:flex items-center space-x-4">
        <ModeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notificationsTriggerRef}
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div
            ref={notificationsRef}
            className={`${
              notificationsOpen ? "block" : "hidden"
            } absolute right-0 mt-2 w-80 bg-background rounded-md shadow-lg border border-border z-10 max-h-96 overflow-hidden`}
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                        !notification.read ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary"></span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Menu */}
        <div className="relative">
          <button
            ref={triggerRef}
            onClick={() => setIsOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
          >
            {admin?.avatarUrl ? (
              <img
                src={admin.avatarUrl}
                alt={admin.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : admin?.name ? (
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                {getInitials(admin.name)}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown */}
          <div
            ref={menuRef}
            role="menu"
            className={`${
              isOpen ? "block" : "hidden"
            } absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg border border-border z-10`}
          >
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-medium truncate">
                {admin?.name || 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {admin?.email || 'admin@taskkash.com'}
              </p>
            </div>

            <Link
              href="/admin-dashboard/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </Link>

            <Link
              href="/admin-dashboard/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden flex items-center space-x-2">
        <ModeToggle />
        
        {/* Mobile Hamburger */}
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-sidebar"))
          }
          className="p-2 rounded hover:bg-muted"
          aria-label="Open menu"
        >
          <span className="block w-6 h-0.5 bg-foreground/70 mb-1" />
          <span className="block w-6 h-0.5 bg-foreground/70 mb-1" />
          <span className="block w-6 h-0.5 bg-foreground/70" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
