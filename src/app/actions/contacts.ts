"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type ContactStatus = "lead" | "customer" | "churned" | "prospect";
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

export async function getContact(id: string): Promise<{ data?: Contact & { deals?: any[]; activities?: any[]; bookings?: any[]; crm_notes?: any[] }; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select("*, deals(*), activities(*), crm_notes(*)")
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
      status: (formData.get("status") as ContactStatus) || "lead",
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
