"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Contact } from "@/app/actions/contacts";
import type { LeadStatus } from "@/lib/interaction-types";

type ContactStatus = LeadStatus;
import { createContact, updateContact, deleteContact, bulkDeleteContacts, bulkUpdateContactsStatus, bulkReassignContacts } from "@/app/actions/contacts";
import { useIsMobile } from "@/lib/useIsMobile";

const STATUS_CFG: Record<ContactStatus, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "#64748B", bg: "#F1F5F9" },
  contacted: { label: "Contacted", color: "#D97706", bg: "#FEF7E0" },
  qualified: { label: "Qualified", color: "#6366F1", bg: "#EEF2FF" },
  proposal: { label: "Proposal", color: "#8B5CF6", bg: "#F5F3FF" },
  negotiation: { label: "Negotiation", color: "#EC4899", bg: "#FDF2F8" },
  won: { label: "Won", color: "#10B981", bg: "#E6F4EA" },
  lost: { label: "Lost", color: "#EF4444", bg: "#FCE8E6" },
  churned: { label: "Churned", color: "#64748B", bg: "#F1F5F9" },
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  referral: "Referral",
  social: "Social",
  email: "Email",
  cold_call: "Cold Call",
  event: "Event",
  other: "Other",
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
          status: fd.get("status") as LeadStatus,
          lead_source: fd.get("lead_source") as any,
          notes: (fd.get("notes") as string) || null,
        };
        const res = await updateContact(editing.id, updates);
        if (res.error) {
          setError(res.error);
          return;
        }
        onSaved(res.data!);
      } else {
        const res = await createContact(fd);
        if (res.error) {
          setError(res.error);
          return;
        }
        onSaved(res.data!);
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "0.65rem 0.875rem",
    color: "#1E293B",
    fontSize: "0.875rem",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div
        style={{
          width: 460,
          background: "#FFFFFF",
          borderLeft: "1px solid #E2E8F0",
          height: "100%",
          overflowY: "auto",
          padding: "1.75rem",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.05)",
        }}
        className="crm-drawer-panel"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>
            {editing ? "Edit Contact" : "New Contact"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input
                name="first_name"
                required
                defaultValue={editing?.first_name}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input
                name="last_name"
                required
                defaultValue={editing?.last_name}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
          </div>
          {[
            { name: "email", label: "Email *", type: "email", required: true, value: editing?.email },
            { name: "phone", label: "Phone", type: "tel", required: false, value: editing?.phone || "" },
            { name: "company", label: "Company", type: "text", required: false, value: editing?.company || "" },
            { name: "job_title", label: "Job Title", type: "text", required: false, value: editing?.job_title || "" },
          ].map((f) => (
            <div key={f.name} style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                required={f.required}
                defaultValue={f.value}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" defaultValue={editing?.status || "new"} style={{ ...inputStyle, cursor: "pointer" }}>
                {Object.entries(STATUS_CFG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Lead Source</label>
              <select name="lead_source" defaultValue={editing?.lead_source || "other"} style={{ ...inputStyle, cursor: "pointer" }}>
                {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={editing?.notes || ""}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
          </div>
          {error && (
            <div
              style={{
                color: "#EF4444",
                fontSize: "0.82rem",
                marginBottom: "1rem",
                background: "#FCE8E6",
                padding: "0.6rem 0.75rem",
                borderRadius: 8,
                border: "1px solid #FCA5A5",
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.7rem",
                borderRadius: 10,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                color: "#64748B",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                flex: 2,
                padding: "0.7rem",
                borderRadius: 10,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#FFFFFF",
                cursor: isPending ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 700,
              }}
            >
              {isPending ? "Saving…" : editing ? "Save Changes" : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ContactsTable({
  initialContacts,
  isAdmin,
  salespeople = []
}: {
  initialContacts: Contact[];
  isAdmin: boolean;
  salespeople?: any[];
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [contacts, setContacts] = useState(initialContacts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: Contact }>({ open: false });
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Bulk selection states
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      const q = search.toLowerCase();
      return !q || `${c.first_name} ${c.last_name} ${c.email} ${c.company || ""}`.toLowerCase().includes(q);
    });
  }, [contacts, search, statusFilter]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleExportCSV() {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Company", "Job Title", "Status", "Lead Source", "Notes"];
    const csvContent = [
      headers.join(","),
      ...filtered.map(c => [
        `"${(c.first_name || "").replace(/"/g, '""')}"`,
        `"${(c.last_name || "").replace(/"/g, '""')}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        `"${(c.phone || "").replace(/"/g, '""')}"`,
        `"${(c.company || "").replace(/"/g, '""')}"`,
        `"${(c.job_title || "").replace(/"/g, '""')}"`,
        `"${(c.status || "").replace(/"/g, '""')}"`,
        `"${(c.lead_source || "").replace(/"/g, '""')}"`,
        `"${(c.notes || "").replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stateai_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Leads exported successfully!", "success");
  }

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length <= 1) {
        showToast("CSV file is empty", "error");
        return;
      }

      const csvHeaders = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
      const dataRows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values: string[] = [];
        let current = "";
        let insideQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(current.trim().replace(/^["']|["']$/g, ""));
            current = "";
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^["']|["']$/g, ""));

        const rowObj: any = {};
        csvHeaders.forEach((h, index) => {
          rowObj[h] = values[index] || "";
        });

        const firstName = rowObj["first name"] || rowObj["firstname"] || rowObj["first_name"] || "";
        const lastName = rowObj["last name"] || rowObj["lastname"] || rowObj["last_name"] || "";
        const email = rowObj["email"] || "";
        const phone = rowObj["phone"] || rowObj["telephone"] || null;
        const company = rowObj["company"] || rowObj["organization"] || null;
        const jobTitle = rowObj["job title"] || rowObj["jobtitle"] || rowObj["job_title"] || null;
        const status = rowObj["status"] || "new";
        const leadSource = rowObj["lead source"] || rowObj["source"] || "other";
        const notes = rowObj["notes"] || rowObj["description"] || null;

        if (firstName && email) {
          dataRows.push({
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            company,
            job_title: jobTitle,
            status,
            lead_source: leadSource,
            notes
          });
        }
      }

      if (dataRows.length === 0) {
        showToast("No valid contacts found (First Name & Email required)", "error");
        return;
      }

      startTransition(async () => {
        const { importContacts } = await import("@/app/actions/contacts");
        const res = await importContacts(dataRows);
        if (res.success) {
          showToast(`Successfully imported ${res.count} leads!`, "success");
          router.refresh();
        } else {
          showToast(res.error || "Failed to import leads", "error");
        }
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleSaved(contact: Contact) {
    setContacts((prev) => {
      const exists = prev.find((c) => c.id === contact.id);
      if (exists) return prev.map((c) => (c.id === contact.id ? contact : c));
      return [contact, ...prev];
    });
    setDrawer({ open: false });
    showToast("Contact saved!", "success");
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    const previous = [...contacts];
    setContacts((prev) => prev.filter((c) => c.id !== id));
    startTransition(async () => {
      const res = await deleteContact(id);
      if (!res.success) {
        setContacts(previous);
        showToast(res.error || "Delete failed", "error");
      } else {
        showToast("Contact deleted", "success");
      }
    });
  }

  const handleSelectRow = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (visibleRows: Contact[]) => {
    const visibleIds = visibleRows.map((r) => r.id);
    const allSelected = visibleIds.every((id) => selectedContactIds.includes(id));
    if (allSelected) {
      setSelectedContactIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedContactIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedContactIds.length} contacts? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await bulkDeleteContacts(selectedContactIds);
      if (!res.success) {
        showToast(res.error || "Bulk delete failed", "error");
      } else {
        showToast("Deleted selected contacts successfully!", "success");
        setContacts((prev) => prev.filter((c) => !selectedContactIds.includes(c.id)));
        setSelectedContactIds([]);
      }
    });
  };

  const handleBulkStatusUpdate = async (status: ContactStatus) => {
    startTransition(async () => {
      const res = await bulkUpdateContactsStatus(selectedContactIds, status);
      if (!res.success) {
        showToast(res.error || "Bulk status update failed", "error");
      } else {
        showToast("Status updated for selected contacts!", "success");
        setContacts((prev) =>
          prev.map((c) => (selectedContactIds.includes(c.id) ? { ...c, status } : c))
        );
        setSelectedContactIds([]);
      }
    });
  };

  const handleBulkReassign = async (assignedTo: string) => {
    if (!assignedTo) return;
    startTransition(async () => {
      const res = await bulkReassignContacts(selectedContactIds, assignedTo);
      if (!res.success) {
        showToast(res.error || "Bulk reassignment failed", "error");
      } else {
        showToast("Reassigned selected contacts successfully!", "success");
        setContacts((prev) =>
          prev.map((c) => (selectedContactIds.includes(c.id) ? { ...c, assigned_to: assignedTo } : c))
        );
        setSelectedContactIds([]);
      }
    });
  };

  const counts = useMemo(() => {
    const r: Record<string, number> = { all: contacts.length };
    contacts.forEach((c) => {
      r[c.status] = (r[c.status] || 0) + 1;
    });
    return r;
  }, [contacts]);

  return (
    <div style={{ padding: "1.75rem 2rem", background: "#F5F7FB", minHeight: "calc(100vh - 70px)" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 200,
            background: toast.type === "success" ? "#E6F4EA" : "#FCE8E6",
            border: `1px solid ${toast.type === "success" ? "#A3E635" : "#FCA5A5"}`,
            color: toast.type === "success" ? "#10B981" : "#EF4444",
            padding: "0.75rem 1.25rem",
            borderRadius: 12,
            fontSize: "0.85rem",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          {toast.msg}
        </div>
      )}

      {drawer.open && (
        <ContactDrawer editing={drawer.editing} onClose={() => setDrawer({ open: false })} onSaved={handleSaved} />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1E293B", margin: 0, letterSpacing: "-0.03em" }}>
            Contacts
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: 4 }}>{contacts.length} total contacts</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.65rem 1.25rem",
              borderRadius: 10,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#475569",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              minHeight: 40,
              transition: "all 0.15s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#FFFFFF"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.65rem 1.25rem",
              borderRadius: 10,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#475569",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              minHeight: 40,
              transition: "all 0.15s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#FFFFFF"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: "none" }} />
          </label>

          <button
            onClick={() => setDrawer({ open: true })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.65rem 1.25rem",
              borderRadius: 10,
              background: "linear-gradient(135deg, #3B82F6, #6366F1)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(99,102,241,0.12)",
              minHeight: 40,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts…"
            style={{
              width: "100%",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              padding: "0.6rem 0.875rem 0.6rem 2.5rem",
              color: "#1E293B",
              fontSize: "0.875rem",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "new", "contacted", "qualified", "proposal", "negotiation", "won", "lost", "churned"] as const).map((s) => {
            const isActive = statusFilter === s;
            const cfg = s !== "all" ? STATUS_CFG[s] : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "0.5rem 0.875rem",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  border: isActive ? "1px solid transparent" : "1px solid #E2E8F0",
                  background: isActive ? (cfg ? cfg.bg : "#EEF2FF") : "#FFFFFF",
                  color: isActive ? (cfg ? cfg.color : "#6366F1") : "#64748B",
                }}
              >
                {s === "all" ? "All" : STATUS_CFG[s].label} ({counts[s] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Card */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 12px rgba(99,102,241,0.01)" }}>
        {/* Table header - hidden on mobile */}
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "0.5fr 2.5fr 2fr 1.5fr 1.5fr 1fr auto", gap: "1rem", padding: "0.85rem 1.25rem", borderBottom: "1px solid #F1F5F9", background: "#FAFBFD", alignItems: "center" }}>
            <div>
              <input
                type="checkbox"
                checked={filtered.length > 0 && filtered.every(r => selectedContactIds.includes(r.id))}
                onChange={() => handleSelectAll(filtered)}
                style={{ cursor: "pointer", width: 15, height: 15 }}
              />
            </div>
            {["Contact", "Company", "Status", "Source", "Created", ""].map((h) => (
              <div key={h} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {h}
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94A3B8" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>👤</div>
            No contacts found. {search ? "Try a different search." : "Add your first contact!"}
          </div>
        ) : isMobile ? (
          /* Mobile card layout */
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((contact) => {
              const cfg = STATUS_CFG[contact.status];
              return (
                <div key={contact.id} style={{ padding: "1rem", borderBottom: "1px solid #F1F5F9", background: "#FFFFFF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: cfg.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: cfg.color,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(contact.first_name, contact.last_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a href={`/crm/contacts/${contact.id}`} style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1E293B", textDecoration: "none", display: "block" }}>
                        {contact.first_name} {contact.last_name}
                      </a>
                      <div style={{ fontSize: "0.75rem", color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {contact.email}
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "2px 10px",
                        borderRadius: 999,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: cfg.color,
                        background: cfg.bg,
                        flexShrink: 0,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {contact.company && (
                    <div style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 4 }}>
                      {contact.company}
                      {contact.job_title ? ` · ${contact.job_title}` : ""}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{formatDate(contact.created_at)}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setDrawer({ open: true, editing: contact })}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 7,
                          fontSize: "0.75rem",
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          color: "#64748B",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          minHeight: 32,
                        }}
                      >
                        Edit
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(contact.id)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 7,
                            fontSize: "0.75rem",
                            background: "transparent",
                            border: "1px solid #FCA5A5",
                            color: "#EF4444",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            minHeight: 32,
                          }}
                        >
                          Del
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop table layout */
          filtered.map((contact) => {
            const cfg = STATUS_CFG[contact.status];
            return (
              <div
                key={contact.id}
                className="hover:bg-[#FAFBFD] transition-colors duration-150"
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.5fr 2.5fr 2fr 1.5fr 1.5fr 1fr auto",
                  gap: "1rem",
                  padding: "0.875rem 1.25rem",
                  borderBottom: "1px solid #F1F5F9",
                  alignItems: "center",
                  background: "#FFFFFF",
                }}
              >
                {/* Checkbox */}
                <div>
                  <input
                    type="checkbox"
                    checked={selectedContactIds.includes(contact.id)}
                    onChange={() => handleSelectRow(contact.id)}
                    style={{ cursor: "pointer", width: 15, height: 15 }}
                  />
                </div>
                {/* Contact */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: cfg.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: cfg.color,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(contact.first_name, contact.last_name)}
                  </div>
                  <div>
                    <a
                      href={`/crm/contacts/${contact.id}`}
                      style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1E293B", textDecoration: "none", display: "block" }}
                    >
                      {contact.first_name} {contact.last_name}
                    </a>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{contact.email}</div>
                  </div>
                </div>
                {/* Company */}
                <div style={{ fontSize: "0.85rem", color: "#64748B" }}>
                  {contact.company || "—"}
                  <br />
                  <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{contact.job_title || ""}</span>
                </div>
                {/* Status */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: cfg.color,
                    background: cfg.bg,
                    width: "fit-content",
                  }}
                >
                  {cfg.label}
                </span>
                {/* Source */}
                <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                  {SOURCE_LABELS[contact.lead_source] || contact.lead_source}
                </div>
                {/* Created */}
                <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>{formatDate(contact.created_at)}</div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setDrawer({ open: true, editing: contact })}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 7,
                      fontSize: "0.72rem",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      color: "#64748B",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Edit
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(contact.id)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 7,
                        fontSize: "0.72rem",
                        background: "transparent",
                        border: "1px solid #FCA5A5",
                        color: "#EF4444",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Del
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedContactIds.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0F172A",
            border: "1px solid #1E293B",
            borderRadius: 16,
            padding: "0.85rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
            zIndex: 100,
            animation: "crm-slide-up 0.2s ease-out forwards",
            color: "#FFFFFF"
          }}
        >
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {selectedContactIds.length} Selected
          </span>

          <div style={{ width: 1, height: 20, background: "#334155" }} />

          {/* Bulk Update Status Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>Update Status:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusUpdate(e.target.value as ContactStatus);
                  e.target.value = "";
                }
              }}
              style={{
                background: "#1E293B",
                border: "1px solid #334155",
                color: "#FFFFFF",
                padding: "4px 8px",
                borderRadius: 8,
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="">— Select Status —</option>
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <option key={k} value={k} style={{ background: "#0F172A" }}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Reassign Dropdown (Admins only) */}
          {isAdmin && salespeople.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 600 }}>Assign To:</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkReassign(e.target.value);
                    e.target.value = "";
                  }
                }}
                style={{
                  background: "#1E293B",
                  border: "1px solid #334155",
                  color: "#FFFFFF",
                  padding: "4px 8px",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none"
                }}
              >
                <option value="">— Select Member —</option>
                {salespeople.map((u) => (
                  <option key={u.id} value={u.id} style={{ background: "#0F172A" }}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bulk Delete Button (Admins only) */}
          {isAdmin && (
            <button
              onClick={handleBulkDelete}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: "#EF4444",
                border: "none",
                color: "#FFFFFF",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#DC2626"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#EF4444"}
            >
              Delete Selected
            </button>
          )}

          {/* Cancel/Clear selection button */}
          <button
            onClick={() => setSelectedContactIds([])}
            style={{
              background: "none",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
