"use client";

import React, { useState } from "react";
import {
  Award,
  Gift,
  Clock,
  CheckCircle,
  Star,
  DollarSign,
  PlusCircle,
  Download,
  Filter,
} from "lucide-react";
import AdminHeader from "@/components/admin-dashboard/AdminHeader";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

type TabId = "overview" | "create" | "distribution" | "activity";

type RewardItem = {
  id: string;
  title: string;
  type: "badge" | "boost";
  claimed?: boolean;
  claimable?: boolean;
};

type HistoryItem = {
  title: string;
  user: string;
  claimedAt: string;
};

/* ------------------------------------------------------------------ */
/* MOCK DATA */
/* ------------------------------------------------------------------ */

const MOCK_REWARDS: RewardItem[] = [
  { id: "1", title: "Starter Badge", type: "badge", claimed: true },
  { id: "2", title: "XP Boost", type: "boost", claimable: true },
];

const MOCK_HISTORY: HistoryItem[] = [
  { title: "Starter Badge", user: "John D.", claimedAt: new Date().toISOString() },
  { title: "XP Boost", user: "Sarah K.", claimedAt: new Date().toISOString() },
];

/* ------------------------------------------------------------------ */
/* PAGE */
/* ------------------------------------------------------------------ */

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Award className="text-indigo-400" />
            <h1 className="text-2xl font-bold">Rewards</h1>
          </div>

          <Tabs active={activeTab} setActive={setActiveTab} />

          {activeTab === "overview" && (
            <OverviewTab rewards={MOCK_REWARDS} />
          )}

          {activeTab === "create" && <CreateRewardTab />}

          {activeTab === "distribution" && (
            <DistributionTab rewards={MOCK_REWARDS} />
          )}

          {activeTab === "activity" && (
            <ActivityLogsTab history={MOCK_HISTORY} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TABS */
/* ------------------------------------------------------------------ */

function Tabs({
  active,
  setActive,
}: {
  active: TabId;
  setActive: (t: TabId) => void;
}) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "create", label: "Create Reward" },
    { id: "distribution", label: "Distribution" },
    { id: "activity", label: "Activity Logs" },
  ];

  return (
    <div className="border-b border-border">
      <div className="flex gap-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id as TabId)}
            className={`pb-3 font-medium ${
              active === t.id
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OVERVIEW (FULL – WITH SECOND SECTION RESTORED) */
/* ------------------------------------------------------------------ */

function OverviewTab({ rewards }: { rewards: RewardItem[] }) {
  const badgeCount = rewards.filter((r) => r.type === "badge").length;
  const boostCount = rewards.filter((r) => r.type === "boost").length;
  const total = badgeCount + boostCount || 1;

  return (
    <div className="space-y-6">
      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <MetricCard title="Total Rewards" value={rewards.length} Icon={Gift} />
        <MetricCard title="Claimable" value={1} Icon={Clock} />
        <MetricCard title="Claimed" value={1} Icon={CheckCircle} />
        <MetricCard title="Level" value="Intermediate" Icon={Star} />
        <MetricCard title="TP" value={1200} Icon={DollarSign} />
      </div>

      {/* SECOND SECTION (RESTORED & REDESIGNED) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CLAIMS ANALYTICS */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Claims Analytics</h3>
            <div className="flex gap-2 text-xs">
              <span className="text-indigo-400">Today</span>
              <span className="text-muted-foreground">Week</span>
              <span className="text-muted-foreground">Month</span>
            </div>
          </div>

          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
            No claims data available yet
          </div>
        </div>

        {/* BADGE / BOOST BREAKDOWN */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Reward Breakdown</h3>

          <BreakdownRow
            label="Badges"
            value={badgeCount}
            percent={(badgeCount / total) * 100}
          />

          <BreakdownRow
            label="Boosts"
            value={boostCount}
            percent={(boostCount / total) * 100}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CREATE REWARD */
/* ------------------------------------------------------------------ */

function CreateRewardTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-xl mb-4">Create New Reward</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Reward Title" placeholder="Power User Badge" />
          <Select label="Reward Type" options={["Badge", "Boost"]} />
          <Input label="Minimum TP" placeholder="1000" />
          <Select
            label="Level Requirement"
            options={["Beginner", "Intermediate", "Advanced", "Expert"]}
          />
          <Textarea label="Description" placeholder="Describe this reward…" />
        </div>

        <button
          disabled
          className="mt-6 flex items-center gap-2 bg-indigo-600/40 px-6 py-2 rounded-lg text-white opacity-60 cursor-not-allowed"
        >
          <PlusCircle className="w-4 h-4" />
          Create Reward
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h4 className="font-semibold mb-3">Live Preview</h4>
        <div className="bg-muted rounded-xl p-4">
          <p className="font-medium">Reward Title</p>
          <p className="text-sm text-muted-foreground mt-1">
            Reward description will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DISTRIBUTION */
/* ------------------------------------------------------------------ */

function DistributionTab({ rewards }: { rewards: RewardItem[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Issued" value={rewards.length} Icon={Gift} />
        <MetricCard title="Claimed" value={1} Icon={CheckCircle} />
        <MetricCard title="Pending" value={1} Icon={Clock} />
        <MetricCard title="Users Reached" value={12} Icon={Star} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Reward Distribution</h3>

        <table className="w-full text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="text-left pb-2">Reward</th>
              <th className="text-left pb-2">Type</th>
              <th className="text-left pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="py-3">{r.title}</td>
                <td className="py-3 capitalize">{r.type}</td>
                <td className="py-3">
                  <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-full">
                    {r.claimed ? "Claimed" : r.claimable ? "Available" : "Locked"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ACTIVITY LOGS */
/* ------------------------------------------------------------------ */

function ActivityLogsTab({ history }: { history: HistoryItem[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex justify-between mb-6">
        <h3 className="font-semibold text-xl">Activity Logs</h3>

        <div className="flex gap-2">
          <button className="bg-muted px-3 py-1 rounded-lg text-sm flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="bg-indigo-600 px-3 py-1 rounded-lg text-sm flex items-center gap-1 text-white">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((h, i) => (
          <div key={i} className="flex gap-3 border-b border-border pb-4">
            <CheckCircle className="text-indigo-400 mt-1" />
            <div>
              <p className="text-sm">
                <span className="font-medium">{h.user}</span> claimed{" "}
                <span className="text-indigo-400">{h.title}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(h.claimedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* UI HELPERS */
/* ------------------------------------------------------------------ */

function MetricCard({ title, value, Icon }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <Icon className="text-indigo-400" />
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  percent,
}: {
  label: string;
  value: number;
  percent: number;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function Input({ label, placeholder }: any) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <input
        placeholder={placeholder}
        className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2"
      />
    </div>
  );
}

function Select({ label, options }: any) {
  return (
    <div>
      <label className="text-sm text-muted-foreground">{label}</label>
      <select className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2">
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, placeholder }: any) {
  return (
    <div className="md:col-span-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <textarea
        rows={3}
        placeholder={placeholder}
        className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2"
      />
    </div>
  );
}
