"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Password reset instructions sent to your email');
      } else {
        toast.error(data.error || 'Failed to send reset instructions');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="absolute inset-0 bg-linear-to-tr from-[#00ff9d0a] via-transparent to-[#8a2be20a] pointer-events-none"></div>
        
        <div className="relative w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Check Your Email</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We've sent password reset instructions to<br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-muted-foreground text-xs mb-6">
              Didn't receive the email? Check your spam folder or<br />
              try again with a different email address.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="w-full bg-background text-foreground border-border hover:bg-muted transition-colors"
            >
              Try Different Email
            </Button>
            
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="absolute inset-0 bg-linear-to-tr from-[#00ff9d0a] via-transparent to-[#8a2be20a] pointer-events-none"></div>
      
      <div className="relative w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-4 hover:opacity-80 transition-opacity cursor-pointer">
              <img
                src="/taskkash-logo.png"
                alt="TaskKash Logo"
                className="w-12 h-12 object-contain"
              />
              <span className="text-xl font-bold bg-linear-to-r from-[#00ff9d] to-[#8a2be2] bg-clip-text text-transparent">
                Taskkash
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-semibold mb-1">Forgot Password?</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Forgot Password Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xl"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-[10px] w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-all pl-10"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-[#00ff9d] to-[#8a2be2] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Sending Instructions...
              </>
            ) : (
              "Send Reset Instructions"
            )}
          </Button>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </form>

        {/* Sign Up */}
        <p className="text-center text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-semibold hover:underline transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
