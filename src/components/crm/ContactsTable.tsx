"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Contact, ContactStatus } from "@/app/actions/contacts";
import { createContact, updateContact, deleteContact } from "@/app/actions/contacts";
import { useIsMobile } from "@/lib/useIsMobile";

const STATUS_CFG: Record<ContactStatus, { label: string; color: string; bg: string }> = {
  lead: { label: "Lead", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  prospect: { label: "Prospect", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  customer: { label: "Customer", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  churned: { label: "Churned", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Website", referral: "Referral", social: "Social", email: "Email",
  cold_call: "Cold Call", event: "Event", other: "Other",
};

function getInitials(first: string, last: string) {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Contact Form Drawer ───────────────────────────────────────────────────────
function ContactDrawer({
  editing,
  onClose,
  onSaved,
}: {
  editing?: Contact;
  onClose: () => void;
  onSaved: (c: Contact) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (editing) {
        const updates: Partial<Contact> = {
          first_name: fd.get("first_name") as string,
          last_name: fd.get("last_name") as string,
          email: fd.get("email") as string,
          phone: (fd.get("phone") as string) || null,
          company: (fd.get("company") as string) || null,
          job_title: (fd.get("job_title") as string) || null,
          status: fd.get("status") as ContactStatus,
          lead_source: fd.get("lead_source") as any,
          notes: (fd.get("notes") as string) || null,
        };
        const res = await updateContact(editing.id, updates);
        if (res.error) { setError(res.error); return; }
        onSaved(res.data!);
      } else {
        const res = await createContact(fd);
        if (res.error) { setError(res.error); return; }
        onSaved(res.data!);
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.12)",
    borderRadius: 10, padding: "0.65rem 0.875rem", color: "#fcfcfe", fontSize: "0.875rem",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#818286",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{
        width: 460, background: "#0d0d12", borderLeft: "1px solid rgba(177,178,180,0.1)",
        height: "100%", overflowY: "auto", padding: "1.75rem",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      }} className="crm-drawer-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fcfcfe", margin: 0 }}>
            {editing ? "Edit Contact" : "New Contact"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5d5e60", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input name="first_name" required defaultValue={editing?.first_name} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(177,178,180,0.12)"} />
            </div>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input name="last_name" required defaultValue={editing?.last_name} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(177,178,180,0.12)"} />
            </div>
          </div>
          {[
            { name: "email", label: "Email *", type: "email", required: true, value: editing?.email },
            { name: "phone", label: "Phone", type: "tel", required: false, value: editing?.phone || "" },
            { name: "company", label: "Company", type: "text", required: false, value: editing?.company || "" },
            { name: "job_title", label: "Job Title", type: "text", required: false, value: editing?.job_title || "" },
          ].map(f => (
            <div key={f.name} style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>{f.label}</label>
              <input name={f.name} type={f.type} required={f.required} defaultValue={f.value} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(177,178,180,0.12)"} />
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" defaultValue={editing?.status || "lead"}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Lead Source</label>
              <select name="lead_source" defaultValue={editing?.lead_source || "other"}
                style={{ ...inputStyle, cursor: "pointer" }}>
                {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Notes</label>
            <textarea name="notes" rows={3} defaultValue={editing?.notes || ""}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(177,178,180,0.12)"} />
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: "1rem", background: "rgba(239,68,68,0.08)", padding: "0.6rem 0.75rem", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.7rem", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(177,178,180,0.12)", color: "#818286", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={isPending} style={{ flex: 2, padding: "0.7rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "1px solid rgba(99,102,241,0.4)", color: "#fcfcfe", cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700 }}>
              {isPending ? "Saving…" : editing ? "Save Changes" : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ContactsTable({ initialContacts, isAdmin }: { initialContacts: Contact[]; isAdmin: boolean }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [contacts, setContacts] = useState(initialContacts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: Contact }>({ open: false });
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const filtered = useMemo(() => contacts.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return !q || `${c.first_name} ${c.last_name} ${c.email} ${c.company || ""}`.toLowerCase().includes(q);
  }), [contacts, search, statusFilter]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleSaved(contact: Contact) {
    setContacts(prev => {
      const exists = prev.find(c => c.id === contact.id);
      if (exists) return prev.map(c => c.id === contact.id ? contact : c);
      return [contact, ...prev];
    });
    setDrawer({ open: false });
    showToast("Contact saved!", "success");
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    setContacts(prev => prev.filter(c => c.id !== id));
    startTransition(async () => {
      const res = await deleteContact(id);
      if (!res.success) { setContacts(initialContacts); showToast(res.error || "Delete failed", "error"); }
      else showToast("Contact deleted", "success");
    });
  }

  const counts = useMemo(() => {
    const r: Record<string, number> = { all: contacts.length };
    contacts.forEach(c => { r[c.status] = (r[c.status] || 0) + 1; });
    return r;
  }, [contacts]);

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>
          {toast.msg}
        </div>
      )}

      {drawer.open && (
        <ContactDrawer editing={drawer.editing} onClose={() => setDrawer({ open: false })} onSaved={handleSaved} />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "#fcfcfe", margin: 0, letterSpacing: "-0.03em" }}>Contacts</h1>
          <p style={{ color: "#5d5e60", fontSize: "0.85rem", marginTop: 4 }}>{contacts.length} total contacts</p>
        </div>
        <button onClick={() => setDrawer({ open: true })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.65rem 1.25rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "1px solid rgba(99,102,241,0.4)", color: "#fcfcfe", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(99,102,241,0.2)", minHeight: 44 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Contact
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5d5e60" strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
            style={{ width: "100%", background: "rgba(13,13,18,0.7)", border: "1px solid rgba(177,178,180,0.1)", borderRadius: 10, padding: "0.6rem 0.875rem 0.6rem 2.5rem", color: "#fcfcfe", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "lead", "prospect", "customer", "churned"] as const).map(s => {
            const isActive = statusFilter === s;
            const cfg = s !== "all" ? STATUS_CFG[s] : null;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: "0.5rem 0.875rem", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", border: isActive ? `1px solid ${cfg ? cfg.color + "40" : "rgba(177,178,180,0.3)"}` : "1px solid transparent", background: isActive ? (cfg ? cfg.bg : "rgba(177,178,180,0.08)") : "transparent", color: isActive ? (cfg ? cfg.color : "#fcfcfe") : "#5d5e60" }}>
                {s === "all" ? "All" : STATUS_CFG[s].label} ({counts[s] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, overflow: "hidden" }}>
        {/* Table header - hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1.5fr 1.5fr 1fr auto", gap: "1rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(177,178,180,0.06)", background: "rgba(255,255,255,0.02)" }}>
            {["Contact", "Company", "Status", "Source", "Created", ""].map(h => (
              <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#3d3e40" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>👤</div>
            No contacts found. {search ? "Try a different search." : "Add your first contact!"}
          </div>
        ) : isMobile ? (
          /* Mobile card layout */
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map(contact => {
              const cfg = STATUS_CFG[contact.status];
              return (
                <div key={contact.id} style={{ padding: "1rem", borderBottom: "1px solid rgba(177,178,180,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`, border: `1px solid ${cfg.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                      {getInitials(contact.first_name, contact.last_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a href={`/crm/contacts/${contact.id}`} style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fcfcfe", textDecoration: "none", display: "block" }}>
                        {contact.first_name} {contact.last_name}
                      </a>
                      <div style={{ fontSize: "0.75rem", color: "#5d5e60", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contact.email}</div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.05em", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`, flexShrink: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
                      {cfg.label}
                    </span>
                  </div>
                  {contact.company && <div style={{ fontSize: "0.78rem", color: "#818286", marginBottom: 4 }}>{contact.company}{contact.job_title ? ` · ${contact.job_title}` : ""}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.72rem", color: "#3d3e40" }}>{formatDate(contact.created_at)}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setDrawer({ open: true, editing: contact })} style={{ padding: "6px 14px", borderRadius: 7, fontSize: "0.75rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.1)", color: "#818286", cursor: "pointer", fontFamily: "inherit", minHeight: 36 }}>Edit</button>
                      {isAdmin && <button onClick={() => handleDelete(contact.id)} style={{ padding: "6px 14px", borderRadius: 7, fontSize: "0.75rem", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.6)", cursor: "pointer", fontFamily: "inherit", minHeight: 36 }}>Del</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop table layout */
          filtered.map(contact => {
            const cfg = STATUS_CFG[contact.status];
            return (
              <div key={contact.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1.5fr 1.5fr 1fr auto", gap: "1rem", padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(177,178,180,0.04)", alignItems: "center", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                {/* Contact */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`, border: `1px solid ${cfg.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                    {getInitials(contact.first_name, contact.last_name)}
                  </div>
                  <div>
                    <a href={`/crm/contacts/${contact.id}`} style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fcfcfe", textDecoration: "none", display: "block" }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = "#818cf8"}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = "#fcfcfe"}>
                      {contact.first_name} {contact.last_name}
                    </a>
                    <div style={{ fontSize: "0.75rem", color: "#5d5e60" }}>{contact.email}</div>
                  </div>
                </div>
                {/* Company */}
                <div style={{ fontSize: "0.85rem", color: "#818286" }}>{contact.company || "—"}<br /><span style={{ fontSize: "0.72rem", color: "#5d5e60" }}>{contact.job_title || ""}</span></div>
                {/* Status */}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`, width: "fit-content" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
                  {cfg.label}
                </span>
                {/* Source */}
                <div style={{ fontSize: "0.8rem", color: "#5d5e60" }}>{SOURCE_LABELS[contact.lead_source] || contact.lead_source}</div>
                {/* Created */}
                <div style={{ fontSize: "0.78rem", color: "#3d3e40" }}>{formatDate(contact.created_at)}</div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setDrawer({ open: true, editing: contact })} style={{ padding: "4px 10px", borderRadius: 7, fontSize: "0.72rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.1)", color: "#818286", cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                  {isAdmin && <button onClick={() => handleDelete(contact.id)} style={{ padding: "4px 10px", borderRadius: 7, fontSize: "0.72rem", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.6)", cursor: "pointer", fontFamily: "inherit" }}>Del</button>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
