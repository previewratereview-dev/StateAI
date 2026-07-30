"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { LeadStatus } from "@/lib/interaction-types";
import { requireAuth } from "@/lib/auth";
import { logAuditAction } from "@/lib/audit-logger";
import { logTargetProgress } from "./targets";
import { revalidatePath } from "next/cache";

export type ContactStatus = LeadStatus;
export type LeadSource = "website" | "referral" | "social" | "email" | "cold_call" | "event" | "other";

export interface Contact {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  website: string | null;
  status: ContactStatus;
  lead_source: LeadSource;
  tags: string[];
  notes: string | null;
  assigned_to: string | null;
  created_by: string | null;
}

export async function getContacts(): Promise<{ data?: Contact[]; error?: string }> {
  try {
    const profile = await requireAuth();
    let query = supabaseAdmin.from("contacts").select("*");
    
    if (profile.role !== "admin") {
      query = query.eq("assigned_to", profile.id);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return { error: error.message };
    return { data: data as Contact[] };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getContact(id: string) {
  try {
    const profile = await requireAuth();
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select(`
        *,
        deals(*),
        crm_notes(*),
        activities(*),
        emails(*),
        quotes(*),
        invoices(*),
        tasks(*)
      `)
      .eq("id", id)
      .single();

    if (error) return { error: error.message };

    // RBAC validation
    if (profile.role !== "admin" && data.assigned_to !== profile.id && data.created_by !== profile.id) {
      return { error: "Unauthorized access to this contact record" };
    }

    return { data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createContact(
  formData: FormData
): Promise<{ data?: Contact; error?: string }> {
  try {
    const profile = await requireAuth();
    const payload = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      company: (formData.get("company") as string) || null,
      job_title: (formData.get("job_title") as string) || null,
      website: (formData.get("website") as string) || null,
      status: (formData.get("status") as ContactStatus) || "new",
      lead_source: (formData.get("lead_source") as LeadSource) || "other",
      notes: (formData.get("notes") as string) || null,
      created_by: profile.id,
      assigned_to: (formData.get("assigned_to") as string) || profile.id,
      last_activity_at: new Date().toISOString()
    };
    
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .insert(payload)
      .select()
      .single();

    if (error) return { error: error.message };

    // Log audit & target
    await logAuditAction("Lead Creation", { contact_id: data.id, email: payload.email });
    await logTargetProgress(profile.id, "followups", 1); // Followup/Action logged

    return { data: data as Contact };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateContact(
  id: string,
  updates: Partial<Contact>
): Promise<{ data?: Contact; error?: string }> {
  try {
    const profile = await requireAuth();
    
    // RBAC check
    const { data: existing } = await supabaseAdmin.from("contacts").select("assigned_to, created_by").eq("id", id).single();
    if (existing) {
      const allowed = profile.role === "admin" || existing.assigned_to === profile.id || existing.created_by === profile.id;
      if (!allowed) return { error: "Not authorized to update this contact record" };
    }

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from("contacts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) return { error: error.message };

    await logAuditAction("Lead Update", { contact_id: id, updates });

    return { data: data as Contact };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const profile = await requireAuth();
    
    // RBAC check: only admins can delete contacts
    if (profile.role !== "admin") {
      return { success: false, error: "Unauthorized. Only admins can delete contact records" };
    }

    const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    await logAuditAction("Lead Delete", { contact_id: id });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function claimContact(contactId: string, ttlMinutes = 15): Promise<{ success: boolean; error?: string; data?: any }> {
  const profile = await requireAuth();
  try {
    const { data: existing } = await supabaseAdmin.from("contacts").select("locked_by, locked_at, assigned_to").eq("id", contactId).single();

    const now = Date.now();
    let lockExpired = true;
    if (existing?.locked_at) {
      const lockedAt = new Date(existing.locked_at).getTime();
      lockExpired = lockedAt + ttlMinutes * 60 * 1000 < now;
    }

    if (existing?.locked_by && existing.locked_by !== profile.id && !lockExpired && profile.role !== "admin") {
      return { success: false, error: "Contact is locked by another user" };
    }

    const { data, error } = await supabaseAdmin
      .from("contacts")
      .update({ locked_by: profile.id, locked_at: new Date().toISOString(), last_activity_at: new Date().toISOString() })
      .eq("id", contactId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditAction("Contact Claimed", { contact_id: contactId });

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function releaseContact(contactId: string): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();
  try {
    const { data: existing } = await supabaseAdmin.from("contacts").select("locked_by").eq("id", contactId).single();
    if (existing) {
      const allowed = profile.role === "admin" || existing.locked_by === profile.id;
      if (!allowed) return { success: false, error: "Not authorized to release lock" };
    }

    const { error } = await supabaseAdmin.from("contacts").update({ locked_by: null, locked_at: null, last_activity_at: new Date().toISOString() }).eq("id", contactId);
    if (error) return { success: false, error: error.message };

    await logAuditAction("Contact Lock Released", { contact_id: contactId });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function bulkDeleteContacts(ids: string[]) {
  const profile = await requireAuth();
  if (profile.role !== "admin") return { success: false, error: "Only admins can perform bulk delete" };
  try {
    const { error } = await supabaseAdmin.from("contacts").delete().in("id", ids);
    if (error) return { success: false, error: error.message };
    await logAuditAction("Bulk Deleted Contacts", { count: ids.length });
    revalidatePath("/crm/contacts");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function bulkUpdateContactsStatus(ids: string[], status: any) {
  const profile = await requireAuth();
  try {
    let query = supabaseAdmin.from("contacts").update({ status, last_activity_at: new Date().toISOString() });
    if (profile.role !== "admin") {
      query = query.eq("assigned_to", profile.id);
    }
    const { error } = await query.in("id", ids);
    if (error) return { success: false, error: error.message };
    await logAuditAction("Bulk Updated Status", { count: ids.length, status });
    revalidatePath("/crm/contacts");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function bulkReassignContacts(ids: string[], assignedTo: string) {
  const profile = await requireAuth();
  if (profile.role !== "admin") return { success: false, error: "Only admins can reassign contacts" };
  try {
    const { error } = await supabaseAdmin.from("contacts").update({ assigned_to: assignedTo, last_activity_at: new Date().toISOString() }).in("id", ids);
    if (error) return { success: false, error: error.message };
    await logAuditAction("Bulk Reassigned Leads", { count: ids.length, assigned_to: assignedTo });
    revalidatePath("/crm/contacts");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function importContacts(dataRows: any[]) {
  const profile = await requireAuth();
  try {
    const payload = dataRows.map(row => ({
      ...row,
      assigned_to: profile.role === "sales" ? profile.id : null,
      created_by: profile.id
    }));

    const { data, error } = await supabaseAdmin.from("contacts").insert(payload).select();
    if (error) return { success: false, error: error.message };

    await logAuditAction("Imported Contacts from CSV", { count: payload.length });
    revalidatePath("/crm/contacts");
    return { success: true, count: data?.length || payload.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
