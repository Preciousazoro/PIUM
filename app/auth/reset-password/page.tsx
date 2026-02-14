"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      toast.error('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          toast.error(data.error || 'Invalid or expired reset link');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
        toast.error('Failed to validate reset link');
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="absolute inset-0 bg-linear-to-tr from-[#00ff9d0a] via-transparent to-[#8a2be20a] pointer-events-none"></div>
        
        <div className="relative w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Invalid Reset Link</h1>
            <p className="text-muted-foreground text-sm mb-6">
              This password reset link is invalid or has expired.<br />
              Please request a new one.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/forgot-password">
              <Button className="w-full bg-linear-to-r from-[#00ff9d] to-[#8a2be2] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 h-11">
                Request New Reset Link
              </Button>
            </Link>
            
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

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="absolute inset-0 bg-linear-to-tr from-[#00ff9d0a] via-transparent to-[#8a2be20a] pointer-events-none"></div>
        
        <div className="relative w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Password Reset Successful</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Your password has been successfully reset.<br />
              You can now log in with your new password.
            </p>
          </div>

          <Link href="/auth/login">
            <Button className="w-full bg-linear-to-r from-[#00ff9d] to-[#8a2be2] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 h-11">
              Continue to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="absolute inset-0 bg-linear-to-tr from-[#00ff9d0a] via-transparent to-[#8a2be20a] pointer-events-none"></div>
      
      <div className="relative w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/taskkash-logo.png"
              alt="TaskKash Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl font-bold bg-linear-to-r from-[#00ff9d] to-[#8a2be2] bg-clip-text text-transparent">
              Taskkash
            </span>
          </div>
          <h1 className="text-2xl font-semibold mb-1">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your new password below
          </p>
        </div>

        {/* Reset Password Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xl"
        >
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-[10px] w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-all pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[10px] text-muted-foreground hover:text-primary transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password && (
              <p className={`text-xs mt-1 ${validatePassword(password) ? 'text-green-500' : 'text-red-500'}`}>
                {validatePassword(password) ? '✓ Password is valid' : 'Password must be at least 6 characters'}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-[10px] w-4 h-4 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-all pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[10px] text-muted-foreground hover:text-primary transition"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                {password === confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !validatePassword(password) || password !== confirmPassword}
            className="w-full bg-linear-to-r from-[#00ff9d] to-[#8a2be2] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
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
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
