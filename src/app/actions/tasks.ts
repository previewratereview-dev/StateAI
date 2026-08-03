"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

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
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("*, contacts(first_name, last_name), deals(title), profiles!tasks_assigned_to_fkey(full_name)")
      .order("due_date", { ascending: true, nullsFirst: false });
    if (error) return { error: error.message };
    return { data: data as Task[] };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function createTask(formData: FormData): Promise<{ data?: Task; error?: string }> {
  try {
    const payload = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      due_date: (formData.get("due_date") as string) || null,
      priority: (formData.get("priority") as TaskPriority) || "medium",
      status: "open" as TaskStatus,
      contact_id: (formData.get("contact_id") as string) || null,
      deal_id: (formData.get("deal_id") as string) || null,
    };
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert(payload)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as Task };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("tasks")
      .update({ status })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("tasks")
      .update(updates)
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}
