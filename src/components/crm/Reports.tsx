"use client";

import { useIsMobile } from "@/lib/useIsMobile";

const STAGE_CFG: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "#6366f1" },
  qualified: { label: "Qualified", color: "#3b82f6" },
  proposal: { label: "Proposal", color: "#f59e0b" },
  negotiation: { label: "Negotiation", color: "#f97316" },
  won: { label: "Won", color: "#10b981" },
  lost: { label: "Lost", color: "#6b7280" },
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "#6b7280" },
  contacted: { label: "Contacted", color: "#f59e0b" },
  qualified: { label: "Qualified", color: "#6366f1" },
  proposal: { label: "Proposal", color: "#8b5cf6" },
  negotiation: { label: "Negotiation", color: "#ec4899" },
  won: { label: "Won", color: "#10b981" },
  lost: { label: "Lost", color: "#ef4444" },
  churned: { label: "Churned", color: "#6b7280" },
};

const BOOKING_STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#f59e0b" },
  confirmed: { label: "Confirmed", color: "#3b82f6" },
  completed: { label: "Completed", color: "#10b981" },
  cancelled: { label: "Cancelled", color: "#6b7280" },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ height: 6, background: "rgb(var(--crm-overlay) / 0.05)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 6px ${color}60` }} />
    </div>
  );
}

