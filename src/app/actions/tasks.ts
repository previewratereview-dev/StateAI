"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { logAuditAction } from "@/lib/audit-logger";
import { logTargetProgress } from "./targets";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "open" | "in_progress" | "done";

export interface Task {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  contact_id: string | null;
  deal_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  contacts?: { first_name: string; last_name: string };
  deals?: { title: string };
  profiles?: { full_name: string | null };
}

export async function getTasks(): Promise<{ data?: Task[]; error?: string }> {
  try {
    const profile = await requireAuth();
    let query = supabaseAdmin
      .from("tasks")
      .select("*, contacts(first_name, last_name), deals(title), profiles!tasks_assigned_to_fkey(full_name)");

    if (profile.role !== "admin") {
      query = query.eq("assigned_to", profile.id);
    }

    const { data, error } = await query.order("due_date", { ascending: true, nullsFirst: false });
    if (error) return { error: error.message };
    return { data: data as Task[] };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createTask(formData: FormData): Promise<{ data?: Task; error?: string }> {
  try {
    const profile = await requireAuth();
    const payload = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      due_date: (formData.get("due_date") as string) || null,
      priority: (formData.get("priority") as TaskPriority) || "medium",
      status: "open" as TaskStatus,
      contact_id: (formData.get("contact_id") as string) || null,
      deal_id: (formData.get("deal_id") as string) || null,
      created_by: profile.id,
      assigned_to: (formData.get("assigned_to") as string) || profile.id
    };
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert(payload)
      .select()
      .single();
    if (error) return { error: error.message };

    await logAuditAction("Task Created", { task_id: data.id, title: payload.title });

    return { data: data as Task };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireAuth();

    // Check ownership for sales users
    const { data: existing } = await supabaseAdmin.from("tasks").select("assigned_to, created_by").eq("id", id).single();
    if (existing && profile.role !== "admin" && existing.assigned_to !== profile.id && existing.created_by !== profile.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabaseAdmin
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: error.message };

    await logAuditAction(`Task Status Updated: ${status}`, { task_id: id, status });

    if (status === "done") {
      await logTargetProgress(profile.id, "followups", 1);
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireAuth();

    // Check ownership for sales users
    const { data: existing } = await supabaseAdmin.from("tasks").select("assigned_to, created_by").eq("id", id).single();
    if (existing && profile.role !== "admin" && existing.assigned_to !== profile.id && existing.created_by !== profile.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabaseAdmin
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: error.message };

    await logAuditAction("Task Update", { task_id: id, updates });

    if (updates.status === "done") {
      await logTargetProgress(profile.id, "followups", 1);
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireAuth();

    // Only admin can delete tasks
    if (profile.role !== "admin") {
      return { success: false, error: "Unauthorized. Only admins can delete tasks" };
    }

    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    await logAuditAction("Task Deleted", { task_id: id });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
