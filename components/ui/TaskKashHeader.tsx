"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";

export default function TaskKashHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 shadow-sm backdrop-blur"
          : "bg-transparent dark:bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 bg-linear-to-r from-emerald-500 via-green-500 to-purple-600 bg-clip-text text-2xl font-extrabold text-transparent"
        >
          <img
            src="/taskkash-logo.png"
            alt="TaskKash Logo"
            className="h-8 w-8 object-contain"
          />
          TaskKash
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#how" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
            How It Works
          </a>
          <a href="/#users" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
            For Users
          </a>
          <a href="/#brands" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
            For Brands
          </a>
          <a href="/#faq" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
            FAQ
          </a>
          <Link href="/about" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400">
            Contact
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-xl bg-linear-to-r from-emerald-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
          >
            Sign Up
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 z-[70] h-screen w-80 bg-white dark:bg-slate-950 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-screen flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center gap-3 bg-linear-to-r from-emerald-500 via-green-500 to-purple-600 bg-clip-text text-2xl font-extrabold text-transparent"
            >
              <img
                src="/taskkash-logo.png"
                alt="TaskKash Logo"
                className="h-8 w-8 object-contain"
              />
              TaskKash
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-300"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col min-h-0">
            <nav className="flex-1">
              <div className="space-y-6">
                <a href="/#how" onClick={handleNavClick} className="block font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                  How It Works
                </a>
                <a href="/#users" onClick={handleNavClick} className="block font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                  For Users
                </a>
                <a href="/#brands" onClick={handleNavClick} className="block font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                  For Brands
                </a>
                <a href="/#faq" onClick={handleNavClick} className="block font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                  FAQ
                </a>
                <Link href="/about" onClick={handleNavClick} className="block font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                  About
                </Link>
                <Link href="/contact" onClick={handleNavClick} className="block font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-lg">
                  Contact
                </Link>
              </div>
            </nav>

            {/* Login/Sign Up Buttons at Bottom */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-auto">
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  onClick={handleNavClick}
                  className="rounded-xl border border-emerald-200 dark:border-emerald-800 px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={handleNavClick}
                  className="rounded-xl bg-linear-to-r from-emerald-500 to-purple-600 px-4 py-3 font-semibold text-white text-center shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
