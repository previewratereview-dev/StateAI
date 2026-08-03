/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Booking, BookingStatus } from "@/app/actions/crm";
import {
  updateBookingStatus,
  updateAdminNotes,
  deleteBooking,
} from "@/app/actions/crm";

// ─── Types & Constants ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    dot: "#f59e0b",
  },
  confirmed: {
    label: "Confirmed",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    dot: "#3b82f6",
  },
  completed: {
    label: "Completed",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    dot: "#10b981",
  },
  cancelled: {
    label: "Cancelled",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    dot: "#6b7280",
  },
};

const PURPOSE_LABELS: Record<string, string> = {
  general_inquiry: "General Inquiry",
  project_discussion: "Project Discussion",
  partnership: "Partnership",
  demo_request: "Demo Request",
  support: "Support",
  other: "Other",
};

const DURATION_LABELS: Record<number, string> = {
  15: "15 min",
  30: "30 min",
  45: "45 min",
  60: "1 hour",
  90: "1.5 hours",
  120: "2 hours",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCreatedAt(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}18, ${color}08)`
          : "rgb(17 17 24 / 60%)",
        border: `1px solid ${active ? color + "40" : "rgb(var(--crm-line) / 10%)"}`,
        borderRadius: 16,
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        backdropFilter: "blur(20px)",
        boxShadow: active
          ? `0 8px 32px ${color}18, inset 0 1px rgb(var(--crm-overlay) / 4%)`
          : "0 4px 16px rgb(0 0 0 / 25%)",
        width: "100%",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: active ? color : "var(--crm-text)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--crm-muted)",
            marginTop: 3,
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}30`,
        textTransform: "uppercase",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
          boxShadow: `0 0 6px ${cfg.dot}`,
        }}
      />
      {cfg.label}
    </span>
  );
}

