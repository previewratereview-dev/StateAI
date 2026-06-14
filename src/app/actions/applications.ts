"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface JobApplication {
  id: string;
  created_at: string;
  updated_at: string;
  job_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  resume_url: string | null;
  cover_letter: string | null;
  expected_salary: number | null;
  currency: string;
  currently_employed: boolean;
  start_date: string | null;
  status: "new" | "reviewed" | "shortlisted" | "rejected" | "hired";
  admin_notes: string | null;
  created_by: string | null;
}

export interface ApplicationWithJob extends JobApplication {
  jobs?: {
    title: string;
    slug: string;
    department: string;
    type: string;
  };
}

export type ApplicationFormData = {
  job_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  website_url?: string;
  resume_url?: string;
  cover_letter?: string;
  expected_salary?: number | null;
  currency?: string;
  currently_employed?: boolean;
  start_date?: string;
};

export async function submitApplication(
  formData: ApplicationFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.from("job_applications").insert([
      {
        job_id: formData.job_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        linkedin_url: formData.linkedin_url || null,
        portfolio_url: formData.portfolio_url || null,
        website_url: formData.website_url || null,
        resume_url: formData.resume_url || null,
        cover_letter: formData.cover_letter || null,
        expected_salary: formData.expected_salary || null,
        currency: formData.currency || "USD",
        currently_employed: formData.currently_employed || false,
        start_date: formData.start_date || null,
        created_by: null, // anonymous submission
      },
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAllApplications(): Promise<{
  success: boolean;
  data?: ApplicationWithJob[];
  error?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .select("*, jobs!inner(title, slug, department, type)")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ApplicationWithJob[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getApplicationsByJobId(jobId: string): Promise<{
  success: boolean;
  data?: JobApplication[];
  error?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as JobApplication[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getApplicationById(id: string): Promise<{
  success: boolean;
  data?: ApplicationWithJob;
  error?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .select("*, jobs!inner(title, slug, department, type)")
      .eq("id", id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as ApplicationWithJob };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateApplicationStatus(
  id: string,
  status: JobApplication["status"]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("job_applications")
      .update({ status })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateApplicationNotes(
  id: string,
  admin_notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("job_applications")
      .update({ admin_notes })
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteApplication(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("job_applications")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}