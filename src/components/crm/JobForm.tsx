"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createJob, updateJob, type Job, type JobFormData } from "@/app/actions/jobs";

const DEPARTMENTS = [
  "Engineering",
  "Data Science",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Management",
  "Legal",
  "Other",
] as const;

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance", "commission"] as const;
const JOB_STATUSES = ["active", "inactive", "draft"] as const;

export default function JobForm({ job }: { job?: Job | null }) {
  const router = useRouter();
  const isEditing = !!job;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<JobFormData>({
    title: job?.title || "",
    department: job?.department || "Engineering",
    location: job?.location || "",
    type: job?.type || "full-time",
    description: job?.description || "",
    requirements: job?.requirements || "",
    responsibilities: job?.responsibilities || "",
    salary_min: job?.salary_min || null,
    salary_max: job?.salary_max || null,
    salary_currency: job?.salary_currency || "USD",
    status: job?.status || "draft",
    featured: job?.featured || false,
    application_url: job?.application_url || "",
  });

  const handleChange = useCallback(
    (field: keyof JobFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = isEditing
        ? await updateJob(job!.id, formData)
        : await createJob(formData);

      if (result.success) {
        router.push("/crm/jobs");
        router.refresh();
      } else {
        setError(result.error || "Failed to save job");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    background: "rgb(var(--crm-overlay) / 0.04)",
    border: "1px solid rgb(var(--crm-line) / 0.12)",
    color: "var(--crm-text)",
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
    color: "var(--crm-text-2)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%235d5e60' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "12px",
    paddingRight: 36,
    backgroundColor: "rgb(var(--crm-overlay) / 0.04)",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 150,
    resize: "vertical",
    lineHeight: 1.6,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--crm-text)", margin: 0 }}>
            {isEditing ? "Edit Job" : "New Job Listing"}
          </h1>
          <p style={{ color: "var(--crm-faint)", fontSize: "0.85rem", margin: "4px 0 0" }}>
            {isEditing ? `Editing "${job?.title}"` : "Create a new job posting"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => router.push("/crm/jobs")}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: "rgb(var(--crm-overlay) / 0.04)",
              border: "1px solid rgb(var(--crm-line) / 0.12)",
              color: "var(--crm-muted)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.25))",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
              fontFamily: "inherit",
            }}
          >
            {saving ? "Saving..." : isEditing ? "Update Job" : "Create Job"}
          </button>
        </div>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Title */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Job Title</label>
          <input
            style={inputStyle}
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g. Senior Machine Learning Engineer"
            required
          />
        </div>

        {/* Department */}
        <div>
          <label style={labelStyle}>Department</label>
          <select
            style={selectStyle}
            value={formData.department}
            onChange={(e) => handleChange("department", e.target.value)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location</label>
          <input
            style={inputStyle}
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="e.g. Remote, San Francisco, London"
            required
          />
        </div>

        {/* Job Type */}
        <div>
          <label style={labelStyle}>Type</label>
          <select
            style={selectStyle}
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status</label>
          <select
            style={selectStyle}
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Salary Min */}
        <div>
          <label style={labelStyle}>Salary Min</label>
          <input
            style={inputStyle}
            type="number"
            value={formData.salary_min ?? ""}
            onChange={(e) => handleChange("salary_min", e.target.value ? Number(e.target.value) : null)}
            placeholder="e.g. 80000"
          />
        </div>

        {/* Salary Max */}
        <div>
          <label style={labelStyle}>Salary Max</label>
          <input
            style={inputStyle}
            type="number"
            value={formData.salary_max ?? ""}
            onChange={(e) => handleChange("salary_max", e.target.value ? Number(e.target.value) : null)}
            placeholder="e.g. 150000"
          />
        </div>

        {/* Salary Currency */}
        <div>
          <label style={labelStyle}>Currency</label>
          <select
            style={selectStyle}
            value={formData.salary_currency}
            onChange={(e) => handleChange("salary_currency", e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        </div>

        {/* Application URL */}
        <div>
          <label style={labelStyle}>Application URL (optional)</label>
          <input
            style={inputStyle}
            value={formData.application_url ?? ""}
            onChange={(e) => handleChange("application_url", e.target.value || null)}
            placeholder="e.g. https://jobs.lever.co/stateai/..."
          />
        </div>

        {/* Featured */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            paddingTop: 24,
          }}
        >
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured || false}
            onChange={(e) => handleChange("featured", e.target.checked)}
            style={{
              width: 18,
              height: 18,
              accentColor: "#818cf8",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="featured"
            style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}
          >
            Featured Position
          </label>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Description</label>
        <textarea
          style={textareaStyle}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Write a compelling description about the role..."
          required
        />
      </div>

      {/* Responsibilities */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Responsibilities</label>
        <textarea
          style={textareaStyle}
          value={formData.responsibilities}
          onChange={(e) => handleChange("responsibilities", e.target.value)}
          placeholder="List the key responsibilities for this role..."
          required
        />
      </div>

      {/* Requirements */}
      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Requirements</label>
        <textarea
          style={textareaStyle}
          value={formData.requirements}
          onChange={(e) => handleChange("requirements", e.target.value)}
          placeholder="List the qualifications and requirements..."
          required
        />
      </div>
    </form>
  );
}