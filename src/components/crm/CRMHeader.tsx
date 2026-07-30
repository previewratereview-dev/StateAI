"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/auth";
import { globalSearch } from "@/app/actions/search";
import { getNotifications, markNotificationRead, markAllNotificationsRead, type AppNotification } from "@/app/actions/notifications";

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function CRMHeader({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ contacts: any[]; deals: any[]; tasks: any[] }>({
    contacts: [],
    deals: [],
    tasks: []
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const firstName = profile.full_name?.split(" ")[0] || profile.email?.split("@")[0] || "User";
  const fullName = profile.full_name || profile.email?.split("@")[0] || "User";

  // Load notifications
  const loadNotifications = async () => {
    const res = await getNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Search Input Change
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        const res = await globalSearch(searchQuery);
        setSearchResults(res);
        setIsSearching(false);
        setSearchOpen(true);
      } else {
        setSearchResults({ contacts: [], deals: [], tasks: [] });
        setSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside listener to close search & notification dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleNotifClick = async (id: string, read: boolean) => {
    if (!read) {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
    setNotifOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header
      style={{
        height: 70,
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 90,
        flexShrink: 0,
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "#1E293B",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Welcome Back, {firstName} 👋
        </h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {/* Search Bar */}
        <div ref={searchRef} style={{ position: "relative", width: 260 }} className="hidden md:block">
          <input
            type="text"
            placeholder="Search leads, deals, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 1) setSearchOpen(true);
            }}
            style={{
              width: "100%",
              padding: "0.5rem 1rem 0.5rem 2.25rem",
              borderRadius: 10,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              fontSize: "0.85rem",
              color: "#1E293B",
              outline: "none",
              transition: "border-color 0.15s ease-in-out"
            }}
          />
          <svg
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748B",
            }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          {/* Search Dropdown Popover */}
          {searchOpen && (
            <div
              style={{
                position: "absolute",
                top: "120%",
                right: 0,
                width: 320,
                background: "#FFFFFF",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                padding: "1rem",
                maxHeight: 400,
                overflowY: "auto",
                zIndex: 200,
              }}
            >
              {isSearching ? (
                <div style={{ fontSize: "0.85rem", color: "#64748B", textAlign: "center", padding: "1rem" }}>Searching...</div>
              ) : (searchResults.contacts.length === 0 && searchResults.deals.length === 0 && searchResults.tasks.length === 0) ? (
                <div style={{ fontSize: "0.85rem", color: "#64748B", textAlign: "center", padding: "1rem" }}>No results found</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Contacts Section */}
                  {searchResults.contacts.length > 0 && (
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Contacts</div>
                      {searchResults.contacts.map((c) => (
                        <Link
                          key={c.id}
                          href={`/crm/contacts/${c.id}`}
                          onClick={() => setSearchOpen(false)}
                          style={{
                            display: "block",
                            padding: "0.4rem 0.5rem",
                            borderRadius: 6,
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            color: "#1E293B",
                            transition: "background 0.15s"
                          }}
                          className="hover:bg-slate-50"
                        >
                          <div style={{ fontWeight: 600 }}>{c.first_name} {c.last_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{c.company || c.email}</div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Deals Section */}
                  {searchResults.deals.length > 0 && (
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Deals</div>
                      {searchResults.deals.map((d) => (
                        <Link
                          key={d.id}
                          href={`/crm/deals`}
                          onClick={() => setSearchOpen(false)}
                          style={{
                            display: "block",
                            padding: "0.4rem 0.5rem",
                            borderRadius: 6,
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            color: "#1E293B",
                            transition: "background 0.15s"
                          }}
                          className="hover:bg-slate-50"
                        >
                          <div style={{ fontWeight: 600 }}>{d.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>${d.value.toLocaleString()} • {d.stage}</div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Tasks Section */}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: "0.5rem" }}>Tasks</div>
                      {searchResults.tasks.map((t) => (
                        <Link
                          key={t.id}
                          href={`/crm/tasks`}
                          onClick={() => setSearchOpen(false)}
                          style={{
                            display: "block",
                            padding: "0.4rem 0.5rem",
                            borderRadius: 6,
                            textDecoration: "none",
                            fontSize: "0.85rem",
                            color: "#1E293B",
                            transition: "background 0.15s"
                          }}
                          className="hover:bg-slate-50"
                        >
                          <div style={{ fontWeight: 600 }}>{t.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Status: {t.status}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Icon & Center */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  borderRadius: "50%",
                  width: 14,
                  height: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div
              style={{
                position: "absolute",
                top: "140%",
                right: 0,
                width: 320,
                background: "#FFFFFF",
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                zIndex: 200,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #E2E8F0"
                }}
              >
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1E293B" }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3B82F6",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "#94A3B8", textAlign: "center", padding: "1.5rem" }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => {
                    const colorMap = {
                      info: "#3B82F6",
                      success: "#10B981",
                      warning: "#F59E0B",
                      error: "#EF4444",
                      alert: "#6366F1"
                    };
                    const color = colorMap[n.type] || "#3B82F6";
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n.id, n.read)}
                        style={{
                          padding: "0.75rem 1rem",
                          borderBottom: "1px solid #F1F5F9",
                          cursor: "pointer",
                          background: n.read ? "transparent" : "#F8FAFC",
                          display: "flex",
                          gap: "0.75rem"
                        }}
                        className="hover:bg-slate-50"
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, marginTop: 4, flexShrink: 0 }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: n.read ? 600 : 700, color: "#1E293B" }}>{n.title}</span>
                          <span style={{ fontSize: "0.75rem", color: "#64748B", lineHeight: 1.3 }}>{n.message}</span>
                          <span style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 4 }}>
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "#E2E8F0" }} />

        {/* User Profile Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3B82F6, #6366F1)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: 700,
              boxShadow: "0 2px 4px 0 rgba(99, 102, 241, 0.15)"
            }}
          >
            {getInitials(profile.full_name || profile.email)}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }} className="hidden sm:flex">
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1E293B", lineHeight: 1.2 }}>
              {fullName}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#64748B", textTransform: "capitalize" }}>
              {profile.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
