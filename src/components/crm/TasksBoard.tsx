"use client";

import { useState, useTransition, useMemo } from "react";
import type { Task, TaskStatus, TaskPriority } from "@/app/actions/tasks";
import { createTask, updateTaskStatus, deleteTask } from "@/app/actions/tasks";

const PRIORITY_CFG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  high: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  medium: { label: "Medium", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  low: { label: "Low", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

const STATUS_CFG: Record<TaskStatus, { label: string; color: string }> = {
  open: { label: "Open", color: "#f59e0b" },
  in_progress: { label: "In Progress", color: "#3b82f6" },
  done: { label: "Done", color: "#10b981" },
};

function formatDueDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const isOverdue = d < new Date() ;
  const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return { formatted, isOverdue };
}

function TaskRow({
  task, isAdmin, onStatusChange, onDelete,
}: {
  task: Task; isAdmin: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pCfg = PRIORITY_CFG[task.priority];
  const sCfg = STATUS_CFG[task.status];
  const due = formatDueDate(task.due_date);

  return (
    <div style={{ borderBottom: "1px solid rgba(177,178,180,0.04)", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.015)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
      <div
        style={{ display: "grid", gridTemplateColumns: "20px 2fr 1fr 1fr 1.2fr auto", gap: "0.875rem", padding: "0.875rem 1.25rem", alignItems: "center", cursor: "pointer" }}
        onClick={() => setExpanded(x => !x)}
      >
        {/* Priority dot */}
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: pCfg.color, boxShadow: `0 0 6px ${pCfg.color}70`, flexShrink: 0 }} />

        {/* Title */}
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: task.status === "done" ? "#5d5e60" : "#fcfcfe", textDecoration: task.status === "done" ? "line-through" : "none" }}>
            {task.title}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#3d3e40", marginTop: 2 }}>
            {task.contacts && `👤 ${task.contacts.first_name} ${task.contacts.last_name}`}
            {task.deals && ` · 💼 ${task.deals.title}`}
          </div>
        </div>

        {/* Priority badge */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 600, color: pCfg.color, background: pCfg.bg, border: `1px solid ${pCfg.color}30`, width: "fit-content" }}>
          {pCfg.label}
        </span>

        {/* Status badge */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 600, color: sCfg.color, background: `${sCfg.color}15`, border: `1px solid ${sCfg.color}30`, width: "fit-content" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: sCfg.color }} />{sCfg.label}
        </span>

        {/* Due date */}
        <div style={{ fontSize: "0.78rem", color: due?.isOverdue ? "#ef4444" : "#5d5e60" }}>
          {due ? (due.isOverdue ? "⚠️ " : "📅 ") + due.formatted : "—"}
        </div>

        {/* Chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5d5e60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 1.25rem 1.25rem 3.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {task.description && (
            <div style={{ fontSize: "0.85rem", color: "#818286", background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: 10, border: "1px solid rgba(177,178,180,0.06)", lineHeight: 1.6 }}>
              {task.description}
            </div>
          )}
          {/* Status controls */}
          <div>
            <div style={{ fontSize: "0.7rem", color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>Update Status</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["open", "in_progress", "done"] as TaskStatus[]).map(s => {
                const c = STATUS_CFG[s];
                const isActive = task.status === s;
                return (
                  <button key={s} onClick={e => { e.stopPropagation(); onStatusChange(task.id, s); }}
                    disabled={isActive}
                    style={{ padding: "5px 14px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600, border: `1px solid ${isActive ? c.color + "50" : "rgba(177,178,180,0.12)"}`, background: isActive ? `${c.color}15` : "transparent", color: isActive ? c.color : "#818286", cursor: isActive ? "default" : "pointer", fontFamily: "inherit" }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Delete */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}
              style={{ padding: "4px 14px", borderRadius: 8, fontSize: "0.75rem", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.6)", cursor: "pointer", fontFamily: "inherit" }}>
              Delete Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddTaskDrawer({ contacts, deals, onClose, onSaved }: { contacts: any[]; deals: any[]; onClose: () => void; onSaved: (t: Task) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(177,178,180,0.12)", borderRadius: 10, padding: "0.65rem 0.875rem", color: "#fcfcfe", fontSize: "0.875rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#818286", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" };

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
      <div style={{ width: 440, background: "#0d0d12", borderLeft: "1px solid rgba(177,178,180,0.1)", height: "100%", overflowY: "auto", padding: "1.75rem", boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fcfcfe", margin: 0 }}>New Task</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5d5e60", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
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
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.7rem", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(177,178,180,0.12)", color: "#818286", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={isPending} style={{ flex: 2, padding: "0.7rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "none", color: "#fcfcfe", cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700 }}>{isPending ? "Creating…" : "Create Task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksBoard({ initialTasks, contacts, deals, isAdmin }: { initialTasks: Task[]; contacts: any[]; deals: any[]; isAdmin: boolean }) {
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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    startTransition(async () => {
      const res = await updateTaskStatus(id, status);
      if (!res.success) { setTasks(initialTasks); showToast(res.error || "Failed", "error"); }
      else showToast("Task updated", "success");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    startTransition(async () => {
      const res = await deleteTask(id);
      if (!res.success) { setTasks(initialTasks); showToast(res.error || "Failed", "error"); }
    });
  }

  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#10b981" : "#ef4444", padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(20px)" }}>{toast.msg}</div>}
      {showAdd && <AddTaskDrawer contacts={contacts} deals={deals} onClose={() => setShowAdd(false)} onSaved={t => { setTasks(p => [t, ...p]); setShowAdd(false); showToast("Task created!", "success"); }} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fcfcfe", margin: 0, letterSpacing: "-0.03em" }}>Tasks</h1>
          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
            <span style={{ fontSize: "0.82rem", color: "#5d5e60" }}>{open} open</span>
            <span style={{ fontSize: "0.82rem", color: "#10b981" }}>{done} done</span>
            {overdue > 0 && <span style={{ fontSize: "0.82rem", color: "#ef4444" }}>⚠️ {overdue} overdue</span>}
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.65rem 1.25rem", borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))", border: "1px solid rgba(99,102,241,0.4)", color: "#fcfcfe", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(99,102,241,0.2)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "open", "in_progress", "done"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s as TaskStatus | "all")}
              style={{ padding: "0.5rem 0.875rem", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: statusFilter === s ? "1px solid rgba(177,178,180,0.3)" : "1px solid transparent", background: statusFilter === s ? "rgba(177,178,180,0.08)" : "transparent", color: statusFilter === s ? "#fcfcfe" : "#5d5e60" }}>
              {s === "all" ? "All" : STATUS_CFG[s as TaskStatus].label}
            </button>
          ))}
        </div>
        <div style={{ width: 1, background: "rgba(177,178,180,0.1)" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "urgent", "high", "medium", "low"] as const).map(p => {
            const cfg = p !== "all" ? PRIORITY_CFG[p as TaskPriority] : null;
            return (
              <button key={p} onClick={() => setPriorityFilter(p as TaskPriority | "all")}
                style={{ padding: "0.5rem 0.875rem", borderRadius: 8, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: priorityFilter === p ? `1px solid ${cfg ? cfg.color + "40" : "rgba(177,178,180,0.3)"}` : "1px solid transparent", background: priorityFilter === p ? (cfg ? cfg.bg : "rgba(177,178,180,0.08)") : "transparent", color: priorityFilter === p ? (cfg ? cfg.color : "#fcfcfe") : "#5d5e60" }}>
                {p === "all" ? "All priorities" : PRIORITY_CFG[p as TaskPriority].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table header */}
      <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "20px 2fr 1fr 1fr 1.2fr auto", gap: "0.875rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(177,178,180,0.06)", background: "rgba(255,255,255,0.02)" }}>
          {["", "Task", "Priority", "Status", "Due Date", ""].map((h, i) => <div key={i} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>)}
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#3d3e40" }}><div style={{ fontSize: "2rem", marginBottom: 8 }}>✅</div>No tasks. Create one!</div>
        ) : (
          filtered.map(task => (
            <TaskRow key={task.id} task={task} isAdmin={isAdmin} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
