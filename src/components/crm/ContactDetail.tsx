"use client";

import { useState, useTransition, useCallback } from "react";
import { sendEmail } from "@/app/actions/emails";
import { logInteraction, updateContactStatus } from "@/app/actions/interactions";
import { undoAutoCreatedDeal } from "@/app/actions/deals";
import { useRouter } from "next/navigation";
import { claimContact, releaseContact } from "@/app/actions/contacts";
import { CHANNEL_LABELS, CHANNEL_ICONS } from "@/lib/interaction-types";
import type { UserProfile } from "@/lib/auth";
import type { InteractionChannel, LeadStatus } from "@/lib/interaction-types";
import { useIsMobile } from "@/lib/useIsMobile";

const INTERACTION_CHANNELS: InteractionChannel[] = [
  "email",
  "social_dm",
  "cold_call",
  "whatsapp",
  "linkedin_message",
  "sms",
  "meeting",
  "call",
  "other_interaction",
  "note",
];

const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "#6b7280" },
  { value: "contacted", label: "Contacted", color: "#f59e0b" },
  { value: "qualified", label: "Qualified", color: "#6366f1" },
  { value: "proposal", label: "Proposal", color: "#8b5cf6" },
  { value: "negotiation", label: "Negotiation", color: "#ec4899" },
  { value: "won", label: "Won", color: "#10b981" },
  { value: "lost", label: "Lost", color: "#ef4444" },
  { value: "churned", label: "Churned", color: "#6b7280" },
];

const STATUS_CFG: Record<string, { label: string; color: string }> = {};
LEAD_STATUS_OPTIONS.forEach(opt => { STATUS_CFG[opt.value] = { label: opt.label, color: opt.color }; });

