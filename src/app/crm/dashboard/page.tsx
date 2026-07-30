import { getDashboardStats } from "@/app/actions/settings";
import { getLeaderboard, getDailyTargets } from "@/app/actions/targets";
import { requireAuth } from "@/lib/auth";
import DashboardClient from "@/components/crm/Dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const profile = await requireAuth();
  
  const [stats, leaderboardRes, targetsRes] = await Promise.all([
    getDashboardStats(),
    getLeaderboard(),
    getDailyTargets(profile.id)
  ]);

  return (
    <DashboardClient 
      profile={profile} 
      stats={stats} 
      leaderboard={leaderboardRes.success ? (leaderboardRes.data || []) : []} 
      targets={targetsRes.success ? targetsRes.data : null} 
    />
  );
}
