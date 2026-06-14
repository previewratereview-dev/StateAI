"use client";

import { useState, useTransition } from "react";
import { sendEmail } from "@/app/actions/emails";
import type { UserProfile } from "@/lib/auth";
import { useIsMobile } from "@/lib/useIsMobile";

export default function ContactDetailClient({
  contact,
  deals,
  notes,
  activities,
  emails,
  profile,
}: {
  contact: any;
  deals: any[];
  notes: any[];
  activities: any[];
  emails: any[];
  profile: UserProfile;
}) {
  const isMobile = useIsMobile();
  const [isComposing, setIsComposing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSendEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Force the "to" field to be the contact's email
    fd.set("to", contact.email);
    
    startTransition(async () => {
      const res = await sendEmail(fd);
      if (!res.success) {
        showToast(res.error || "Failed to send email", "error");
      } else {
        showToast("Email sent!", "success");
        setIsComposing(false);
      }
    });
  }

  // Unified timeline (sort activities, notes, and emails by date)
  const unifiedTimeline = [
    ...activities.map(a => ({ ...a, _timelineType: "activity", _date: new Date(a.created_at) })),
    ...notes.map(n => ({ ...n, _timelineType: "note", _date: new Date(n.created_at) })),
    ...emails.map(e => ({ ...e, _timelineType: "email", _date: new Date(e.created_at) }))
  ].sort((a, b) => b._date.getTime() - a._date.getTime());

  const STATUS_CFG: Record<string, { label: string; color: string }> = {
    lead: { label: "Lead", color: "#f59e0b" },
    prospect: { label: "Prospect", color: "#6366f1" },
    customer: { label: "Customer", color: "#10b981" },
    churned: { label: "Churned", color: "#6b7280" },
  };

  const cfg = STATUS_CFG[contact.status] || STATUS_CFG.lead;
  
  // Calculate probability/health purely for visual depth
  const winRate = deals.length > 0 ? (deals.filter(d => d.stage === "won").length / deals.length) * 100 : 0;
  const totalValue = deals.reduce((acc, d) => acc + (d.value || 0), 0);

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh", position: "relative" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}

      <a href="/crm/contacts" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5d5e60", fontSize: "0.82rem", textDecoration: "none", marginBottom: "1.5rem", fontWeight: 600 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        Back to Contacts
      </a>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "360px 1fr", gap: "1.5rem", alignItems: "start" }}>
        
        {/* Left Column — Hub */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, padding: "1.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`, border: `1px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800, color: cfg.color, marginBottom: 16, boxShadow: `0 8px 32px ${cfg.color}20` }}>
                {(contact.first_name[0] || "") + (contact.last_name[0] || "")}
              </div>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fcfcfe", margin: 0, textAlign: "center", letterSpacing: "-0.02em" }}>
                {contact.first_name} {contact.last_name}
              </h1>
              {contact.job_title && <p style={{ color: "#818286", fontSize: "0.85rem", margin: "6px 0 0", fontWeight: 500 }}>{contact.job_title}</p>}
              {contact.company && <p style={{ color: "#5d5e60", fontSize: "0.8rem", margin: "2px 0 0" }}>{contact.company}</p>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, marginTop: 16, textTransform: "uppercase" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                {cfg.label}
              </span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(177,178,180,0.08)" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(177,178,180,0.06)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.7rem", color: "#5d5e60", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Win Rate</div>
                <div style={{ fontSize: "1.25rem", color: "#fcfcfe", fontWeight: 800, marginTop: 4 }}>{winRate.toFixed(0)}%</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(177,178,180,0.06)", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "0.7rem", color: "#5d5e60", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Value</div>
                <div style={{ fontSize: "1.25rem", color: "#10b981", fontWeight: 800, marginTop: 4 }}>${totalValue.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "✉️", value: contact.email },
                { icon: "📞", value: contact.phone },
                { icon: "🔗", value: contact.website },
              ].filter(r => r.value).map(r => (
                <div key={r.icon} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.85rem", color: "#818286", fontWeight: 500 }}>
                  <span style={{ background: "rgba(255,255,255,0.04)", padding: 6, borderRadius: 8 }}>{r.icon}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setIsComposing(true)} style={{ width: "100%", marginTop: "2rem", padding: "0.85rem", borderRadius: 12, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", color: "#fcfcfe", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }}>
              Send Email
            </button>
          </div>

          <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fcfcfe", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1rem" }}>Deals ({deals.length})</h3>
            {deals.length === 0 ? <p style={{ color: "#5d5e60", fontSize: "0.85rem" }}>No deals linked</p> : deals.map((d: any) => (
              <div key={d.id} style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(177,178,180,0.06)", marginBottom: 8 }}>
                <div style={{ fontSize: "0.85rem", color: "#fcfcfe", fontWeight: 600 }}>{d.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#818286", marginTop: 4 }}>
                  <span style={{ textTransform: "capitalize" }}>{d.stage}</span>
                  <span style={{ fontWeight: 700, color: "#10b981" }}>${(d.value || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column — Unified Timeline */}
        <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, padding: "1.75rem", minHeight: 600 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fcfcfe", margin: "0 0 1.5rem", letterSpacing: "-0.01em" }}>Unified History</h2>
          
          {unifiedTimeline.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 0", color: "#5d5e60" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📭</div>
              <p style={{ fontSize: "0.9rem" }}>No history found for this contact.</p>
            </div>
          ) : (
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: "rgba(177,178,180,0.06)", borderRadius: 999 }} />
              
              {unifiedTimeline.map((item: any, i) => {
                const isEmail = item._timelineType === "email";
                const isNote = item._timelineType === "note";
                const isActivity = item._timelineType === "activity";
                
                let icon = "📌";
                let color = "#818286";
                let bg = "rgba(177,178,180,0.1)";
                
                if (isEmail) {
                  icon = "✉️"; color = "#6366f1"; bg = "rgba(99,102,241,0.1)";
                } else if (isNote) {
                  icon = "📝"; color = "#f59e0b"; bg = "rgba(245,158,11,0.1)";
                } else {
                  color = "#10b981"; bg = "rgba(16,185,129,0.1)";
                }

                return (
                  <div key={`${item._timelineType}-${item.id}`} style={{ position: "relative", marginBottom: "2rem" }}>
                    <div style={{ position: "absolute", left: -32, top: 0, width: 32, display: "flex", justifyContent: "center" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: bg, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: color, zIndex: 10, boxShadow: `0 0 0 4px #0d0d12` }}>
                        {icon}
                      </div>
                    </div>
                    
                    <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(177,178,180,0.06)", transition: "background 0.2s" }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {isEmail ? (item.status === 'sent' ? 'Email Sent' : 'Email Received') : isNote ? "Note Added" : "Activity"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#5d5e60", fontWeight: 600 }}>
                          {item._date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      {isEmail && (
                        <div>
                          <div style={{ fontSize: "0.9rem", color: "#fcfcfe", fontWeight: 600, marginBottom: 6 }}>{item.subject}</div>
                          <div style={{ fontSize: "0.85rem", color: "#b1b2b4", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.body_text}</div>
                        </div>
                      )}
                      
                      {isNote && (
                        <div style={{ fontSize: "0.85rem", color: "#d1d5db", lineHeight: 1.6 }}>{item.body}</div>
                      )}
                      
                      {isActivity && (
                        <div style={{ fontSize: "0.85rem", color: "#d1d5db", lineHeight: 1.6 }}>{item.content || item.type.replace(/_/g, " ")}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={() => setIsComposing(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 600, background: "#0d0d12", borderRadius: 20, border: "1px solid rgba(177,178,180,0.1)", padding: "2rem", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", zIndex: 901 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#fcfcfe" }}>Email {contact.first_name}</h2>
              <button onClick={() => setIsComposing(false)} style={{ background: "none", border: "none", color: "#5d5e60", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>From</label>
                <select name="fromBox" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.12)", color: "#fcfcfe", padding: "0.75rem", borderRadius: 10, outline: "none", cursor: "pointer", fontSize: "0.85rem" }}>
                  <option value="contact@stateai.in" style={{ background: "#0d0d12" }}>contact@stateai.in</option>
                  <option value="support@stateai.in" style={{ background: "#0d0d12" }}>support@stateai.in</option>
                  <option value="info@stateai.in" style={{ background: "#0d0d12" }}>info@stateai.in</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>Subject</label>
                <input name="subject" required placeholder="What is this about?" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.12)", color: "#fcfcfe", padding: "0.75rem", borderRadius: 10, outline: "none", fontSize: "0.85rem" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>Message</label>
                <textarea name="body" required rows={8} placeholder="Write your email here..." style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.12)", color: "#fcfcfe", padding: "0.75rem", borderRadius: 10, outline: "none", fontSize: "0.85rem", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsComposing(false)} style={{ padding: "0.75rem 1.5rem", borderRadius: 10, background: "transparent", border: "1px solid rgba(177,178,180,0.12)", color: "#818286", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={isPending} style={{ padding: "0.75rem 2rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "none", color: "#fcfcfe", cursor: isPending ? "not-allowed" : "pointer", fontWeight: 700 }}>
                  {isPending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
