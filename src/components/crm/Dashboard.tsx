"use client";

import type { UserProfile } from "@/lib/auth";

const STAGE_CONFIG = {
  new: { label: "New", color: "#6366f1" },
  qualified: { label: "Qualified", color: "#3b82f6" },
  proposal: { label: "Proposal", color: "#f59e0b" },
  negotiation: { label: "Negotiation", color: "#f97316" },
  won: { label: "Won", color: "#10b981" },
  lost: { label: "Lost", color: "#6b7280" },
};

const ACTIVITY_ICONS: Record<string, string> = {
  note: "📝",
  call: "📞",
  email: "✉️",
  meeting: "📅",
  status_change: "🔄",
  task_done: "✅",
  deal_created: "💼",
  contact_created: "👤",
};

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#3b82f6",
  low: "#6b7280",
};

export default function DashboardClient({
  profile,
  stats,
}: {
  profile: UserProfile;
  stats: {
    contacts: any[];
    deals: any[];
    tasks: any[];
    bookings: any[];
    activities: any[];
  };
}) {
  const { contacts, deals, tasks, bookings, activities } = stats;

  // Compute KPIs
  const totalContacts = contacts.length;
  const activeDeals = deals.filter((d) => !["won", "lost"].includes(d.stage));
  const pipeline = activeDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
  const openTasks = tasks.filter((t: any) => t.status !== "done").length;
  const overdueTasks = tasks.filter(
    (t: any) => t.status !== "done" && t.due_date && new Date(t.due_date) < new Date()
  ).length;
  const wonDeals = deals.filter((d: any) => d.stage === "won").length;
  const conversionRate =
    deals.length > 0 ? Math.round((wonDeals / deals.length) * 100) : 0;

  // Pipeline by stage
  const stageGroups = Object.keys(STAGE_CONFIG).map((stage) => {
    const stageDeals = deals.filter((d: any) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((s: number, d: any) => s + (d.value || 0), 0),
    };
  });
  const maxStageCount = Math.max(...stageGroups.map((s) => s.count), 1);

  // Upcoming tasks (open, sorted by due date)
  const upcomingTasks = tasks
    .filter((t: any) => t.status !== "done" && t.due_date)
    .slice(0, 6);

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const firstName = profile.full_name?.split(" ")[0] || profile.email?.split("@")[0];

  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#fcfcfe",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ color: "#5d5e60", marginTop: 4, fontSize: "0.9rem" }}>
          Here&apos;s what&apos;s happening with your pipeline today.
        </p>
      </div>

      {/* KPI Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {[
          {
            label: "Total Contacts",
            value: totalContacts,
            sub: `${contacts.filter((c: any) => c.status === "customer").length} customers`,
            color: "#6366f1",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
          },
          {
            label: "Active Deals",
            value: activeDeals.length,
            sub: profile.role === "admin" ? `$${pipeline.toLocaleString()} pipeline` : `${activeDeals.length} open`,
            color: "#10b981",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
          },
          {
            label: "Open Tasks",
            value: openTasks,
            sub: overdueTasks > 0 ? `${overdueTasks} overdue` : "All on track",
            color: overdueTasks > 0 ? "#ef4444" : "#f59e0b",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            ),
          },
          {
            label: "Conversion Rate",
            value: `${conversionRate}%`,
            sub: `${wonDeals} won of ${deals.length} deals`,
            color: "#3b82f6",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
              </svg>
            ),
          },
          {
            label: "Bookings (7d)",
            value: bookings.length,
            sub: `${bookings.filter((b: any) => b.status === "confirmed").length} confirmed`,
            color: "#8b5cf6",
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "rgb(13 13 18 / 70%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(177,178,180,0.08)",
              borderRadius: 16,
              padding: "1.25rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              transition: "border-color 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${kpi.color}18`,
                  border: `1px solid ${kpi.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: kpi.color,
                }}
              >
                {kpi.icon}
              </div>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fcfcfe", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#818286", marginTop: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: "0.72rem", color: "#5d5e60", marginTop: 2 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Pipeline by stage */}
          <div
            style={{
              background: "rgb(13 13 18 / 70%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(177,178,180,0.08)",
              borderRadius: 16,
              padding: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fcfcfe", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>
              Deal Pipeline
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {stageGroups.map((sg) => {
                const cfg = STAGE_CONFIG[sg.stage as keyof typeof STAGE_CONFIG];
                const pct = maxStageCount > 0 ? (sg.count / maxStageCount) * 100 : 0;
                return (
                  <div key={sg.stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: "0.8rem", color: "#b1b2b4", fontWeight: 500 }}>{cfg.label}</span>
                      <span style={{ fontSize: "0.8rem", color: "#5d5e60" }}>
                        {sg.count} deal{sg.count !== 1 ? "s" : ""}
                        {profile.role === "admin" && sg.value > 0 && (
                          <span style={{ marginLeft: 8, color: "#818286" }}>${sg.value.toLocaleString()}</span>
                        )}
                      </span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: cfg.color,
                          borderRadius: 999,
                          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                          boxShadow: `0 0 8px ${cfg.color}50`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming tasks */}
          <div
            style={{
              background: "rgb(13 13 18 / 70%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(177,178,180,0.08)",
              borderRadius: 16,
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fcfcfe", margin: 0, letterSpacing: "-0.01em" }}>
                Upcoming Tasks
              </h2>
              <a href="/crm/tasks" style={{ fontSize: "0.75rem", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>View all →</a>
            </div>
            {upcomingTasks.length === 0 ? (
              <p style={{ color: "#5d5e60", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}>No upcoming tasks</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcomingTasks.map((task: any) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                  return (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "0.6rem 0.75rem",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                        border: "1px solid rgba(177,178,180,0.06)",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: PRIORITY_COLORS[task.priority] || "#6b7280",
                          flexShrink: 0,
                          boxShadow: `0 0 6px ${PRIORITY_COLORS[task.priority] || "#6b7280"}80`,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.83rem", color: "#fcfcfe", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {task.title}
                        </div>
                      </div>
                      {task.due_date && (
                        <span style={{ fontSize: "0.72rem", color: isOverdue ? "#ef4444" : "#5d5e60", flexShrink: 0 }}>
                          {isOverdue ? "⚠️ " : ""}{formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right col — Activity Feed */}
        <div
          style={{
            background: "rgb(13 13 18 / 70%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(177,178,180,0.08)",
            borderRadius: 16,
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fcfcfe", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>
            Recent Activity
          </h2>
          {activities.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#3d3e40", fontSize: "0.85rem", textAlign: "center" }}>
                No activity yet.<br />Start by adding contacts!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {activities.map((act: any) => (
                <div key={act.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(177,178,180,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    {ACTIVITY_ICONS[act.type] || "📌"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", color: "#b1b2b4", lineHeight: 1.4 }}>
                      {act.content || `${act.type.replace(/_/g, " ")}`}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#3d3e40", marginTop: 2 }}>
                      {act.profiles?.full_name && `${act.profiles.full_name} · `}
                      {formatRelativeTime(act.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
