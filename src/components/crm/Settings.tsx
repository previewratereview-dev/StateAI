"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/actions/settings";
import type { UserProfile } from "@/lib/auth";

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function SettingsClient({
  currentUser,
  profiles,
}: {
  currentUser: UserProfile;
  profiles: any[];
}) {
  const [tab, setTab] = useState<"general" | "team">("team");
  const [profileList, setProfileList] = useState(profiles);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleRoleChange(userId: string, role: "admin" | "sales") {
    if (userId === currentUser.id && role !== "admin") {
      if (!confirm("Demoting yourself will remove your admin access. Continue?")) return;
    }
    setProfileList(prev => prev.map(p => p.id === userId ? { ...p, role } : p));
    startTransition(async () => {
      const res = await updateUserRole(userId, role);
      if (!res.success) { setProfileList(profiles); showToast(res.error || "Failed", "error"); }
      else showToast("Role updated!", "success");
    });
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.6rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
    background: active ? "rgba(99,102,241,0.12)" : "transparent",
    border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
    color: active ? "#818cf8" : "#5d5e60",
  });

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", maxWidth: 900, margin: "0 auto" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}

      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fcfcfe", margin: 0, letterSpacing: "-0.03em" }}>Settings</h1>
        <p style={{ color: "#5d5e60", fontSize: "0.85rem", marginTop: 4 }}>Manage your CRM workspace</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button onClick={() => setTab("general")} style={tabStyle(tab === "general")}>General</button>
        <button onClick={() => setTab("team")} style={tabStyle(tab === "team")}>Team Members</button>
      </div>

      {/* General tab */}
      {tab === "general" && (
        <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, padding: "1.75rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fcfcfe", margin: "0 0 1.5rem" }}>Your Profile</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(177,178,180,0.08)", marginBottom: "1.5rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, color: "#818cf8", flexShrink: 0 }}>
              {getInitials(currentUser.full_name)}
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fcfcfe" }}>{currentUser.full_name || "—"}</div>
              <div style={{ fontSize: "0.82rem", color: "#818286", marginTop: 2 }}>{currentUser.email}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: currentUser.role === "admin" ? "#f59e0b" : "#10b981", background: currentUser.role === "admin" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 999, marginTop: 6, border: `1px solid ${currentUser.role === "admin" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                {currentUser.role}
              </div>
            </div>
          </div>
          <div style={{ padding: "1rem 1.25rem", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p style={{ fontSize: "0.82rem", color: "#818286", margin: 0, lineHeight: 1.6 }}>
                Profile details (name, avatar) are managed through Supabase Auth. Contact your Supabase admin to update your display name or email address.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Team tab */}
      {tab === "team" && (
        <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(177,178,180,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#fcfcfe", margin: 0 }}>Team Members</h2>
              <p style={{ fontSize: "0.78rem", color: "#5d5e60", margin: "4px 0 0" }}>{profileList.length} members · Manage roles below</p>
            </div>
          </div>

          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: "1rem", padding: "0.75rem 1.5rem", borderBottom: "1px solid rgba(177,178,180,0.06)", background: "rgba(255,255,255,0.02)" }}>
            {["Member", "Email", "Role", "Actions"].map(h => <div key={h} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>)}
          </div>

          {profileList.map(p => {
            const isCurrentUser = p.id === currentUser.id;
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: "1rem", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(177,178,180,0.04)", alignItems: "center" }}>
                {/* Member */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#818cf8", flexShrink: 0 }}>
                    {getInitials(p.full_name)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fcfcfe" }}>
                      {p.full_name || "Unnamed User"}
                      {isCurrentUser && <span style={{ fontSize: "0.65rem", background: "rgba(99,102,241,0.15)", color: "#818cf8", padding: "1px 7px", borderRadius: 999, marginLeft: 8, fontWeight: 700 }}>You</span>}
                    </div>
                  </div>
                </div>

                {/* Email (from profiles, may be null) */}
                <div style={{ fontSize: "0.82rem", color: "#5d5e60" }}>—</div>

                {/* Role badge */}
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: p.role === "admin" ? "#f59e0b" : "#10b981", background: p.role === "admin" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${p.role === "admin" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                    {p.role}
                  </span>
                </div>

                {/* Role switcher */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleRoleChange(p.id, p.role === "admin" ? "sales" : "admin")}
                    disabled={isPending}
                    style={{ padding: "4px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.12)", color: "#818286", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget).style.borderColor = "rgba(177,178,180,0.25)"; (e.currentTarget).style.color = "#fcfcfe"; }}
                    onMouseLeave={e => { (e.currentTarget).style.borderColor = "rgba(177,178,180,0.12)"; (e.currentTarget).style.color = "#818286"; }}
                  >
                    → {p.role === "admin" ? "Sales" : "Admin"}
                  </button>
                </div>
              </div>
            );
          })}

          {profileList.length === 0 && (
            <div style={{ padding: "3rem", textAlign: "center", color: "#3d3e40" }}>No team members found.</div>
          )}
        </div>
      )}
    </div>
  );
}
