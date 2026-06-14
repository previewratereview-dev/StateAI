"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateApplicationStatus, updateApplicationNotes, deleteApplication, type ApplicationWithJob } from "@/app/actions/applications";

function getStatusStyle(status: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    new: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
    reviewed: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    shortlisted: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
    rejected: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
    hired: { bg: "rgba(16,185,129,0.2)", color: "#34d399" },
  };
  return styles[status] || styles.new;
}

export default function ApplicationsClient({
  applications,
}: {
  applications: ApplicationWithJob[];
}) {
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<ApplicationWithJob | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleStatusChange = useCallback(async (id: string, status: string) => {
    const result = await updateApplicationStatus(id, status as any);
    if (result.success) router.refresh();
  }, [router]);

  const handleSaveNotes = useCallback(async (id: string) => {
    setSaving(true);
    const result = await updateApplicationNotes(id, adminNotes);
    setSaving(false);
    if (result.success) router.refresh();
  }, [router, adminNotes]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this application?")) return;
    const result = await deleteApplication(id);
    if (result.success) {
      setSelectedApp(null);
      router.refresh();
    }
  }, [router]);

  const statuses = ["new", "reviewed", "shortlisted", "rejected", "hired"] as const;

  const cellStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: "0.84rem",
    color: "#a1a3a6",
    borderBottom: "1px solid rgba(177,178,180,0.06)",
    verticalAlign: "middle",
  };

  const headerStyle: React.CSSProperties = {
    ...cellStyle,
    color: "#5d5e60",
    fontWeight: 600,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid rgba(177,178,180,0.1)",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: selectedApp ? "1fr 380px" : "1fr", gap: 24 }}>
      {/* List */}
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fcfcfe", margin: 0 }}>
            Applications
          </h1>
          <p style={{ color: "#5d5e60", fontSize: "0.85rem", margin: "4px 0 0" }}>
            {applications.length} total
          </p>
        </div>

        {applications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(177,178,180,0.08)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5d5e60" strokeWidth="1.5" style={{ marginBottom: 16 }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-5" />
            </svg>
            <h3 style={{ color: "#fcfcfe", fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>No applications yet</h3>
            <p style={{ color: "#5d5e60", fontSize: "0.9rem" }}>Applications will appear here once candidates start applying.</p>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(177,178,180,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={headerStyle}>Applicant</th>
                  <th style={headerStyle}>Job</th>
                  <th style={headerStyle}>Email</th>
                  <th style={headerStyle}>Date</th>
                  <th style={headerStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const sStyle = getStatusStyle(app.status);
                  return (
                    <tr
                      key={app.id}
                      onClick={() => {
                        setSelectedApp(app);
                        setAdminNotes(app.admin_notes || "");
                      }}
                      style={{
                        cursor: "pointer",
                        background: selectedApp?.id === app.id ? "rgba(99,102,241,0.06)" : "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedApp?.id !== app.id)
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedApp?.id !== app.id)
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <td style={cellStyle}>
                        <span style={{ color: "#fcfcfe", fontWeight: 600, fontSize: "0.88rem" }}>
                          {app.first_name} {app.last_name}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span style={{ color: "#818286", fontSize: "0.82rem" }}>
                          {app.jobs?.title || "—"}
                        </span>
                      </td>
                      <td style={cellStyle}>{app.email}</td>
                      <td style={cellStyle}>
                        {new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td style={cellStyle}>
                        <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, background: sStyle.bg, color: sStyle.color }}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedApp && (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 14,
            border: "1px solid rgba(177,178,180,0.08)",
            padding: "1.5rem",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
            position: "sticky",
            top: 24,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fcfcfe", margin: 0 }}>
              {selectedApp.first_name} {selectedApp.last_name}
            </h2>
            <button
              onClick={() => setSelectedApp(null)}
              style={{ background: "none", border: "none", color: "#5d5e60", cursor: "pointer", padding: 4 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Status</label>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {statuses.map((s) => {
                const ss = getStatusStyle(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedApp.id, s)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      background: selectedApp.status === s ? ss.bg : "rgba(177,178,180,0.06)",
                      color: selectedApp.status === s ? ss.color : "#5d5e60",
                      border: selectedApp.status === s ? `1px solid ${ss.color}20` : "1px solid transparent",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textTransform: "capitalize",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Contact</label>
            <div style={{ fontSize: "0.85rem", color: "#a1a3a6", lineHeight: 1.8 }}>
              <div><strong style={{ color: "#818286" }}>Email:</strong> {selectedApp.email}</div>
              {selectedApp.phone && <div><strong style={{ color: "#818286" }}>Phone:</strong> {selectedApp.phone}</div>}
              {selectedApp.linkedin_url && (
                <div><strong style={{ color: "#818286" }}>LinkedIn:</strong> <a href={selectedApp.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8" }}>View Profile</a></div>
              )}
              {selectedApp.portfolio_url && (
                <div><strong style={{ color: "#818286" }}>Portfolio:</strong> <a href={selectedApp.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8" }}>View</a></div>
              )}
              {selectedApp.website_url && (
                <div><strong style={{ color: "#818286" }}>Website:</strong> <a href={selectedApp.website_url} target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8" }}>Visit</a></div>
              )}
              {selectedApp.resume_url && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fcfcfe" }}>Resume</div>
                      <div style={{ fontSize: "0.72rem", color: "#5d5e60", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selectedApp.resume_url.split("/").pop() || "resume"}
                      </div>
                    </div>
                  </div>
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 8,
                      background: "rgba(99,102,241,0.15)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      color: "#818cf8",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.15)";
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="8 17 16 11 8 5" />
                    </svg>
                    View / Download
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Job Info */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Applied For</label>
            <div style={{ fontSize: "0.85rem", color: "#a1a3a6" }}>
              <Link href={`/careers/${selectedApp.jobs?.slug}`} target="_blank" style={{ color: "#818cf8", textDecoration: "none" }}>
                {selectedApp.jobs?.title}
              </Link>
              <div style={{ color: "#5d5e60", fontSize: "0.78rem" }}>{selectedApp.jobs?.department} • {selectedApp.jobs?.type}</div>
            </div>
          </div>

          {/* Extra Details */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Details</label>
            <div style={{ fontSize: "0.85rem", color: "#a1a3a6", lineHeight: 1.8 }}>
              {selectedApp.currently_employed && <div>✅ Currently employed</div>}
              {selectedApp.start_date && <div>Start: {selectedApp.start_date}</div>}
              {selectedApp.expected_salary != null && (
                <div>Expected: {selectedApp.currency} {selectedApp.expected_salary.toLocaleString()}</div>
              )}
              <div>Applied: {new Date(selectedApp.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>

          {/* Cover Letter */}
          {selectedApp.cover_letter && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Cover Letter</label>
              <div style={{ fontSize: "0.85rem", color: "#a1a3a6", lineHeight: 1.7, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12 }}>{selectedApp.cover_letter}</div>
            </div>
          )}

          {/* Admin Notes */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this applicant..."
              style={{
                width: "100%",
                minHeight: 80,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(177,178,180,0.12)",
                color: "#fcfcfe",
                fontSize: "0.85rem",
                fontFamily: "inherit",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => handleSaveNotes(selectedApp.id)}
              disabled={saving}
              style={{
                marginTop: 8,
                padding: "6px 16px",
                borderRadius: 8,
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#818cf8",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
                fontFamily: "inherit",
              }}
            >
              {saving ? "Saving..." : "Save Notes"}
            </button>
          </div>

          {/* Delete */}
          <button
            onClick={() => handleDelete(selectedApp.id)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 8,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "#ef4444",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Delete Application
          </button>
        </div>
      )}
    </div>
  );
}