function BookingCard({
  booking,
  onStatusChange,
  onNotesChange,
  onDelete,
  isPending,
}: {
  booking: Booking;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(booking.admin_notes || "");
  const [notesDirty, setNotesDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const cfg = STATUS_CONFIG[booking.status];
  const initials = getInitials(booking.name);

  return (
    <div
      style={{
        background: "rgb(17 17 24 / 55%)",
        border: `1px solid rgb(var(--crm-line) / 10%)`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "0 4px 24px rgb(0 0 0 / 30%)",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {/* Card Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "1rem",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`,
            border: `1px solid ${cfg.color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: cfg.color,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: "var(--crm-text)",
                fontSize: "0.95rem",
              }}
            >
              {booking.name}
            </span>
            {booking.company && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--crm-faint)",
                  background: "rgb(var(--crm-overlay) / 4%)",
                  border: "1px solid rgb(var(--crm-line) / 8%)",
                  padding: "1px 8px",
                  borderRadius: 999,
                }}
              >
                {booking.company}
              </span>
            )}
            <StatusBadge status={booking.status} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 4,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.78rem", color: "var(--crm-muted)" }}>
              📧 {booking.email}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--crm-muted)" }}>
              📅 {formatDate(booking.meeting_date)} · {booking.meeting_time}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--crm-muted)" }}>
              ⏱{" "}
              {DURATION_LABELS[booking.duration] || `${booking.duration} min`}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--crm-faint)" }}>
              Submitted {formatCreatedAt(booking.created_at)}
            </span>
          </div>
        </div>

        {/* Expand chevron */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--crm-faint)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid rgb(var(--crm-line) / 8%)",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Purpose + Notes from client */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--crm-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Purpose
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--crm-text-2)",
                  background: "rgb(var(--crm-overlay) / 3%)",
                  border: "1px solid rgb(var(--crm-line) / 8%)",
                  borderRadius: 8,
                  padding: "0.5rem 0.75rem",
                }}
              >
                {PURPOSE_LABELS[booking.purpose] || booking.purpose}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--crm-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Booking ID
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--crm-faint)",
                  fontFamily: "monospace",
                  background: "rgb(var(--crm-overlay) / 3%)",
                  border: "1px solid rgb(var(--crm-line) / 8%)",
                  borderRadius: 8,
                  padding: "0.5rem 0.75rem",
                  wordBreak: "break-all",
                }}
              >
                {booking.id}
              </div>
            </div>
          </div>

          {booking.notes && (
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--crm-faint)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Client Notes
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--crm-text-2)",
                  background: "rgb(var(--crm-overlay) / 3%)",
                  border: "1px solid rgb(var(--crm-line) / 8%)",
                  borderRadius: 8,
                  padding: "0.75rem",
                  lineHeight: 1.6,
                }}
              >
                {booking.notes}
              </div>
            </div>
          )}

          {/* Status Controls */}
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--crm-faint)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Update Status
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(
                Object.keys(STATUS_CONFIG) as BookingStatus[]
              ).map((s) => {
                const c = STATUS_CONFIG[s];
                const isActive = booking.status === s;
                return (
                  <button
                    key={s}
                    disabled={isPending || isActive}
                    onClick={() => onStatusChange(booking.id, s)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 999,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      border: `1px solid ${isActive ? c.color + "50" : "rgb(var(--crm-line) / 12%)"}`,
                      background: isActive ? c.bg : "transparent",
                      color: isActive ? c.color : "var(--crm-muted)",
                      cursor: isActive ? "default" : "pointer",
                      transition: "all 0.2s ease",
                      textTransform: "uppercase",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--crm-faint)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Admin Notes
            </div>
            <textarea
              ref={notesRef}
              value={notes}
              placeholder="Add internal notes, follow-up actions, or CRM context…"
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesDirty(e.target.value !== (booking.admin_notes || ""));
              }}
              rows={3}
              style={{
                width: "100%",
                background: "rgb(var(--crm-overlay) / 3%)",
                border: "1px solid rgb(var(--crm-line) / 10%)",
                borderRadius: 10,
                padding: "0.75rem",
                color: "var(--crm-text)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgb(var(--crm-line) / 25%)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgb(var(--crm-line) / 10%)")
              }
            />
            {notesDirty && (
              <div
                style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
              >
                <button
                  disabled={isPending}
                  onClick={() => {
                    onNotesChange(booking.id, notes);
                    setNotesDirty(false);
                  }}
                  style={{
                    padding: "6px 18px",
                    borderRadius: 8,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    background: "rgb(var(--crm-line) / 15%)",
                    border: "1px solid rgb(var(--crm-line) / 20%)",
                    color: "var(--crm-text)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Save Notes
                </button>
              </div>
            )}
          </div>

          {/* Delete */}
          <div
            style={{
              borderTop: "1px solid rgb(var(--crm-line) / 6%)",
              paddingTop: "1rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 8,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: "transparent",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "rgba(239,68,68,0.6)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(239,68,68,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(239,68,68,0.9)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(239,68,68,0.6)";
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                Delete Booking
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.78rem", color: "var(--crm-muted)" }}>
                  Permanently delete this booking?
                </span>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    fontSize: "0.75rem",
                    background: "transparent",
                    border: "1px solid rgb(var(--crm-line) / 15%)",
                    color: "var(--crm-muted)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={isPending}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDelete(booking.id);
                  }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "rgba(239,68,68,0.9)",
                    cursor: "pointer",
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main CRM Dashboard ───────────────────────────────────────────────────────

export default function CRMDashboard({
  initialBookings,
  fetchError,
}: {
  initialBookings: Booking[];
  fetchError?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => counts[b.status]++);
    return { total: bookings.length, ...counts };
  }, [bookings]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "all" || b.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        (b.company || "").toLowerCase().includes(q) ||
        b.purpose.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, statusFilter]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleStatusChange(id: string, status: BookingStatus) {
    const previous = [...bookings];
    // Optimistic update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    startTransition(async () => {
      const res = await updateBookingStatus(id, status);
      if (res.success) {
        showToast("Status updated", "success");
        router.refresh();
      } else {
        // Revert on error
        setBookings(previous);
        showToast(res.error || "Failed to update status", "error");
      }
    });
  }

  function handleNotesChange(id: string, notes: string) {
    const previous = [...bookings];
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, admin_notes: notes } : b))
    );
    startTransition(async () => {
      const res = await updateAdminNotes(id, notes);
      if (res.success) {
        showToast("Notes saved", "success");
        router.refresh();
      } else {
        setBookings(previous);
        showToast(res.error || "Failed to save notes", "error");
      }
    });
  }

  function handleDelete(id: string) {
    const previous = [...bookings];
    setBookings((prev) => prev.filter((b) => b.id !== id));
    startTransition(async () => {
      const res = await deleteBooking(id);
      if (res.success) {
        showToast("Booking deleted", "success");
        router.refresh();
      } else {
        setBookings(previous);
        showToast(res.error || "Failed to delete", "error");
      }
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--crm-bg)",
        fontFamily: "var(--font-geist-sans), Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 40% at 10% 0%, rgb(var(--crm-line) / 5%), transparent 55%),
            radial-gradient(ellipse 50% 35% at 90% 100%, rgb(var(--crm-line) / 4%), transparent 55%)
          `,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--crm-muted)",
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--crm-text)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--crm-muted)")
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back to site
              </Link>
            </div>
            <h1
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                fontWeight: 700,
                color: "var(--crm-text)",
                letterSpacing: "-0.03em",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              CRM Dashboard
            </h1>
            <p style={{ color: "var(--crm-faint)", margin: "6px 0 0", fontSize: "0.88rem" }}>
              Manage bookings, track status, and add internal notes.
            </p>
          </div>

          {/* Refresh button */}
          <button
            disabled={isPending}
            onClick={() => {
              startTransition(() => {
                router.refresh();
              });
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 10,
              background: "rgb(17 17 24 / 80%)",
              border: "1px solid rgb(var(--crm-line) / 12%)",
              color: "var(--crm-text-2)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(16px)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: isPending ? "spin 0.8s linear infinite" : "none",
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {isPending ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* ── Error Banner ── */}
        {fetchError && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12,
              padding: "1rem 1.25rem",
              color: "rgba(239,68,68,0.9)",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>
              <strong>Supabase Error:</strong> {fetchError}. Make sure{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> is set in{" "}
              <code>.env.local</code>.
            </span>
          </div>
        )}

        {/* ── Stats Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            label="Total Bookings"
            value={stats.total}
            color="var(--crm-text-2)"
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            }
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="#f59e0b"
            active={statusFilter === "pending"}
            onClick={() => setStatusFilter("pending")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            }
          />
          <StatCard
            label="Confirmed"
            value={stats.confirmed}
            color="#3b82f6"
            active={statusFilter === "confirmed"}
            onClick={() => setStatusFilter("confirmed")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            }
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            color="#10b981"
            active={statusFilter === "completed"}
            onClick={() => setStatusFilter("completed")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            }
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            color="#6b7280"
            active={statusFilter === "cancelled"}
            onClick={() => setStatusFilter("cancelled")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            }
          />
        </div>

        {/* ── Search Bar ── */}
        <div
          style={{
            position: "relative",
            marginBottom: "1.5rem",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--crm-faint)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, company, or purpose…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.75rem",
              background: "rgb(17 17 24 / 60%)",
              border: "1px solid rgb(var(--crm-line) / 10%)",
              borderRadius: 12,
              color: "var(--crm-text)",
              fontSize: "0.9rem",
              outline: "none",
              backdropFilter: "blur(16px)",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease",
              fontFamily: "inherit",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgb(var(--crm-line) / 25%)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgb(var(--crm-line) / 10%)")
            }
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--crm-faint)",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* ── Results count ── */}
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--crm-faint)",
            marginBottom: "1rem",
          }}
        >
          {filtered.length === 0
            ? "No bookings found"
            : `Showing ${filtered.length} of ${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`}
          {statusFilter !== "all" && (
            <span
              style={{ color: STATUS_CONFIG[statusFilter].color, marginLeft: 4 }}
            >
              · {STATUS_CONFIG[statusFilter].label}
            </span>
          )}
        </div>

        {/* ── Booking Cards ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "rgb(17 17 24 / 40%)",
              border: "1px solid rgb(var(--crm-line) / 8%)",
              borderRadius: 20,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {bookings.length === 0 ? "📭" : "🔍"}
            </div>
            <p style={{ color: "var(--crm-faint)", fontSize: "0.95rem", margin: 0 }}>
              {bookings.length === 0
                ? "No bookings yet. They'll appear here once people submit the contact form."
                : "No bookings match your current filter."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
                onDelete={handleDelete}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background:
              toast.type === "success"
                ? "rgba(16,185,129,0.12)"
                : "rgba(239,68,68,0.12)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            backdropFilter: "blur(20px)",
            borderRadius: 12,
            padding: "0.875rem 1.25rem",
            color:
              toast.type === "success"
                ? "rgba(16,185,129,0.9)"
                : "rgba(239,68,68,0.9)",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 9999,
            animation: "slide-up 0.3s cubic-bezier(0.4,0,0.2,1) forwards",
            boxShadow: "0 8px 32px rgb(0 0 0 / 40%)",
          }}
        >
          {toast.type === "success" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          {toast.msg}
        </div>
      )}

      {/* Spin animation for refresh button */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::placeholder { color: #3a3a40; }
      `}</style>
    </div>
  );
}
