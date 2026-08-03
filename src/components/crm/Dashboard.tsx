/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import type { UserProfile } from "@/lib/auth";
import { useIsMobile } from "@/lib/useIsMobile";

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
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
  meeting: "🤝",
  status_change: "🔄",
  task_done: "✅",
  deal_created: "💼",
  contact_created: "👤",
  social_dm: "📱",
  cold_call: "📞",
  whatsapp: "💬",
  linkedin_message: "🔗",
  sms: "📨",
  other_interaction: "📌",
};

const ACTIVITY_COLORS: Record<string, string> = {
  note: "#f59e0b",
  call: "#10b981",
  email: "#6366f1",
  meeting: "#8b5cf6",
  status_change: "#8b5cf6",
  task_done: "#10b981",
  deal_created: "#f59e0b",
  contact_created: "#3b82f6",
  social_dm: "#ec4899",
  cold_call: "#f97316",
  whatsapp: "#10b981",
  linkedin_message: "#3b82f6",
  sms: "#0ea5e9",
  other_interaction: "#6b7280",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#3b82f6",
  low: "#6b7280",
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

function Sparkline({ series, color }: { series: number[]; color: string }) {
  const w = 72;
  const h = 24;
  const max = Math.max(...series, 1);
  const step = w / (series.length - 1);
  const points = series.map((v, i) => [i * step, h - 2 - (v / max) * (h - 6)]);
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polygon points={area} fill={`${color}14`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="120"
        style={{ animation: "crm-spark 0.9s ease forwards" }}
      />
    </svg>
  );
}

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
  const isMobile = useIsMobile();
  const { contacts, deals, tasks, bookings, activities } = stats;

  const isAdmin = profile.role === "admin";

  // KPIs
  const totalContacts = contacts.length;
  const activeDeals = deals.filter((d) => !["won", "lost"].includes(d.stage));
  const pipeline = activeDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
  const openTasks = tasks.filter((t: any) => t.status !== "done").length;
  const doneTasks = tasks.filter((t: any) => t.status === "done").length;
  const overdueTasks = tasks.filter(
    (t: any) => t.status !== "done" && t.due_date && new Date(t.due_date) < new Date()
  ).length;
  const wonDeals = deals.filter((d: any) => d.stage === "won").length;
  const conversionRate = deals.length > 0 ? Math.round((wonDeals / deals.length) * 100) : 0;
  const taskCompletion = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  // Pipeline by stage
  const stageGroups = Object.keys(STAGE_CONFIG).map((stage) => {
    const stageDeals = deals.filter((d: any) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((s: number, d: any) => s + (d.value || 0), 0),
    };
  });

  // 7-day activity series (for sparklines)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const series = Array.from({ length: 7 }, (_, i) => {
    const day = todayStart - (6 - i) * 86400000;
    return activities.filter((a: any) => {
      const t = new Date(a.created_at).getTime();
      return t >= day && t < day + 86400000;
    }).length;
  });

  // Upcoming tasks (open, sorted by due date)
  const upcomingTasks = tasks
    .filter((t: any) => t.status !== "done" && t.due_date)
    .slice(0, 6);

  // Activity feed grouped by day
  const yestStart = todayStart - 86400000;
  const grouped: { label: string; items: any[] }[] = [];
  activities.forEach((act: any) => {
    const t = new Date(act.created_at).getTime();
    let label: string;
    if (t >= todayStart) label = "Today";
    else if (t >= yestStart) label = "Yesterday";
    else label = new Date(act.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    let g = grouped.find((x) => x.label === label);
    if (!g) {
      g = { label, items: [] };
      grouped.push(g);
    }
    g.items.push(act);
  });

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const firstName = profile.full_name?.split(" ")[0] || profile.email?.split("@")[0];
  const todayLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const card: React.CSSProperties = {
    background: "rgb(var(--crm-card-rgb) / 0.7)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgb(var(--crm-line) / 0.08)",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgb(var(--crm-line) / 0.1)",
  };

  // Donut geometry
  const donutR = 44;
  const donutC = 2 * Math.PI * donutR;
  let offset = 0;

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh" }}>
      {/* ══════════ HERO HEADER ══════════ */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.75rem",
          animation: "crm-rise 0.5s ease both",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? "1.4rem" : "1.8rem",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, var(--crm-text), var(--crm-muted))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color: "var(--crm-faint)", marginTop: 6, fontSize: "0.88rem", fontWeight: 500 }}>
            {todayLabel} · Here&apos;s what&apos;s happening with your pipeline today.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/crm/contacts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0.55rem 1rem",
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))",
              border: "1px solid rgba(99,102,241,0.4)",
              color: "var(--crm-on-accent)",
              fontSize: "0.8rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(99,102,241,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.25)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Contact
          </Link>
          <Link
            href="/crm/reports"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0.55rem 1rem",
              borderRadius: 10,
              background: "rgb(var(--crm-overlay) / 0.06)",
              border: "1px solid rgb(var(--crm-line) / 0.12)",
              color: "var(--crm-text-2)",
              fontSize: "0.8rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgb(var(--crm-overlay) / 0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgb(var(--crm-overlay) / 0.06)";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Reports
          </Link>
        </div>
      </div>

      {/* ══════════ KPI ROW ══════════ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {[
          {
            label: "Total Contacts",
            value: totalContacts,
            sub: `${contacts.filter((c: any) => c.status === "won").length} won contacts`,
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
            sub: isAdmin ? `$${pipeline.toLocaleString()} pipeline` : `${activeDeals.length} open`,
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
        ].map((kpi, i) => (
          <div
            key={kpi.label}
            style={{
              ...card,
              padding: "1.25rem",
              transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
              animation: `crm-rise 0.5s ease both`,
              animationDelay: `${80 + i * 70}ms`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgb(var(--crm-line) / 0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgb(var(--crm-line) / 0.08)";
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
              <Sparkline series={series} color={kpi.color} />
            </div>
            <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--crm-text)", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--crm-muted)", marginTop: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--crm-faint)", marginTop: 2 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr", gap: "1.25rem" }}>
        {/* ── Left column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Pipeline health */}
          <div style={{ ...card, padding: "1.5rem", animation: "crm-rise 0.5s ease both", animationDelay: "220ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: 0, letterSpacing: "-0.01em" }}>
                Pipeline Health
              </h2>
              {isAdmin && (
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981" }}>
                  ${pipeline.toLocaleString()}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: isMobile ? "wrap" : "nowrap" }}>
              {/* Donut */}
              <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <g transform="rotate(-90 60 60)">
                    <circle cx="60" cy="60" r={donutR} fill="none" stroke="rgb(var(--crm-line) / 0.1)" strokeWidth="14" />
                    {deals.length > 0 &&
                      stageGroups.map((sg) => {
                        const cfg = STAGE_CONFIG[sg.stage];
                        const frac = sg.count / deals.length;
                        const dash = frac * donutC;
                        const seg = (
                          <circle
                            key={sg.stage}
                            cx="60"
                            cy="60"
                            r={donutR}
                            fill="none"
                            stroke={cfg.color}
                            strokeWidth="14"
                            strokeDasharray={`${Math.max(dash - 1.5, 0.5)} ${donutC - dash}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="round"
                          />
                        );
                        offset += dash;
                        return seg;
                      })}
                  </g>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--crm-text)", letterSpacing: "-0.03em" }}>{deals.length}</div>
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--crm-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>deals</div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", minWidth: 0 }}>
                {stageGroups.map((sg) => {
                  const cfg = STAGE_CONFIG[sg.stage];
                  const pct = deals.length > 0 ? Math.round((sg.count / deals.length) * 100) : 0;
                  return (
                    <div key={sg.stage} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}70`, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.8rem", color: "var(--crm-text-2)", fontWeight: 500, width: 92, flexShrink: 0 }}>
                        {cfg.label}
                      </span>
                      <div style={{ flex: 1, height: 5, background: "rgb(var(--crm-line) / 0.1)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: 999, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--crm-faint)", fontWeight: 600, minWidth: 34, textAlign: "right" }}>
                        {sg.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming tasks */}
          <div style={{ ...card, padding: "1.5rem", animation: "crm-rise 0.5s ease both", animationDelay: "300ms" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: 0, letterSpacing: "-0.01em" }}>
                Upcoming Tasks
              </h2>
              <Link href="/crm/tasks" style={{ fontSize: "0.75rem", color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
            </div>

            {tasks.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <div style={{ flex: 1, height: 5, background: "rgb(var(--crm-line) / 0.1)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${taskCompletion}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--crm-faint)", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {doneTasks}/{tasks.length} done
                </span>
              </div>
            )}

            {upcomingTasks.length === 0 ? (
              <p style={{ color: "var(--crm-faint)", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}>No upcoming tasks</p>
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
                        background: "rgb(var(--crm-overlay) / 0.03)",
                        borderRadius: 10,
                        border: "1px solid rgb(var(--crm-line) / 0.06)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgb(var(--crm-overlay) / 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgb(var(--crm-overlay) / 0.03)";
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
                        <div style={{ fontSize: "0.83rem", color: "var(--crm-text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {task.title}
                        </div>
                      </div>
                      {task.due_date && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: isOverdue ? "#ef4444" : "var(--crm-faint)",
                            flexShrink: 0,
                            ...(isOverdue
                              ? { padding: "2px 8px", borderRadius: 999, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 600 }
                              : {}),
                          }}
                        >
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

        {/* ── Right column — Activity Feed ── */}
        <div style={{ ...card, padding: "1.5rem", display: "flex", flexDirection: "column", animation: "crm-rise 0.5s ease both", animationDelay: "260ms" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>
            Recent Activity
          </h2>
          {grouped.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "var(--crm-faint)", fontSize: "0.85rem", textAlign: "center" }}>
                No activity yet.<br />Start by adding contacts!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {grouped.map((g) => (
                <div key={g.label}>
                  <div
                    style={{
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      color: "var(--crm-faint)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 8,
                    }}
                  >
                    {g.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {g.items.map((act: any) => {
                      const color = ACTIVITY_COLORS[act.type] || "#6b7280";
                      return (
                        <div key={act.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 10,
                              background: `${color}15`,
                              border: `1px solid ${color}25`,
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
                            <div style={{ fontSize: "0.8rem", color: "var(--crm-text-2)", lineHeight: 1.4 }}>
                              {act.content || `${act.type.replace(/_/g, " ")}`}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--crm-faint)", marginTop: 2, fontWeight: 500 }}>
                              {act.profiles?.full_name && `${act.profiles.full_name} · `}
                              {formatRelativeTime(act.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bookings strip */}
          {bookings.length > 0 && (
            <div
              style={{
                marginTop: "auto",
                paddingTop: "1.25rem",
                borderTop: "1px solid rgb(var(--crm-line) / 0.06)",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
              }}
            >
              {[
                { label: "Confirmed", count: bookings.filter((b: any) => b.status === "confirmed").length, color: "#3b82f6" },
                { label: "Completed", count: bookings.filter((b: any) => b.status === "completed").length, color: "#10b981" },
                { label: "Pending", count: bookings.filter((b: any) => b.status === "pending").length, color: "#f59e0b" },
                { label: "Cancelled", count: bookings.filter((b: any) => b.status === "cancelled").length, color: "#6b7280" },
              ].map((b) => (
                <div
                  key={b.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0.55rem 0.75rem",
                    borderRadius: 10,
                    background: "rgb(var(--crm-overlay) / 0.03)",
                    border: "1px solid rgb(var(--crm-line) / 0.06)",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.72rem", color: "var(--crm-muted)", flex: 1 }}>{b.label}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--crm-text)" }}>{b.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
