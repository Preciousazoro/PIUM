"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import ModeToggle from "@/components/ui/ModeToggle";

// Navigation
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

export default function SettingsPage() {
  const { theme } = useTheme();

  // Hydration safety
  const [mounted, setMounted] = useState(false);

  // Password form state (UI only)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePasswordUpdate = () => {
    setPasswordErr(null);
    setPasswordMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordErr("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErr("New password and confirmation do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErr("New password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);

    setTimeout(() => {
      setSavingPassword(false);
      setPasswordMsg("Password updated (demo only)");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 800);
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

            {/* Change Password (UI only) */}
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
                      setPasswordErr(null);
                      setPasswordMsg(null);
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
                      setPasswordErr(null);
                      setPasswordMsg(null);
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
                      setPasswordErr(null);
                      setPasswordMsg(null);
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

                {passwordErr && <span className="text-sm text-red-500">{passwordErr}</span>}
                {passwordMsg && <span className="text-sm text-green-500">{passwordMsg}</span>}
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
