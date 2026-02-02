"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Lock, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/user-dashboard/dashboard'
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else if (result?.ok) {
        toast.success('Login successful!');
        setTimeout(() => {
          router.push('/user-dashboard/dashboard');
        }, 1000);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 transition-colors duration-300">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff9d0a] via-transparent to-[#8a2be20a] pointer-events-none"></div>
      
      <div className="relative w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00ff9d] to-[#8a2be2] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#00ff9d] to-[#8a2be2] bg-clip-text text-transparent">
              Taskkash
            </span>
          </div>
          <h1 className="text-2xl font-semibold mb-1">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">
            Login to access your account and continue earning rewards
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xl transition-colors duration-300"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-all pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-muted-foreground hover:text-primary transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <div className="flex justify-end mt-2">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00ff9d] to-[#8a2be2] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 h-11"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Wallet Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-background text-foreground border border-border hover:bg-muted flex items-center justify-center gap-2 transition-colors h-11"
          >
            <Lock className="w-4 h-4" /> Connect Wallet
          </Button>
        </form>

        {/* Sign Up */}
        <p className="text-center text-muted-foreground text-sm">
          Don’t have an account?{" "}
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