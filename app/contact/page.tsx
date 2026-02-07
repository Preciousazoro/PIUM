"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ModeToggle from "@/components/ui/ModeToggle";

export default function ContactPage() {
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

  useEffect(() => {
    // Initialize any needed effects
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
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
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 shadow"
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
                <div className="flex items-center space-x-2">
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
                  className="block w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 shadow text-center transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
            <span className="gradient-text">Contact Us</span>
          </h1>

          <div className="space-y-16">
            {/* For Brands Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">For Brands 🤝</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Want to promote your brand, product, or campaign on TaskKash?
              </p>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border max-w-2xl mx-auto">
                <p className="text-lg mb-6">Book a session with us to:</p>
                <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Discuss your project or brand goals
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Explore how TaskKash can help you reach real users
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Launch tasks and campaigns tailored to your needs
                  </li>
                </ul>
                
                <a
                  href="#"
                  className="inline-flex items-center px-8 py-3 rounded-lg bg-gradient-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
                >
                  Book a Session
                </a>
              </div>
            </div>

            {/* Get in Touch Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-xl text-muted-foreground mb-8">
                For general inquiries, partnerships, or support, reach us via:
              </p>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border max-w-2xl mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium">Email:</span>
                    <a href="mailto:taskkash.web3@gmail.com" className="text-green-400 hover:text-green-300 transition-colors">
                      taskkash.web3@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium">X:</span>
                    <a href="https://x.com/TaskKash" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                      @TaskKash
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* For Users Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">For Users 👥</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Have questions, feedback, or need support? We're always happy to hear from you.
              </p>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border max-w-2xl mx-auto">
                <p className="text-lg mb-6">👉 Email us or reach out on X</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:taskkash.web3@gmail.com"
                    className="px-6 py-3 rounded-lg border border-green-400 text-green-400 font-medium hover:bg-green-400 hover:text-background transition-colors"
                  >
                    Email Us
                  </a>
                  <a
                    href="https://x.com/TaskKash"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-lg border border-green-400 text-green-400 font-medium hover:bg-green-400 hover:text-background transition-colors"
                  >
                    Message on X
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Send us a Message</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Prefer to fill out a form? We'll get back to you as soon as possible.
              </p>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border max-w-2xl mx-auto">
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-left">Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-left">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-left">Subject</label>
                    <select className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors">
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="brand">Brand Collaboration</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-left">Message *</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors resize-none"
                      placeholder="How can we help you? Please provide as much detail as possible..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="rounded border-border bg-background focus:ring-2 focus:ring-green-400"
                    />
                    <label htmlFor="newsletter">
                      I'd like to receive updates about TaskKash features and announcements
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full px-8 py-3 rounded-lg bg-gradient-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

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
