"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import feather from "feather-icons";
import { Menu, X } from "lucide-react";
import ModeToggle from "@/components/ui/ModeToggle";
import { HomepageSkeleton } from "@/components/ui/LoadingSkeleton";

export default function HomePage() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    feather.replace();
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <HomepageSkeleton />;
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "#users", label: "For Users" },
    { href: "#projects", label: "For Projects" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const sectionId = href.substring(1);
      scrollToSection(sectionId);
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

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
          <span className="text-2xl font-bold gradient-text">TaskKash</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            item.href.startsWith('#') ? (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={`transition-colors ${
                  isActive(item.href)
                    ? "text-green-400 font-medium"
                    : "hover:text-green-400"
                }`}
              >
                {item.label}
              </button>
            ) : (
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
            )
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
                  <span className="text-xl font-bold gradient-text">TaskKash</span>
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
                  item.href.startsWith('#') ? (
                    <button
                      key={item.label}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNavClick(item.href);
                      }}
                      className={`block w-full px-4 py-3 rounded-lg transition-colors text-left ${
                        isActive(item.href)
                          ? "bg-green-400/10 text-green-400 font-medium dark:bg-green-400/10 dark:text-green-400 light:bg-green-500/20 light:text-green-600"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block w-full px-4 py-3 rounded-lg transition-colors text-left ${
                        isActive(item.href)
                          ? "bg-green-400/10 text-green-400 font-medium dark:bg-green-400/10 dark:text-green-400 light:bg-green-500/20 light:text-green-600"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
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

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="gradient-text">TaskKash - Rewards</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Earn rewards for engaging, sharing, and completing simple tasks. Fun. Flexible. Web3-powered.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/auth/signup"
            className="px-8 py-4 rounded-xl bg-linear-to-r from-green-400 to-purple-600 text-white font-bold text-lg hover:opacity-90 shadow"
          >
            Start Earning
          </Link>

          <Link
            href="/contact"
            className="px-8 py-4 rounded-xl border border-border text-foreground font-bold text-lg hover:bg-muted transition-colors"
          >
            Promote with TaskKash
          </Link>
        </div>

        <div className="mt-12 bg-card border border-border rounded-2xl h-64 flex items-center justify-center text-muted-foreground">
          Hero Mockup Image
        </div>
      </section>

      {/* What is TaskKash */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              What is TaskKash?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              TaskKash is a Web3-powered platform where users get paid to engage online,
              and brands gain verified growth. A win-win ecosystem.
            </p>

            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start space-x-3">
                <i data-feather="check-circle" className="text-green-400"></i>
                <span>Earn crypto for simple social tasks</span>
              </li>
              <li className="flex items-start space-x-3">
                <i data-feather="check-circle" className="text-green-400"></i>
                <span>Verified human engagement only</span>
              </li>
              <li className="flex items-start space-x-3">
                <i data-feather="check-circle" className="text-green-400"></i>
                <span>Instant withdrawals to your wallet</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl h-72 flex items-center justify-center text-muted-foreground">
            Platform Mockup
          </div>
        </div>
      </section>

      {/* For Users */}
      <section id="users" className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              For Users 🚀
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Turn your daily social media use into real rewards.
            </p>

            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start space-x-3">
                <i data-feather="zap" className="text-green-400"></i>
                <span>Earn crypto for everyday activities</span>
              </li>
              <li className="flex items-start space-x-3">
                <i data-feather="smile" className="text-green-400"></i>
                <span>Fun & flexible side income</span>
              </li>
              <li className="flex items-start space-x-3">
                <i data-feather="gift" className="text-green-400"></i>
                <span>Instant redeemable rewards</span>
              </li>
              <li className="flex items-start space-x-3">
                <i data-feather="users" className="text-green-400"></i>
                <span>Be part of a global community</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl h-72 flex items-center justify-center text-muted-foreground">
            User Mockup
          </div>
        </div>
      </section>

      {/* For Projects */}
      <section id="projects" className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              For Projects 🏢
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Grow your project with authentic user engagement and measurable results.
            </p>

            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start space-x-3">
                <i data-feather="target" className="text-green-400"></i>
                <span>Reach your target audience effectively</span>
              </li>
              <li className="flex items-start space-x-3">
                <i data-feather="trending-up" className="text-green-400"></i>
                <span>Track real-time campaign performance</span>
              </li>
              <li className="flex items-start space-x-3">
                <i data-feather="shield" className="text-green-400"></i>
                <span>Verified engagement and fraud protection</span>
              </li>
              <li className="flex items-start space-x-3">
                <i data-feather="dollar-sign" className="text-green-400"></i>
                <span>Cost-effective marketing solutions</span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-xl h-72 flex items-center justify-center text-muted-foreground">
            Projects Mockup
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 gradient-text">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: "user", title: "1. Sign Up", text: "Join with your wallet or email in seconds" },
            { icon: "check-square", title: "2. Complete Tasks", text: "Engage, share, or shop to earn TaskPoints" },
            { icon: "dollar-sign", title: "3. Get Paid", text: "Redeem instantly — cash, cards, or crypto" },
          ].map((step, i) => (
            <div key={i}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-400/10 flex items-center justify-center">
                <i data-feather={step.icon} className="text-green-400 w-8 h-8"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
  <div className="max-w-2xl mx-auto bg-linear-to-br from-green-400/10 to-purple-600/10 p-12 rounded-3xl border border-border">
    <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
      Ready to earn or grow with TaskKash?
    </h2>

    <p className="text-lg text-muted-foreground mb-8">
      Join thousands of users and projects already benefiting from our platform.
    </p>

    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link
        href="/auth/signup"
        className="px-8 py-4 rounded-xl bg-linear-to-r from-green-400 to-purple-600 text-white font-bold text-lg hover:opacity-90 shadow"
      >
        Sign Up Now
      </Link>

      <Link
        href="/about"
        className="px-8 py-4 rounded-xl border border-border text-foreground font-bold text-lg hover:bg-muted transition-colors"
      >
        Learn More
      </Link>
    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-muted-foreground text-sm">
        © 2025 TaskKash. All rights reserved.
      </footer>

      <style jsx>{`
        .gradient-text {
          background: linear-gradient(90deg, #00ff9d, #8a2be2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
}
