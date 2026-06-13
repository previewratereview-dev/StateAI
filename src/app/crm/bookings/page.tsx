import { getAllBookings } from "@/app/actions/crm";
import { requireAuth } from "@/lib/auth";
import CRMDashboard from "@/components/CRMDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BookingsPage() {
  const [, result] = await Promise.all([requireAuth(), getAllBookings()]);
  return (
    <CRMDashboard
      initialBookings={result.data || []}
      fetchError={result.error}
    />
  );
}
