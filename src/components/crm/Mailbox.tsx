"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendEmail, updateEmailStatus, markEmailRead } from "@/app/actions/emails";
import { useIsMobile } from "@/lib/useIsMobile";

type MobilePane = "folders" | "list" | "read" | "compose";

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
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");
  
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
  const INBOXES = currentUser.role === "sales" && currentUser.assigned_mailbox
    ? [currentUser.assigned_mailbox]
    : SHARED_INBOXES;

  const displayedEmails = emails.filter((e) => {
    if (filterBox === "all") return true;
    return e.to_addresses.includes(filterBox) || e.from_address === filterBox;
  });

  function handleSelect(email: any) {
    setSelectedEmail(email);
    setComposing(false);
    if (isMobile) setMobilePane("read");
    if (!email.read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
      startTransition(async () => {
        await markEmailRead(email.id);
      });
    }
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
    const fd = new FormData(e.currentTarget);
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
    if (isMobile) setMobilePane("list");
    router.push(`/crm/mailbox?folder=${folder}`);
  }

  const FoldersPane = (
    <div style={{ width: isMobile ? "100%" : 240, borderRight: isMobile ? "none" : "1px solid rgba(177,178,180,0.08)", background: "rgba(13,13,18,0.5)", padding: "1.5rem 1rem", display: isMobile && mobilePane !== "folders" ? "none" : "flex", flexDirection: "column" }}>
      {isMobile && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <button onClick={() => setMobilePane("list")} style={{ background: "none", border: "none", color: "#fcfcfe", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
        </div>
      )}
      <button 
        onClick={() => { setComposing(true); setSelectedEmail(null); if(isMobile) setMobilePane("compose"); }}
        style={{ width: "100%", padding: "0.85rem", borderRadius: 12, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", color: "#fcfcfe", fontWeight: 700, border: "none", cursor: "pointer", marginBottom: "2rem", boxShadow: "0 4px 12px rgba(99,102,241,0.2)", minHeight: 44 }}
      >
        Compose Email
      </button>

      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, paddingLeft: 8 }}>Folders</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: "2rem" }}>
        {[
          { id: "inbox", label: "Inbox", icon: "📥" },
          { id: "sent", label: "Sent", icon: "↗️" },
          { id: "archived", label: "Archive", icon: "📦" },
          { id: "trash", label: "Trash", icon: "🗑️" }
        ].map(f => (
          <button key={f.id} onClick={() => changeFolder(f.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.8rem", borderRadius: 8, background: currentFolder === f.id ? "rgba(99,102,241,0.1)" : "transparent", color: currentFolder === f.id ? "#818cf8" : "#818286", border: "none", cursor: "pointer", textAlign: "left", fontWeight: currentFolder === f.id ? 600 : 500, minHeight: 40 }}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12, paddingLeft: 8 }}>Inboxes</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <button onClick={() => setFilterBox("all")}
          style={{ padding: "0.5rem 0.8rem", borderRadius: 8, background: filterBox === "all" ? "rgba(177,178,180,0.1)" : "transparent", color: filterBox === "all" ? "#fcfcfe" : "#5d5e60", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.82rem", minHeight: 40 }}
        >All Inboxes</button>
        {INBOXES.map(box => (
          <button key={box} onClick={() => setFilterBox(box)}
            style={{ padding: "0.5rem 0.8rem", borderRadius: 8, background: filterBox === box ? "rgba(177,178,180,0.1)" : "transparent", color: filterBox === box ? "#fcfcfe" : "#5d5e60", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.82rem", minHeight: 40 }}
          >{box}</button>
        ))}
      </div>
    </div>
  );

  const ListPane = (
    <div style={{ width: isMobile ? "100%" : 350, borderRight: isMobile ? "none" : "1px solid rgba(177,178,180,0.08)", background: "rgba(13,13,18,0.3)", display: isMobile && mobilePane !== "list" ? "none" : "flex", flexDirection: "column" }}>
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(177,178,180,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#fcfcfe", textTransform: "capitalize" }}>{currentFolder}</h2>
          <div style={{ fontSize: "0.75rem", color: "#5d5e60", marginTop: 4 }}>{displayedEmails.length} messages</div>
        </div>
        {isMobile && (
          <button onClick={() => setMobilePane("folders")} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(177,178,180,0.12)", color: "#fcfcfe", padding: "6px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600 }}>
            Folders
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {displayedEmails.length === 0 ? (
          <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#5d5e60", fontSize: "0.85rem" }}>No emails found.</div>
        ) : (
          displayedEmails.map(e => (
            <div key={e.id} onClick={() => handleSelect(e)}
              style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(177,178,180,0.04)", cursor: "pointer", background: selectedEmail?.id === e.id && !isMobile ? "rgba(99,102,241,0.08)" : (!e.read ? "rgba(255,255,255,0.02)" : "transparent"), transition: "background 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: !e.read ? 700 : 500, color: !e.read ? "#fcfcfe" : "#818286", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentFolder === "sent" ? (e.to_addresses?.[0] || "Unknown") : (e.from_name || e.from_address || "Unknown")}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#5d5e60", flexShrink: 0 }}>
                  {new Date(e.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: !e.read ? 600 : 400, color: !e.read ? "#d1d5db" : "#818286", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.subject || "No Subject"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#5d5e60", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.body_text || "No preview available..."}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const ComposeReadPane = (
    <div style={{ flex: 1, background: "#0d0d12", display: isMobile && (mobilePane === "folders" || mobilePane === "list") ? "none" : "flex", flexDirection: "column" }}>
      {composing ? (
        <div style={{ padding: isMobile ? "1rem" : "2rem", maxWidth: 800, width: "100%", margin: isMobile ? "0" : "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#fcfcfe" }}>New Message</h2>
            <button onClick={() => { setComposing(false); if(isMobile) setMobilePane("list"); }} style={{ background: "none", border: "none", color: "#5d5e60", cursor: "pointer", fontSize: "1.2rem", padding: 8 }}>✕</button>
          </div>
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(177,178,180,0.1)", paddingBottom: "0.5rem" }}>
              <label style={{ width: 60, fontSize: "0.8rem", color: "#818286", fontWeight: 600 }}>From:</label>
              <select name="fromBox" style={{ flex: 1, background: "transparent", border: "none", color: "#fcfcfe", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}>
                {INBOXES.map(box => <option key={box} value={box} style={{ background: "#0d0d12" }}>{box}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(177,178,180,0.1)", paddingBottom: "0.5rem" }}>
              <label style={{ width: 60, fontSize: "0.8rem", color: "#818286", fontWeight: 600 }}>To:</label>
              <input name="to" type="email" defaultValue={selectedEmail ? (currentFolder === "sent" ? selectedEmail.to_addresses[0] : selectedEmail.from_address) : ""} required placeholder="recipient@example.com" style={{ flex: 1, background: "transparent", border: "none", color: "#fcfcfe", fontSize: "0.85rem", outline: "none" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(177,178,180,0.1)", paddingBottom: "0.5rem" }}>
              <label style={{ width: 60, fontSize: "0.8rem", color: "#818286", fontWeight: 600 }}>Subject:</label>
              <input name="subject" defaultValue={selectedEmail ? (selectedEmail.subject?.startsWith("Re:") ? selectedEmail.subject : `Re: ${selectedEmail.subject || ""}`) : ""} required placeholder="Message subject" style={{ flex: 1, background: "transparent", border: "none", color: "#fcfcfe", fontSize: "0.85rem", outline: "none" }} />
            </div>
            <div style={{ marginTop: "1rem", flex: 1 }}>
              <textarea name="body" defaultValue={selectedEmail ? `\n\n\n--- Original Message ---\nFrom: ${selectedEmail.from_address}\nDate: ${new Date(selectedEmail.created_at).toLocaleString()}\nSubject: ${selectedEmail.subject || "No Subject"}\n\n${selectedEmail.body_text || ""}` : ""} required rows={isMobile ? 10 : 16} placeholder="Write your message here..." style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(177,178,180,0.1)", borderRadius: 12, padding: "1rem", color: "#fcfcfe", fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" onClick={() => { setComposing(false); if(isMobile) setMobilePane("list"); }} style={{ padding: "0.75rem 1.5rem", borderRadius: 10, background: "transparent", border: "1px solid rgba(177,178,180,0.12)", color: "#818286", cursor: "pointer", fontWeight: 600 }}>Discard</button>
              <button type="submit" disabled={isPending} style={{ padding: "0.75rem 2rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "none", color: "#fcfcfe", cursor: isPending ? "not-allowed" : "pointer", fontWeight: 700 }}>
                {isPending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </form>
        </div>
      ) : selectedEmail ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: isMobile ? "1rem" : "1.5rem 2rem", borderBottom: "1px solid rgba(177,178,180,0.08)", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {isMobile && (
              <button onClick={() => setMobilePane("list")} style={{ background: "none", border: "none", color: "#818286", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", fontWeight: 600, padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                Back to List
              </button>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.4rem", fontWeight: 700, margin: "0 0 1rem", color: "#fcfcfe", wordBreak: "break-word" }}>{selectedEmail.subject || "No Subject"}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color: "#818cf8", flexShrink: 0 }}>
                    {(selectedEmail.from_name || selectedEmail.from_address || "?")[0]?.toUpperCase() || "?"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fcfcfe", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedEmail.from_name || selectedEmail.from_address || "Unknown"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#5d5e60", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>to {(selectedEmail.to_addresses || []).join(", ")}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: "0.8rem", color: "#5d5e60" }}>
                  {new Date(selectedEmail.created_at).toLocaleString()}
                </span>
                {currentFolder !== "archived" && currentFolder !== "trash" && (
                  <button onClick={() => handleArchive(selectedEmail.id)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(177,178,180,0.12)", borderRadius: 8, padding: "6px 12px", color: "#fcfcfe", fontSize: "0.75rem", cursor: "pointer" }}>
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
          <div style={{ flex: 1, padding: isMobile ? "1rem" : "2rem", overflowY: "auto", fontSize: "0.9rem", color: "#d1d5db", lineHeight: 1.6 }}>
            {selectedEmail.body_html ? (
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} style={{ maxWidth: "100%", overflowX: "auto" }} />
            ) : (
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedEmail.body_text}</div>
            )}

            {/* Attachments Section */}
            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
              <div style={{ marginTop: "2rem", borderTop: "1px dashed rgba(177,178,180,0.15)", paddingTop: "1.5rem" }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#818286", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                  Attachments ({selectedEmail.attachments.length})
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                  {selectedEmail.attachments.map((att: any, idx: number) => (
                    <a key={idx} href={att.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(177,178,180,0.08)", textDecoration: "none", color: "#fcfcfe", width: "fit-content", transition: "background 0.2s", maxWidth: "100%" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.filename || "Attachment"}</span>
                        <span style={{ fontSize: "0.7rem", color: "#818286", marginTop: 2 }}>{(att.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid rgba(177,178,180,0.08)" }}>
            <button onClick={() => {
              setComposing(true);
              if(isMobile) setMobilePane("compose");
            }} style={{ padding: "0.75rem 1.5rem", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(177,178,180,0.12)", color: "#fcfcfe", cursor: "pointer", fontWeight: 600 }}>
              Reply
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#3d3e40", flexDirection: "column", gap: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          <div style={{ fontSize: "1.1rem" }}>Select an email to read</div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100%", minHeight: "100vh", overflow: "hidden", background: "#08080c" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}

      {FoldersPane}
      {ListPane}
      {ComposeReadPane}
    </div>
  );
}
