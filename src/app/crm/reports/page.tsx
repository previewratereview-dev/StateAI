import { requireAuth } from "@/lib/auth";
import { getDashboardStats } from "@/app/actions/settings";
import ReportsClient from "@/components/crm/Reports";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage() {
  const [profile, stats] = await Promise.all([requireAuth(), getDashboardStats()]);
  return <ReportsClient stats={stats} isAdmin={profile.role === "admin"} />;
}
