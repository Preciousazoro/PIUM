"use client";

import { useEffect } from "react";
import Link from "next/link";
import feather from "feather-icons";
import ModeToggle from "@/components/ui/ModeToggle";

export default function HomePage() {
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden transition-colors duration-300">

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img
            src="/taskkash-logo.png"
            alt="TaskKash Logo"
            className="w-10 h-10 object-contain"
          />
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#" className="hover:text-green-400">Home</Link>
          <Link href="#" className="hover:text-green-400">For Users</Link>
          <Link href="#" className="hover:text-green-400">For Projects</Link>
          <Link href="#" className="hover:text-green-400">About</Link>
          <Link href="#" className="hover:text-green-400">Contact</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ModeToggle />

          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 font-medium hover:bg-gray-800"
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
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="gradient-text">TaskKash → Rewards</span>
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
            href="#"
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

            <ul className="space-y-4 text-gray-300">
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
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              For Users 🚀
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Turn your daily social media use into real rewards.
            </p>

            <ul className="space-y-4 text-gray-300">
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
  <div className="max-w-2xl mx-auto bg-gradient-to-br from-green-400/10 to-purple-600/10 p-12 rounded-3xl border border-border">
    <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
      Ready to earn or grow with TaskKash?
    </h2>

    <p className="text-lg text-gray-300 mb-8">
      Join thousands of users and projects already benefiting from our platform.
    </p>

    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link
        href="/auth/signup"
        className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-400 to-purple-600 text-white font-bold text-lg hover:opacity-90 shadow"
      >
        Sign Up Now
      </Link>

      <Link
        href="#"
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