export default function ContactDetailClient({
  contact,
  deals,
  notes,
  activities,
  emails,
  statusHistory,
  profile,
}: {
  contact: any;
  deals: any[];
  notes: any[];
  activities: any[];
  emails: any[];
  statusHistory?: any[];
  profile: UserProfile;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isComposing, setIsComposing] = useState(false);
  const [isLoggingInteraction, setIsLoggingInteraction] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSendEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
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

  async function handleLogInteraction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("contactId", contact.id);

    startTransition(async () => {
      // Attempt to claim contact before logging to prevent races
      const claimRes = await claimContact(contact.id);
      if (!claimRes.success) {
        showToast(claimRes.error || "Failed to claim contact", "error");
        return;
      }

      const res = await logInteraction(fd);
      if (!res.success) {
        showToast(res.error || "Failed to log interaction", "error");
      } else {
        showToast("Interaction logged!", "success");
        setIsLoggingInteraction(false);
      }
    });
  }

  const handleStatusChange = useCallback(async (newStatus: string) => {
    startTransition(async () => {
      const res = await updateContactStatus(contact.id, newStatus as LeadStatus);
      if (!res.success) {
        showToast(res.error || "Failed to update status", "error");
      } else {
        showToast(`Status updated to "${newStatus}"`, "success");
      }
    });
  }, [contact.id]);

  // Build unified timeline combining notes, emails, activities, and status changes
  const unifiedTimeline = [
    ...(activities || []).map((a: any) => ({
      ...a,
      _timelineType: "activity",
      _date: new Date(a.created_at),
    })),
    ...(notes || []).map((n: any) => ({
      ...n,
      _timelineType: "note",
      _date: new Date(n.created_at),
    })),
    ...(emails || []).map((e: any) => ({
      ...e,
      _timelineType: "email",
      _date: new Date(e.created_at),
    })),
    ...(statusHistory || []).map((s: any) => ({
      ...s,
      _timelineType: "status_change",
      _date: new Date(s.created_at),
    })),
  ].sort((a: any, b: any) => b._date.getTime() - a._date.getTime());

  const cfg = STATUS_CFG[contact.status] || STATUS_CFG.new;

  const winRate = deals.length > 0
    ? (deals.filter((d: any) => d.stage === "won").length / deals.length) * 100
    : 0;
  const totalValue = deals.reduce((acc: number, d: any) => acc + (d.value || 0), 0);

  // Track which status dropdown is open
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh", position: "relative" }}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background:
              toast.type === "success"
                ? "rgba(16,185,129,0.15)"
                : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#10b981" : "#ef4444",
            padding: "0.75rem 1.25rem",
            borderRadius: 12,
            fontSize: "0.85rem",
            fontWeight: 600,
            backdropFilter: "blur(20px)",
          }}
        >
          {toast.msg}
        </div>
      )}

      <a
        href="/crm/contacts"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "#5d5e60",
          fontSize: "0.82rem",
          textDecoration: "none",
          marginBottom: "1.5rem",
          fontWeight: 600,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Contacts
      </a>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "360px 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* ======================== LEFT COLUMN ======================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Contact Card */}
          <div
            style={{
              background: "rgb(13 13 18 / 70%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(177,178,180,0.08)",
              borderRadius: 16,
              padding: "1.75rem",
            }}
          >
            {/* Avatar + Name */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`,
                  border: `1px solid ${cfg.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: cfg.color,
                  marginBottom: 16,
                  boxShadow: `0 8px 32px ${cfg.color}20`,
                }}
              >
                {(contact.first_name?.[0] || "") + (contact.last_name?.[0] || "")}
              </div>
              <h1
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#fcfcfe",
                  margin: 0,
                  textAlign: "center",
                  letterSpacing: "-0.02em",
                }}
              >
                {contact.first_name} {contact.last_name}
              </h1>
              {contact.job_title && (
                <p style={{ color: "#818286", fontSize: "0.85rem", margin: "6px 0 0", fontWeight: 500 }}>
                  {contact.job_title}
                </p>
              )}
              {contact.company && (
                <p style={{ color: "#5d5e60", fontSize: "0.8rem", margin: "2px 0 0" }}>
                  {contact.company}
                </p>
              )}

              {/* Lock / Claim indicator */}
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                {contact.locked_by_profile ? (
                  contact.locked_by_profile.id === profile.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 700 }}>You're working</span>
                      <button
                        onClick={() => {
                          startTransition(async () => {
                            const res = await releaseContact(contact.id);
                            if (!res.success) {
                              showToast(res.error || "Failed to release", "error");
                            } else {
                              showToast("Released", "success");
                              router.refresh();
                            }
                          });
                        }}
                        style={{ padding: "6px 10px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#b1b2b4", cursor: "pointer" }}
                      >
                        Release
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.85rem", color: "#f59e0b", fontWeight: 700 }}>
                      Locked by {contact.locked_by_profile.full_name || "someone"}
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => {
                      startTransition(async () => {
                        const res = await claimContact(contact.id);
                        if (!res.success) {
                          showToast(res.error || "Failed to claim", "error");
                        } else {
                          showToast("Claimed", "success");
                          router.refresh();
                        }
                      });
                    }}
                    style={{ padding: "6px 10px", borderRadius: 8, background: "#11121a", border: "1px solid rgba(255,255,255,0.04)", color: "#b1b2b4", cursor: "pointer" }}
                  >
                    Claim
                  </button>
                )}
              </div>

              {/* Status Badge (clickable dropdown) */}
              <div style={{ position: "relative", marginTop: 16 }}>
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 14px",
                    borderRadius: 999,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: cfg.color,
                    background: `${cfg.color}15`,
                    border: `1px solid ${cfg.color}30`,
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: cfg.color,
                      boxShadow: `0 0 6px ${cfg.color}`,
                    }}
                  />
                  {cfg.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {statusDropdownOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 50 }}
                      onClick={() => setStatusDropdownOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginTop: 6,
                        background: "#1a1a23",
                        border: "1px solid rgba(177,178,180,0.12)",
                        borderRadius: 12,
                        padding: "0.5rem",
                        zIndex: 51,
                        minWidth: 160,
                        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                      }}
                    >
                      {LEAD_STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            handleStatusChange(opt.value);
                            setStatusDropdownOpen(false);
                          }}
                          disabled={opt.value === contact.status || isPending}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            width: "100%",
                            padding: "0.5rem 0.75rem",
                            borderRadius: 8,
                            border: "none",
                            background:
                              opt.value === contact.status
                                ? `${opt.color}15`
                                : "transparent",
                            color:
                              opt.value === contact.status ? opt.color : "#b1b2b4",
                            cursor:
                              opt.value === contact.status
                                ? "default"
                                : "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            opacity: opt.value === contact.status ? 0.6 : 1,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            if (opt.value !== contact.status)
                              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          }}
                          onMouseLeave={(e) => {
                            if (opt.value !== contact.status)
                              e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: opt.color,
                              flexShrink: 0,
                            }}
                          />
                          {opt.label}
                          {opt.value === contact.status && (
                            <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "#5d5e60" }}>
                              (current)
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid rgba(177,178,180,0.08)",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(177,178,180,0.06)",
                  borderRadius: 12,
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#5d5e60",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  Win Rate
                </div>
                <div style={{ fontSize: "1.25rem", color: "#fcfcfe", fontWeight: 800, marginTop: 4 }}>
                  {winRate.toFixed(0)}%
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(177,178,180,0.06)",
                  borderRadius: 12,
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#5d5e60",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  Value
                </div>
                <div style={{ fontSize: "1.25rem", color: "#10b981", fontWeight: 800, marginTop: 4 }}>
                  ${totalValue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "✉️", value: contact.email, href: `mailto:${contact.email}` },
                { icon: "📞", value: contact.phone, href: contact.phone ? `tel:${contact.phone}` : undefined },
                { icon: "🔗", value: contact.website, href: contact.website },
              ]
                .filter((r) => r.value)
                .map((r) => (
                  <div
                    key={r.icon}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: "0.85rem",
                      color: "#818286",
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        padding: 6,
                        borderRadius: 8,
                      }}
                    >
                      {r.icon}
                    </span>
                    {r.href ? (
                      <a
                        href={r.href}
                        style={{
                          color: "#818286",
                          textDecoration: "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={r.value}
                      >
                        {r.value}
                      </a>
                    ) : (
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.value}
                      </span>
                    )}
                  </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "1.5rem" }}>
              <button
                onClick={() => setIsComposing(true)}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))",
                  color: "#fcfcfe",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
                  fontSize: "0.85rem",
                }}
              >
                ✉️ Send Email
              </button>
              <button
                onClick={() => setIsLoggingInteraction(true)}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  color: "#fcfcfe",
                  fontWeight: 700,
                  border: "1px solid rgba(177,178,180,0.12)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                📋 Log Interaction
              </button>
            </div>
          </div>

          {/* Deals Section */}
          <div
            style={{
              background: "rgb(13 13 18 / 70%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(177,178,180,0.08)",
              borderRadius: 16,
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#fcfcfe",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 1rem",
              }}
            >
              Deals ({deals.length})
            </h3>
            {deals.length === 0 ? (
              <p style={{ color: "#5d5e60", fontSize: "0.85rem" }}>No deals linked</p>
            ) : (
              deals.map((d: any) => {
                const autoActivity = (activities || []).find((a: any) => a.deal_id === d.id && a.metadata && a.metadata.auto_created);
                return (
                  <div
                    key={d.id}
                    style={{
                      padding: "0.75rem 1rem",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                      border: "1px solid rgba(177,178,180,0.06)",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "0.85rem", color: "#fcfcfe", fontWeight: 600 }}>{d.title}</div>
                      {autoActivity && (
                        <UndoAutoDealButton deal={d} contactId={contact.id} showToast={showToast} />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        color: "#818286",
                        marginTop: 4,
                      }}
                    >
                      <span style={{ textTransform: "capitalize" }}>{d.stage}</span>
                      <span style={{ fontWeight: 700, color: "#10b981" }}>${(d.value || 0).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================== RIGHT COLUMN - TIMELINE ======================== */}
        <div
          style={{
            background: "rgb(13 13 18 / 70%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(177,178,180,0.08)",
            borderRadius: 16,
            padding: "1.75rem",
            minHeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#fcfcfe",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Timeline
            </h2>
            <button
              onClick={() => setIsLoggingInteraction(true)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 10,
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.2)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.8rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.15)")}
            >
              + Log Activity
            </button>
          </div>

          {unifiedTimeline.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4rem 0",
                color: "#5d5e60",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📭</div>
              <p style={{ fontSize: "0.9rem" }}>No history found for this contact.</p>
              <p style={{ fontSize: "0.8rem", color: "#818286", marginTop: 4 }}>
                Log your first interaction to start tracking.
              </p>
            </div>
          ) : (
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div
                style={{
                  position: "absolute",
                  left: 15,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "rgba(177,178,180,0.06)",
                  borderRadius: 999,
                }}
              />

              {unifiedTimeline.map((item: any, i: number) => {
                const isEmail = item._timelineType === "email";
                const isNote = item._timelineType === "note";
                const isStatusChange = item._timelineType === "status_change";
                const isActivity = item._timelineType === "activity";

                // Determine icon and colors
                let icon = "📌";
                let color = "#818286";
                let bg = "rgba(177,178,180,0.1)";
                let label = "Activity";

                if (isEmail) {
                  icon = "✉️";
                  color = "#6366f1";
                  bg = "rgba(99,102,241,0.1)";
                  label = item.status === "sent" ? "Email Sent" : "Email Received";
                } else if (isNote) {
                  icon = "📝";
                  color = "#f59e0b";
                  bg = "rgba(245,158,11,0.1)";
                  label = "Note";
                } else if (isStatusChange) {
                  icon = "🔄";
                  color = "#8b5cf6";
                  bg = "rgba(139,92,246,0.1)";
                  label = "Status Changed";
                } else if (isActivity) {
                  // Determine from metadata channel or type
                  const metaChannel = item.metadata?.channel;
                  if (metaChannel && CHANNEL_ICONS[metaChannel as InteractionChannel]) {
                    icon = CHANNEL_ICONS[metaChannel as InteractionChannel];
                    color = "#10b981";
                    bg = "rgba(16,185,129,0.1)";
                    label = item.metadata?.channel_label || metaChannel.replace(/_/g, " ");
                  } else if (item.type === "call") {
                    icon = "📞";
                    color = "#10b981";
                    bg = "rgba(16,185,129,0.1)";
                    label = "Phone Call";
                  } else if (item.type === "meeting") {
                    icon = "🤝";
                    color = "#10b981";
                    bg = "rgba(16,185,129,0.1)";
                    label = "Meeting";
                  } else if (item.type === "status_change") {
                    icon = "🔄";
                    color = "#8b5cf6";
                    bg = "rgba(139,92,246,0.1)";
                    label = "Status Changed";
                  } else {
                    icon = "📌";
                    color = "#818286";
                    bg = "rgba(177,178,180,0.1)";
                    label = item.type.replace(/_/g, " ");
                  }
                }

                return (
                  <div
                    key={`${item._timelineType}-${item.id}-${i}`}
                    style={{ position: "relative", marginBottom: "2rem" }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -32,
                        top: 0,
                        width: 32,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: bg,
                          border: `1px solid ${color}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          color: color,
                          zIndex: 10,
                          boxShadow: `0 0 0 4px #0d0d12`,
                        }}
                      >
                        {icon}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "1.25rem",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: 12,
                        border: "1px solid rgba(177,178,180,0.06)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: color,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#5d5e60", fontWeight: 600 }}>
                          {item._date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {item.created_by && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "#5d5e60",
                            fontWeight: 500,
                            marginBottom: 6,
                          }}
                        >
                          by {item.profiles?.full_name || item.profiles?.full_name || "Unknown"}
                        </div>
                      )}

                      {isEmail && (
                        <div>
                          <div
                            style={{
                              fontSize: "0.9rem",
                              color: "#fcfcfe",
                              fontWeight: 600,
                              marginBottom: 6,
                            }}
                          >
                            {item.subject}
                          </div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "#b1b2b4",
                              lineHeight: 1.6,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {item.body_text}
                          </div>
                        </div>
                      )}

                      {isNote && (
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#d1d5db",
                            lineHeight: 1.6,
                          }}
                        >
                          {item.body}
                        </div>
                      )}

                      {isActivity && (
                        <div style={{ fontSize: "0.85rem", color: "#d1d5db", lineHeight: 1.6 }}>
                          {item.content || item.type.replace(/_/g, " ")}
                          {item.metadata?.follow_up_date && (
                            <div
                              style={{
                                marginTop: 8,
                                padding: "6px 10px",
                                background: "rgba(245,158,11,0.1)",
                                border: "1px solid rgba(245,158,11,0.15)",
                                borderRadius: 8,
                                fontSize: "0.75rem",
                                color: "#f59e0b",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              📅 Follow-up:{" "}
                              {new Date(item.metadata.follow_up_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          )}
                          {item.metadata?.outcome && (
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: "0.75rem",
                                color: "#818286",
                              }}
                            >
                              Outcome: {item.metadata.outcome}
                            </div>
                          )}
                        </div>
                      )}

                      {isStatusChange && (
                        <div style={{ fontSize: "0.85rem", color: "#b1b2b4", lineHeight: 1.6 }}>
                          <span style={{ color: "#5d5e60" }}>
                            {item.from_status || "?"}
                          </span>
                          <span style={{ margin: "0 8px", color: "#5d5e60" }}>→</span>
                          <span style={{ color: "#fcfcfe", fontWeight: 600 }}>
                            {item.to_status}
                          </span>
                          {item.reason && (
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: "0.8rem",
                                color: "#818286",
                                fontStyle: "italic",
                              }}
                            >
                              "{item.reason}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================== COMPOSE EMAIL MODAL ======================== */}
      {isComposing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setIsComposing(false)}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 600,
              background: "#0d0d12",
              borderRadius: 20,
              border: "1px solid rgba(177,178,180,0.1)",
              padding: "2rem",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              zIndex: 901,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#fcfcfe" }}>
                Email {contact.first_name}
              </h2>
              <button
                onClick={() => setIsComposing(false)}
                style={{ background: "none", border: "none", color: "#5d5e60", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>
                  From
                </label>
                <select
                  name="fromBox"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(177,178,180,0.12)",
                    color: "#fcfcfe",
                    padding: "0.75rem",
                    borderRadius: 10,
                    outline: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="contact@stateai.in" style={{ background: "#0d0d12" }}>
                    contact@stateai.in
                  </option>
                  <option value="support@stateai.in" style={{ background: "#0d0d12" }}>
                    support@stateai.in
                  </option>
                  <option value="info@stateai.in" style={{ background: "#0d0d12" }}>
                    info@stateai.in
                  </option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>
                  Subject
                </label>
                <input
                  name="subject"
                  required
                  placeholder="What is this about?"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(177,178,180,0.12)",
                    color: "#fcfcfe",
                    padding: "0.75rem",
                    borderRadius: 10,
                    outline: "none",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>
                  Message
                </label>
                <textarea
                  name="body"
                  required
                  rows={8}
                  placeholder="Write your email here..."
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(177,178,180,0.12)",
                    color: "#fcfcfe",
                    padding: "0.75rem",
                    borderRadius: 10,
                    outline: "none",
                    fontSize: "0.85rem",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: 10,
                    background: "transparent",
                    border: "1px solid rgba(177,178,180,0.12)",
                    color: "#818286",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))",
                    border: "none",
                    color: "#fcfcfe",
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {isPending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================== LOG INTERACTION MODAL ======================== */}
      {isLoggingInteraction && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setIsLoggingInteraction(false)}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 560,
              background: "#0d0d12",
              borderRadius: 20,
              border: "1px solid rgba(177,178,180,0.1)",
              padding: "2rem",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              zIndex: 901,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#fcfcfe" }}>
                📋 Log Interaction
              </h2>
              <button
                onClick={() => setIsLoggingInteraction(false)}
                style={{ background: "none", border: "none", color: "#5d5e60", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleLogInteraction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Channel Selection */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>
                  Channel *
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 6,
                  }}
                >
                  {INTERACTION_CHANNELS.filter((ch) => ch !== "note").map((ch) => (
                    <label
                      key={ch}
                      data-channel={ch}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        padding: "0.6rem 0.3rem",
                        borderRadius: 10,
                        border: "1px solid rgba(177,178,180,0.12)",
                        cursor: "pointer",
                        fontSize: "0.7rem",
                        color: "#818286",
                        fontWeight: 600,
                        textAlign: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="channel"
                        value={ch}
                        required
                        style={{ display: "none" }}
                        onChange={(e) => {
                          // Visual selection via parent styling
                          const parent = e.currentTarget.closest("label");
                          if (parent) {
                            document
                              .querySelectorAll("label[data-channel]")
                              .forEach((l) => {
                                (l as HTMLElement).style.borderColor =
                                  "rgba(177,178,180,0.12)";
                                (l as HTMLElement).style.background = "transparent";
                              });
                            parent.style.borderColor = "#818cf8";
                            parent.style.background = "rgba(99,102,241,0.1)";
                          }
                        }}
                      />
                      <span style={{ fontSize: "1.2rem" }}>
                        {CHANNEL_ICONS[ch]}
                      </span>
                      <span style={{ lineHeight: 1.2 }}>
                        {CHANNEL_LABELS[ch].split(" ")[0]}
                      </span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 6 }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0.4rem 0.8rem",
                      borderRadius: 8,
                      border: "1px solid rgba(177,178,180,0.12)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      color: "#818286",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="channel"
                      value="note"
                      style={{ accentColor: "#818cf8" }}
                    />
                    📝 Note (internal)
                  </label>
                </div>
              </div>

              {/* Content */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>
                  Notes / Description *
                </label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder="Describe the interaction..."
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(177,178,180,0.12)",
                    color: "#fcfcfe",
                    padding: "0.75rem",
                    borderRadius: 10,
                    outline: "none",
                    fontSize: "0.85rem",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Outcome */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>
                  Outcome (optional)
                </label>
                <select
                  name="outcome"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(177,178,180,0.12)",
                    color: "#fcfcfe",
                    padding: "0.75rem",
                    borderRadius: 10,
                    outline: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value="" style={{ background: "#0d0d12" }}>— Select outcome —</option>
                  <option value="interested" style={{ background: "#0d0d12" }}>Interested</option>
                  <option value="not_interested" style={{ background: "#0d0d12" }}>Not Interested</option>
                  <option value="follow_up" style={{ background: "#0d0d12" }}>Needs Follow-up</option>
                  <option value="meeting_booked" style={{ background: "#0d0d12" }}>Meeting Booked</option>
                  <option value="demo_scheduled" style={{ background: "#0d0d12" }}>Demo Scheduled</option>
                  <option value="no_response" style={{ background: "#0d0d12" }}>No Response</option>
                  <option value="decision_maker" style={{ background: "#0d0d12" }}>Reached Decision Maker</option>
                  <option value="other" style={{ background: "#0d0d12" }}>Other</option>
                </select>
              </div>

              {/* Follow-up Date */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#818286", marginBottom: 6, fontWeight: 600 }}>
                  Follow-up Date (optional)
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(177,178,180,0.12)",
                    color: "#fcfcfe",
                    padding: "0.75rem",
                    borderRadius: 10,
                    outline: "none",
                    fontSize: "0.85rem",
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsLoggingInteraction(false)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: 10,
                    background: "transparent",
                    border: "1px solid rgba(177,178,180,0.12)",
                    color: "#818286",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))",
                    border: "none",
                    color: "#fcfcfe",
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {isPending ? "Logging..." : "Log Interaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UndoAutoDealButton({ deal, contactId, showToast }: { deal: any; contactId: string; showToast: (m: string, t: "success" | "error") => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleUndo() {
    if (!confirm("Remove auto-created deal?")) return;
    startTransition(async () => {
      const res = await undoAutoCreatedDeal(deal.id, contactId);
      if (!res.success) {
        showToast(res.error || "Failed to remove", "error");
      } else {
        showToast("Auto-created deal removed", "success");
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleUndo}
      disabled={isPending}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        background: "transparent",
        border: "1px solid rgba(239,68,68,0.18)",
        color: "#ef4444",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "0.75rem",
      }}
    >
      Undo
    </button>
  );
}
