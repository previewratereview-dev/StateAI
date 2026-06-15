"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { LeadStatus } from "@/lib/interaction-types";
import { requireAuth } from "@/lib/auth";

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
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { error: error.message };
    return { data: data as Contact[] };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getContact(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select(`
        *,
        deals(*),
        crm_notes(*),
        activities(*),
        emails(*)
      `)
      .eq("id", id)
      .single();
    if (error) return { error: error.message };
    return { data };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createContact(
  formData: FormData
): Promise<{ data?: Contact; error?: string }> {
  try {
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
    };
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .insert(payload)
      .select()
      .single();
    if (error) return { error: error.message };
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
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as Contact };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function claimContact(contactId: string, ttlMinutes = 15): Promise<{ success: boolean; error?: string; data?: any }> {
  const profile = await requireAuth();
  try {
    const { data: existing } = await supabaseAdmin.from("contacts").select("locked_by, locked_at").eq("id", contactId).single();

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
      .update({ locked_by: profile.id, locked_at: new Date().toISOString() })
      .eq("id", contactId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
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

    const { error } = await supabaseAdmin.from("contacts").update({ locked_by: null, locked_at: null }).eq("id", contactId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
