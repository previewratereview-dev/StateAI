"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Deal, DealStage } from "@/app/actions/deals";
import { createDeal, updateDealStage, deleteDeal } from "@/app/actions/deals";
import { useIsMobile } from "@/lib/useIsMobile";

const STAGES: { key: DealStage; label: string; color: string; prob: number }[] = [
  { key: "new", label: "New", color: "#6366f1", prob: 10 },
  { key: "qualified", label: "Qualified", color: "#3b82f6", prob: 25 },
  { key: "proposal", label: "Proposal", color: "#f59e0b", prob: 50 },
  { key: "negotiation", label: "Negotiation", color: "#f97316", prob: 75 },
  { key: "won", label: "Won", color: "#10b981", prob: 100 },
  { key: "lost", label: "Lost", color: "#6b7280", prob: 0 },
];

function formatCurrency(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v.toLocaleString()}`;
}

function DaysBadge({ createdAt }: { createdAt: string }) {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  const color = days > 30 ? "#ef4444" : days > 14 ? "#f59e0b" : "#6b7280";
  return <span style={{ fontSize: "0.65rem", color, fontWeight: 600 }}>{days}d</span>;
}

function DealCard({ deal, isAdmin, onMove, onDelete }: { deal: Deal; isAdmin: boolean; onMove: (id: string, stage: DealStage) => void; onDelete: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const contactName = deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : null;
  const stage = STAGES.find(s => s.key === deal.stage)!;

  return (
    <div style={{ background: "rgb(var(--crm-card-rgb) / 80%)", border: "1px solid rgb(var(--crm-line) / 0.1)", borderRadius: 12, padding: "0.875rem", marginBottom: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.3)", transition: "all 0.2s" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgb(var(--crm-line) / 0.2)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgb(var(--crm-line) / 0.1)"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--crm-text)", flex: 1, paddingRight: 8 }}>{deal.title}</div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowMenu(s => !s)} style={{ background: "none", border: "none", color: "var(--crm-faint)", cursor: "pointer", padding: "0 4px", fontSize: "1rem" }}>⋯</button>
          {showMenu && (
            <div style={{ position: "absolute", right: 0, top: "100%", background: "var(--crm-modal)", border: "1px solid rgb(var(--crm-line) / 0.1)", borderRadius: 10, overflow: "hidden", zIndex: 10, minWidth: 140, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
              {STAGES.filter(s => s.key !== deal.stage).map(s => (
                <button key={s.key} onClick={() => { setShowMenu(false); onMove(deal.id, s.key); }}
                  style={{ display: "block", width: "100%", padding: "0.6rem 0.875rem", textAlign: "left", background: "none", border: "none", color: s.color, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                  Move to {s.label}
                </button>
              ))}
              {isAdmin && <button onClick={() => { setShowMenu(false); onDelete(deal.id); }} style={{ display: "block", width: "100%", padding: "0.6rem 0.875rem", textAlign: "left", background: "none", border: "none", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer", borderTop: "1px solid rgb(var(--crm-line) / 0.06)", fontFamily: "inherit" }}>Delete</button>}
            </div>
          )}
        </div>
      </div>
      {contactName && <div style={{ fontSize: "0.75rem", color: "var(--crm-muted)", marginBottom: 6 }}>👤 {contactName}</div>}
      {deal.contacts?.company && <div style={{ fontSize: "0.72rem", color: "var(--crm-faint)", marginBottom: 8 }}>🏢 {deal.contacts.company}</div>}
      {deal.profiles?.full_name && <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 600, color: "#818cf8", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", marginBottom: 8 }}>🧑‍💼 {deal.profiles.full_name}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: stage.color }}>{formatCurrency(deal.value || 0)}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.68rem", color: "var(--crm-faint)" }}>{deal.probability}%</span>
          <DaysBadge createdAt={deal.created_at} />
        </div>
      </div>
    </div>
  );
}

function AddDealDrawer({ contacts, onClose, onSaved }: { contacts: { id: string; first_name: string; last_name: string }[]; onClose: () => void; onSaved: (d: Deal) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = { width: "100%", background: "rgb(var(--crm-overlay) / 0.04)", border: "1px solid rgb(var(--crm-line) / 0.12)", borderRadius: 10, padding: "0.65rem 0.875rem", color: "var(--crm-text)", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createDeal(fd);
      if (res.error) { setError(res.error); return; }
      onSaved(res.data!);
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ width: 420, background: "var(--crm-modal)", borderLeft: "1px solid rgb(var(--crm-line) / 0.1)", height: "100%", overflowY: "auto", padding: "1.75rem", boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--crm-text)", margin: 0 }}>New Deal</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--crm-faint)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { name: "title", label: "Deal Title *", type: "text", required: true },
          ].map(f => (
            <div key={f.name} style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--crm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
              <input name={f.name} type={f.type} required={f.required} style={inputStyle} />
            </div>
          ))}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--crm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contact</label>
            <select name="contact_id" style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">— None —</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--crm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Value ($)</label>
              <input name="value" type="number" min="0" step="0.01" defaultValue="0" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--crm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Probability (%)</label>
              <input name="probability" type="number" min="0" max="100" defaultValue="10" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--crm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Stage</label>
              <select name="stage" style={{ ...inputStyle, cursor: "pointer" }}>
                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--crm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Close Date</label>
              <input name="expected_close_date" type="date" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--crm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</label>
            <textarea name="description" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: "1rem", background: "rgba(239,68,68,0.08)", padding: "0.6rem 0.75rem", borderRadius: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.7rem", borderRadius: 10, background: "rgb(var(--crm-overlay) / 0.05)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={isPending} style={{ flex: 2, padding: "0.7rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "none", color: "var(--crm-on-accent)", cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700 }}>
              {isPending ? "Creating…" : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeadsPipeline({ initialDeals, contacts, isAdmin }: { initialDeals: Deal[]; contacts: any[]; isAdmin: boolean }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleMove(id: string, stage: DealStage) {
    const previous = [...deals];
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d));
    startTransition(async () => {
      const res = await updateDealStage(id, stage);
      if (!res.success) { setDeals(previous); showToast(res.error || "Failed to move", "error"); }
      else showToast(`Moved to ${stage}`, "success");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this deal?")) return;
    const previous = [...deals];
    setDeals(prev => prev.filter(d => d.id !== id));
    startTransition(async () => {
      const res = await deleteDeal(id);
      if (!res.success) { setDeals(previous); showToast(res.error || "Failed", "error"); }
    });
  }

  function handleDealSaved(deal: Deal) {
    setDeals(prev => [deal, ...prev]);
    setShowAddDeal(false);
    showToast("Deal created!", "success");
  }

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}
      {showAddDeal && <AddDealDrawer contacts={contacts} onClose={() => setShowAddDeal(false)} onSaved={handleDealSaved} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "var(--crm-text)", margin: 0, letterSpacing: "-0.03em" }}>Pipeline</h1>
          <p style={{ color: "var(--crm-faint)", fontSize: "0.85rem", marginTop: 4 }}>
            {deals.length} deals · <span style={{ color: "#10b981" }}>${(deals.reduce((acc, d) => acc + (d.value || 0), 0)).toLocaleString()} total</span>
          </p>
        </div>
        <button onClick={() => setShowAddDeal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.65rem 1.25rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "1px solid rgba(99,102,241,0.4)", color: "var(--crm-on-accent)", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(99,102,241,0.2)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Deal
        </button>
      </div>

      {/* Kanban */}
      <div style={{ display: "flex", gap: "1rem", overflowX: "auto", flex: 1, paddingBottom: "1rem" }}>
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.key);
          const stageValue = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
          return (
            <div key={stage.key} style={{ flex: isMobile ? "0 0 240px" : "0 0 280px", display: "flex", flexDirection: "column" }}>
              {/* Column header */}
              <div style={{ padding: "0.875rem", background: "rgb(var(--crm-card-rgb) / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgb(var(--crm-line) / 0.08)", borderRadius: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, boxShadow: `0 0 8px ${stage.color}70` }} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--crm-text)" }}>{stage.label}</span>
                    <span style={{ fontSize: "0.72rem", background: `${stage.color}18`, color: stage.color, border: `1px solid ${stage.color}30`, padding: "1px 7px", borderRadius: 999, fontWeight: 700 }}>{stageDeals.length}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--crm-faint)" }}>{formatCurrency(stageValue)}</span>
                </div>
              </div>
              {/* Cards */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {stageDeals.length === 0 && (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--crm-faint)", fontSize: "0.78rem", border: "1px dashed rgb(var(--crm-line) / 0.08)", borderRadius: 12 }}>No deals</div>
                )}
                {stageDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} isAdmin={isAdmin} onMove={handleMove} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
