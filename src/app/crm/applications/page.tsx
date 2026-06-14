import { requireAdmin } from "@/lib/auth";
import { getAllApplications } from "@/app/actions/applications";
import ApplicationsClient from "@/components/crm/ApplicationsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ApplicationsPage() {
  const [profile, appsResult] = await Promise.all([
    requireAdmin(),
    getAllApplications(),
  ]);

  return (
    <div style={{ padding: "2rem" }}>
      <ApplicationsClient
        applications={appsResult.success ? appsResult.data || [] : []}
      />
    </div>
  );
}