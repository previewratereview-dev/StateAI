/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type DealStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export interface Deal {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  contact_id: string | null;
  value: number;
  stage: DealStage;
  probability: number;
  expected_close_date: string | null;
  description: string | null;
  assigned_to: string | null;
  created_by: string | null;
  lost_reason: string | null;
  contacts?: { first_name: string; last_name: string; company: string | null };
  profiles?: { full_name: string | null };
}

export async function getDeals(): Promise<{ data?: Deal[]; error?: string }> {
  const profile = await requireAuth();
  try {
    let query = supabaseAdmin
      .from("deals")
      .select("*, contacts(first_name, last_name, company), profiles!deals_assigned_to_fkey(full_name)")
      .order("created_at", { ascending: false });

    // Sales users only see deals they own or created
    if (profile.role !== "admin") {
      query = query.or(`assigned_to.eq.${profile.id},created_by.eq.${profile.id}`);
    }

    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data: data as Deal[] };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function createDeal(formData: FormData): Promise<{ data?: Deal; error?: string }> {
  const profile = await requireAuth();
  try {
    const payload: any = {
      title: (formData.get("title") as string) || "Opportunity",
      contact_id: (formData.get("contact_id") as string) || null,
      value: parseFloat((formData.get("value") as string) || "0"),
      stage: (formData.get("stage") as DealStage) || "new",
      probability: parseInt((formData.get("probability") as string) || "10"),
      expected_close_date: (formData.get("expected_close_date") as string) || null,
      description: (formData.get("description") as string) || null,
    };

    // Ensure attribution
    payload.created_by = profile.id;
    payload.assigned_to = (formData.get("assigned_to") as string) || profile.id;

    const { data, error } = await supabaseAdmin
      .from("deals")
      .insert(payload)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as Deal };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function updateDealStage(
  id: string,
  stage: DealStage
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("deals")
      .update({ stage })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateDeal(
  id: string,
  updates: Partial<Deal>
): Promise<{ data?: Deal; error?: string }> {
  const profile = await requireAuth();
  try {
    // Authorization: only admin or assigned_to can update core fields
    const { data: existing } = await supabaseAdmin.from("deals").select("assigned_to, created_by").eq("id", id).single();
    if (existing) {
      const allowed = profile.role === "admin" || existing.assigned_to === profile.id || existing.created_by === profile.id;
      if (!allowed) return { error: "Not authorized to update this deal" };
    }

    const { data, error } = await supabaseAdmin
      .from("deals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as Deal };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

export async function deleteDeal(id: string): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();
  try {
    // Only admin or creator can delete
    const { data: existing } = await supabaseAdmin.from("deals").select("created_by, assigned_to").eq("id", id).single();
    if (existing) {
      const allowed = profile.role === "admin" || existing.created_by === profile.id;
      if (!allowed) return { success: false, error: "Not authorized" };
    }

    const { error } = await supabaseAdmin.from("deals").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function undoAutoCreatedDeal(dealId: string, contactId: string): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();
  try {
    // Fetch deal and verify contact
    const { data: deal, error: dErr } = await supabaseAdmin
      .from("deals")
      .select("id, contact_id, created_by, title")
      .eq("id", dealId)
      .single();

    if (dErr || !deal) return { success: false, error: dErr ? dErr.message : "Deal not found" };
    if (deal.contact_id !== contactId) return { success: false, error: "Deal does not belong to this contact" };

    // Only the creator or an admin can undo
    if (profile.role !== "admin" && deal.created_by !== profile.id) {
      return { success: false, error: "Not authorized" };
    }

    // Confirm this was an auto-created deal by looking for an activity with metadata.auto_created
    const { data: acts } = await supabaseAdmin
      .from("activities")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false });

    const autoActivity = (acts || []).find((a: any) => a.metadata && a.metadata.auto_created);
    if (!autoActivity) {
      return { success: false, error: "Deal is not marked as auto-created" };
    }

    // Delete the deal
    const { error: delErr } = await supabaseAdmin.from("deals").delete().eq("id", dealId);
    if (delErr) return { success: false, error: delErr.message };

    // Log undo activity
    const { error: aErr } = await supabaseAdmin.from("activities").insert({
      type: "deal_deleted",
      content: `Auto-created deal "${deal.title}" removed`,
      contact_id: contactId,
      deal_id: dealId,
      created_by: profile.id,
      metadata: { undo_auto_created: true, original_activity: autoActivity.id },
    });
    if (aErr) console.error("Failed to log undo activity:", aErr);

    revalidatePath("/crm/deals");
    revalidatePath("/crm/leads");
    revalidatePath(`/crm/contacts/${contactId}`);

    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}
