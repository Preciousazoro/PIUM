"use client";

import React from "react";
import Link from "next/link";
import ModeToggle from "@/components/ui/ModeToggle";
import { Bell, ChevronDown, User as UserIcon } from "lucide-react";

const AdminHeader = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!isOpen) return;
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

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

        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </button>

        {/* Admin Menu */}
        <div className="relative">
          <button
            ref={triggerRef}
            onClick={() => setIsOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
            </div>
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
            <Link
              href="/admin/profile"
              className="block px-4 py-2 text-sm hover:bg-muted"
            >
              Profile
            </Link>

            <Link
              href="/admin/settings"
              className="block px-4 py-2 text-sm hover:bg-muted"
            >
              Settings
            </Link>

            <Link
              href="/auth/login"
              className="block px-4 py-2 text-sm hover:bg-muted hover:text-red-600"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() =>
          window.dispatchEvent(new CustomEvent("open-sidebar"))
        }
        className="md:hidden p-2 rounded hover:bg-muted"
        aria-label="Open menu"
      >
        <span className="block w-6 h-0.5 bg-foreground/70 mb-1" />
        <span className="block w-6 h-0.5 bg-foreground/70 mb-1" />
        <span className="block w-6 h-0.5 bg-foreground/70" />
      </button>
    </header>
  );
};

export default AdminHeader;
