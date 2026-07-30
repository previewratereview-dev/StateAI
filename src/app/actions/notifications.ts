"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface AppNotification {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error" | "alert";
}

export async function getNotifications(unreadOnly = false): Promise<{ success: boolean; data?: AppNotification[]; error?: string }> {
  const profile = await requireAuth();

  try {
    let query = supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };

    return { success: true, data: data as AppNotification[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" | "alert" = "info"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        type
      });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createAdminNotification(
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" | "alert" = "info"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find all admin profiles
    const { data: admins } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (admins) {
      for (const adm of admins) {
        await createNotification(adm.id, title, message, type);
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markNotificationRead(id: string): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();

  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", profile.id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/crm/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markAllNotificationsRead(): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();

  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ read: true })
      .eq("user_id", profile.id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/crm/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
