"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  
  const router = useRouter();

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!form.terms) {
      toast.error("You must accept the terms and conditions");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password should be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully!');
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-foreground px-4 relative overflow-hidden bg-background transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff9d1a] via-transparent to-[#8a2be21a] blur-3xl opacity-50"></div>
      <div className="relative z-10 w-full max-w-md space-y-6">
        
        {/* Header / Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#00ff9d] to-[#8a2be2] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#00ff9d] to-[#8a2be2] bg-clip-text text-transparent">
              Taskkash
            </span>
          </div>
          <h1 className="text-2xl font-semibold mb-1">Create Your Account</h1>
          <p className="text-gray-400 text-sm">
            Start earning rewards by completing simple tasks
          </p>
        </div>

        {/* Sign Up Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-[0_0_20px_rgba(0,255,157,0.05)] transition-colors duration-300"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
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
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-[#00ff9d] transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Confirm Password
            </label>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-[#00ff9d] transition"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-3 mt-3">
            <Checkbox
              id="terms"
              checked={form.terms}
              onCheckedChange={(val) => handleChange("terms", Boolean(val))}
              className="border-input data-[state=checked]:bg-[#00ff9d] data-[state=checked]:border-[#00ff9d]"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-400 leading-snug cursor-pointer"
            >
              I agree to the{" "}
              <Link href="#" className="text-[#00ff9d] hover:text-[#66ffc2] transition">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#00ff9d] hover:text-[#66ffc2] transition">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00ff9d] to-[#8a2be2] text-white font-medium hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,255,157,0.3)]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Wallet Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-background text-foreground border border-input hover:bg-muted flex items-center justify-center gap-2 transition-colors"
          >
            <Lock className="w-4 h-4" /> Connect Wallet
          </Button>
        </form>

        {/* Already have an account */}
        <p className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[#00ff9d] hover:text-[#66ffc2] transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}