import { requireAuth } from "@/lib/auth";
import { getDashboardStats, getTeamPerformance } from "@/app/actions/settings";
import ReportsClient from "@/components/crm/Reports";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage() {
  const profile = await requireAuth();
  const isAdmin = profile.role === "admin";

  const [stats, team] = await Promise.all([
    getDashboardStats(),
    isAdmin ? getTeamPerformance() : Promise.resolve({ data: [] }),
  ]);

  return <ReportsClient stats={stats} teamPerformance={team.data || []} isAdmin={isAdmin} />;
}
