"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ModeToggle from "@/components/ui/ModeToggle";
import Footer from "@/components/ui/Footer";

export default function AboutPage() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "#", label: "For Users" },
    { href: "#", label: "For Projects" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center md:static md:z-auto sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border md:border-b-0">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => window.location.href = '/'}
        >
          <img
            src="/taskkash-logo.png"
            alt="TaskKash Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="text-2xl font-bold bg-linear-to-tr">TaskKash</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`transition-colors ${
                isActive(item.href)
                  ? "text-green-400 font-medium"
                  : "hover:text-green-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <ModeToggle />

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="px-6 py-2 rounded-lg bg-linear-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 shadow"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-80 bg-background/95 backdrop-blur-md border-r border-border shadow-xl">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                     onClick={() => window.location.href = '/'}>
                  <img
                    src="/taskkash-logo.png"
                    alt="TaskKash Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xl font-bold bg-linear-to-tr">TaskKash</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex-1 p-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-green-400/10 text-green-400 font-medium dark:bg-green-400/10 dark:text-green-400 light:bg-green-500/20 light:text-green-600"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="p-6 border-t border-border space-y-3">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted text-center transition-colors"
                >
                  Login
                </Link>

                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 rounded-lg bg-linear-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 shadow text-center transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="relative min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-linear-to-r from-green-400/20 via-cyan-400/10 to-purple-500/20 blur-3xl dark:from-green-400/20 dark:via-cyan-400/10 dark:to-purple-500/20 light:from-green-600/10 light:via-cyan-600/5 light:to-purple-600/10" />
      </div>

      {/* Container */}
      <div className="relative mx-auto max-w-6xl px-6 py-24 space-y-28">
        {/* HERO */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              About
            </span>{" "}
            <span className="bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              TaskKash
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Where brands and users connect through meaningful engagement and real
            rewards.
          </p>
        </section>

        {/* VISION & MISSION */}
        <section className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8 backdrop-blur">
            <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              At TaskKash, we envision a world where brands and users collaborate
              seamlessly. A platform where engagement feels natural, trust is
              built through transparency, and every interaction delivers real
              value.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 backdrop-blur">
            <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To bridge the gap between brands and users by providing innovative
              tools that foster trust, meaningful engagement, and mutual growth.
            </p>
          </div>
        </section>

        {/* WHY TASKKASH */}
        <section className="grid gap-12 md:grid-cols-2">
          {/* Brands */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Why Brands Choose TaskKash
            </h2>
            <p className="text-muted-foreground">
              TaskKash gives brands a smarter way to connect with the right
              audience and drive measurable results.
            </p>

            <ul className="space-y-3 text-muted-foreground">
              <li>🎯 Targeted outreach to real users</li>
              <li>📊 Real-time analytics and insights</li>
              <li>🛠 Customizable, performance-driven campaigns</li>
            </ul>
          </div>

          {/* Users */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Why Users Love TaskKash
            </h2>
            <p className="text-muted-foreground">
              TaskKash is more than a platform — it’s a community where effort is
              rewarded.
            </p>

            <ul className="space-y-3 text-muted-foreground">
              <li>🎁 Earn rewards for simple, engaging tasks</li>
              <li>🔓 Access exclusive offers and content</li>
              <li>🤝 Authentic interactions with real brands</li>
            </ul>
          </div>
        </section>

        {/* ROADMAP */}
        <section className="space-y-10">
          <h2 className="text-center text-3xl font-bold">
            TaskKash Roadmap
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="font-semibold mb-2">✅ Beta Testing</h4>
              <p className="text-muted-foreground text-sm">
                Extensive testing, user feedback, and feature refinement to
                improve the overall experience.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="font-semibold mb-2">✅ Website Launch</h4>
              <p className="text-muted-foreground text-sm">
                MVP released with core features, smooth UI, and early brand
                partnerships.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="font-semibold mb-2">🚀 By April 2026</h4>
              <p className="text-muted-foreground text-sm">
                Reach 500–1,000 active users and expand brand collaborations.
              </p>
            </div>
          </div>
        </section>

        {/* LONG TERM */}
        <section className="rounded-3xl border border-border bg-card p-10 text-center space-y-4">
          <h2 className="text-2xl font-semibold">Long-Term Vision</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            We are committed to continuous improvement, community building, and
            global expansion — creating a platform where brands and users grow
            together.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-green-400 to-purple-500 px-8 py-3 font-medium text-foreground transition hover:opacity-90"
          >
            Get Started with TaskKash <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
    <Footer />
    </div>
  );
}

