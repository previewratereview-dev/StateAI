import { getAllBookings } from "@/app/actions/crm";
import CRMDashboard from "@/components/CRMDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const result = await getAllBookings();

  return (
    <CRMDashboard
      initialBookings={result.data || []}
      fetchError={result.error}
    />
  );
}
