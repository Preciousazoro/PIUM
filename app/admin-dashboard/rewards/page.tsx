"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Award, Gift, Clock, CheckCircle, Star, DollarSign, Download, Edit, Trash2 } from "lucide-react";
import AdminHeader from "@/components/admin-dashboard/AdminHeader";
import AdminSidebar from "@/components/admin-dashboard/AdminSidebar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

type TabId = "overview" | "create" | "tracker" | "activity";

type Level = "Beginner" | "Advanced" | "Intermediate" | "Expert";
type RewardItem = { id: string; title: string; desc: string; minTP: number; minLevel: Level; type: "badge" | "boost" | "access" | "token" | "nft"; locked?: boolean; claimed?: boolean; claimable?: boolean };
type RewardsResponse = {
  performance: {
    tp: number;
    tasksCompleted: number;
    level: Level;
    nextLevel: Level | string;
    progress: number; // 0-100
    threshold: number;
    next: number | null;
  };
  rewards: RewardItem[];
  history: { rewardId: string; title: string; claimedAt: string }[];
};

type AccentColor = "indigo" | "yellow" | "blue" | "purple" | "green";

type MetricCardProps = {
  title: string;
  value: string | number;
  note?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent?: AccentColor;
};

type SmallWidgetProps = {
  label: string;
  value: string | number;
};

