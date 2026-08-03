/* eslint-disable @typescript-eslint/no-explicit-any */
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
  created_by_profile?: { full_name: string | null } | null;
  assigned_profile?: { full_name: string | null } | null;
}

export async function getContacts(): Promise<{ data?: Contact[]; error?: string }> {
  const profile = await requireAuth();
  try {
    let query = supabaseAdmin
      .from("contacts")
      .select("*, created_by_profile:profiles!contacts_created_by_fkey(full_name), assigned_profile:profiles!contacts_assigned_to_fkey(full_name)")
      .order("created_at", { ascending: false });

    // Sales users only see contacts they own or created
    if (profile.role !== "admin") {
      query = query.or(`assigned_to.eq.${profile.id},created_by.eq.${profile.id}`);
    }

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data: data as Contact[] };
  } catch (e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}

export async function getContact(id: string) {
  const profile = await requireAuth();
  try {
    let query = supabaseAdmin
      .from("contacts")
      .select(`
        *,
        created_by_profile:profiles!contacts_created_by_fkey(full_name),
        assigned_profile:profiles!contacts_assigned_to_fkey(full_name),
        deals(*),
        crm_notes(*),
        activities(*),
        emails(*)
      `)
      .eq("id", id);

    // Sales users cannot open other people's contacts directly by URL
    if (profile.role !== "admin") {
      query = query.or(`assigned_to.eq.${profile.id},created_by.eq.${profile.id}`);
    }

    const { data, error } = await query.single();
    if (error) return { error: error.message };
    return { data };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function createContact(
  formData: FormData
): Promise<{ data?: Contact; error?: string }> {
  const profile = await requireAuth();
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
      // Attribution: record who created the contact; default owner to the creator
      created_by: profile.id,
      assigned_to: (formData.get("assigned_to") as string) || profile.id,
    };
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .insert(payload)
      .select("*, created_by_profile:profiles!contacts_created_by_fkey(full_name), assigned_profile:profiles!contacts_assigned_to_fkey(full_name)")
      .single();
    if (error) return { error: error.message };
    return { data: data as Contact };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function updateContact(
  id: string,
  updates: Partial<Contact>
): Promise<{ data?: Contact; error?: string }> {
  const profile = await requireAuth();
  try {
    // Only admin, the owner (assigned_to), or the creator can update a contact
    if (profile.role !== "admin") {
      const { data: existing } = await supabaseAdmin.from("contacts").select("assigned_to, created_by").eq("id", id).single();
      if (!existing || (existing.assigned_to !== profile.id && existing.created_by !== profile.id)) {
        return { error: "Not authorized to update this contact" };
      }
    }
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .update(updates)
      .eq("id", id)
      .select("*, created_by_profile:profiles!contacts_created_by_fkey(full_name), assigned_profile:profiles!contacts_assigned_to_fkey(full_name)")
      .single();
    if (error) return { error: error.message };
    return { data: data as Contact };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();
  try {
    // Only admin or the creator can delete (UI already restricts this; enforce here too)
    if (profile.role !== "admin") {
      const { data: existing } = await supabaseAdmin.from("contacts").select("created_by").eq("id", id).single();
      if (!existing || existing.created_by !== profile.id) {
        return { success: false, error: "Not authorized to delete this contact" };
      }
    }
    const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
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
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
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
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}
