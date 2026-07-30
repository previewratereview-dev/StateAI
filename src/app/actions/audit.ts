"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin, requireAuth } from "@/lib/auth";

export interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  metadata: any;
  profiles?: { full_name: string | null; email: string };
}

export async function getAuditLogs(): Promise<{ success: boolean; data?: AuditLog[]; error?: string }> {
  await requireAdmin();

  try {
    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*, profiles:user_id(full_name, email)")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    return { success: true, data: data as AuditLog[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getLiveActivityFeed(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const profile = await requireAuth();

  try {
    let query = supabaseAdmin
      .from("activities")
      .select("*, profiles:created_by(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);

    // Sales users only see activities they generated or are linked to their assigned objects
    if (profile.role !== "admin") {
      query = query.eq("created_by", profile.id);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };

    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
