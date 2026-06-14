"use client";

import { useState } from "react";
import { submitApplication } from "@/app/actions/applications";
import { uploadResume } from "@/app/actions/upload";

export default function JobApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const resumeFile = form.get("resume") as File;

    // Upload resume first if provided
    let resumeUrl: string | null = null;
    if (resumeFile && resumeFile.size > 0) {
      setUploadProgress("Uploading resume...");
      const uploadForm = new FormData();
      uploadForm.set("resume", resumeFile);
      const uploadResult = await uploadResume(uploadForm);
      if (!uploadResult.success) {
        setError(uploadResult.error || "Failed to upload resume");
        setSaving(false);
        setUploadProgress(null);
        return;
      }
      resumeUrl = uploadResult.url || null;
    }

    setUploadProgress("Submitting application...");

    const result = await submitApplication({
      job_id: jobId,
      first_name: form.get("first_name") as string,
      last_name: form.get("last_name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      linkedin_url: form.get("linkedin_url") as string,
      portfolio_url: form.get("portfolio_url") as string,
      website_url: form.get("website_url") as string,
      resume_url: resumeUrl || undefined,
      cover_letter: form.get("cover_letter") as string,
      expected_salary: form.get("expected_salary") ? Number(form.get("expected_salary")) : null,
      currency: (form.get("currency") as string) || "USD",
      currently_employed: form.get("currently_employed") === "on",
      start_date: form.get("start_date") as string,
    });

    setSaving(false);
    setUploadProgress(null);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem 2rem",
          background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))",
          border: "1px solid rgba(16,185,129,0.15)",
          borderRadius: 20,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" style={{ marginBottom: 16 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h3 style={{ color: "#fcfcfe", fontSize: "1.2rem", fontWeight: 600, marginBottom: 8 }}>
          Application Submitted!
        </h3>
        <p style={{ color: "#818286", fontSize: "0.9rem", maxWidth: 400, margin: "0 auto" }}>
          Thank you for applying to <strong>{jobTitle}</strong>. We'll review your application and get back to you soon.
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(177,178,180,0.12)",
    color: "#fcfcfe",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#a1a3a6",
    marginBottom: 6,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 120,
    resize: "vertical",
    lineHeight: 1.6,
  };

  const fileInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(177,178,180,0.12)",
    color: "#a1a3a6",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            fontSize: "0.85rem",
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {uploadProgress && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#818cf8",
            fontSize: "0.85rem",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: "2px solid rgba(99,102,241,0.3)",
              borderTopColor: "#818cf8",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          {uploadProgress}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>First Name *</label>
          <input style={inputStyle} name="first_name" required placeholder="John" />
        </div>
        <div>
          <label style={labelStyle}>Last Name *</label>
          <input style={inputStyle} name="last_name" required placeholder="Doe" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Email *</label>
          <input style={inputStyle} name="email" type="email" required placeholder="john@example.com" />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} name="phone" placeholder="+1 (555) 123-4567" />
        </div>
      </div>

      {/* Resume Upload */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Resume (PDF, DOC, DOCX) *</label>
        <input
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf"
          style={fileInputStyle}
        />
        <div style={{ fontSize: "0.72rem", color: "#5d5e60", marginTop: 4 }}>
          Max 10MB — PDF, DOC, DOCX, TXT, or RTF
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>LinkedIn URL</label>
          <input style={inputStyle} name="linkedin_url" placeholder="https://linkedin.com/in/..." />
        </div>
        <div>
          <label style={labelStyle}>Portfolio URL</label>
          <input style={inputStyle} name="portfolio_url" placeholder="https://..." />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Website</label>
          <input style={inputStyle} name="website_url" placeholder="https://..." />
        </div>
        <div>
          <label style={labelStyle}>Expected Salary</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              name="expected_salary"
              type="number"
              placeholder="80000"
            />
            <select
              name="currency"
              style={{
                ...inputStyle,
                width: 80,
                flexShrink: 0,
                cursor: "pointer",
                appearance: "none",
                paddingRight: 24,
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%235d5e60' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
                backgroundSize: "10px",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Earliest Start Date</label>
          <input style={inputStyle} name="start_date" type="text" placeholder="ASAP / 2 weeks / Date" />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 10 }}>
          <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 0 }}>
            <input
              type="checkbox"
              name="currently_employed"
              style={{ width: 16, height: 16, accentColor: "#818cf8", cursor: "pointer" }}
            />
            Currently employed
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Cover Letter / Why You?</label>
        <textarea
          style={textareaStyle}
          name="cover_letter"
          placeholder="Tell us why you're interested in this role and what makes you a great fit..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        style={{
          width: "100%",
          padding: "14px 24px",
          borderRadius: 12,
          background: saving
            ? "rgba(99,102,241,0.15)"
            : "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))",
          border: "1px solid rgba(99,102,241,0.3)",
          color: "#818cf8",
          fontSize: "0.95rem",
          fontWeight: 700,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.6 : 1,
          fontFamily: "inherit",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!saving) {
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.3))";
          }
        }}
        onMouseLeave={(e) => {
          if (!saving) {
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))";
          }
        }}
      >
        {saving ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}