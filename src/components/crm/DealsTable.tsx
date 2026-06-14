"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Deal, DealStage } from "@/app/actions/deals";
import { createDeal, updateDeal, deleteDeal } from "@/app/actions/deals";
import { useIsMobile } from "@/lib/useIsMobile";

const STAGE_CFG: Record<DealStage, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  qualified: { label: "Qualified", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  proposal: { label: "Proposal", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  negotiation: { label: "Negotiation", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  won: { label: "Won", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  lost: { label: "Lost", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DealsTable({ initialDeals, contacts, isAdmin }: { initialDeals: Deal[]; contacts: any[]; isAdmin: boolean }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [deals, setDeals] = useState(initialDeals);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: Deal | null }>({ open: false });
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const filtered = useMemo(() => deals.filter(d => {
    if (stageFilter !== "all" && d.stage !== stageFilter) return false;
    const q = search.toLowerCase();
    return !q || d.title.toLowerCase().includes(q) || (d.contacts ? `${d.contacts.first_name} ${d.contacts.last_name}`.toLowerCase().includes(q) : false);
  }), [deals, search, stageFilter]);

  const totalPipeline = deals.filter(d => !["won", "lost"].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);

  function showToast(msg: string, type: "success" | "error") { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  function handleDelete(id: string) {
    if (!confirm("Delete this deal?")) return;
    setDeals(prev => prev.filter(d => d.id !== id));
    startTransition(async () => {
      const res = await deleteDeal(id);
      if (!res.success) { setDeals(initialDeals); showToast(res.error || "Failed", "error"); }
    });
  }

  const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.12)", borderRadius: 10, padding: "0.65rem 0.875rem", color: "#fcfcfe", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}

      {/* Add Drawer */}
      {drawer.open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setDrawer({ open: false })} />
          <div style={{ width: isMobile ? "100%" : 460, background: "#0d0d12", borderLeft: "1px solid rgba(177,178,180,0.1)", height: "100%", overflowY: "auto", padding: "1.75rem", boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fcfcfe", margin: 0 }}>{drawer.editing ? "Edit Deal" : "New Deal"}</h2>
              <button onClick={() => setDrawer({ open: false })} style={{ background: "none", border: "none", color: "#5d5e60", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); const payload = { title: fd.get("title") as string, contact_id: (fd.get("contact_id") as string) || null, value: parseFloat((fd.get("value") as string) || "0"), stage: (fd.get("stage") as any) || "new", probability: parseInt((fd.get("probability") as string) || "10"), expected_close_date: (fd.get("expected_close_date") as string) || null }; startTransition(async () => { const res = drawer.editing ? await updateDeal(drawer.editing.id, payload) : await createDeal(fd); if (res.data) { if(drawer.editing) setDeals(p => p.map(d => d.id === res.data!.id ? res.data! : d)); else setDeals(p => [res.data!, ...p]); setDrawer({ open: false }); showToast("Success!", "success"); } else showToast(res.error || "Failed", "error"); }); }}>
              <input type="hidden" name="id" defaultValue={drawer.editing?.id} />
              <div style={{ marginBottom: "1rem" }}><label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#818286", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title *</label><input name="title" defaultValue={drawer.editing?.title} required style={inputStyle} /></div>
              <div style={{ marginBottom: "1rem" }}><label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#818286", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Contact</label><select name="contact_id" defaultValue={drawer.editing?.contact_id || ""} style={{ ...inputStyle, cursor: "pointer" }}><option value="">— None —</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div><label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#818286", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Value ($)</label><input name="value" type="number" min="0" step="0.01" defaultValue={drawer.editing?.value || 0} style={inputStyle} /></div>
                <div><label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#818286", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Stage</label><select name="stage" defaultValue={drawer.editing?.stage || "new"} style={{ ...inputStyle, cursor: "pointer" }}>{Object.entries(STAGE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div><label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#818286", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Probability (%)</label><input name="probability" type="number" min="0" max="100" defaultValue={drawer.editing?.probability || 10} style={inputStyle} /></div>
                <div><label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#818286", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Close Date</label><input name="expected_close_date" type="date" defaultValue={drawer.editing?.expected_close_date?.split('T')[0]} style={inputStyle} /></div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setDrawer({ open: false })} style={{ flex: 1, padding: "0.7rem", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(177,178,180,0.12)", color: "#818286", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={isPending} style={{ flex: 2, padding: "0.7rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "none", color: "#fcfcfe", cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700 }}>{isPending ? "Saving…" : "Save Deal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "#fcfcfe", margin: 0, letterSpacing: "-0.03em" }}>Deals</h1>
          <p style={{ color: "#5d5e60", fontSize: "0.85rem", marginTop: 4 }}>{deals.length} total deals {isAdmin && `· ${formatCurrency(totalPipeline)} pipeline`}</p>
        </div>
        <button onClick={() => setDrawer({ open: true })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.65rem 1.25rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "1px solid rgba(99,102,241,0.4)", color: "#fcfcfe", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(99,102,241,0.2)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Deal
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5d5e60" strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals…" style={{ width: "100%", background: "rgba(13,13,18,0.7)", border: "1px solid rgba(177,178,180,0.1)", borderRadius: 10, padding: "0.6rem 0.875rem 0.6rem 2.5rem", color: "#fcfcfe", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", ...Object.keys(STAGE_CFG)] as const).map(s => {
            const isActive = stageFilter === s;
            const cfg = s !== "all" ? STAGE_CFG[s as DealStage] : null;
            return <button key={s} onClick={() => setStageFilter(s as DealStage | "all")} style={{ padding: "0.5rem 0.875rem", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: isActive ? `1px solid ${cfg ? cfg.color + "40" : "rgba(177,178,180,0.3)"}` : "1px solid transparent", background: isActive ? (cfg ? cfg.bg : "rgba(177,178,180,0.08)") : "transparent", color: isActive ? (cfg ? cfg.color : "#fcfcfe") : "#5d5e60" }}>{s === "all" ? "All Stages" : STAGE_CFG[s as DealStage].label}</button>;
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, overflow: "hidden" }}>
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr auto", gap: "0.875rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(177,178,180,0.06)", background: "rgba(255,255,255,0.02)" }}>
            {["Deal", "Contact", "Stage", "Value", "Probability", "Close Date", ""].map(h => <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>)}
          </div>
        )}
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#3d3e40" }}><div style={{ fontSize: "2rem", marginBottom: 8 }}>💼</div>No deals found.</div>
        ) : filtered.map(deal => {
          const cfg = STAGE_CFG[deal.stage];
          const contactName = deal.contacts ? `${deal.contacts.first_name} ${deal.contacts.last_name}` : "—";
          return isMobile ? (
            <div key={deal.id} style={{ padding: "1rem", borderBottom: "1px solid rgba(177,178,180,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, color: "#fcfcfe" }}>{deal.title}</div>
                <div style={{ color: "#10b981", fontWeight: 700 }}>{isAdmin ? formatCurrency(deal.value || 0) : "—"}</div>
              </div>
              <div style={{ fontSize: "0.82rem", color: "#818286", marginBottom: 8 }}>{contactName}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>{cfg.label}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setDrawer({ open: true, editing: deal })} style={{ padding: "4px 10px", borderRadius: 7, fontSize: "0.72rem", background: "rgba(255,255,255,0.04)", border: "none", color: "#fcfcfe", cursor: "pointer" }}>Edit</button>
                  {isAdmin && <button onClick={() => handleDelete(deal.id)} style={{ padding: "4px 10px", borderRadius: 7, fontSize: "0.72rem", background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", cursor: "pointer" }}>Del</button>}
                </div>
              </div>
            </div>
          ) : (
            <div key={deal.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr auto", gap: "0.875rem", padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(177,178,180,0.04)", alignItems: "center" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fcfcfe" }}>{deal.title}</div>
              <div style={{ fontSize: "0.82rem", color: "#818286" }}>{contactName}<br /><span style={{ fontSize: "0.72rem", color: "#5d5e60" }}>{deal.contacts?.company || ""}</span></div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`, width: "fit-content" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />{cfg.label}
              </span>
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#10b981" }}>{isAdmin ? formatCurrency(deal.value || 0) : "—"}</div>
              <div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", marginBottom: 3 }}>
                  <div style={{ height: "100%", width: `${deal.probability}%`, background: cfg.color, borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: "#5d5e60" }}>{deal.probability}%</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#5d5e60" }}>{formatDate(deal.expected_close_date)}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {isAdmin && <button onClick={() => handleDelete(deal.id)} style={{ padding: "4px 10px", borderRadius: 7, fontSize: "0.72rem", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.6)", cursor: "pointer", fontFamily: "inherit" }}>Del</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
