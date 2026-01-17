"use client";

import Link from "next/link";
import React from "react";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden transition-colors duration-300">

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        {/* Logo Left */}
        <div className="flex items-center space-x-2">
          <img src="/taskkash-logo.png" alt="TaskKash Logo" className="w-10 h-10 object-contain" />
        </div>

        {/* Nav Center */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="hover:text-green-400">Home</a>
          <a href="#" className="hover:text-green-400">For Users</a>
          <a href="#" className="hover:text-green-400">For Projects</a>
          <a href="#" className="hover:text-green-400">About</a>
          <a href="#" className="hover:text-green-400">Contact</a>
        </nav>

        {/* Right actions: Simple buttons without routing logic */}
        <div className="flex items-center space-x-4">
  <Link href="/auth/login" passHref>
    <button className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 font-medium hover:bg-gray-800">
      Login
    </button>
  </Link>

  <Link href="/auth/signup" passHref>
    <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-purple-600 text-white font-medium hover:opacity-90 shadow">
      Sign Up
    </button>
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
          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-400 to-purple-600 text-white font-bold text-lg hover:opacity-90 shadow">
            Start Earning
          </button>
          <button className="px-8 py-4 rounded-xl border border-border text-foreground font-bold text-lg hover:bg-muted transition-colors">
            Promote with TaskKash
          </button>
        </div>
        <div className="mt-12 bg-card border border-border rounded-2xl h-64 flex items-center justify-center text-muted-foreground">
          Hero Mockup Image
        </div>
      </section>

      {/* What is TaskKash */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">What is TaskKash?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              TaskKash is a Web3-powered platform where users get paid to engage online, and brands gain verified growth.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="text-green-400">✔</span>
                <span>Earn crypto for simple social tasks</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400">✔</span>
                <span>Verified human engagement only</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400">✔</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">For Users 🚀</h2>
            <p className="text-lg text-gray-300 mb-6">
              Turn your daily social media use into real rewards. Every like, share, or comment counts.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="text-green-400">✦</span>
                <span>Earn crypto for everyday activities</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-400">✦</span>
                <span>Fun & flexible side income</span>
              </li>
            </ul>
          </div>
          <div className="bg-card border border-border rounded-xl h-72 flex items-center justify-center text-muted-foreground">
            User Mockup
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 gradient-text">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: "1. Sign Up", text: "Join with your wallet or email in seconds" },
            { title: "2. Complete Tasks", text: "Engage, share, or shop to earn TaskPoints" },
            { title: "3. Get Paid", text: "Redeem instantly — cash, cards, or crypto" },
          ].map((step, i) => (
            <div key={i}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-400/10 flex items-center justify-center text-green-400 font-bold">
                {i + 1}
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
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-400 to-purple-600 text-white font-bold text-lg hover:opacity-90 shadow">
              Sign Up Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-muted-foreground text-sm">
        © 2025 TaskKash. All rights reserved.
      </footer>

      {/* CSS remains for styling */}
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