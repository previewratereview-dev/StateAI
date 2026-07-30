"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface DailyTargets {
  id?: string;
  user_id: string;
  date: string;
  calls_target: number;
  meetings_target: number;
  quotes_target: number;
  followups_target: number;
  revenue_target: number;
  calls_progress: number;
  meetings_progress: number;
  quotes_progress: number;
  followups_progress: number;
  revenue_progress: number;
}

export async function getDailyTargets(userId?: string): Promise<{ success: boolean; data?: DailyTargets; error?: string }> {
  const profile = await requireAuth();
  const targetUserId = userId || profile.id;

  // RBAC check
  if (profile.role !== "admin" && targetUserId !== profile.id) {
    return { success: false, error: "Not authorized to view these targets" };
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    // Attempt to load today's targets
    const { data, error } = await supabaseAdmin
      .from("daily_targets")
      .select("*")
      .eq("user_id", targetUserId)
      .eq("date", today)
      .maybeSingle();

    if (error) return { success: false, error: error.message };

    if (data) {
      return { success: true, data: data as DailyTargets };
    }

    // Default configuration if missing
    const defaultTarget = {
      user_id: targetUserId,
      date: today,
      calls_target: 30,
      meetings_target: 5,
      quotes_target: 3,
      followups_target: 10,
      revenue_target: 5000,
      calls_progress: 0,
      meetings_progress: 0,
      quotes_progress: 0,
      followups_progress: 0,
      revenue_progress: 0
    };

    const { data: newTarget, error: insertError } = await supabaseAdmin
      .from("daily_targets")
      .insert(defaultTarget)
      .select()
      .single();

    if (insertError) return { success: false, error: insertError.message };
    return { success: true, data: newTarget as DailyTargets };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateDailyTargets(
  userId: string,
  targets: Partial<DailyTargets>
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  const today = new Date().toISOString().split("T")[0];

  try {
    const { error } = await supabaseAdmin
      .from("daily_targets")
      .upsert({
        user_id: userId,
        date: today,
        ...targets
      }, { onConflict: "user_id,date" });

    if (error) return { success: false, error: error.message };
    revalidatePath("/crm/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logTargetProgress(
  userId: string,
  type: "calls" | "meetings" | "quotes" | "followups" | "revenue",
  value: number
): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();

  // Enforce ownership
  if (profile.role !== "admin" && userId !== profile.id) {
    return { success: false, error: "Unauthorized" };
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    // Get targets row first
    const targetRes = await getDailyTargets(userId);
    if (!targetRes.success || !targetRes.data) {
      return { success: false, error: targetRes.error || "Targets not found" };
    }

    const currentProgress = targetRes.data[`${type}_progress` as keyof DailyTargets] as number || 0;
    const updates: any = {};
    updates[`${type}_progress`] = currentProgress + value;

    const { error } = await supabaseAdmin
      .from("daily_targets")
      .update(updates)
      .eq("user_id", userId)
      .eq("date", today);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export interface LeaderboardUser {
  id: string;
  full_name: string;
  email: string;
  calls: number;
  meetings: number;
  quotes: number;
  deals: number;
  revenue: number;
  target_completion: number;
}

export async function getLeaderboard(): Promise<{ success: boolean; data?: LeaderboardUser[]; error?: string }> {
  await requireAuth();

  try {
    const today = new Date().toISOString().split("T")[0];

    // Load active profiles
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("status", "active")
      .eq("role", "sales");

    if (pErr) return { success: false, error: pErr.message };

    const leaderboard: LeaderboardUser[] = [];

    for (const prof of profiles || []) {
      // 1. Fetch daily target metrics
      const { data: targetData } = await supabaseAdmin
        .from("daily_targets")
        .select("*")
        .eq("user_id", prof.id)
        .eq("date", today)
        .maybeSingle();

      // 2. Count won deals and value
      const { data: dealsData } = await supabaseAdmin
        .from("deals")
        .select("value")
        .eq("assigned_to", prof.id)
        .eq("stage", "won");

      const revenue = (dealsData || []).reduce((acc, curr) => acc + (curr.value || 0), 0);
      const dealsCount = (dealsData || []).length;

      // Calculate Target Completion Percentage
      let pct = 0;
      if (targetData) {
        const t = targetData;
        const progressCount = t.calls_progress + t.meetings_progress + t.quotes_progress;
        const targetCount = t.calls_target + t.meetings_target + t.quotes_target;
        pct = targetCount > 0 ? Math.round((progressCount / targetCount) * 100) : 0;
      }

      leaderboard.push({
        id: prof.id,
        full_name: prof.full_name || prof.email.split("@")[0],
        email: prof.email,
        calls: targetData?.calls_progress || 0,
        meetings: targetData?.meetings_progress || 0,
        quotes: targetData?.quotes_progress || 0,
        deals: dealsCount,
        revenue,
        target_completion: Math.min(pct, 100)
      });
    }

    // Rank salespeople automatically: first by revenue, then by deals won, then target completion
    leaderboard.sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      if (b.deals !== a.deals) return b.deals - a.deals;
      return b.target_completion - a.target_completion;
    });

    return { success: true, data: leaderboard };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
