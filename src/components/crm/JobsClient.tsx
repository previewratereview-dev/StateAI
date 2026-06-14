"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteJob, toggleJobStatus, toggleJobFeatured, type Job } from "@/app/actions/jobs";

function getStatusStyle(status: string) {
  switch (status) {
    case "active":
      return { bg: "rgba(16,185,129,0.12)", color: "#10b981" };
    case "inactive":
      return { bg: "rgba(239,68,68,0.12)", color: "#ef4444" };
    case "draft":
      return { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" };
    default:
      return { bg: "rgba(177,178,180,0.1)", color: "#818286" };
  }
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    "full-time": "#10b981",
    "part-time": "#f59e0b",
    contract: "#818cf8",
    internship: "#ec4899",
    freelance: "#a855f7",
    commission: "#ef4444",
  };
  return colors[type] || "#818286";
}

export default function JobsClient({
  jobs,
  error,
}: {
  jobs: Job[];
  error?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    setDeleting(id);
    const result = await deleteJob(id);
    setDeleting(null);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete");
    }
  }, [router]);

  const handleToggleStatus = useCallback(async (id: string, currentStatus: string) => {
    setToggling(id);
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const result = await toggleJobStatus(id, newStatus);
    setToggling(null);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to update status");
    }
  }, [router]);

  const handleToggleFeatured = useCallback(async (id: string, current: boolean) => {
    setToggling(id);
    const result = await toggleJobFeatured(id, !current);
    setToggling(null);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to update featured");
    }
  }, [router]);

  const cellStyle: React.CSSProperties = {
    padding: "12px 16px",
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
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fcfcfe", margin: 0 }}>
            Job Listings
          </h1>
          <p style={{ color: "#5d5e60", fontSize: "0.85rem", margin: "4px 0 0" }}>
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/crm/jobs/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.25))",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "#818cf8",
            fontSize: "0.85rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.35))";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.25))";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Job
        </Link>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            fontSize: "0.85rem",
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 16,
            border: "1px solid rgba(177,178,180,0.08)",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5d5e60" strokeWidth="1.5" style={{ marginBottom: 16 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h3 style={{ color: "#fcfcfe", fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>No jobs yet</h3>
          <p style={{ color: "#5d5e60", fontSize: "0.9rem", marginBottom: 20 }}>
            Create your first job listing to start attracting candidates.
          </p>
          <Link
            href="/crm/jobs/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#818cf8",
              fontSize: "0.85rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create First Job
          </Link>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 14,
            border: "1px solid rgba(177,178,180,0.08)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={headerStyle}>Title</th>
                <th style={headerStyle}>Department</th>
                <th style={headerStyle}>Location</th>
                <th style={headerStyle}>Type</th>
                <th style={headerStyle}>Status</th>
                <th style={headerStyle}>Featured</th>
                <th style={{ ...headerStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const statusStyle = getStatusStyle(job.status);
                const typeColor = getTypeColor(job.type);
                return (
                  <tr key={job.id}>
                    <td style={cellStyle}>
                      <Link
                        href={`/careers/${job.slug}`}
                        target="_blank"
                        style={{
                          color: "#fcfcfe",
                          fontWeight: 600,
                          textDecoration: "none",
                          fontSize: "0.88rem",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#818cf8";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#fcfcfe";
                        }}
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td style={cellStyle}>{job.department}</td>
                    <td style={cellStyle}>{job.location}</td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          color: typeColor,
                          fontWeight: 500,
                          fontSize: "0.78rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {job.type.replace("-", " ")}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => handleToggleStatus(job.id, job.status)}
                        disabled={toggling === job.id}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          opacity: toggling === job.id ? 0.6 : 1,
                        }}
                      >
                        {job.status}
                      </button>
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => handleToggleFeatured(job.id, job.featured)}
                        disabled={toggling === job.id}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background: job.featured ? "rgba(245,158,11,0.12)" : "rgba(177,178,180,0.08)",
                          color: job.featured ? "#f59e0b" : "#5d5e60",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          opacity: toggling === job.id ? 0.6 : 1,
                        }}
                      >
                        {job.featured ? "Featured" : "Normal"}
                      </button>
                    </td>
                    <td style={{ ...cellStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <Link
                          href={`/crm/jobs/${job.id}/edit`}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "rgba(99,102,241,0.1)",
                            border: "1px solid rgba(99,102,241,0.15)",
                            color: "#818cf8",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.2)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)";
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id)}
                          disabled={deleting === job.id}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.15)",
                            color: "#ef4444",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: deleting === job.id ? "not-allowed" : "pointer",
                            opacity: deleting === job.id ? 0.5 : 1,
                            fontFamily: "inherit",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (deleting !== job.id) {
                              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
                          }}
                        >
                          {deleting === job.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}