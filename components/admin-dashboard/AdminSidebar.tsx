"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout,
  CheckCircle,
  Users,
  FileText,
  Award,
  BarChart2,
  Settings,
  User as UserIcon,
  LogOut,
  X,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

const AdminSidebar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onOpen = () => setMenuOpen(true);
    window.addEventListener("open-sidebar", onOpen);
    return () => window.removeEventListener("open-sidebar", onOpen);
  }, []);

  // Fetch admin data
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdmin(data.admin);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const iconClass = "w-4 h-4";
  const activeIconClass = "w-4 h-4 text-white";
  const inactiveIconClass = "w-4 h-4 text-muted-foreground";

  const menuItems = [
    { icon: <Layout className={iconClass} />, label: "Dashboard", href: "/admin-dashboard/dashboard", color: "text-blue-500" },
    { icon: <CheckCircle className={iconClass} />, label: "Manage Tasks", href: "/admin-dashboard/manage-tasks", color: "text-green-500" },
    { icon: <Users className={iconClass} />, label: "Users", href: "/admin-dashboard/users", color: "text-purple-500" },
    { icon: <FileText className={iconClass} />, label: "Submissions", href: "/admin-dashboard/submissions", color: "text-orange-500" },
    { icon: <Award className={iconClass} />, label: "Rewards", href: "/admin-dashboard/rewards", color: "text-yellow-500" },
    { icon: <BarChart2 className={iconClass} />, label: "Reports & Analytics", href: "/admin-dashboard/reports", color: "text-indigo-500" },
    { icon: <Settings className={iconClass} />, label: "Settings", href: "/admin-dashboard/settings", color: "text-gray-500" },
  ];

  const bottomMenuItems = [
    { icon: <UserIcon className={iconClass} />, label: "Switch To User", href: "/user-dashboard/dashboard", color: "text-cyan-500" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 bg-background border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-border">
          
          <p className="text-sm font-bold text-center mt-4">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item, i) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-linear-to-r from-green-500 to-purple-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className={isActive ? "text-white" : item.color}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Bottom Menu Items */}
          <nav className="space-y-1">
            {bottomMenuItems.map((item, i) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={i}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                    isActive
                      ? "bg-linear-to-r from-green-500 to-purple-500 text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className={isActive ? "text-white" : item.color}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Admin Profile */}
          <Link href="/admin-dashboard/profile" className="flex items-center space-x-3">
            {admin?.avatarUrl ? (
              <img
                src={admin.avatarUrl}
                alt={admin.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : admin?.name ? (
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {getInitials(admin.name)}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {loading ? 'Loading...' : (admin?.name || 'Admin')}
              </p>
              <p className="text-xs text-muted-foreground">
                {admin?.role === 'admin' ? 'Administrator' : 'User'}
              </p>
            </div>
          </Link>

          <Link
            href="/auth/login"
            className="flex items-center space-x-3 p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-muted"
          >
            <LogOut className={`${iconClass} text-red-500`} />
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              className="fixed top-0 left-0 w-3/4 max-w-xs h-full bg-background z-50 flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
            >
              <div className="flex items-center p-4 border-b border-border">
                <span className="font-bold">Admin Dashboard</span>
                <button className="ml-auto" onClick={() => setMenuOpen(false)}>
                  <X />
                </button>
              </div>

              <div className="flex-1 p-4">
                <nav className="space-y-1">
                  {menuItems.map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition text-base ${
                        pathname.startsWith(item.href)
                          ? "bg-linear-to-r from-green-500 to-purple-500 text-white"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className={pathname.startsWith(item.href) ? "text-white" : item.color}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Admin Profile and Logout - At Bottom */}
              <div className="p-4 border-t border-border space-y-3">
                {/* Bottom Menu Items */}
                <nav className="space-y-1">
                  {bottomMenuItems.map((item, i) => (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition text-base ${
                        pathname.startsWith(item.href)
                          ? "bg-linear-to-r from-green-500 to-purple-500 text-white"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className={pathname.startsWith(item.href) ? "text-white" : item.color}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
                
                {/* Admin Profile */}
                <Link href="/admin-dashboard/profile" className="flex items-center space-x-3">
                  {admin?.avatarUrl ? (
                    <img
                      src={admin.avatarUrl}
                      alt={admin.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : admin?.name ? (
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {getInitials(admin.name)}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {loading ? 'Loading...' : (admin?.name || 'Admin')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {admin?.role === 'admin' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </Link>

                <Link
                  href="/auth/login"
                  className="flex items-center space-x-3 p-3 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-muted"
                >
                  <LogOut className={`${iconClass} text-red-500`} />
                  <span>Logout</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
