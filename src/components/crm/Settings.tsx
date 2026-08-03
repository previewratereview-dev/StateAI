"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, createRole, updateRole, deleteRole, createUser } from "@/app/actions/settings";
import { useIsMobile } from "@/lib/useIsMobile";
import type { UserProfile } from "@/lib/auth";

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function SettingsClient({
  currentUser,
  profiles,
  roles,
}: {
  currentUser: UserProfile;
  profiles: any[];
  roles: any[];
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<"general" | "team" | "roles">("team");
  const [profileList, setProfileList] = useState(profiles);
  const [roleList, setRoleList] = useState(roles);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Role builder state
  const [editingRole, setEditingRole] = useState<any>(null);

  // Add Team Member modal state
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberMailbox, setNewMemberMailbox] = useState("");
  const [mailboxTouched, setMailboxTouched] = useState(false);

  function handleNameChange(name: string) {
    setNewMemberName(name);
    // Auto-suggest mailbox only if admin hasn't manually edited it
    if (!mailboxTouched) {
      const suggestion = name.trim()
        ? `${name.trim().toLowerCase().replace(/\s+/g, ".")}.sales@stateai.in`
        : "";
      setNewMemberMailbox(suggestion);
    }
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleRoleChange(userId: string, newRole: string) {
    if (userId === currentUser.id && newRole !== "admin" && currentUser.role === "admin") {
      if (!confirm("Demoting yourself will remove your admin access. Continue?")) return;
    }
    setProfileList(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (!res.success) { setProfileList(profiles); showToast(res.error || "Failed", "error"); }
      else showToast("Role updated!", "success");
    });
  }

  async function handleCreateMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim() || !newMemberPassword.trim() || !newMemberMailbox.trim()) return;

    startTransition(async () => {
      const res = await createUser(
        newMemberName.trim(),
        newMemberEmail.trim(),
        newMemberPassword.trim(),
        "sales",
        newMemberMailbox.trim()
      );
      if (res.success) {
        setProfileList(prev => [...prev, res.data]);
        showToast(`${newMemberName} added with mailbox ${newMemberMailbox}`, "success");
        setAddingMember(false);
        setNewMemberName("");
        setNewMemberEmail("");
        setNewMemberPassword("");
        setNewMemberMailbox("");
        setMailboxTouched(false);
      } else {
        showToast(res.error || "Failed to create user", "error");
      }
    });
  }

  function handleSaveRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const permissions = {
      can_manage_roles: fd.get("can_manage_roles") === "on",
      can_manage_deals: fd.get("can_manage_deals") === "on",
      can_manage_contacts: fd.get("can_manage_contacts") === "on",
      can_access_mailbox: fd.get("can_access_mailbox") === "on",
    };

    startTransition(async () => {
      if (editingRole.id === "new") {
        const res = await createRole(name, permissions);
        if (res.success) {
          setRoleList(prev => [...prev, res.data]);
          showToast("Role created", "success");
          setEditingRole(null);
        } else showToast(res.error || "Failed", "error");
      } else {
        const res = await updateRole(editingRole.id, permissions);
        if (res.success) {
          setRoleList(prev => prev.map(r => r.id === editingRole.id ? { ...r, name, permissions } : r));
          showToast("Role updated", "success");
          setEditingRole(null);
        } else showToast(res.error || "Failed", "error");
      }
    });
  }

  function handleDeleteRole(id: string) {
    if (!confirm("Are you sure you want to delete this role? Users with this role might lose access.")) return;
    startTransition(async () => {
      const res = await deleteRole(id);
      if (res.success) {
        setRoleList(prev => prev.filter(r => r.id !== id));
        showToast("Role deleted", "success");
      } else showToast(res.error || "Failed", "error");
    });
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.6rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
    background: active ? "rgba(99,102,241,0.12)" : "transparent",
    border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
    color: active ? "#818cf8" : "var(--crm-faint)",
  });

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh", maxWidth: 1200, margin: "0 auto" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}

      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "var(--crm-text)", margin: 0, letterSpacing: "-0.03em" }}>Settings</h1>
        <p style={{ color: "var(--crm-faint)", fontSize: "0.85rem", marginTop: 4 }}>Manage your CRM workspace</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button onClick={() => setTab("general")} style={tabStyle(tab === "general")}>General</button>
        <button onClick={() => setTab("team")} style={tabStyle(tab === "team")}>Team Members</button>
        <button onClick={() => setTab("roles")} style={tabStyle(tab === "roles")}>Roles & Permissions</button>
      </div>

      {tab === "general" && (
        <div style={{ background: "rgb(var(--crm-card-rgb) / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgb(var(--crm-line) / 0.08)", borderRadius: 16, padding: isMobile ? "1.25rem" : "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--crm-text)", margin: "0 0 1.5rem" }}>Your Profile</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem", background: "rgb(var(--crm-overlay) / 0.03)", borderRadius: 12, border: "1px solid rgb(var(--crm-line) / 0.08)", marginBottom: "1.5rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, color: "#818cf8", flexShrink: 0 }}>
              {getInitials(currentUser.full_name)}
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--crm-text)" }}>{currentUser.full_name || "—"}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--crm-muted)", marginTop: 2 }}>{currentUser.email}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: currentUser.role === "admin" ? "#f59e0b" : "#10b981", background: currentUser.role === "admin" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 999, marginTop: 6, border: `1px solid ${currentUser.role === "admin" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "team" && (
        <div style={{ background: "rgb(var(--crm-card-rgb) / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgb(var(--crm-line) / 0.08)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--crm-text)", margin: 0 }}>Team Members</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--crm-faint)", margin: "4px 0 0" }}>{profileList.length} members · Manage roles below</p>
            </div>
            <button onClick={() => setAddingMember(true)} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 600, border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", fontSize: "0.8rem" }}>
              + Add Team Member
            </button>
          </div>

          {/* Add Team Member Modal */}
          {addingMember && (
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.06)", background: "rgba(16,185,129,0.03)" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--crm-text)" }}>Add New Sales Team Member</h3>
              <form onSubmit={handleCreateMember} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--crm-muted)", marginBottom: 4 }}>Full Name *</label>
                    <input
                      value={newMemberName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      placeholder="e.g. Muzamil Khan"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: 6, background: "rgb(var(--crm-overlay) / 0.04)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--crm-muted)", marginBottom: 4 }}>Login Email *</label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      required
                      placeholder="muzamil@company.com"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: 6, background: "rgb(var(--crm-overlay) / 0.04)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--crm-muted)", marginBottom: 4 }}>Initial Password *</label>
                    <input
                      type="password"
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: 6, background: "rgb(var(--crm-overlay) / 0.04)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--crm-muted)", marginBottom: 4 }}>Assigned Mailbox *</label>
                    <input
                      value={newMemberMailbox}
                      onChange={(e) => { setNewMemberMailbox(e.target.value); setMailboxTouched(true); }}
                      required
                      placeholder="e.g. muzamil.sales@stateai.in"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: 6, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontSize: "0.85rem", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: "0.25rem" }}>
                  <button type="submit" disabled={isPending || !newMemberName.trim() || !newMemberMailbox.trim()} style={{ padding: "0.5rem 1.25rem", borderRadius: 6, background: "#10b981", border: "none", color: "var(--crm-on-accent)", fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1 }}>
                    {isPending ? "Creating..." : "Create User"}
                  </button>
                  <button type="button" onClick={() => { setAddingMember(false); setNewMemberName(""); setNewMemberEmail(""); setNewMemberPassword(""); setNewMemberMailbox(""); setMailboxTouched(false); }} style={{ padding: "0.5rem 1.25rem", borderRadius: 6, background: "transparent", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-muted)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem", padding: "0.75rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.06)", background: "rgb(var(--crm-overlay) / 0.02)" }}>
              {["Member", "Current Role", "Change Role"].map(h => <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--crm-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>)}
            </div>
          )}

          {profileList.map(p => {
            const isCurrentUser = p.id === currentUser.id;
            return isMobile ? (
              <div key={p.id} style={{ padding: "1rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.04)" }}>
                <div style={{ fontWeight: 600, color: "var(--crm-text)" }}>{p.full_name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--crm-muted)" }}>{p.role}</div>
              </div>
            ) : (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.04)", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#818cf8" }}>
                    {getInitials(p.full_name)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--crm-text)" }}>
                      {p.full_name || "Unnamed User"}
                      {isCurrentUser && <span style={{ fontSize: "0.65rem", background: "rgba(99,102,241,0.15)", color: "#818cf8", padding: "1px 7px", borderRadius: 999, marginLeft: 8, fontWeight: 700 }}>You</span>}
                    </div>
                    {p.assigned_mailbox && (
                      <div style={{ fontSize: "0.72rem", color: "#10b981", marginTop: 2 }}>📬 {p.assigned_mailbox}</div>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: p.role === "admin" ? "#f59e0b" : "#10b981", background: p.role === "admin" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${p.role === "admin" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                    {p.role}
                  </span>
                </div>

                <div>
                  <select 
                    value={p.role} 
                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                    disabled={isPending}
                    style={{ background: "rgb(var(--crm-overlay) / 0.04)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-text)", padding: "4px 8px", borderRadius: 6, fontSize: "0.8rem", outline: "none", cursor: "pointer" }}
                  >
                    {roleList.map(r => <option key={r.id} value={r.name} style={{ background: "var(--crm-modal)" }}>{r.name}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "roles" && (
        <div style={{ background: "rgb(var(--crm-card-rgb) / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgb(var(--crm-line) / 0.08)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--crm-text)", margin: 0 }}>Roles & Permissions</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--crm-faint)", margin: "4px 0 0" }}>Create and manage custom roles</p>
            </div>
            <button onClick={() => setEditingRole({ id: "new", name: "", permissions: {} })} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "rgba(99,102,241,0.15)", color: "#818cf8", fontWeight: 600, border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer", fontSize: "0.8rem" }}>
              + New Role
            </button>
          </div>

          {editingRole && (
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.06)", background: "rgba(99,102,241,0.03)" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "var(--crm-text)" }}>{editingRole.id === "new" ? "Create New Role" : "Edit Role"}</h3>
              <form onSubmit={handleSaveRole} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--crm-muted)", marginBottom: 4 }}>Role Name</label>
                  <input name="name" defaultValue={editingRole.name} required readOnly={editingRole.name === 'admin'} style={{ width: "100%", maxWidth: 250, padding: "0.5rem", borderRadius: 6, background: "rgb(var(--crm-overlay) / 0.04)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none" }} />
                  {editingRole.name === 'admin' && <span style={{ marginLeft: 10, fontSize: "0.7rem", color: "#ef4444" }}>Admin name cannot be changed</span>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--crm-muted)", marginBottom: 8 }}>Permissions</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {["can_manage_roles", "can_manage_deals", "can_manage_contacts", "can_access_mailbox"].map(perm => (
                      <label key={perm} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "var(--crm-text-2)" }}>
                        <input type="checkbox" name={perm} defaultChecked={editingRole.permissions?.[perm]} style={{ accentColor: "#6366f1" }} />
                        {perm.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: "0.5rem" }}>
                  <button type="submit" disabled={isPending} style={{ padding: "0.5rem 1.25rem", borderRadius: 6, background: "#6366f1", border: "none", color: "var(--crm-on-accent)", fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer" }}>Save</button>
                  <button type="button" onClick={() => setEditingRole(null)} style={{ padding: "0.5rem 1.25rem", borderRadius: 6, background: "transparent", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-muted)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1rem", padding: "0.75rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.06)", background: "rgb(var(--crm-overlay) / 0.02)" }}>
              {["Role Name", "Permissions", "Actions"].map(h => <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--crm-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>)}
            </div>
          )}

          {roleList.map(r => (
            <div key={r.id} style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.04)", alignItems: "center" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--crm-text)", marginBottom: isMobile ? "0.5rem" : 0 }}>{r.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(r.permissions).map(([k, v]) => v ? (
                  <span key={k} style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(99,102,241,0.1)", color: "#818cf8", borderRadius: 4, border: "1px solid rgba(99,102,241,0.2)" }}>
                    {k.replace('can_', '')}
                  </span>
                ) : null)}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: isMobile ? "0.75rem" : 0 }}>
                <button onClick={() => setEditingRole(r)} style={{ padding: "4px 10px", borderRadius: 6, background: "rgb(var(--crm-overlay) / 0.05)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-text-2)", fontSize: "0.75rem", cursor: "pointer" }}>Edit</button>
                {r.name !== "admin" && r.name !== "sales" && (
                  <button onClick={() => handleDeleteRole(r.id)} disabled={isPending} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
