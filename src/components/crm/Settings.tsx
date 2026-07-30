"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, createRole, updateRole, deleteRole, createUser, adminResetPassword, adminSuspendUser, adminDeleteUser, adminReassignLeads } from "@/app/actions/settings";
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

  // User Management states
  const [resettingPasswordUserId, setResettingPasswordUserId] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [reassigningFromUserId, setReassigningFromUserId] = useState<string | null>(null);
  const [reassigningToUserId, setReassigningToUserId] = useState("");

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

  async function handleResetPassword(userId: string) {
    if (!newPasswordVal || newPasswordVal.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    startTransition(async () => {
      const res = await adminResetPassword(userId, newPasswordVal);
      if (!res.success) {
        showToast(res.error || "Failed", "error");
      } else {
        showToast("Password reset successfully!", "success");
        setResettingPasswordUserId(null);
        setNewPasswordVal("");
      }
    });
  }

  async function handleToggleSuspend(userId: string, currentStatus: string | null) {
    const shouldSuspend = currentStatus !== "suspended";
    const msg = shouldSuspend ? "Suspend this user? They will not be able to log in." : "Reactivate this user?";
    if (!confirm(msg)) return;

    startTransition(async () => {
      const res = await adminSuspendUser(userId, shouldSuspend);
      if (!res.success) {
        showToast(res.error || "Failed", "error");
      } else {
        showToast(shouldSuspend ? "User suspended!" : "User reactivated!", "success");
        router.refresh();
      }
    });
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;

    startTransition(async () => {
      const res = await adminDeleteUser(userId);
      if (!res.success) {
        showToast(res.error || "Failed", "error");
      } else {
        showToast("User deleted successfully!", "success");
        router.refresh();
      }
    });
  }

  async function handleReassignLeads() {
    if (!reassigningFromUserId || !reassigningToUserId) return;
    startTransition(async () => {
      const res = await adminReassignLeads(reassigningFromUserId, reassigningToUserId);
      if (!res.success) {
        showToast(res.error || "Failed", "error");
      } else {
        showToast("Leads reassigned successfully!", "success");
        setReassigningFromUserId(null);
        setReassigningToUserId("");
        router.refresh();
      }
    });
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.6rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
    background: active ? "rgba(99,102,241,0.12)" : "transparent",
    border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
    color: active ? "#818cf8" : "#94A3B8",
  });

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh", maxWidth: 1200, margin: "0 auto" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}

      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "#1E293B", margin: 0, letterSpacing: "-0.03em" }}>Settings</h1>
        <p style={{ color: "#94A3B8", fontSize: "0.85rem", marginTop: 4 }}>Manage your CRM workspace</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button onClick={() => setTab("general")} style={tabStyle(tab === "general")}>General</button>
        <button onClick={() => setTab("team")} style={tabStyle(tab === "team")}>Team Members</button>
        <button onClick={() => setTab("roles")} style={tabStyle(tab === "roles")}>Roles & Permissions</button>
      </div>

      {tab === "general" && (
        <div style={{ background: "#FFFFFF", backdropFilter: "blur(20px)", border: "1px solid #E2E8F0", borderRadius: 16, padding: isMobile ? "1.25rem" : "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1E293B", margin: "0 0 1.5rem" }}>Your Profile</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem", background: "#FAFBFD", borderRadius: 12, border: "1px solid #E2E8F0", marginBottom: "1.5rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, color: "#818cf8", flexShrink: 0 }}>
              {getInitials(currentUser.full_name)}
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#1E293B" }}>{currentUser.full_name || "—"}</div>
              <div style={{ fontSize: "0.82rem", color: "#64748B", marginTop: 2 }}>{currentUser.email}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: currentUser.role === "admin" ? "#f59e0b" : "#10b981", background: currentUser.role === "admin" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 999, marginTop: 6, border: `1px solid ${currentUser.role === "admin" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "team" && (
        <div style={{ background: "#FFFFFF", backdropFilter: "blur(20px)", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>Team Members</h2>
              <p style={{ fontSize: "0.78rem", color: "#94A3B8", margin: "4px 0 0" }}>{profileList.length} members · Manage roles below</p>
            </div>
            <button onClick={() => setAddingMember(true)} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 600, border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", fontSize: "0.8rem" }}>
              + Add Team Member
            </button>
          </div>

          {/* Add Team Member Modal */}
          {addingMember && (
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #E2E8F0", background: "rgba(16,185,129,0.03)" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "#1E293B" }}>Add New Sales Team Member</h3>
              <form onSubmit={handleCreateMember} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#64748B", marginBottom: 4 }}>Full Name *</label>
                    <input
                      value={newMemberName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      placeholder="e.g. Muzamil Khan"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: 6, background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#1E293B", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#64748B", marginBottom: 4 }}>Login Email *</label>
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      required
                      placeholder="muzamil@company.com"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: 6, background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#1E293B", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#64748B", marginBottom: 4 }}>Initial Password *</label>
                    <input
                      type="password"
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: 6, background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#1E293B", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#64748B", marginBottom: 4 }}>Assigned Mailbox *</label>
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
                  <button type="submit" disabled={isPending || !newMemberName.trim() || !newMemberMailbox.trim()} style={{ padding: "0.5rem 1.25rem", borderRadius: 6, background: "#10b981", border: "none", color: "#fff", fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1 }}>
                    {isPending ? "Creating..." : "Create User"}
                  </button>
                  <button type="button" onClick={() => { setAddingMember(false); setNewMemberName(""); setNewMemberEmail(""); setNewMemberPassword(""); setNewMemberMailbox(""); setMailboxTouched(false); }} style={{ padding: "0.5rem 1.25rem", borderRadius: 6, background: "transparent", border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 2.5fr", gap: "1rem", padding: "0.75rem 1.5rem", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
              {["Member", "Current Role", "Status", "Change Role", "Actions"].map(h => <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>)}
            </div>
          )}

          {profileList.map(p => {
            const isCurrentUser = p.id === currentUser.id;
            const isSuspended = p.status === "suspended";
            return isMobile ? (
              <div key={p.id} style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, color: "#1E293B" }}>{p.full_name}</div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: isSuspended ? "#EF4444" : "#10B981" }}>
                    {isSuspended ? "Suspended" : "Active"}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>Role: {p.role}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => setResettingPasswordUserId(p.id)} style={{ flex: 1, padding: "6px", background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#475569", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Reset PW</button>
                  <button onClick={() => handleToggleSuspend(p.id, p.status)} style={{ flex: 1, padding: "6px", background: isSuspended ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${isSuspended ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, color: isSuspended ? "#10B981" : "#EF4444", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                    {isSuspended ? "Reactivate" : "Suspend"}
                  </button>
                </div>
              </div>
            ) : (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 2.5fr", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid #E2E8F0", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#818cf8" }}>
                    {getInitials(p.full_name)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1E293B" }}>
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
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, color: isSuspended ? "#EF4444" : "#10B981", background: isSuspended ? "#FEF2F2" : "#D1FAE5", border: `1px solid ${isSuspended ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}` }}>
                    {isSuspended ? "Suspended" : "Active"}
                  </span>
                </div>

                <div>
                  <select 
                    value={p.role} 
                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                    disabled={isPending || isCurrentUser}
                    style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#1E293B", padding: "4px 8px", borderRadius: 6, fontSize: "0.8rem", outline: "none", cursor: "pointer" }}
                  >
                    {roleList.map(r => <option key={r.id} value={r.name} style={{ background: "#FFFFFF" }}>{r.name}</option>)}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setResettingPasswordUserId(p.id)} style={{ padding: "4px 8px", borderRadius: 6, background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#475569", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Reset PW</button>
                  <button onClick={() => setReassigningFromUserId(p.id)} style={{ padding: "4px 8px", borderRadius: 6, background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#475569", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Move Leads</button>
                  <button onClick={() => handleToggleSuspend(p.id, p.status)} style={{ padding: "4px 8px", borderRadius: 6, background: isSuspended ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${isSuspended ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, color: isSuspended ? "#10B981" : "#EF4444", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                    {isSuspended ? "Activate" : "Suspend"}
                  </button>
                  {!isCurrentUser && (
                    <button onClick={() => handleDeleteUser(p.id)} style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "roles" && (
        <div style={{ background: "#FFFFFF", backdropFilter: "blur(20px)", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1E293B", margin: 0 }}>Roles & Permissions</h2>
              <p style={{ fontSize: "0.78rem", color: "#94A3B8", margin: "4px 0 0" }}>Create and manage custom roles</p>
            </div>
            <button onClick={() => setEditingRole({ id: "new", name: "", permissions: {} })} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "rgba(99,102,241,0.15)", color: "#818cf8", fontWeight: 600, border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer", fontSize: "0.8rem" }}>
              + New Role
            </button>
          </div>

          {editingRole && (
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #E2E8F0", background: "rgba(99,102,241,0.03)" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", color: "#1E293B" }}>{editingRole.id === "new" ? "Create New Role" : "Edit Role"}</h3>
              <form onSubmit={handleSaveRole} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#64748B", marginBottom: 4 }}>Role Name</label>
                  <input name="name" defaultValue={editingRole.name} required readOnly={editingRole.name === 'admin'} style={{ width: "100%", maxWidth: 250, padding: "0.5rem", borderRadius: 6, background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#1E293B", fontSize: "0.85rem", outline: "none" }} />
                  {editingRole.name === 'admin' && <span style={{ marginLeft: 10, fontSize: "0.7rem", color: "#ef4444" }}>Admin name cannot be changed</span>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#64748B", marginBottom: 8 }}>Permissions</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {["can_manage_roles", "can_manage_deals", "can_manage_contacts", "can_access_mailbox"].map(perm => (
                      <label key={perm} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "#d1d5db" }}>
                        <input type="checkbox" name={perm} defaultChecked={editingRole.permissions?.[perm]} style={{ accentColor: "#6366f1" }} />
                        {perm.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: "0.5rem" }}>
                  <button type="submit" disabled={isPending} style={{ padding: "0.5rem 1.25rem", borderRadius: 6, background: "#6366f1", border: "none", color: "#fff", fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer" }}>Save</button>
                  <button type="button" onClick={() => setEditingRole(null)} style={{ padding: "0.5rem 1.25rem", borderRadius: 6, background: "transparent", border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1rem", padding: "0.75rem 1.5rem", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
              {["Role Name", "Permissions", "Actions"].map(h => <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>)}
            </div>
          )}

          {roleList.map(r => (
            <div key={r.id} style={{ display: isMobile ? "block" : "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid #E2E8F0", alignItems: "center" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B", marginBottom: isMobile ? "0.5rem" : 0 }}>{r.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(r.permissions).map(([k, v]) => v ? (
                  <span key={k} style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(99,102,241,0.1)", color: "#818cf8", borderRadius: 4, border: "1px solid rgba(99,102,241,0.2)" }}>
                    {k.replace('can_', '')}
                  </span>
                ) : null)}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: isMobile ? "0.75rem" : 0 }}>
                <button onClick={() => setEditingRole(r)} style={{ padding: "4px 10px", borderRadius: 6, background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#d1d5db", fontSize: "0.75rem", cursor: "pointer" }}>Edit</button>
                {r.name !== "admin" && r.name !== "sales" && (
                  <button onClick={() => handleDeleteRole(r.id)} disabled={isPending} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Password Reset Modal Overlay */}
      {resettingPasswordUserId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setResettingPasswordUserId(null)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 400, background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: "1.5rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", zIndex: 901 }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "#1E293B" }}>Reset User Password</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#64748B", marginBottom: 4, fontWeight: 600 }}>New Password</label>
                <input
                  type="password"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Min 6 characters"
                  style={{ width: "100%", padding: "0.55rem", borderRadius: 8, border: "1px solid #E2E8F0", outline: "none", fontSize: "0.85rem" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => { setResettingPasswordUserId(null); setNewPasswordVal(""); }} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "transparent", border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
                <button onClick={() => handleResetPassword(resettingPasswordUserId)} style={{ padding: "0.5rem 1.25rem", borderRadius: 8, background: "#3B82F6", border: "none", color: "#FFFFFF", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>Reset Password</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Leads Modal Overlay */}
      {reassigningFromUserId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setReassigningFromUserId(null)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 400, background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0", padding: "1.5rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", zIndex: 901 }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700, color: "#1E293B" }}>Reassign Leads</h3>
            <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "0 0 1rem", lineHeight: 1.4 }}>Transfer all assigned leads from this user to another team member.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#64748B", marginBottom: 4, fontWeight: 600 }}>Assign To</label>
                <select
                  value={reassigningToUserId}
                  onChange={(e) => setReassigningToUserId(e.target.value)}
                  style={{ width: "100%", padding: "0.55rem", borderRadius: 8, border: "1px solid #E2E8F0", outline: "none", fontSize: "0.85rem", background: "#FFFFFF" }}
                >
                  <option value="">— Select member —</option>
                  {profileList.filter(u => u.id !== reassigningFromUserId).map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => { setReassigningFromUserId(null); setReassigningToUserId(""); }} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "transparent", border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>Cancel</button>
                <button onClick={handleReassignLeads} disabled={!reassigningToUserId} style={{ padding: "0.5rem 1.25rem", borderRadius: 8, background: "#10B981", border: "none", color: "#FFFFFF", fontWeight: 700, cursor: !reassigningToUserId ? "not-allowed" : "pointer", fontSize: "0.8rem", opacity: !reassigningToUserId ? 0.6 : 1 }}>Transfer Leads</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
