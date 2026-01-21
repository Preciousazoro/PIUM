"use client";

import { useCallback, useState } from "react";
import AdminHeader from "@/components/admin-dashboard/AdminHeader";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";

type SectionId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7;

export default function AdminSettingsPage() {
  const [open, setOpen] = useState<Set<SectionId>>(new Set([1]));

  const toggle = useCallback((id: SectionId) => {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isOpen = (id: SectionId) => open.has(id);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <header>
              <h1 className="text-2xl sm:text-3xl font-bold">Admin Settings</h1>
              <p className="text-sm text-muted-foreground">
                Configure core platform behavior and appearance.
              </p>
            </header>

            {/* 1. GENERAL */}
            <Section
              id={1}
              title="General Platform Settings"
              open={isOpen(1)}
              toggle={toggle}
            >
              <Field label="Platform Name">
                <input defaultValue="TaskKash" />
              </Field>

              <Field label="Support Email">
                <input type="email" defaultValue="support@taskkash.io" />
              </Field>

              <Field label="Default Currency">
                <select>
                  <option>USD ($)</option>
                  <option>NGN (₦)</option>
                </select>
              </Field>

              <Field label="Maintenance Mode">
                <Toggle />
              </Field>

              <SaveRow />
            </Section>

            {/* 2. REWARDS */}
            <Section
              id={2}
              title="Rewards & Points"
              open={isOpen(2)}
              toggle={toggle}
            >
              <Field label="Minimum Withdrawal ($)">
                <input type="number" defaultValue={10} />
              </Field>

              <Field label="Max Daily Earnings ($)">
                <input type="number" defaultValue={50} />
              </Field>

              <Field label="Reward Approval">
                <select>
                  <option>Automatic</option>
                  <option>Manual</option>
                </select>
              </Field>

              <Field label="Bonus Multiplier">
                <input type="number" step="0.1" defaultValue={1.2} />
              </Field>

              <SaveRow />
            </Section>

            {/* 3. TASKS */}
            <Section
              id={3}
              title="Task Configuration"
              open={isOpen(3)}
              toggle={toggle}
            >
              <Field label="Default Task Duration (hours)">
                <input type="number" defaultValue={24} />
              </Field>

              <Field label="Max Tasks per User / Day">
                <input type="number" defaultValue={10} />
              </Field>

              <Field label="Task Review Mode">
                <select>
                  <option>Automatic</option>
                  <option>Manual</option>
                </select>
              </Field>

              <Field label="Allowed Proof Types">
                <div className="flex gap-4 text-sm">
                  <label><input type="checkbox" defaultChecked /> Image</label>
                  <label><input type="checkbox" defaultChecked /> Link</label>
                  <label><input type="checkbox" defaultChecked /> Text</label>
                </div>
              </Field>

              <SaveRow />
            </Section>

            {/* 4. PAYMENTS */}
            <Section
              id={4}
              title="Payments & Payouts"
              open={isOpen(4)}
              toggle={toggle}
            >
              <Field label="Primary Payment Method">
                <select>
                  <option>Crypto</option>
                  <option>PayPal</option>
                </select>
              </Field>

              <Field label="Payout Frequency">
                <select>
                  <option>Manual</option>
                  <option>Weekly</option>
                </select>
              </Field>

              <Field label="Transaction Fee (%)">
                <input type="number" defaultValue={2.5} />
              </Field>

              <SaveRow />
            </Section>

            {/* 5. NOTIFICATIONS */}
            <Section
              id={5}
              title="Notifications"
              open={isOpen(5)}
              toggle={toggle}
            >
              <Field label="Global Announcement">
                <textarea rows={3} placeholder="Displayed to all users…" />
              </Field>

              <Field label="Push Notifications">
                <Toggle />
              </Field>

              <Field label="In-App Notifications">
                <Toggle />
              </Field>

              <SaveRow />
            </Section>

            {/* 6. BRANDING */}
            <Section
              id={6}
              title="Branding & Appearance"
              open={isOpen(6)}
              toggle={toggle}
            >
              <Field label="Primary Color">
                <input type="color" defaultValue="#6366f1" />
              </Field>

              <Field label="Accent Color">
                <input type="color" defaultValue="#22d3ee" />
              </Field>

              <Field label="Dark Mode">
                <Toggle />
              </Field>

              <SaveRow />
            </Section>

            {/* 7. SECURITY */}
            <Section
              id={7}
              title="Security Basics"
              open={isOpen(7)}
              toggle={toggle}
            >
              <Field label="Session Timeout (minutes)">
                <input type="number" defaultValue={30} />
              </Field>

              <Field label="Require Admin 2FA">
                <Toggle />
              </Field>

              <SaveRow />
            </Section>
          </div>
        </main>
      </div>

      <style jsx global>{`
        input, select, textarea {
          width: 100%;
          padding: 10px;
          background: rgba(0,0,0,0.2);
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          color: inherit;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #6366f1;
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------- */
/* UI HELPERS */
/* ---------------------------------- */

function Section({
  id,
  title,
  open,
  toggle,
  children,
}: any) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => toggle(id)}
        className="w-full px-5 py-4 flex justify-between items-center text-left font-semibold"
      >
        {title}
        <span className={`transition ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <label className="text-sm text-muted-foreground mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle() {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked />
      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-indigo-500 relative">
        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

function SaveRow() {
  return (
    <div className="pt-4 flex justify-end">
      <button className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90">
        Save Changes
      </button>
    </div>
  );
}
