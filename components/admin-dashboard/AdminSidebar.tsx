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

const AdminSidebar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setMenuOpen(true);
    window.addEventListener("open-sidebar", onOpen);
    return () => window.removeEventListener("open-sidebar", onOpen);
  }, []);

  const iconClass = "w-4 h-4";

  const menuItems = [
    { icon: <Layout className={iconClass} />, label: "Dashboard", href: "/admin-dashboard/dashboard" },
    { icon: <CheckCircle className={iconClass} />, label: "Manage Tasks", href: "/admin-dashboard/manage-tasks" },
    { icon: <Users className={iconClass} />, label: "Users", href: "/admin-dashboard/users" },
    { icon: <FileText className={iconClass} />, label: "Submissions", href: "/admin-dashboard/submissions" },
    { icon: <Award className={iconClass} />, label: "Rewards", href: "/admin-dashboard/rewards" },
    { icon: <BarChart2 className={iconClass} />, label: "Reports & Analytics", href: "/admin-dashboard/reports" },
    { icon: <Settings className={iconClass} />, label: "Settings", href: "/admin-dashboard/settings" },
    { icon: <UserIcon className={iconClass} />, label: "Switch To User", href: "/user-dashboard/dashboard" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 bg-background border-r border-border hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <img src="/taskkash-logo.png" alt="TaskKash Logo" className="w-12 h-12" />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-purple-600 bg-clip-text text-transparent">
              TASKKASH
            </span>
          </div>
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
                    ? "bg-gradient-to-r from-green-500 to-purple-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Link href="/admin/profile" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </Link>

          <Link
            href="/auth/login"
            className="mt-3 flex items-center space-x-3 p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-muted"
          >
            <LogOut className={iconClass} />
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
                <span className="font-bold">TASKKASH</span>
                <button className="ml-auto" onClick={() => setMenuOpen(false)}>
                  <X />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                <Link
                  href="/auth/login"
                  className="flex items-center space-x-3 p-3 text-red-500 hover:bg-muted"
                >
                  <LogOut />
                  <span>Logout</span>
                </Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
