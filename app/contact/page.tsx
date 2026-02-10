"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ModeToggle from "@/components/ui/ModeToggle";
import BookingModal from "@/components/booking/BookingModal";
import { toast } from "sonner";

export default function ContactPage() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    subscribedToUpdates: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        subscribedToUpdates: false
      });
      
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      subscribedToUpdates: false
    });
  };

  useEffect(() => {
    // Initialize any needed effects
  }, []);

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
                  className="block w-full px-4 py-3 rounded-lg bg-linear-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 shadow text-center transition-opacity"
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
                
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="inline-flex items-center px-8 py-3 rounded-lg bg-linear-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
                >
                  Book a Session
                </button>
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
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We've received your message and will get back to you soon.
                    </p>
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 rounded-lg border border-green-400 text-green-400 font-medium hover:bg-green-400 hover:text-background transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-left">Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors disabled:opacity-50"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-left">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors disabled:opacity-50"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-left">Subject</label>
                      <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors disabled:opacity-50"
                      >
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
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors resize-none disabled:opacity-50"
                        placeholder="How can we help you? Please provide as much detail as possible..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        id="newsletter"
                        name="subscribedToUpdates"
                        checked={formData.subscribedToUpdates}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="rounded border-border bg-background focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                      />
                      <label htmlFor="newsletter">
                        I'd like to receive updates about TaskKash features and announcements
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-3 rounded-lg bg-linear-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />

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
