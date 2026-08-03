"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "freelance" | "commission";
  description: string;
  requirements: string;
  responsibilities: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  status: "active" | "inactive" | "draft";
  featured: boolean;
  application_url: string | null;
  created_by: string | null;
}

export type JobFormData = {
  title: string;
  department: string;
  location: string;
  type: Job["type"];
  description: string;
  requirements: string;
  responsibilities: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  status: Job["status"];
  featured?: boolean;
  application_url?: string | null;
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getActiveJobs(): Promise<{
  success: boolean;
  data?: Job[];
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Job[] };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getJobBySlug(slug: string): Promise<{
  success: boolean;
  data?: Job;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Job };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getAllJobs(): Promise<{
  success: boolean;
  data?: Job[];
  error?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Job[] };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getJobById(id: string): Promise<{
  success: boolean;
  data?: Job;
  error?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Job };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createJob(
  formData: JobFormData
): Promise<{ success: boolean; data?: Job; error?: string }> {
  try {
    // Get current user
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const slug = generateSlug(formData.title);

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert([
        {
          ...formData,
          slug,
          salary_min: formData.salary_min || null,
          salary_max: formData.salary_max || null,
          salary_currency: formData.salary_currency || "USD",
          featured: formData.featured || false,
          application_url: formData.application_url || null,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Job };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateJob(
  id: string,
  formData: JobFormData
): Promise<{ success: boolean; data?: Job; error?: string }> {
  try {
    const slug = generateSlug(formData.title);

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .update({
        ...formData,
        slug,
        salary_min: formData.salary_min || null,
        salary_max: formData.salary_max || null,
        salary_currency: formData.salary_currency || "USD",
        featured: formData.featured || false,
        application_url: formData.application_url || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Job };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteJob(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from("jobs").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function toggleJobStatus(
  id: string,
  status: Job["status"]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("jobs")
      .update({ status })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function toggleJobFeatured(
  id: string,
  featured: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("jobs")
      .update({ featured })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}