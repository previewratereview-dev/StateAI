"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

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
  try {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .select("*, contacts(first_name, last_name, company), profiles!deals_assigned_to_fkey(full_name)")
      .order("created_at", { ascending: false });
    if (error) return { error: error.message };
    return { data: data as Deal[] };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createDeal(formData: FormData): Promise<{ data?: Deal; error?: string }> {
  try {
    const payload = {
      title: formData.get("title") as string,
      contact_id: (formData.get("contact_id") as string) || null,
      value: parseFloat((formData.get("value") as string) || "0"),
      stage: (formData.get("stage") as DealStage) || "new",
      probability: parseInt((formData.get("probability") as string) || "10"),
      expected_close_date: (formData.get("expected_close_date") as string) || null,
      description: (formData.get("description") as string) || null,
    };
    const { data, error } = await supabaseAdmin
      .from("deals")
      .insert(payload)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as Deal };
  } catch (e: any) {
    return { error: e.message };
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
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateDeal(
  id: string,
  updates: Partial<Deal>
): Promise<{ data?: Deal; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("deals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as Deal };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteDeal(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from("deals").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
