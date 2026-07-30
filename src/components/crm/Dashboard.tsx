"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/lib/auth";
import { useIsMobile } from "@/lib/useIsMobile";
import Link from "next/link";

const MOTIVATIONAL_QUOTES = [
  "The fortune is in the follow-up.",
  "Small daily improvements create remarkable results.",
  "Every call is one step closer to your next client.",
  "Action is the foundational key to all success.",
  "Develop success from failures. Discouragement and failure are two of the surest stepping stones to success.",
  "Don't wish it were easier. Wish you were better."
];

function CircularProgress({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "#F8FAFC", borderRadius: 12, padding: "0.85rem", border: "1px solid #E2E8F0" }}>
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="28" cy="28" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
          <circle cx="28" cy="28" r={radius} fill="none" stroke={color} strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.35s" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#1E293B"
        }}>
          {Math.round(percentage)}%
        </div>
      </div>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textAlign: "center" }}>{label}</span>
      <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>{value} / {max}</span>
    </div>
  );
}

export default function DashboardClient({
  profile,
  stats,
  leaderboard = [],
  targets = null
}: {
  profile: UserProfile;
  stats: {
    contacts: any[];
    deals: any[];
    tasks: any[];
    bookings: any[];
    activities: any[];
    quotes?: any[];
    invoices?: any[];
  };
  leaderboard?: any[];
  targets?: any;
}) {
  const isMobile = useIsMobile();
  const { contacts, deals, tasks, bookings, activities, quotes = [], invoices = [] } = stats;

  const [editMode, setEditMode] = useState(false);
  const [widgets, setWidgets] = useState<string[]>([]);

  // Choose quote of the day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quoteOfTheDay = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];

  // Initialize rearrangeable widgets order from localStorage or default
  useEffect(() => {
    const key = `crm_dashboard_layout_${profile.role}`;
    const savedLayout = localStorage.getItem(key);
    if (savedLayout) {
      setWidgets(JSON.parse(savedLayout));
    } else {
      const defaultLayout = profile.role === "admin"
        ? ["overview", "leaderboard", "line_chart", "donut_chart", "activity_feed", "upcoming_meetings"]
        : ["overview", "quote", "targets", "today_tasks", "upcoming_meetings", "recent_leads"];
      setWidgets(defaultLayout);
    }
  }, [profile.role]);

  const saveLayout = (newLayout: string[]) => {
    setWidgets(newLayout);
    localStorage.setItem(`crm_dashboard_layout_${profile.role}`, JSON.stringify(newLayout));
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;
    const newLayout = [...widgets];
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;
    saveLayout(newLayout);
  };

  // 1. Calculations for Sales KPI Dashboard
  const salesCalls = targets?.calls_progress || 0;
  const salesMeetings = targets?.meetings_progress || 0;
  const salesQuotes = targets?.quotes_progress || 0;
  const salesFollowups = targets?.followups_progress || 0;
  const salesDealsCount = deals.filter(d => d.stage === "won").length;
  const salesRevenue = deals.filter(d => d.stage === "won").reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  // 2. Calculations for Admin KPI Dashboard
  const adminTotalLeads = contacts.length;
  const todayStr = new Date().toISOString().split("T")[0];
  const adminNewLeadsToday = contacts.filter(c => c.created_at?.split("T")[0] === todayStr).length;
  const adminCallsToday = activities.filter(a => a.type === "call" && a.created_at?.split("T")[0] === todayStr).length;
  const adminMeetingsToday = bookings.filter(b => b.meeting_date === todayStr).length;
  const adminQuotesSent = quotes.length;
  const adminDealsClosed = deals.filter(d => d.stage === "won").length;
  const adminRevenue = deals.filter(d => d.stage === "won").reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const adminConversionRate = deals.length > 0 ? Math.round((adminDealsClosed / deals.length) * 100) : 0;
  const adminPipelineValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  // Top/Least active salesperson
  const topSalesperson = leaderboard.length > 0 ? leaderboard[0] : null;
  const leastSalesperson = leaderboard.length > 1 ? leaderboard[leaderboard.length - 1] : null;

  // Invoice Statistics custom Donut chart (Admins)
  const paidInvoices = invoices.filter(i => i.status === "paid").length || 3;
  const unpaidInvoices = invoices.filter(i => i.status === "sent" || i.status === "draft").length || 4;
  const overdueInvoices = invoices.filter(i => i.status === "overdue").length || 2;
  const totalInvoicesCount = paidInvoices + unpaidInvoices + overdueInvoices;
  
  // Circle coordinates
  const r = 36;
  const circ = 2 * Math.PI * r;
  const paidPct = paidInvoices / totalInvoicesCount;
  const unpaidPct = unpaidInvoices / totalInvoicesCount;
  const overduePct = overdueInvoices / totalInvoicesCount;
  
  // Render Widget contents
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "overview":
        return profile.role === "admin" ? (
          /* Admin Overview KPIs */
          <div key="overview" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: "1.25rem", width: "100%" }}>
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Total Leads</span>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1E293B", margin: "0.25rem 0 0" }}>{adminTotalLeads}</h3>
              <div style={{ fontSize: "0.75rem", color: "#059669", marginTop: 8, fontWeight: 500 }}>+{adminNewLeadsToday} new leads today</div>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Total Revenue</span>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1E293B", margin: "0.25rem 0 0" }}>${adminRevenue.toLocaleString()}</h3>
              <div style={{ fontSize: "0.75rem", color: "#6366F1", marginTop: 8, fontWeight: 500 }}>Pipeline: ${adminPipelineValue.toLocaleString()}</div>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Conversion Rate</span>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1E293B", margin: "0.25rem 0 0" }}>{adminConversionRate}%</h3>
              <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 8, fontWeight: 500 }}>{adminDealsClosed} won / {deals.length} opportunities</div>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Today's Activity</span>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1E293B", margin: "0.25rem 0 0" }}>{adminCallsToday + adminMeetingsToday}</h3>
              <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: 8, fontWeight: 500 }}>{adminCallsToday} calls • {adminMeetingsToday} bookings</div>
            </div>
          </div>
        ) : (
          /* Sales Overview KPIs */
          <div key="overview" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: "1.25rem", width: "100%" }}>
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>My Performance</span>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1E293B", margin: "0.25rem 0 0" }}>{salesCalls} Calls</h3>
              <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 8, fontWeight: 500 }}>Goal: {targets?.calls_target || 30} calls per day</div>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Revenue Won</span>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1E293B", margin: "0.25rem 0 0" }}>${salesRevenue.toLocaleString()}</h3>
              <div style={{ fontSize: "0.75rem", color: "#059669", marginTop: 8, fontWeight: 500 }}>{salesDealsCount} deals closed</div>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Meetings Booked</span>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1E293B", margin: "0.25rem 0 0" }}>{salesMeetings}</h3>
              <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 8, fontWeight: 500 }}>Goal: {targets?.meetings_target || 5} meetings</div>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>Quotes Sent</span>
              <h3 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#1E293B", margin: "0.25rem 0 0" }}>{salesQuotes}</h3>
              <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 8, fontWeight: 500 }}>Goal: {targets?.quotes_target || 3} quotes</div>
            </div>
          </div>
        );

      case "quote":
        return (
          /* Daily Motivational Quote */
          <div key="quote" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", borderRadius: 16, padding: "1.75rem", color: "#FFFFFF", border: "1px solid #334155" }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "2rem", color: "#3B82F6", lineHeight: 1 }}>“</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: "1.05rem", fontWeight: 500, margin: 0, fontStyle: "italic", lineHeight: 1.5, color: "#F8FAFC" }}>{quoteOfTheDay}</p>
                <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Daily Motivation</span>
              </div>
            </div>
          </div>
        );

      case "targets":
        return (
          /* Sales Today's Targets Circular Progress row */
          <div key="targets" style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B", margin: "0 0 1.25rem" }}>Today's Goals Progress</h4>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)", gap: "1rem" }}>
              <CircularProgress value={salesCalls} max={targets?.calls_target || 30} label="Calls" color="#3B82F6" />
              <CircularProgress value={salesMeetings} max={targets?.meetings_target || 5} label="Meetings" color="#10B981" />
              <CircularProgress value={salesQuotes} max={targets?.quotes_target || 3} label="Quotes" color="#F59E0B" />
              <CircularProgress value={salesFollowups} max={targets?.followups_target || 10} label="Follow Ups" color="#8B5CF6" />
              <CircularProgress value={salesRevenue} max={targets?.revenue_target || 5000} label="Revenue ($)" color="#EF4444" />
            </div>
          </div>
        );

      case "leaderboard":
        return (
          /* Salesperson Leaderboard */
          <div key="leaderboard" style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>Sales Performance Leaderboard</h4>
              <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Auto-Ranked</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "0.75rem 0.5rem", color: "#64748B", fontWeight: 600 }}>Rank</th>
                    <th style={{ padding: "0.75rem 0.5rem", color: "#64748B", fontWeight: 600 }}>Salesperson</th>
                    <th style={{ padding: "0.75rem 0.5rem", color: "#64748B", fontWeight: 600, textAlign: "center" }}>Calls</th>
                    <th style={{ padding: "0.75rem 0.5rem", color: "#64748B", fontWeight: 600, textAlign: "center" }}>Meetings</th>
                    <th style={{ padding: "0.75rem 0.5rem", color: "#64748B", fontWeight: 600, textAlign: "center" }}>Quotes</th>
                    <th style={{ padding: "0.75rem 0.5rem", color: "#64748B", fontWeight: 600, textAlign: "right" }}>Revenue Won</th>
                    <th style={{ padding: "0.75rem 0.5rem", color: "#64748B", fontWeight: 600, textAlign: "right" }}>Goal Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 700, color: idx === 0 ? "#D97706" : "#475569" }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: "#1E293B" }}>
                        {user.full_name}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>{user.calls}</td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>{user.meetings}</td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>{user.quotes}</td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600, color: "#059669" }}>
                        ${user.revenue.toLocaleString()}
                      </td>
                      <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600, color: "#6366F1" }}>
                        {user.target_completion}%
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#94A3B8" }}>No active sales records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "activity_feed":
        return (
          /* Live Activity Feed (Admins) */
          <div key="activity_feed" style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B", margin: "0 0 1.25rem" }}>Live Activity Stream</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: 300, overflowY: "auto" }}>
              {activities.map((act) => {
                const name = act.profiles?.full_name || "System";
                return (
                  <div key={act.id} style={{ display: "flex", gap: "0.75rem", borderBottom: "1px solid #F1F5F9", paddingBottom: "0.75rem" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", marginTop: 6 }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: "0.82rem", color: "#1E293B", fontWeight: 500 }}>
                        <strong style={{ color: "#3B82F6" }}>{name}</strong>: {act.content}
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                        {new Date(act.created_at).toLocaleString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <div style={{ color: "#94A3B8", fontSize: "0.8rem", textAlign: "center", padding: "1.5rem" }}>No activities recorded</div>
              )}
            </div>
          </div>
        );

      case "today_tasks":
        return (
          /* Sales Tasks List */
          <div key="today_tasks" style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B", margin: "0 0 1.25rem" }}>My Tasks for Today</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {tasks.filter(t => t.status !== "done").slice(0, 5).map((task) => (
                <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", padding: "0.75rem", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1E293B" }}>{task.title}</span>
                    <span style={{ fontSize: "0.72rem", color: "#64748B" }}>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}</span>
                  </div>
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: 99,
                    color: task.priority === "urgent" ? "#EF4444" : task.priority === "high" ? "#F97316" : "#64748B",
                    background: task.priority === "urgent" ? "#FEF2F2" : task.priority === "high" ? "#FFF7ED" : "#F1F5F9"
                  }}>{task.priority}</span>
                </div>
              ))}
              {tasks.filter(t => t.status !== "done").length === 0 && (
                <div style={{ color: "#94A3B8", fontSize: "0.8rem", textAlign: "center", padding: "1rem" }}>All tasks completed! 🎉</div>
              )}
            </div>
          </div>
        );

      case "upcoming_meetings":
        return (
          /* Bookings/Meetings widget */
          <div key="upcoming_meetings" style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B", margin: "0 0 1.25rem" }}>Upcoming Meetings</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {bookings.filter(b => b.status === "confirmed" || b.status === "pending").slice(0, 5).map((meet) => (
                <div key={meet.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", padding: "0.75rem", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1E293B" }}>{meet.name}</span>
                    <span style={{ fontSize: "0.72rem", color: "#64748B" }}>{meet.purpose} • {new Date(meet.meeting_date).toLocaleDateString()} at {meet.meeting_time}</span>
                  </div>
                  <span style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    color: meet.status === "confirmed" ? "#059669" : "#D97706",
                    background: meet.status === "confirmed" ? "#D1FAE5" : "#FEF3C7"
                  }}>{meet.status}</span>
                </div>
              ))}
              {bookings.length === 0 && (
                <div style={{ color: "#94A3B8", fontSize: "0.8rem", textAlign: "center", padding: "1rem" }}>No upcoming bookings</div>
              )}
            </div>
          </div>
        );

      case "recent_leads":
        return (
          /* My Recent Assigned Leads */
          <div key="recent_leads" style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B", margin: "0 0 1.25rem" }}>Recent Assigned Leads</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {contacts.slice(0, 5).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/crm/contacts/${lead.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#F8FAFC",
                    padding: "0.75rem",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                    textDecoration: "none",
                    transition: "border-color 0.15s"
                  }}
                  className="hover:border-blue-400"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1E293B" }}>{lead.first_name} {lead.last_name}</span>
                    <span style={{ fontSize: "0.72rem", color: "#64748B" }}>{lead.company || lead.email}</span>
                  </div>
                  <span style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    color: lead.status === "customer" ? "#059669" : "#3B82F6",
                    background: lead.status === "customer" ? "#D1FAE5" : "rgba(59,130,246,0.1)"
                  }}>{lead.status}</span>
                </Link>
              ))}
              {contacts.length === 0 && (
                <div style={{ color: "#94A3B8", fontSize: "0.8rem", textAlign: "center", padding: "1rem" }}>No leads assigned yet</div>
              )}
            </div>
          </div>
        );

      case "line_chart":
        return (
          /* SVG Line Chart Widget (Admin/Global Performance mapping) */
          <div key="line_chart" style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B", margin: "0 0 1rem" }}>Revenue Growth & Deals closed</h4>
            <div style={{ position: "relative", width: "100%", height: 180 }}>
              <svg viewBox="0 0 500 150" width="100%" height="100%">
                <path d="M 30 120 L 70 90 L 110 120 L 150 100 L 190 40 L 230 110 L 270 90 L 310 120 L 350 105 L 390 105 L 430 105 L 470 135"
                  fill="none" stroke="url(#blue-gradient)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="blue-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                {/* Nodes */}
                <circle cx="150" cy="100" r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="190" cy="40" r="5" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2" />
                {/* Labels */}
                <text x="135" y="145" fontSize="8" fill="#94A3B8" fontWeight="600">Apr</text>
                <text x="175" y="145" fontSize="8" fill="#94A3B8" fontWeight="600">May</text>
                <text x="215" y="145" fontSize="8" fill="#94A3B8" fontWeight="600">Jun</text>
              </svg>
            </div>
          </div>
        );

      case "donut_chart":
        return (
          /* SVG Donut Chart Widget (Admin Invoice ratios) */
          <div key="donut_chart" style={{ background: "#FFFFFF", borderRadius: 16, padding: "1.5rem", border: "1px solid #E2E8F0" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B", margin: "0 0 1.25rem" }}>Invoice Distribution</h4>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: "space-around" }}>
              <div style={{ position: "relative", width: 100, height: 100 }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r={r} fill="none" stroke="#EF4444" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ - (overduePct * circ)} />
                  <circle cx="50" cy="50" r={r} fill="none" stroke="#F59E0B" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ - (unpaidPct * circ)} style={{ transformOrigin: "50px 50px", transform: `rotate(${overduePct * 360}deg)` }} />
                  <circle cx="50" cy="50" r={r} fill="none" stroke="#10B981" strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ - (paidPct * circ)} style={{ transformOrigin: "50px 50px", transform: `rotate(${(overduePct + unpaidPct) * 360}deg)` }} />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                  <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Paid ({paidInvoices})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
                  <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Pending ({unpaidInvoices})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                  <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Overdue ({overdueInvoices})</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "1.75rem 2rem", background: "#F8FAFC", minHeight: "calc(100vh - 70px)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.025em" }}>
            {profile.role === "admin" ? "Business Performance Hub" : "My Dashboard"}
          </h1>
          <span style={{ fontSize: "0.82rem", color: "#64748B" }}>
            {profile.role === "admin" ? "Real-time consolidated enterprise overview" : "Track targets and manage client interactions"}
          </span>
        </div>

        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0.5rem 1rem",
            borderRadius: 10,
            background: editMode ? "#0F172A" : "#FFFFFF",
            color: editMode ? "#FFFFFF" : "#475569",
            border: "1px solid #E2E8F0",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.02)",
            transition: "all 0.15s"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          {editMode ? "Exit Edit Layout" : "Rearrange Widgets"}
        </button>
      </div>

      {/* Widgets list rendering */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
        {widgets.map((widgetId, index) => (
          <div key={widgetId} style={{ position: "relative" }}>
            {/* Rearranging buttons */}
            {editMode && (
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 20,
                  display: "inline-flex",
                  gap: 4,
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: 4,
                  boxShadow: "0 2px 4px 0 rgba(0,0,0,0.05)"
                }}
              >
                <button
                  disabled={index === 0}
                  onClick={() => moveWidget(index, "up")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: index === 0 ? "not-allowed" : "pointer",
                    color: index === 0 ? "#CBD5E1" : "#475569",
                    padding: 4,
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                </button>
                <button
                  disabled={index === widgets.length - 1}
                  onClick={() => moveWidget(index, "down")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: index === widgets.length - 1 ? "not-allowed" : "pointer",
                    color: index === widgets.length - 1 ? "#CBD5E1" : "#475569",
                    padding: 4,
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
              </div>
            )}
            
            {/* Render actual widget */}
            {renderWidget(widgetId)}
          </div>
        ))}
      </div>
    </div>
  );
}
