"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendEmail, updateEmailStatus, markEmailRead, getEmail } from "@/app/actions/emails";
import { useIsMobile } from "@/lib/useIsMobile";

type MobilePane = "list" | "read" | "compose";

function boxInitial(box: string) {
  return box.split("@")[0].slice(0, 2).toUpperCase() || "?";
}

function rowIdentity(e: any, currentFolder: string) {
  if (currentFolder === "sent") return e.to_addresses?.[0] || "Unknown";
  return e.from_name || e.from_address || "Unknown";
}

function formatShortDate(dateString: string) {
  const date = new Date(dateString);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${monthNames[date.getUTCMonth()]} ${day}, ${year} ${hours}:${minutes} UTC`;
}

export default function MailboxClient({
  initialEmails,
  currentFolder,
  currentUser,
}: {
  initialEmails: any[];
  currentFolder: string;
  currentUser: any;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [emails, setEmails] = useState(initialEmails);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [composing, setComposing] = useState(false);
  const [filterBox, setFilterBox] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");
  const [composeFiles, setComposeFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmails(initialEmails);
    setSelectedEmail(null);
  }, [initialEmails, currentFolder]);

  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const SHARED_INBOXES = ["contact@stateai.in", "support@stateai.in", "info@stateai.in"];
  const isSales = currentUser.role === "sales";
  const INBOXES = isSales && currentUser.assigned_mailbox
    ? [currentUser.assigned_mailbox]
    : SHARED_INBOXES;

  const ACCOUNT_OPTIONS = isSales && currentUser.assigned_mailbox
    ? [{ value: currentUser.assigned_mailbox, label: currentUser.assigned_mailbox, sub: "Your mailbox", initial: boxInitial(currentUser.assigned_mailbox) }]
    : [
        { value: "all", label: "All inboxes", sub: "Every shared mailbox", initial: "SA" },
        ...SHARED_INBOXES.map((b) => ({ value: b, label: b, sub: "Shared mailbox", initial: boxInitial(b) })),
      ];

  const FOLDERS = [
    { id: "inbox", label: "Inbox", icon: "📥" },
    { id: "sent", label: "Sent", icon: "↗️" },
    { id: "archived", label: "Archive", icon: "📦" },
    { id: "trash", label: "Trash", icon: "🗑️" },
  ];

  const accountFiltered = emails.filter((e) => {
    if (filterBox === "all") return true;
    return e.to_addresses.includes(filterBox) || e.from_address === filterBox;
  });

  const query = search.trim().toLowerCase();
  const displayedEmails = accountFiltered.filter((e) => {
    if (!query) return true;
    const hay = [e.from_address, e.from_name, e.subject, e.body_text, ...(e.to_addresses || [])].join(" ").toLowerCase();
    return hay.includes(query);
  });

  function handleSelect(email: any) {
    setSelectedEmail(email);
    setComposing(false);
    if (isMobile) setMobilePane("read");
    if (!email.read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
    }
    startTransition(async () => {
      const res = await getEmail(email.id);
      if (res.data) setSelectedEmail(res.data);
      if (!email.read) await markEmailRead(email.id);
    });
  }

  function handleArchive(emailId: string) {
    setEmails(prev => prev.filter(e => e.id !== emailId));
    setSelectedEmail(null);
    if (isMobile) setMobilePane("list");
    startTransition(async () => {
      await updateEmailStatus(emailId, "archived");
      showToast("Conversation archived", "success");
    });
  }

  function handleTrash(emailId: string) {
    setEmails(prev => prev.filter(e => e.id !== emailId));
    setSelectedEmail(null);
    if (isMobile) setMobilePane("list");
    startTransition(async () => {
      await updateEmailStatus(emailId, "trash");
      showToast("Conversation moved to trash", "success");
    });
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData();
    fd.set("to", (form.elements.namedItem("to") as HTMLInputElement).value);
    fd.set("subject", (form.elements.namedItem("subject") as HTMLInputElement).value);
    fd.set("body", (form.elements.namedItem("body") as HTMLTextAreaElement).value);
    fd.set("fromBox", (form.elements.namedItem("fromBox") as HTMLSelectElement).value);
    for (const f of composeFiles) fd.append("attachments", f);
    setComposeFiles([]);
    startTransition(async () => {
      const res = await sendEmail(fd);
      if (!res.success) {
        showToast(res.error || "Failed to send email", "error");
      } else {
        showToast("Email sent successfully", "success");
        setComposing(false);
        if (isMobile) setMobilePane("list");
      }
    });
  }

  function changeFolder(folder: string) {
    setSelectedEmail(null);
    setComposing(false);
    setAccountOpen(false);
    if (isMobile) setMobilePane("list");
    router.push(`/crm/mailbox?folder=${folder}`);
  }

  function openCompose() {
    setComposing(true);
    setSelectedEmail(null);
    setAccountOpen(false);
    setComposeFiles([]);
    if (isMobile) setMobilePane("compose");
  }

  const activeBoxLabel = ACCOUNT_OPTIONS.find((o) => o.value === filterBox)?.label || "Mailbox";
  const activeBoxInitial = ACCOUNT_OPTIONS.find((o) => o.value === filterBox)?.initial || "SA";

  const Header = (
    <div style={{ padding: isMobile ? "0.8rem 1rem" : "0.9rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.08)", background: "rgb(var(--crm-card-rgb) / 96%)", position: "relative", zIndex: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, flexWrap: "nowrap" }}>
        {/* Compose */}
        <button
          onClick={openCompose}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: isMobile ? "0.55rem" : "0.6rem 1.1rem", borderRadius: 999, background: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(139,92,246,0.85))", color: "var(--crm-on-accent)", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.25)", flexShrink: 0, minHeight: 40, whiteSpace: "nowrap" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
          {!isMobile && <span>Compose</span>}
        </button>

        {/* Folders */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto", scrollbarWidth: "none", flexShrink: 1 }}>
          {FOLDERS.map(f => {
            const active = currentFolder === f.id;
            return (
              <button key={f.id} onClick={() => changeFolder(f.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 0.8rem", borderRadius: 999, background: active ? "rgba(99,102,241,0.12)" : "transparent", color: active ? "#818cf8" : "var(--crm-muted)", border: "none", cursor: "pointer", fontWeight: active ? 700 : 600, fontSize: "0.8rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                <span>{f.icon}</span>
                {!isMobile && <span>{f.label}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        {!isMobile && (
          <div style={{ position: "relative", flex: "1 1 320px", maxWidth: 520, minWidth: 140 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crm-faint)" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search mail${currentFolder !== "inbox" ? ` in ${currentFolder}` : ""}…`}
              style={{ width: "calc(100% - 1px)", background: "var(--crm-raised)", border: "1px solid rgb(var(--crm-line) / 0.12)", borderRadius: 999, padding: "0.62rem 1rem 0.62rem 2.4rem", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgb(var(--crm-line) / 0.12)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        )}

        {/* Account switcher */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setAccountOpen(o => !o)}
            aria-label="Switch account"
            title={activeBoxLabel}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <span style={{ width: isMobile ? 34 : 38, height: isMobile ? 34 : 38, borderRadius: "50%", background: "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(139,92,246,0.8))", border: "2px solid rgb(var(--crm-card-rgb))", boxShadow: "0 2px 10px rgba(99,102,241,0.35)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.02em" }}>
              {activeBoxInitial}
            </span>
            {!isMobile && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--crm-muted)" strokeWidth="2" style={{ transform: accountOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9" /></svg>
            )}
          </button>

          {accountOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "transparent" }} onClick={() => setAccountOpen(false)} />
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: isMobile ? 300 : 340, background: "var(--crm-popover)", border: "1px solid rgb(var(--crm-line) / 0.14)", borderRadius: 16, boxShadow: "0 24px 50px -12px rgb(var(--crm-line) / 0.4), 0 4px 14px rgb(var(--crm-line) / 0.1)", padding: "0.75rem", zIndex: 60 }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--crm-faint)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0.4rem 0.6rem 0.6rem" }}>
                  {isSales ? "Your account" : "Switch account"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {ACCOUNT_OPTIONS.map(opt => {
                    const isActive = isSales ? opt.value === currentUser.assigned_mailbox : opt.value === filterBox;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setFilterBox(opt.value as any); setAccountOpen(false); setSelectedEmail(null); if (isMobile) setMobilePane("list"); }}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.65rem 0.6rem", borderRadius: 10, background: isActive ? "rgba(99,102,241,0.08)" : "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
                      >
                        <span style={{ width: 30, height: 30, borderRadius: "50%", background: isActive ? "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.8))" : "rgb(var(--crm-line) / 0.14)", color: isActive ? "#fff" : "var(--crm-text-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>
                          {opt.initial}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: "0.82rem", fontWeight: isActive ? 700 : 500, color: "var(--crm-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--crm-faint)", marginTop: 1 }}>{opt.sub}</span>
                        </span>
                        {isActive && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile search */}
      {isMobile && (
        <div style={{ position: "relative", marginTop: "0.7rem", marginBottom: "0.2rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crm-faint)" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search mail in ${currentFolder}…`}
            style={{ width: "100%", background: "var(--crm-raised)", border: "1px solid rgb(var(--crm-line) / 0.12)", borderRadius: 999, padding: "0.6rem 1rem 0.6rem 2.4rem", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>
      )}
    </div>
  );

  const ListPane = (
    <div style={{ width: isMobile ? "100%" : 380, minWidth: isMobile ? "100%" : 340, borderRight: isMobile ? "none" : "1px solid rgb(var(--crm-line) / 0.08)", background: "rgb(var(--crm-card-rgb) / 95%)", display: isMobile && mobilePane !== "list" ? "none" : "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "1.15rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--crm-text)", textTransform: "capitalize" }}>
            {currentFolder === "inbox" ? (filterBox === "all" ? "Inbox" : filterBox) : currentFolder}
          </h2>
          <div style={{ fontSize: "0.75rem", color: "var(--crm-faint)", marginTop: 4 }}>
            {query ? `${displayedEmails.length} result${displayedEmails.length === 1 ? "" : "s"}` : `${accountFiltered.length} message${accountFiltered.length === 1 ? "" : "s"}`}
          </div>
        </div>
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={openCompose} style={{ background: "rgba(99,102,241,0.12)", border: "none", color: "#818cf8", padding: "7px 12px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>✏️ Compose</button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {displayedEmails.length === 0 ? (
          <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--crm-faint)", fontSize: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            {query ? `No messages match "${search.trim()}"` : `Your ${currentFolder} is empty.`}
          </div>
        ) : (
          displayedEmails.map(e => {
            const who = rowIdentity(e, currentFolder);
            const isActive = selectedEmail?.id === e.id && !isMobile;
            return (
              <div key={e.id} onClick={() => handleSelect(e)}
                style={{ padding: "0.8rem 1.25rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.05)", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", background: isActive ? "rgba(99,102,241,0.08)" : (!e.read ? "rgb(var(--crm-overlay) / 0.02)" : "transparent"), transition: "background 0.2s" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#818cf8" }}>
                  {who[0]?.toUpperCase() || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: !e.read ? 700 : 500, color: !e.read ? "var(--crm-text)" : "var(--crm-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {who}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--crm-faint)", flexShrink: 0 }}>
                      {formatShortDate(e.created_at)}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: !e.read ? 600 : 400, color: !e.read ? "var(--crm-text-2)" : "var(--crm-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.subject || "No Subject"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--crm-faint)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.body_text || "No preview available..."}
                  </div>
                </div>
                {!e.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#818cf8", flexShrink: 0, marginTop: 7 }} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const ComposeReadPane = (
    <div style={{ flex: 1, minWidth: 0, background: "var(--crm-modal)", display: isMobile && mobilePane === "list" ? "none" : "flex", flexDirection: "column" }}>
      {composing ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: isMobile ? "0.8rem 1rem" : "1rem 1.5rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--crm-text)" }}>New Message</h2>
            <button onClick={() => { setComposing(false); if(isMobile) setMobilePane("list"); }} style={{ background: "none", border: "none", color: "var(--crm-faint)", cursor: "pointer", fontSize: "1.1rem", padding: 4 }}>✕</button>
          </div>
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "1rem" : "1.5rem 2rem" }}>
              <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgb(var(--crm-line) / 0.1)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                <label style={{ width: 60, fontSize: "0.8rem", color: "var(--crm-muted)", fontWeight: 600 }}>From:</label>
                <select name="fromBox" defaultValue={filterBox !== "all" ? filterBox : INBOXES[0]} style={{ flex: 1, background: "transparent", border: "none", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}>
                  {INBOXES.map(box => <option key={box} value={box} style={{ background: "var(--crm-modal)", color: "var(--crm-text)" }}>{box}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgb(var(--crm-line) / 0.1)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                <label style={{ width: 60, fontSize: "0.8rem", color: "var(--crm-muted)", fontWeight: 600 }}>To:</label>
                <input name="to" type="email" defaultValue={selectedEmail ? (currentFolder === "sent" ? selectedEmail.to_addresses[0] : selectedEmail.from_address) : ""} required placeholder="recipient@example.com" style={{ flex: 1, background: "transparent", border: "none", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgb(var(--crm-line) / 0.1)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                <label style={{ width: 60, fontSize: "0.8rem", color: "var(--crm-muted)", fontWeight: 600 }}>Subject:</label>
                <input name="subject" defaultValue={selectedEmail ? (selectedEmail.subject?.startsWith("Re:") ? selectedEmail.subject : `Re: ${selectedEmail.subject || ""}`) : ""} required placeholder="Message subject" style={{ flex: 1, background: "transparent", border: "none", color: "var(--crm-text)", fontSize: "0.85rem", outline: "none" }} />
              </div>
              <textarea name="body" defaultValue={selectedEmail ? `\n\n\n--- Original Message ---\nFrom: ${selectedEmail.from_address}\nDate: ${formatDateTime(selectedEmail.created_at)}\nSubject: ${selectedEmail.subject || "No Subject"}\n\n${selectedEmail.body_text || ""}` : ""} required rows={isMobile ? 10 : 14} placeholder="Write your message here..." style={{ width: "100%", background: "rgb(var(--crm-overlay) / 0.02)", border: "1px solid rgb(var(--crm-line) / 0.1)", borderRadius: 12, padding: "1rem", color: "var(--crm-text)", fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box", minHeight: 200 }} />
              {composeFiles.length > 0 && (
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                  {composeFiles.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgb(var(--crm-overlay) / 0.04)", border: "1px solid rgb(var(--crm-line) / 0.08)", fontSize: "0.8rem", color: "var(--crm-text)" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(99,102,241,0.12)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      </div>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{f.name}</span>
                      <span style={{ color: "var(--crm-faint)", fontSize: "0.75rem", flexShrink: 0 }}>{(f.size / 1024).toFixed(1)} KB</span>
                      <button type="button" onClick={() => setComposeFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "3px 7px", color: "#ef4444", cursor: "pointer", fontSize: "0.7rem", lineHeight: 1, flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: "1rem" }}>
                <input ref={fileInputRef} type="file" multiple onChange={(e) => { const files = e.target.files; if (files && files.length > 0) { const filesArray = Array.from(files); setComposeFiles(prev => [...prev, ...filesArray]); } setTimeout(() => { e.target.value = ""; }, 0); }} style={{ display: "none" }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "rgb(var(--crm-overlay) / 0.04)", border: "1px dashed rgb(var(--crm-line) / 0.15)", color: "var(--crm-muted)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                  Attach files
                </button>
              </div>
            </div>
            <div style={{ padding: isMobile ? "1rem" : "1rem 2rem", borderTop: "1px solid rgb(var(--crm-line) / 0.08)", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0, background: "rgb(var(--crm-card-rgb) / 60%)", backdropFilter: "blur(8px)" }}>
              <button type="button" onClick={() => { setComposing(false); if(isMobile) setMobilePane("list"); }} style={{ padding: "0.6rem 1.25rem", borderRadius: 8, background: "transparent", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-muted)", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>Discard</button>
              <button type="submit" disabled={isPending} style={{ padding: "0.6rem 1.75rem", borderRadius: 8, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "none", color: "var(--crm-on-accent)", cursor: isPending ? "not-allowed" : "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                {isPending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </form>
        </div>
      ) : selectedEmail ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: isMobile ? "1rem" : "1.5rem 2rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.08)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {isMobile && (
              <button onClick={() => setMobilePane("list")} style={{ background: "none", border: "none", color: "var(--crm-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, padding: 0, alignSelf: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                Back to List
              </button>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", gap: 12, minWidth: 0, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color: "#818cf8", flexShrink: 0 }}>
                  {(selectedEmail.from_name || selectedEmail.from_address || "?")[0]?.toUpperCase() || "?"}
                </div>
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--crm-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedEmail.from_name || selectedEmail.from_address || "Unknown"}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--crm-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>to {(selectedEmail.to_addresses || []).join(", ")}</div>
                </div>
              </div>
              <div style={{ flex: "1 1 40%", minWidth: 0, display: "flex", justifyContent: isMobile ? "flex-start" : "center", alignItems: "center" }}>
                <h2 style={{ fontSize: isMobile ? "1.08rem" : "1.26rem", fontWeight: 700, margin: 0, color: "var(--crm-text)", wordBreak: "break-word", textAlign: isMobile ? "left" : "center" }}>{selectedEmail.subject || "No Subject"}</h2>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "flex-end", minWidth: 0 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--crm-faint)" }}>
                  {formatDateTime(selectedEmail.created_at)}
                </span>
                {currentFolder !== "archived" && currentFolder !== "trash" && (
                  <button onClick={() => handleArchive(selectedEmail.id)} style={{ background: "rgb(var(--crm-overlay) / 0.05)", border: "1px solid rgb(var(--crm-line) / 0.12)", borderRadius: 8, padding: "6px 12px", color: "var(--crm-text)", fontSize: "0.75rem", cursor: "pointer" }}>
                    Archive
                  </button>
                )}
                {currentFolder !== "trash" && (
                  <button onClick={() => handleTrash(selectedEmail.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "6px 12px", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: isMobile ? "1rem" : "2rem", overflowY: "auto", fontSize: "0.9rem", color: "var(--crm-text-2)", lineHeight: 1.6 }}>
            <div style={{ background: "rgb(var(--crm-card-rgb) / 0.85)", border: "1px solid rgb(var(--crm-line) / 0.12)", borderRadius: 24, padding: isMobile ? "1rem" : "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {selectedEmail.body_html ? (
                <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} style={{ maxWidth: "100%", overflowX: "auto" }} />
              ) : (
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedEmail.body_text}</div>
              )}

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div style={{ borderTop: "1px dashed rgb(var(--crm-line) / 0.15)", paddingTop: "0.85rem" }}>
                  <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--crm-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.65rem" }}>
                    Attachments ({selectedEmail.attachments.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    {selectedEmail.attachments.map((att: any, idx: number) => (
                      <a key={idx} href={att.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "7px 9px", borderRadius: "7px", background: "rgb(var(--crm-overlay) / 0.03)", border: "1px solid rgb(var(--crm-line) / 0.08)", textDecoration: "none", color: "var(--crm-text)", width: "100%", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgb(var(--crm-overlay) / 0.06)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgb(var(--crm-overlay) / 0.03)"}>
                        <div style={{ width: 25, height: 25, borderRadius: 6, background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.filename || "Attachment"}</span>
                          <span style={{ fontSize: "0.65rem", color: "var(--crm-muted)", marginTop: 1 }}>{(att.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid rgb(var(--crm-line) / 0.08)" }}>
            <button onClick={openCompose} style={{ padding: "0.375rem 0.75rem", borderRadius: 5, background: "rgb(var(--crm-overlay) / 0.05)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-text)", cursor: "pointer", fontWeight: 600 }}>
              Reply
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--crm-faint)", flexDirection: "column", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          <div style={{ fontSize: "1.05rem" }}>Select an email to read</div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--crm-bg)" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}

      {Header}
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
        {ListPane}
        {ComposeReadPane}
      </div>
    </div>
  );
}