type ConversionRowProps = {
  leftLabel: string;
  leftValue: string | number;
  rightValue: string | number;
  tag: string;
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [data, setData] = useState<RewardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminRewards, setAdminRewards] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/user/rewards", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load rewards data");
        const json = (await res.json()) as RewardsResponse;
        if (!mounted) return;
        setData(json);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Could not load rewards");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await fetch('/api/admin/rewards', { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load admin rewards");
        const json = await response.json();
        if (!mounted) return;
        setAdminRewards((json as any)?.rewards || []);
      } catch (e) {
        // noop for now
      }
    })();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Award className="text-indigo-400" />
              <h1 className="text-2xl font-bold">Rewards</h1>
            </div>
          </div>
          {loading && (
            <div className="bg-card border border-border rounded-2xl p-6">Loading rewards…</div>
          )}
          {error && !loading && (
            <div className="bg-card border border-border rounded-2xl p-6 text-red-500">{error}</div>
          )}
          <Tabs active={activeTab} setActive={setActiveTab} />
          <div className="mt-6">
            {activeTab === "overview" && (
              <OverviewTab
                performance={data?.performance || null}
                rewards={data?.rewards || []}
                history={data?.history || []}
              />
            )}
            {activeTab === "create" && <CreateRewardTab adminRewards={adminRewards} refreshAdminRewards={async () => {
              try {
                const res = await fetch('/api/admin/rewards', { cache: 'no-store' });
                if (!res.ok) return;
                const json = await res.json();
                setAdminRewards((json as any)?.rewards || []);
              } catch {}
            }} />}
            {activeTab === "tracker" && (
              <TrackerTab
                rewards={data?.rewards || []}
                history={data?.history || []}
              />
            )}
            {activeTab === "activity" && (
              <ActivityLogsTab
                history={data?.history || []}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

 

function Tabs({ active, setActive }: { active: TabId; setActive: React.Dispatch<React.SetStateAction<TabId>> }) {
  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "create", label: "Create Reward" },
    { id: "tracker", label: "Distribution" },
    { id: "activity", label: "Activity Logs" },
  ];
  return (
    <div className="border-b border-border mb-4 sm:mb-6 overflow-x-auto">
      <div className="flex whitespace-nowrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`shrink-0 px-4 sm:px-6 py-3 font-medium ${active === t.id ? "border-b-3 border-indigo-500 text-indigo-300" : "text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({ performance, rewards, history }: { performance: RewardsResponse["performance"] | null; rewards: RewardItem[]; history: RewardsResponse["history"]; }) {
  const claimedCount = useMemo(() => rewards.filter(r => r.claimed).length, [rewards]);
  const claimableCount = useMemo(() => rewards.filter(r => r.claimable).length, [rewards]);
  const bonusCount = useMemo(() => rewards.filter(r => r.type === "boost").length, [rewards]);

  const lineData = useMemo(() => {
    const byMonth = new Map<string, number>();
    history.forEach(h => {
      const d = new Date(h.claimedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, (byMonth.get(key) || 0) + 1);
    });
    const keys = Array.from(byMonth.keys()).sort();
    return {
      labels: keys,
      datasets: [
        {
          label: "Claims",
          data: keys.map(k => byMonth.get(k) || 0),
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [history]);

  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    rewards.forEach(r => {
      categories[r.type] = (categories[r.type] || 0) + 1;
    });
    const labels = Object.keys(categories);
    const values = labels.map(l => categories[l]);
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"]; // fallback palette
    return {
      labels,
      datasets: [
        { data: values, backgroundColor: values.map((_, i) => colors[i % colors.length]) },
      ],
    };
  }, [rewards]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard title="Total Rewards" value={rewards.length} note={performance ? `Level ${performance.level}` : ""} Icon={Gift} accent="indigo" />
        <MetricCard title="Pending Rewards" value={claimableCount} note="Available to claim" Icon={Clock} accent="yellow" />
        <MetricCard title="Approved Rewards" value={claimedCount} note="Claimed so far" Icon={CheckCircle} accent="blue" />
        <MetricCard title="Bonus Rewards" value={bonusCount} note="Boosts available" Icon={Star} accent="purple" />
        <MetricCard title="Task Points" value={performance ? performance.tp : "-"} note={performance ? `${performance.progress}% to ${performance.nextLevel}` : ""} Icon={DollarSign} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Rewards Distributed Over Time</h3>
            <div>
              <select className="bg-background border border-input rounded px-3 py-1 text-sm text-foreground">
                <option>All Time</option>
              </select>
            </div>
          </div>
          <div className="h-64 md:h-72 lg:h-80">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border">
          <h3 className="font-semibold mb-4">Reward Type Breakdown</h3>
          <div className="h-64 md:h-72 lg:h-80">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Top Earners Table: requires admin aggregate API, fallback hidden when unavailable */}
    </div>
  );
}

function MetricCard({ title, value, note, Icon, accent = "indigo" }: MetricCardProps) {
  const accentBg = {
    indigo: "bg-indigo-600/20",
    yellow: "bg-yellow-600/20",
    blue: "bg-blue-600/20",
    purple: "bg-purple-600/20",
    green: "bg-green-600/20",
  }[accent];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`${accentBg} p-3 rounded-lg`}> 
          <Icon className={`text-${accent}-400`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm text-muted-foreground">
        <span className="mr-2">{note}</span>
      </div>
    </div>
  );
}

function CreateRewardTab({ adminRewards, refreshAdminRewards }: { adminRewards: any[]; refreshAdminRewards: () => Promise<void>; }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("badge");
  const [minTP, setMinTP] = useState<number | "">(0);
  const [minLevel, setMinLevel] = useState<Level>("Beginner");
  const [desc, setDesc] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onUpload = async (file: File | null) => {
    if (!file) return setImage(null);
    const reader = new FileReader();
    const done = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });
    setImage(done);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, desc, minTP: minTP === "" ? 0 : Number(minTP), minLevel, type, image, expiresAt: expiresAt || null }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to create reward");
      }
      setTitle(""); setType("badge"); setMinTP(0); setMinLevel("Beginner"); setDesc(""); setExpiresAt(""); setImage(null);
      await refreshAdminRewards();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    const ok = window.confirm("Delete this reward?");
    if (!ok) return;
    await fetch(`/api/admin/rewards/${id}`, { method: "DELETE" });
    await refreshAdminRewards();
  };

  const onQuickEditTitle = async (id: string, current: string) => {
    const next = window.prompt("Edit title", current);
    if (next == null) return;
    await fetch(`/api/admin/rewards/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: next }) });
    await refreshAdminRewards();
  };

  return (
    <div>
      <div className="bg-card rounded-2xl p-6 border border-border mb-8">
        <h3 className="font-semibold text-xl mb-4">Create New Reward</h3>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Reward Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Reward Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2 outline-none">
                <option value="badge">Badge</option>
                <option value="boost">Boost</option>
                <option value="access">Access</option>
                <option value="token">Token</option>
                <option value="nft">NFT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Required TP</label>
              <input type="number" value={minTP} onChange={(e) => setMinTP(e.target.value === "" ? "" : Number(e.target.value))} className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Minimum Level</label>
              <select value={minLevel} onChange={(e) => setMinLevel(e.target.value as Level)} className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2 outline-none">
                <option>Beginner</option>
                <option>Advanced</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-muted-foreground mb-1">Description</label>
              <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Expiration Date</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Reward Badge</label>
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 bg-muted border border-border rounded-lg flex items-center justify-center overflow-hidden">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <i className="text-muted-foreground">PNG</i>
                  )}
                </div>
                <label className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg cursor-pointer text-white">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 rounded-lg text-white disabled:opacity-60">{saving ? "Creating..." : "Create Reward"}</button>
          </div>
        </form>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-xl">Reward Management</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-3">Reward ID</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Min TP</th>
                <th className="pb-3">Min Level</th>
                <th className="pb-3">Created</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminRewards.map((r: any) => (
                <tr key={r.id} className="border-b border-border hover:bg-muted transition">
                  <td className="py-3">{r.id}</td>
                  <td className="py-3">{r.title}</td>
                  <td className="py-3">{r.type}</td>
                  <td className="py-3">{r.minTP ?? 0}</td>
                  <td className="py-3">{r.minLevel ?? "Beginner"}</td>
                  <td className="py-3">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-indigo-400 hover:text-indigo-300 transition" onClick={() => onQuickEditTitle(r.id, r.title)}><Edit className="w-4 h-4" /></button>
                      <button className="p-1 text-red-400 hover:text-red-300 transition" onClick={() => onDelete(r.id)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TrackerTab({ rewards, history }: { rewards: RewardItem[]; history: RewardsResponse["history"]; }) {
  const totals = useMemo(() => {
    const totalEarned = history.length * 100; // placeholder: unknown point value per claim
    const redeemed = rewards.filter(r => r.claimed).length * 100; // placeholder
    const pending = rewards.filter(r => r.claimable).length * 100; // placeholder
    const avg = totalEarned;
    return { totalEarned, redeemed, pending, avg };
  }, [rewards, history]);

  const barData = useMemo(() => {
    const byType: Record<string, number> = {};
    rewards.forEach(r => {
      byType[r.type] = (byType[r.type] || 0) + 1;
    });
    const labels = Object.keys(byType);
    return {
      labels,
      datasets: [
        { label: "Rewards", data: labels.map(l => byType[l]), backgroundColor: "rgba(99, 102, 241, 0.8)" },
      ],
    };
  }, [rewards]);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-semibold text-xl mb-4">Points Flow</h3>
          <div className="grid grid-cols-2 gap-4">
            <SmallWidget label="Total Points Earned" value={totals.totalEarned.toLocaleString()} />
            <SmallWidget label="Points Redeemed" value={totals.redeemed.toLocaleString()} />
            <SmallWidget label="Points Pending" value={totals.pending.toLocaleString()} />
            <SmallWidget label="Avg. per User" value={totals.avg.toLocaleString()} />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-semibold text-xl mb-4">Conversion Rates</h3>
          <div className="space-y-4">
            <ConversionRow leftLabel="User Conversion" leftValue="100 points" rightValue="$—" tag="User Value" />
            <ConversionRow leftLabel="Brand Cost" leftValue="100 points" rightValue="$—" tag="Brand Cost" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-xl">Reward Distribution</h3>
          <select className="bg-background border border-input rounded px-3 py-1 text-sm text-foreground">
            <option>All Time</option>
          </select>
        </div>
        <div className="h-96">
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

function ActivityLogsTab({ history }: { history: RewardsResponse["history"]; }) {
  const items = useMemo(() =>
    history.map((h, idx) => ({
      id: idx,
      actor: "User",
      text: `claimed "${h.title}"`,
      time: new Date(h.claimedAt).toLocaleString(),
      icon: CheckCircle,
      color: "green" as const,
    })), [history]);

  const colorMap: Record<string, string> = useMemo(() => ({
    indigo: "bg-indigo-600/20",
    green: "bg-green-600/20",
    yellow: "bg-yellow-600/20",
    blue: "bg-blue-600/20",
  }), []);

  return (
    <div>
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-xl">Reward Activity Logs</h3>
          <div className="flex space-x-3">
            <select className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm">
              <option>All Activities</option>
            </select>
            <button className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((a) => (
            <div key={a.id} className="border-b border-gray-800 pb-4">
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-3 ${colorMap[a.color] || "bg-blue-600/20"}`}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm"><span className="font-medium">{a.actor}</span> {a.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{a.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-400">{items.length} activities</div>
          <div className="flex space-x-2">
            <button className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm">Previous</button>
            <button className="bg-indigo-600 border border-indigo-600 rounded px-3 py-1 text-sm">1</button>
            <button className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm">2</button>
            <button className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallWidget({ label, value }: SmallWidgetProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <p className="text-sm text-gray-400">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function ConversionRow({ leftLabel, leftValue, rightValue, tag }: ConversionRowProps) {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">{leftLabel}</p>
          <div className="flex items-center mt-1">
            <h3 className="text-2xl font-bold">{leftValue}</h3>
            <span className="mx-2 text-gray-400">→</span>
            <h3 className="text-2xl font-bold">{rightValue}</h3>
          </div>
        </div>
        <span className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs">{tag}</span>
      </div>
    </div>
  );
}
