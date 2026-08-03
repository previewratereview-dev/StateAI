"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Task, TaskPriority, TaskStatus } from "@/app/actions/tasks";
import { createTask, updateTask, deleteTask } from "@/app/actions/tasks";
import { useIsMobile } from "@/lib/useIsMobile";

const PRIORITY_CFG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  high: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  medium: { label: "Medium", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  low: { label: "Low", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

const STATUS_CFG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  in_progress: { label: "In Progress", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  done: { label: "Done", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
};

function formatDueDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const isOverdue = d < new Date();
  const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return { formatted, isOverdue };
}

function TaskRow({
  task, isAdmin, isMobile, onStatusChange, onDelete,
}: {
  task: any; isAdmin: boolean; isMobile: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pCfg = PRIORITY_CFG[task.priority as TaskPriority] || { label: task.priority, color: "var(--crm-muted)", bg: "transparent" };
  const sCfg = STATUS_CFG[task.status as TaskStatus] || { label: task.status, color: "var(--crm-muted)", bg: "transparent" };
  const due = formatDueDate(task.due_date);

  const innerContent = (
    <>
      {/* Priority dot (Desktop) or Mobile Checkbox */}
      {!isMobile ? (
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: pCfg.color, boxShadow: `0 0 6px ${pCfg.color}70`, flexShrink: 0 }} />
      ) : (
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: pCfg.color, boxShadow: `0 0 6px ${pCfg.color}70`, flexShrink: 0, marginTop: 6 }} />
      )}

      {/* Title */}
      <div style={{ flex: isMobile ? 1 : "unset" }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: task.status === "done" ? "var(--crm-faint)" : "var(--crm-text)", textDecoration: task.status === "done" ? "line-through" : "none" }}>
          {task.title}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--crm-faint)", marginTop: 2 }}>
          {task.contacts && `👤 ${task.contacts.first_name} ${task.contacts.last_name}`}
          {task.deals && ` · 💼 ${task.deals.title}`}
        </div>
        
        {/* Mobile: inline badges */}
        {isMobile && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 600, color: sCfg.color, background: sCfg.bg }}>
              {sCfg.label}
            </span>
            <div style={{ fontSize: "0.72rem", color: due?.isOverdue ? "#ef4444" : "var(--crm-faint)" }}>
              {due ? (due.isOverdue ? "⚠️ " : "📅 ") + due.formatted : "—"}
            </div>
          </div>
        )}
      </div>

      {!isMobile && (
        <>
          {/* Priority badge */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 600, color: pCfg.color, background: pCfg.bg, border: `1px solid ${pCfg.color}30`, width: "fit-content" }}>
            {pCfg.label}
          </span>

          {/* Status badge */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 600, color: sCfg.color, background: sCfg.bg, border: `1px solid ${sCfg.color}30`, width: "fit-content" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: sCfg.color }} />{sCfg.label}
          </span>

          {/* Due date */}
          <div style={{ fontSize: "0.78rem", color: due?.isOverdue ? "#ef4444" : "var(--crm-faint)" }}>
            {due ? (due.isOverdue ? "⚠️ " : "📅 ") + due.formatted : "—"}
          </div>
        </>
      )}

      {/* Chevron */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crm-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </>
  );

  return (
    <div style={{ borderBottom: "1px solid rgb(var(--crm-line) / 0.04)", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgb(var(--crm-overlay) / 0.015)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
      <div
        style={isMobile ? { display: "flex", gap: "0.75rem", padding: "1rem", alignItems: "flex-start", cursor: "pointer" } : { display: "grid", gridTemplateColumns: "20px 2fr 1fr 1fr 1.2fr auto", gap: "0.875rem", padding: "0.875rem 1.25rem", alignItems: "center", cursor: "pointer" }}
        onClick={() => setExpanded(x => !x)}
      >
        {innerContent}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: isMobile ? "0 1rem 1rem 2.25rem" : "0 1.25rem 1.25rem 3.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {task.description && (
            <div style={{ fontSize: "0.85rem", color: "var(--crm-muted)", background: "rgb(var(--crm-overlay) / 0.03)", padding: "0.75rem", borderRadius: 10, border: "1px solid rgb(var(--crm-line) / 0.06)", lineHeight: 1.6 }}>
              {task.description}
            </div>
          )}
          {/* Status controls */}
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--crm-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>Update Status</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["open", "in_progress", "done"] as TaskStatus[]).map(s => {
                const c = STATUS_CFG[s];
                const isActive = task.status === s;
                return (
                  <button key={s} onClick={e => { e.stopPropagation(); onStatusChange(task.id, s); }}
                    disabled={isActive}
                    style={{ padding: "5px 14px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, border: `1px solid ${isActive ? c.color + "50" : "rgb(var(--crm-line) / 0.12)"}`, background: isActive ? c.bg : "transparent", color: isActive ? c.color : "var(--crm-muted)", cursor: isActive ? "default" : "pointer", fontFamily: "inherit" }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Delete */}
          {isAdmin && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}
                style={{ padding: "4px 14px", borderRadius: 8, fontSize: "0.75rem", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.6)", cursor: "pointer", fontFamily: "inherit" }}>
                Delete Task
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddTaskDrawer({ contacts, deals, onClose, onSaved }: { contacts: any[]; deals: any[]; onClose: () => void; onSaved: (t: Task) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const inputStyle: React.CSSProperties = { width: "100%", background: "rgb(var(--crm-overlay) / 0.04)", border: "1px solid rgb(var(--crm-line) / 0.12)", borderRadius: 10, padding: "0.65rem 0.875rem", color: "var(--crm-text)", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--crm-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTask(fd);
      if (res.error) { setError(res.error); return; }
      onSaved(res.data!);
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{
        width: isMobile ? "100%" : 460, background: "var(--crm-modal)", borderLeft: "1px solid rgb(var(--crm-line) / 0.1)",
        height: "100%", overflowY: "auto", padding: "1.75rem",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      }} className="crm-drawer-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--crm-text)", margin: 0 }}>New Task</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--crm-faint)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}><label style={labelStyle}>Title *</label><input name="title" required style={inputStyle} /></div>
          <div style={{ marginBottom: "1rem" }}><label style={labelStyle}>Description</label><textarea name="description" rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div><label style={labelStyle}>Priority</label>
              <select name="priority" style={{ ...inputStyle, cursor: "pointer" }}>
                {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Due Date</label><input name="due_date" type="datetime-local" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Link to Contact</label>
            <select name="contact_id" style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">— None —</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Link to Deal</label>
            <select name="deal_id" style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">— None —</option>
              {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: "1rem", background: "rgba(239,68,68,0.08)", padding: "0.6rem 0.75rem", borderRadius: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.7rem", borderRadius: 10, background: "rgb(var(--crm-overlay) / 0.05)", border: "1px solid rgb(var(--crm-line) / 0.12)", color: "var(--crm-muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={isPending} style={{ flex: 2, padding: "0.7rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "none", color: "var(--crm-on-accent)", cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700 }}>{isPending ? "Creating…" : "Create Task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksBoard({ initialTasks, contacts, deals, isAdmin }: { initialTasks: any[]; contacts: any[]; deals: any[]; isAdmin: boolean }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState(initialTasks);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  const filtered = useMemo(() => tasks.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  }), [tasks, statusFilter, priorityFilter]);

  const overdue = tasks.filter(t => t.status !== "done" && t.due_date && new Date(t.due_date) < new Date()).length;
  const open = tasks.filter(t => t.status === "open").length;
  const done = tasks.filter(t => t.status === "done").length;

  function handleStatusChange(id: string, status: TaskStatus) {
    const previous = [...tasks];
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    startTransition(async () => {
      const res = await updateTask(id, { status });
      if (!res.success) { setTasks(previous); showToast("Failed", "error"); }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete task?")) return;
    const previous = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    startTransition(async () => {
      const res = await deleteTask(id);
      if (!res.success) { setTasks(previous); showToast("Failed", "error"); }
    });
  }

  return (
    <div style={{ padding: isMobile ? "1rem" : "2rem", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}
      {showAdd && <AddTaskDrawer contacts={contacts} deals={deals} onClose={() => setShowAdd(false)} onSaved={t => { setTasks(p => [t, ...p]); setShowAdd(false); showToast("Task created!", "success"); }} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "var(--crm-text)", margin: 0, letterSpacing: "-0.03em" }}>Tasks</h1>
          <div style={{ display: "flex", gap: 16, marginTop: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--crm-faint)" }}>{open} open</span>
            <span style={{ fontSize: "0.82rem", color: "#10b981" }}>{done} done</span>
            {overdue > 0 && <span style={{ fontSize: "0.82rem", color: "#ef4444" }}>⚠️ {overdue} overdue</span>}
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.65rem 1.25rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "1px solid rgba(99,102,241,0.4)", color: "var(--crm-on-accent)", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(99,102,241,0.2)", minHeight: 44 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Task
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "open", "in_progress", "done"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s as TaskStatus | "all")}
              style={{ padding: "0.5rem 0.875rem", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: statusFilter === s ? "1px solid rgb(var(--crm-line) / 0.3)" : "1px solid transparent", background: statusFilter === s ? "rgb(var(--crm-line) / 0.08)" : "transparent", color: statusFilter === s ? "var(--crm-text)" : "var(--crm-faint)" }}>
              {s === "all" ? "All" : STATUS_CFG[s as TaskStatus].label}
            </button>
          ))}
        </div>
        {!isMobile && <div style={{ width: 1, background: "rgb(var(--crm-line) / 0.1)" }} />}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "urgent", "high", "medium", "low"] as const).map(p => {
            const cfg = p !== "all" ? PRIORITY_CFG[p as TaskPriority] : null;
            return (
              <button key={p} onClick={() => setPriorityFilter(p as TaskPriority | "all")}
                style={{ padding: "0.5rem 0.875rem", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: priorityFilter === p ? `1px solid ${cfg ? cfg.color + "40" : "rgb(var(--crm-line) / 0.3)"}` : "1px solid transparent", background: priorityFilter === p ? (cfg ? cfg.bg : "rgb(var(--crm-line) / 0.08)") : "transparent", color: priorityFilter === p ? (cfg ? cfg.color : "var(--crm-text)") : "var(--crm-faint)" }}>
                {p === "all" ? "All priorities" : PRIORITY_CFG[p as TaskPriority].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table header */}
      <div style={{ background: "rgb(var(--crm-card-rgb) / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgb(var(--crm-line) / 0.08)", borderRadius: 16, overflow: "hidden" }}>
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "20px 2fr 1fr 1fr 1.2fr auto", gap: "0.875rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid rgb(var(--crm-line) / 0.06)", background: "rgb(var(--crm-overlay) / 0.02)" }}>
            {["", "Task", "Priority", "Status", "Due Date", ""].map((h, i) => <div key={i} style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--crm-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>)}
          </div>
        )}
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--crm-faint)" }}><div style={{ fontSize: "2rem", marginBottom: 8 }}>✅</div>No tasks. Create one!</div>
        ) : (
          filtered.map(task => (
            <TaskRow key={task.id} task={task} isAdmin={isAdmin} isMobile={isMobile} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
