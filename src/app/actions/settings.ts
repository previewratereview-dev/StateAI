"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { logAuditAction } from "@/lib/audit-logger";
import { revalidatePath } from "next/cache";

export async function getProfiles() {
  await requireAuth();
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

export async function getRoles() {
  await requireAdmin();
  try {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return { error: error.message };
    return { data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createRole(name: string, permissions: any) {
  await requireAdmin();
  try {
    const { data, error } = await supabaseAdmin
      .from("roles")
      .insert([{ name, permissions }])
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    await logAuditAction("Role Created", { name });
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateRole(id: string, permissions: any) {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from("roles")
      .update({ permissions })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await logAuditAction("Role Updated", { role_id: id });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteRole(id: string) {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from("roles")
      .delete()
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    await logAuditAction("Role Deleted", { role_id: id });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    if (error) return { success: false, error: error.message };
    await logAuditAction("User Role Updated", { target_user_id: userId, role });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getDashboardStats() {
  try {
    const profile = await requireAuth();

    let contactsQuery = supabaseAdmin.from("contacts").select("id, status, created_at, assigned_to, email");
    let dealsQuery = supabaseAdmin.from("deals").select("id, stage, value, created_at, assigned_to");
    let tasksQuery = supabaseAdmin.from("tasks").select("id, status, priority, due_date, assigned_to");
    let bookingsQuery = supabaseAdmin.from("bookings").select("id, status, meeting_date, created_at, email");
    let activitiesQuery = supabaseAdmin.from("activities").select("*, profiles!activities_created_by_fkey(full_name)").order("created_at", { ascending: false }).limit(20);
    let quotesQuery = supabaseAdmin.from("quotes").select("id, amount, status, created_at, created_by");
    let invoicesQuery = supabaseAdmin.from("invoices").select("id, amount, status, created_at, created_by");

    // Enforce data isolation for non-admin users
    if (profile.role !== "admin") {
      contactsQuery = contactsQuery.eq("assigned_to", profile.id);
      dealsQuery = dealsQuery.eq("assigned_to", profile.id);
      tasksQuery = tasksQuery.eq("assigned_to", profile.id);
      activitiesQuery = activitiesQuery.eq("created_by", profile.id);
      quotesQuery = quotesQuery.eq("created_by", profile.id);
      invoicesQuery = invoicesQuery.eq("created_by", profile.id);
      
      // Filter bookings: only show bookings from clients assigned to this salesperson
      const { data: contactsData } = await contactsQuery;
      const assignedEmails = (contactsData || []).map(c => c.email).filter(Boolean);
      if (assignedEmails.length > 0) {
        bookingsQuery = bookingsQuery.in("email", assignedEmails);
      } else {
        bookingsQuery = bookingsQuery.eq("email", "none-assigned-dummy-match");
      }
    }

    const [contactsRes, dealsRes, tasksRes, bookingsRes, activitiesRes, quotesRes, invoicesRes] = await Promise.all([
      contactsQuery,
      dealsQuery,
      tasksQuery,
      bookingsQuery.gte("meeting_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      activitiesQuery,
      quotesQuery,
      invoicesQuery
    ]);

    return {
      contacts: contactsRes.data || [],
      deals: dealsRes.data || [],
      tasks: tasksRes.data || [],
      bookings: bookingsRes.data || [],
      activities: activitiesRes.data || [],
      quotes: quotesRes.data || [],
      invoices: invoicesRes.data || [],
    };
  } catch (e: any) {
    return { contacts: [], deals: [], tasks: [], bookings: [], activities: [], quotes: [], invoices: [] };
  }
}

export async function createUser(
  fullName: string,
  email: string,
  password: string,
  role: string,
  assignedMailbox: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  await requireAdmin();
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
        assigned_mailbox: assignedMailbox,
      },
    });

    if (error) return { success: false, error: error.message };

    await logAuditAction("User Created", { email, role });

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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// User deactivation, deletion, suspension, team assignations, and resets
export async function deactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: "inactive" })
      .eq("id", userId);
    
    if (error) return { success: false, error: error.message };
    await logAuditAction("User Deactivated", { target_user_id: userId });
    revalidatePath("/crm/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function suspendUser(userId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: "suspended" })
      .eq("id", userId);
    
    if (error) return { success: false, error: error.message };
    await logAuditAction("User Suspended", { target_user_id: userId });
    revalidatePath("/crm/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function reactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: "active" })
      .eq("id", userId);
    
    if (error) return { success: false, error: error.message };
    await logAuditAction("User Reactivated", { target_user_id: userId });
    revalidatePath("/crm/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    // Delete from auth.users (cascades to profiles)
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) return { success: false, error: authErr.message };

    await logAuditAction("User Deleted", { target_user_id: userId });
    revalidatePath("/crm/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function assignTeam(userId: string, team: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ team })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };
    await logAuditAction("User Team Assigned", { target_user_id: userId, team });
    revalidatePath("/crm/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function assignLeads(leadsList: string[], userId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin
      .from("contacts")
      .update({ assigned_to: userId, last_activity_at: new Date().toISOString() })
      .in("id", leadsList);

    if (error) return { success: false, error: error.message };
    await logAuditAction("Leads Reassigned", { target_user_id: userId, leads_count: leadsList.length });
    revalidatePath("/crm/contacts");
    revalidatePath("/crm/leads");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function resetPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) return { success: false, error: error.message };
    await logAuditAction("User Password Reset By Admin", { target_user_id: userId });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function adminResetPassword(userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  return resetPassword(userId, newPassword);
}

export async function adminSuspendUser(userId: string, suspend: boolean): Promise<{ success: boolean; error?: string }> {
  if (suspend) {
    return suspendUser(userId);
  } else {
    return reactivateUser(userId);
  }
}

export async function adminDeleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  return deleteUser(userId);
}

export async function adminReassignLeads(fromUserId: string, toUserId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    const { data: contacts, error: fetchError } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("assigned_to", fromUserId);
    
    if (fetchError) return { success: false, error: fetchError.message };
    if (!contacts || contacts.length === 0) return { success: true };

    const ids = contacts.map(c => c.id);
    const { error: updateError } = await supabaseAdmin
      .from("contacts")
      .update({ assigned_to: toUserId, last_activity_at: new Date().toISOString() })
      .in("id", ids);
    
    if (updateError) return { success: false, error: updateError.message };
    await logAuditAction("Leads Reassigned In Bulk", { from_user_id: fromUserId, to_user_id: toUserId, count: ids.length });
    revalidatePath("/crm/contacts");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
