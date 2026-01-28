"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import ModeToggle from "@/components/ui/ModeToggle";

// Navigation
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

export default function SettingsPage() {
  const { theme } = useTheme();

  // Hydration safety
  const [mounted, setMounted] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Password validation (only length and number required)
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return errors;
  };

  const handlePasswordUpdate = async () => {
    setPasswordErrors([]);

    // Frontend validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordErrors(['Please fill all fields']);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordErrors(['New password and confirmation do not match']);
      return;
    }

    const passwordValidationErrors = validatePassword(newPassword);
    if (passwordValidationErrors.length > 0) {
      setPasswordErrors(passwordValidationErrors);
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          setPasswordErrors([data.error]);
        } else {
          setPasswordErrors(['Failed to update password']);
        }
        return;
      }

      // Success
      toast.success('Password updated successfully');
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Log user out for security
      setTimeout(() => {
        signOut({ callbackUrl: '/auth/login' });
      }, 2000);
      
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordErrors(['Network error. Please try again.']);
    } finally {
      setSavingPassword(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <UserHeader />

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto w-full max-w-5xl space-y-8">

            {/* Appearance */}
            <section className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-semibold mb-2">Appearance</h2>
              <p className="text-muted-foreground mb-6">
                Choose how Taskkash looks to you.
              </p>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background px-5 py-4">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {theme === "dark" ? "Dark" : "Light"}
                  </span>
                  <ModeToggle />
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
              <p className="text-muted-foreground mb-6">
                Manage which updates you receive.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Product updates", desc: "Emails about new features and tips" },
                  { title: "Security alerts", desc: "Important account activity" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-5 py-4"
                  >
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.desc}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 accent-green-500"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Change Password */}
            <section className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-semibold mb-2">Change Password</h2>
              <p className="text-muted-foreground mb-6">
                Update your password to keep your account secure.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordErrors([]);
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm"
                  />
                </div>

                <div />

                <div>
                  <label className="text-sm text-muted-foreground">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordErrors([]);
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordErrors([]);
                    }}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePasswordUpdate}
                  disabled={savingPassword}
                  className="rounded-lg bg-gradient-to-r from-green-500 to-purple-500 px-4 py-2 text-sm text-white transition hover:shadow-lg disabled:opacity-60"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>

                {passwordErrors.length > 0 && (
                  <div className="w-full">
                    {passwordErrors.map((error, index) => (
                      <div key={index} className="text-sm text-red-500">
                        • {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Password Requirements */}
              <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
                <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains at least one number (0-9)</li>
                  <li>• Uppercase letters, lowercase letters, and special characters are optional but recommended</li>
                </ul>
              </div>
            </section>

            {/* Account */}
            <section className="bg-card rounded-2xl border border-border p-8">
              <h2 className="text-2xl font-semibold mb-2">Account</h2>
              <p className="text-muted-foreground mb-6">
                Manage your account information.
              </p>

              <Link
                href="/user-dashboard/profile"
                className="inline-block rounded-lg bg-gradient-to-r from-green-500 to-purple-500 px-4 py-2 text-sm text-white transition hover:shadow-lg"
              >
                Edit profile
              </Link>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