export default function ReportsClient({
  stats,
  teamPerformance,
  isAdmin,
}: {
  stats: { contacts: any[]; deals: any[]; tasks: any[]; bookings: any[]; activities: any[] };
  teamPerformance: {
    id: string; full_name: string;
    contacts_added: number; contacts_owned: number; deals_owned: number;
    won_count: number; won_value: number; pipeline_value: number; activities: number;
  }[];
  isAdmin: boolean;
}) {
  const isMobile = useIsMobile();
  const { contacts, deals, tasks, bookings } = stats;

  // ── Pipeline by stage ──────────────────────────────────────────────────────
  const stageData = Object.keys(STAGE_CFG).map(stage => ({
    stage,
    count: deals.filter(d => d.stage === stage).length,
    value: deals.filter(d => d.stage === stage).reduce((s: number, d: any) => s + (d.value || 0), 0),
  }));
  const maxCount = Math.max(...stageData.map(s => s.count), 1);

  // ── Contact status breakdown ────────────────────────────────────────────────
  const contactStatusData = Object.keys(STATUS_CFG).map(status => ({
    status,
    count: contacts.filter(c => c.status === status).length,
  }));
  const maxContactCount = Math.max(...contactStatusData.map(s => s.count), 1);

  // ── Booking status ─────────────────────────────────────────────────────────
  const bookingStatusData = Object.keys(BOOKING_STATUS_CFG).map(status => ({
    status,
    count: bookings.filter((b: any) => b.status === status).length,
  }));

  // ── Task overview ──────────────────────────────────────────────────────────
  const tasksDone = tasks.filter(t => t.status === "done").length;
  const tasksOpen = tasks.filter(t => t.status === "open").length;
  const tasksInProgress = tasks.filter(t => t.status === "in_progress").length;
  const tasksTotal = tasks.length;
  const taskCompletion = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  // ── Won vs Total ───────────────────────────────────────────────────────────
  const won = deals.filter(d => d.stage === "won");
  const lost = deals.filter(d => d.stage === "lost");
  const totalPipeline = deals.filter(d => !["won", "lost"].includes(d.stage)).reduce((s: number, d: any) => s + (d.value || 0), 0);
  const wonRevenue = won.reduce((s: number, d: any) => s + (d.value || 0), 0);
  const conversionRate = deals.length > 0 ? Math.round((won.length / deals.length) * 100) : 0;

  // ── Recent bookings breakdown ──────────────────────────────────────────────
  const bookingBreakdown = Object.keys(BOOKING_STATUS_CFG).map(s => ({
    status: s,
    count: bookings.filter(b => b.status === s).length,
  }));
  const maxBookingCount = Math.max(...bookingBreakdown.map(b => b.count), 1);

  // Shared card style
  const card: React.CSSProperties = {
    background: "rgb(var(--crm-card-rgb) / 70%)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgb(var(--crm-line) / 0.08)",
    borderRadius: 16,
    padding: "1.5rem",
  };

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.6rem", fontWeight: 700, color: "var(--crm-text)", margin: 0, letterSpacing: "-0.03em" }}>Reports & Analytics</h1>
        <p style={{ color: "var(--crm-faint)", fontSize: "0.85rem", marginTop: 4 }}>Pipeline performance and team metrics</p>
      </div>

      {/* Top KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Contacts", value: contacts.length.toString(), color: "#6366f1" },
          { label: "Total Deals", value: deals.length.toString(), color: "#3b82f6" },
          { label: "Conversion Rate", value: `${conversionRate}%`, color: "#10b981" },
          ...(isAdmin ? [{ label: "Pipeline Value", value: formatCurrency(totalPipeline), color: "#f59e0b" }, { label: "Revenue Won", value: formatCurrency(wonRevenue), color: "#10b981" }] : []),
          { label: "Tasks Done", value: `${taskCompletion}%`, color: "#8b5cf6" },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...card, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: kpi.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--crm-faint)", marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Pipeline by stage */}
        <div style={card}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>Pipeline by Stage</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {stageData.map(sg => {
              const cfg = STAGE_CFG[sg.stage];
              return (
                <div key={sg.stage}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}70` }} />
                      <span style={{ fontSize: "0.82rem", color: "var(--crm-text-2)", fontWeight: 500 }}>{cfg.label}</span>
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "var(--crm-faint)" }}>
                      {sg.count} deal{sg.count !== 1 ? "s" : ""}
                      {isAdmin && sg.value > 0 && <span style={{ marginLeft: 8 }}>{formatCurrency(sg.value)}</span>}
                    </span>
                  </div>
                  <MiniBar value={sg.count} max={maxCount} color={cfg.color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion funnel */}
        <div style={card}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>Conversion Funnel</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Total Deals", count: deals.length, color: "#6366f1" },
              { label: "Active (non-lost)", count: deals.filter(d => d.stage !== "lost").length, color: "#3b82f6" },
              { label: "In Proposal/Negotiation", count: deals.filter(d => ["proposal", "negotiation"].includes(d.stage)).length, color: "#f59e0b" },
              { label: "Won", count: won.length, color: "#10b981" },
            ].map((item, i, arr) => {
              const maxVal = arr[0].count;
              const widthPct = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
              return (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--crm-text-2)" }}>{item.label}</span>
                      <span style={{ fontSize: "0.78rem", color: item.color, fontWeight: 700 }}>{item.count}</span>
                    </div>
                    <div style={{ height: 8, background: "rgb(var(--crm-overlay) / 0.05)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${widthPct}%`, background: item.color, borderRadius: 999, boxShadow: `0 0 8px ${item.color}50` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ paddingTop: 12, borderTop: "1px solid rgb(var(--crm-line) / 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--crm-muted)" }}>Win Rate</span>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981" }}>{conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.5rem" }}>
        {/* Contact breakdown */}
        <div style={card}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>Contact Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {contactStatusData.map(cd => {
              const cfg = STATUS_CFG[cd.status];
              return (
                <div key={cd.status}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--crm-text-2)" }}>{cfg.label}</span>
                    <span style={{ fontSize: "0.8rem", color: cfg.color, fontWeight: 700 }}>{cd.count}</span>
                  </div>
                  <MiniBar value={cd.count} max={maxContactCount} color={cfg.color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Task completion */}
        <div style={card}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>Task Overview</h2>
          {/* Donut-style */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
            <div style={{ position: "relative", width: 100, height: 100 }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgb(var(--crm-overlay) / 0.05)" strokeWidth="12" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray={`${taskCompletion * 2.388} 238.8`} strokeDashoffset="59.7" strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981" }}>{taskCompletion}%</div>
                <div style={{ fontSize: "0.6rem", color: "var(--crm-faint)" }}>done</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[{ label: "Open", count: tasksOpen, color: "#f59e0b" }, { label: "In Progress", count: tasksInProgress, color: "#3b82f6" }, { label: "Done", count: tasksDone, color: "#10b981" }].map(t => (
              <div key={t.label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--crm-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, display: "inline-block" }} />{t.label}
                </span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: t.color }}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings (7-day window) */}
        <div style={card}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: "0 0 1.25rem", letterSpacing: "-0.01em" }}>Bookings (7 days)</h2>
          {bookings.length === 0 ? (
            <p style={{ color: "var(--crm-faint)", fontSize: "0.85rem" }}>No bookings in the last 7 days.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {bookingBreakdown.map(b => {
                const cfg = BOOKING_STATUS_CFG[b.status];
                return (
                  <div key={b.status}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--crm-text-2)" }}>{cfg.label}</span>
                      <span style={{ fontSize: "0.8rem", color: cfg.color, fontWeight: 700 }}>{b.count}</span>
                    </div>
                    <MiniBar value={b.count} max={maxBookingCount} color={cfg.color} />
                  </div>
                );
              })}
              <div style={{ paddingTop: 12, borderTop: "1px solid rgb(var(--crm-line) / 0.06)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--crm-muted)" }}>Total</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--crm-text)" }}>{bookings.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team performance (admin only) */}
      {isAdmin && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--crm-text)", margin: 0, letterSpacing: "-0.01em" }}>Team Performance</h2>
              <span style={{ fontSize: "0.75rem", color: "var(--crm-faint)" }}>Per salesperson · revenue and pipeline owned</span>
            </div>
            {teamPerformance.length === 0 ? (
              <p style={{ color: "var(--crm-faint)", fontSize: "0.85rem" }}>No team members found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgb(var(--crm-line) / 0.1)" }}>
                      {["Salesperson", "Contacts Added", "Owned", "Deals Owned", "Won", "Revenue Won", "Pipeline Value", "Activities"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.6rem 0.875rem", fontSize: "0.68rem", fontWeight: 700, color: "var(--crm-faint)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teamPerformance.map(p => (
                      <tr key={p.id} style={{ borderBottom: "1px solid rgb(var(--crm-line) / 0.05)", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgb(var(--crm-overlay) / 0.02)"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                        <td style={{ padding: "0.7rem 0.875rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "#818cf8", flexShrink: 0 }}>
                              {p.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--crm-text)", whiteSpace: "nowrap" }}>{p.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "0.7rem 0.875rem", fontSize: "0.82rem", color: "var(--crm-text-2)" }}>{p.contacts_added}</td>
                        <td style={{ padding: "0.7rem 0.875rem", fontSize: "0.82rem", color: "var(--crm-text-2)" }}>{p.contacts_owned}</td>
                        <td style={{ padding: "0.7rem 0.875rem", fontSize: "0.82rem", color: "var(--crm-text-2)" }}>{p.deals_owned}</td>
                        <td style={{ padding: "0.7rem 0.875rem", fontSize: "0.82rem", color: "#10b981", fontWeight: 700 }}>{p.won_count}</td>
                        <td style={{ padding: "0.7rem 0.875rem", fontSize: "0.82rem", color: "#10b981", fontWeight: 700, whiteSpace: "nowrap" }}>{formatCurrency(p.won_value)}</td>
                        <td style={{ padding: "0.7rem 0.875rem", fontSize: "0.82rem", color: "#f59e0b", fontWeight: 600, whiteSpace: "nowrap" }}>{formatCurrency(p.pipeline_value)}</td>
                        <td style={{ padding: "0.7rem 0.875rem", fontSize: "0.82rem", color: "var(--crm-muted)" }}>{p.activities}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
