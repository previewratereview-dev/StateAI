import { getDashboardStats } from "@/app/actions/settings";
import { requireAuth } from "@/lib/auth";
import DashboardClient from "@/components/crm/Dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const [profile, stats] = await Promise.all([
    requireAuth(),
    getDashboardStats(),
  ]);

  return <DashboardClient profile={profile} stats={stats} />;
}
