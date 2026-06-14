import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "sales";

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  email?: string;
  assigned_mailbox?: string | null;
}

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile && !error?.message.includes("does not exist")) {
    // Attempt to auto-create if table exists but row is missing
    const { data: newProfile } = await supabaseAdmin
      .from("profiles")
      .insert([{ id: user.id, full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User", role: "admin" }])
      .select()
      .single();
    if (newProfile) profile = newProfile;
  }

  if (!profile) return null;

  return {
    ...profile,
    email: user.email,
    role: (profile.role as UserRole) || "sales",
    assigned_mailbox: profile.assigned_mailbox || null,
  };
}

export async function requireAuth(): Promise<UserProfile> {
  const profile = await getProfile();
  if (!profile) redirect("/login?error=Profile_Not_Found_Did_you_run_SQL_schema");
  return profile;
}

export async function requireAdmin(): Promise<UserProfile> {
  const profile = await requireAuth();
  if (profile.role !== "admin") redirect("/crm/dashboard");
  return profile;
}
