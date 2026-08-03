/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export interface TeamPerformanceRow {
  id: string;
  full_name: string;
  contacts_added: number;
  contacts_owned: number;
  deals_owned: number;
  won_count: number;
  won_value: number;
  pipeline_value: number;
  activities: number;
}

export async function getTeamPerformance(): Promise<{
  data?: TeamPerformanceRow[];
  error?: string;
}> {
  try {
    const profile = await requireAuth();
    if (profile.role !== "admin") {
      return { data: [] };
    }

    const [profilesRes, contactsRes, dealsRes, activitiesRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name"),
      supabaseAdmin.from("contacts").select("id, created_by, assigned_to"),
      supabaseAdmin.from("deals").select("id, created_by, assigned_to, stage, value"),
      supabaseAdmin.from("activities").select("id, created_by"),
    ]);

    if (profilesRes.error) return { error: profilesRes.error.message };

    const contacts = contactsRes.data || [];
    const deals = dealsRes.data || [];
    const activities = activitiesRes.data || [];

    const rows: TeamPerformanceRow[] = (profilesRes.data || []).map(p => {
      const owned = deals.filter(d => d.assigned_to === p.id);
      const won = owned.filter(d => d.stage === "won");
      const pipeline = owned.filter(d => !["won", "lost"].includes(d.stage));
      return {
        id: p.id,
        full_name: p.full_name || "Unnamed",
        contacts_added: contacts.filter(c => c.created_by === p.id).length,
        contacts_owned: contacts.filter(c => c.assigned_to === p.id).length,
        deals_owned: owned.length,
        won_count: won.length,
        won_value: won.reduce((s, d) => s + (d.value || 0), 0),
        pipeline_value: pipeline.reduce((s, d) => s + (d.value || 0), 0),
        activities: activities.filter(a => a.created_by === p.id).length,
      };
    });

    rows.sort((a, b) => b.won_value - a.won_value || b.deals_owned - a.deals_owned);

    return { data: rows };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function getProfiles() {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return { error: error.message };
    return { data };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function getRoles() {
  try {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return { error: error.message };
    return { data };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function createRole(name: string, permissions: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .insert([{ name, permissions }])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateRole(id: string, permissions: any) {
  try {
    const { error } = await supabaseAdmin
      .from("roles")
      .update({ permissions })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteRole(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("roles")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getDashboardStats() {
  const profile = await requireAuth();
  try {
    const isAdmin = profile.role === "admin";
    const own = `assigned_to.eq.${profile.id},created_by.eq.${profile.id}`;

    const [contactsRes, dealsRes, tasksRes, bookingsRes, activitiesRes] = await Promise.all([
      (isAdmin
        ? supabaseAdmin.from("contacts").select("id, status, created_at")
        : supabaseAdmin.from("contacts").select("id, status, created_at").or(own)),
      (isAdmin
        ? supabaseAdmin.from("deals").select("id, stage, value, created_at")
        : supabaseAdmin.from("deals").select("id, stage, value, created_at").or(own)),
      (isAdmin
        ? supabaseAdmin.from("tasks").select("id, status, priority, due_date")
        : supabaseAdmin.from("tasks").select("id, status, priority, due_date").eq("assigned_to", profile.id)),
      supabaseAdmin.from("bookings").select("id, status, meeting_date, created_at").gte("meeting_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      (isAdmin
        ? supabaseAdmin.from("activities").select("*, profiles!activities_created_by_fkey(full_name)").order("created_at", { ascending: false }).limit(10)
        : supabaseAdmin.from("activities").select("*, profiles!activities_created_by_fkey(full_name)").eq("created_by", profile.id).order("created_at", { ascending: false }).limit(10)),
    ]);

    return {
      contacts: contactsRes.data || [],
      deals: dealsRes.data || [],
      tasks: tasksRes.data || [],
      bookings: bookingsRes.data || [],
      activities: activitiesRes.data || [],
    };
  } catch (_e) {
    return { contacts: [], deals: [], tasks: [], bookings: [], activities: [] };
  }
}

export async function createUser(
  fullName: string,
  email: string,
  password: string,
  role: string,
  assignedMailbox: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Create the auth user with metadata. The handle_new_user() trigger will
    // auto-create the profiles row with role + assigned_mailbox.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: fullName,
        role,
        assigned_mailbox: assignedMailbox,
      },
    });

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        id: data.user.id,
        full_name: fullName,
        role,
        assigned_mailbox: assignedMailbox,
        email,
      },
    };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

