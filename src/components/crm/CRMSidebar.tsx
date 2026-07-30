"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import type { UserProfile } from "@/lib/auth";
import { useIsMobile } from "@/lib/useIsMobile";

const NAV_ITEMS = [
  {
    href: "/crm/dashboard",
    label: "Dashboard",
    roles: ["admin", "sales"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/crm/contacts",
    label: "Contacts",
    roles: ["admin", "sales"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/crm/leads",
    label: "Pipeline",
    roles: ["admin", "sales"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
  },
  {
    href: "/crm/deals",
    label: "Deals",
    roles: ["admin", "sales"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: "/crm/bookings",
    label: "Bookings",
    roles: ["admin", "sales"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/crm/tasks",
    label: "Tasks",
    roles: ["admin", "sales"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    href: "/crm/reports",
    label: "Reports",
    roles: ["admin", "sales"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/crm/mailbox",
    label: "Mailbox",
    roles: ["admin", "sales"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/crm/jobs",
    label: "Jobs",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/crm/applications",
    label: "Applications",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-5" />
      </svg>
    ),
  },
  {
    href: "/crm/audit-logs",
    label: "Audit Logs",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/crm/settings",
    label: "Settings",
    roles: ["admin"],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function CRMSidebar({ profile }: { profile: UserProfile }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("crm-scroll-lock");
    } else {
      document.body.classList.remove("crm-scroll-lock");
    }
    return () => document.body.classList.remove("crm-scroll-lock");
  }, [mobileOpen]);

  const visibleNav = NAV_ITEMS.filter((item) =>
    item.roles.includes(profile.role)
  );

  // On mobile, always show full (not collapsed) sidebar content
  const showLabels = isMobile ? true : !collapsed;
  const sidebarWidth = isMobile ? 260 : collapsed ? 64 : 220;

  const mainMenuNav = visibleNav.filter((item) => item.href !== "/crm/settings");
  const helpSupportNav = visibleNav.filter((item) => item.href === "/crm/settings");

  const sidebarContent = (
    <aside
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: "100vh",
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        background: "#0F172A",
        borderRight: "1px solid #1E293B",
        display: "flex",
        flexDirection: "column",
        transition: isMobile ? "none" : "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 100,
        overflow: "hidden",
        ...(isMobile ? { animation: "crm-slide-in-left 0.25s ease forwards" } : {}),
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: showLabels ? "1.25rem 1rem" : "1.25rem 0",
          borderBottom: "1px solid #1E293B",
          display: "flex",
          alignItems: "center",
          justifyContent: showLabels ? "space-between" : "center",
          gap: 10,
        }}
      >
        {showLabels && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#000000",
                border: "1px solid #334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "#FFFFFF",
                padding: 4,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 75 L53 25 L61 38 L43 75 H28 Z" fill="currentColor" />
                <path d="M54 50 L64 38 L80 75 H69 L61 57 Z" fill="currentColor" />
              </svg>
            </div>
            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              StateAI CRM
            </span>
          </div>
        )}
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "#1E293B",
              border: "1px solid #334155",
              color: "#94A3B8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "#1E293B",
              border: "1px solid #334155",
              color: "#94A3B8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto", overflowX: "hidden" }}>
        {/* MAIN MENU SECTION */}
        {showLabels && (
          <div style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0.5rem 0.75rem 0.5rem",
          }}>
            Main Menu
          </div>
        )}
        {mainMenuNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!showLabels ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: showLabels ? 10 : 0,
                padding: showLabels ? "0.6rem 0.75rem" : "0.6rem",
                borderRadius: 10,
                marginBottom: 2,
                color: isActive ? "#F8FAFC" : "#94A3B8",
                background: isActive ? "#3B82F6" : "transparent",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                justifyContent: showLabels ? "flex-start" : "center",
                minHeight: 40,
                transition: "all 0.15s ease-in-out"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#1E293B";
                  e.currentTarget.style.color = "#F8FAFC";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#94A3B8";
                }
              }}
            >
              <span style={{ flexShrink: 0, color: isActive ? "#F8FAFC" : "#94A3B8" }}>{item.icon}</span>
              {showLabels && <span>{item.label}</span>}
              {showLabels && item.label === "Mailbox" && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#F43F5E",
                    color: "#FFFFFF",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 999,
                    lineHeight: 1,
                  }}
                >
                  12
                </span>
              )}
            </Link>
          );
        })}

        {/* HELP & SUPPORT SECTION */}
        {helpSupportNav.length > 0 && (
          <>
            {showLabels && (
              <div style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "1.25rem 0.75rem 0.5rem",
              }}>
                Help & Support
              </div>
            )}
            {helpSupportNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!showLabels ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: showLabels ? 10 : 0,
                    padding: showLabels ? "0.6rem 0.75rem" : "0.6rem",
                    borderRadius: 10,
                    marginBottom: 2,
                    color: isActive ? "#F8FAFC" : "#94A3B8",
                    background: isActive ? "#3B82F6" : "transparent",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: isActive ? 600 : 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    justifyContent: showLabels ? "flex-start" : "center",
                    minHeight: 40,
                    transition: "all 0.15s ease-in-out"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#1E293B";
                      e.currentTarget.style.color = "#F8FAFC";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#94A3B8";
                    }
                  }}
                >
                  <span style={{ flexShrink: 0, color: isActive ? "#F8FAFC" : "#94A3B8" }}>{item.icon}</span>
                  {showLabels && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: "0.75rem 0.5rem",
          borderTop: "1px solid #1E293B",
        }}
      >
        {showLabels && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0.6rem 0.75rem",
              borderRadius: 10,
              background: "#1E293B",
              border: "1px solid #334155",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              {getInitials(profile.full_name || profile.email)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#F8FAFC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.full_name || profile.email?.split("@")[0]}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: profile.role === "admin" ? "#FBBF24" : "#34D399",
                  background: "rgba(30, 41, 59, 0.5)",
                  padding: "1px 6px",
                  borderRadius: 999,
                  marginTop: 2,
                }}
              >
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                {profile.role}
              </div>
            </div>
          </div>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: showLabels ? "0.55rem 0.75rem" : "0.6rem",
              borderRadius: 10,
              background: "transparent",
              border: "1px solid #334155",
              color: "#EF4444",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: showLabels ? "flex-start" : "center",
              gap: 8,
              transition: "all 0.2s",
              fontFamily: "inherit",
              minHeight: 40,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.1)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#EF4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#334155";
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {showLabels && "Sign Out"}
          </button>
        </form>
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        {/* Floating hamburger button */}
        {!mobileOpen && (
          <button
            className="crm-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {/* Overlay sidebar */}
        {mobileOpen && (
          <>
            <div className="crm-sidebar-backdrop" onClick={() => setMobileOpen(false)} />
            {sidebarContent}
          </>
        )}
      </>
    );
  }

  return sidebarContent;
}
