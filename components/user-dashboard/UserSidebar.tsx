"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Home,
  Users,
  Edit2,
  Settings,
  ShoppingCart,
  Award,
  Gift,
  X,
  LogOut,
  CheckSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

export default function UserSidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Consolidated user data fetching
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  useEffect(() => {
    const onOpen = () => setMenuOpen(true);
    window.addEventListener("open-sidebar", onOpen);
    return () => window.removeEventListener("open-sidebar", onOpen);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r h-screen sticky top-0 bg-background flex-col">
        <div className="p-4 text-center font-bold text-sm">User Dashboard</div>

        <div className="p-4 flex-1">
          <SidebarContent mobile={false} userData={userData} />
        </div>

        <div className="p-4 border-t">
          <AdminAndLogoutLinks userData={userData} isLoading={isLoading} />
        </div>
      </aside>

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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 90, damping: 15 }}
              className="fixed top-0 left-0 w-3/4 max-w-xs h-full bg-background z-50"
            >
              <div className="flex items-center p-4">
                <p className="mx-auto font-bold text-sm">User Dashboard</p>
                <button onClick={() => setMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 flex flex-col h-full justify-between">
                <SidebarContent
                  mobile
                  userData={userData}
                  onLinkClick={() => setMenuOpen(false)}
                />

                {/* Mobile Admin + Logout Links */}
                <div className="mt-4 border-t pt-4">
                  <AdminAndLogoutLinks userData={userData} isLoading={isLoading} />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* Sidebar Content */
function SidebarContent({
  mobile,
  onLinkClick,
  userData,
}: {
  mobile?: boolean;
  onLinkClick?: () => void;
  userData: any;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const links = [
    { href: "/user-dashboard/dashboard", icon: Home, label: "Dashboard" },
    { href: "/user-dashboard/profile", icon: Users, label: "Profile" },
    { href: "/user-dashboard/transactions", icon: Edit2, label: "Transactions" },
    { href: "/user-dashboard/settings", icon: Settings, label: "Settings" },
    { href: "#", icon: ShoppingCart, label: "Commerce Tasks" },
    { href: "/user-dashboard/leaderboard", icon: Award, label: "Leaderboard" },
    { href: "/user-dashboard/task-verification", icon: CheckSquare, label: "Task Verification" },
    { href: "/user-dashboard/rewards", icon: Gift, label: "Rewards" },
  ];

  const streak = userData?.dailyStreak || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Daily Streak */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">🔥 Daily Streak</span>
          <span className="font-medium">{streak}/7 days</span>
        </div>
        <div className="h-2 bg-muted rounded-full">
          <div
            className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
          />
        </div>
        {streak > 0 && (
          <div className="flex gap-1 mt-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < streak
                    ? 'bg-orange-500'
                    : 'bg-muted/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {links.map((link, i) => {
          const active = isActive(link.href);
          return (
            <Link
              key={i}
              href={link.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition
                ${
                  active
                    ? "bg-linear-to-r from-green-500 to-purple-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <link.icon className="w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

     
    </div>
  );
}

/* Admin + Logout Links Component */
function AdminAndLogoutLinks({ userData, isLoading }: { userData: any; isLoading: boolean }) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/login");
  };

  const displayName = userData?.username || userData?.name || 'Loading...';
  const avatarUrl = userData?.avatarUrl;
  const isAdmin = userData?.role === 'admin';

  return (
    <div className="flex flex-col space-y-2">
      {/* Only show Switch to Admin if user has admin role */}
      {isAdmin && (
        <Link
          href="/admin-dashboard/dashboard"
          className="flex items-center space-x-3 py-2 px-3 rounded-lg text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-foreground hover:translate-x-1"
        >
          <Gift className="w-5 text-purple-400" />
          <span className="text-sm">Switch To Admin</span>
        </Link>
      )}

      <button
        onClick={handleLogout}
        className="w-full flex items-center space-x-3 p-3 rounded-xl text-muted-foreground hover:bg-red-500/5 hover:text-red-500 transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span className="font-medium text-sm">Logout</span>
      </button>

       {/* Profile Footer */}
      <div className="border-t pt-4 mt-4 flex items-center gap-3">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border-2 border-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        )}
        <div>
          <div className="font-medium truncate max-w-[120px]">
            {isLoading ? 'Loading...' : displayName}
          </div>
          <div className="text-xs text-muted-foreground">
            {isAdmin ? 'Administrator' : 'Contributor'}
          </div>
        </div>
      </div>
    </div>
  );
}
