"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getProfiles() {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return { error: error.message };
    return { data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "sales"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getDashboardStats() {
  try {
    const [contactsRes, dealsRes, tasksRes, bookingsRes, activitiesRes] = await Promise.all([
      supabaseAdmin.from("contacts").select("id, status, created_at"),
      supabaseAdmin.from("deals").select("id, stage, value, created_at"),
      supabaseAdmin.from("tasks").select("id, status, priority, due_date"),
      supabaseAdmin.from("bookings").select("id, status, meeting_date, created_at").gte("meeting_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      supabaseAdmin.from("activities").select("*, profiles!activities_created_by_fkey(full_name)").order("created_at", { ascending: false }).limit(10),
    ]);

    return {
      contacts: contactsRes.data || [],
      deals: dealsRes.data || [],
      tasks: tasksRes.data || [],
      bookings: bookingsRes.data || [],
      activities: activitiesRes.data || [],
    };
  } catch (e: any) {
    return { contacts: [], deals: [], tasks: [], bookings: [], activities: [] };
  }
}
