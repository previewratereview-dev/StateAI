import { requireAdmin } from "@/lib/auth";
import { getAllJobs } from "@/app/actions/jobs";
import JobsClient from "@/components/crm/JobsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function JobsListPage() {
  const [_profile, jobsResult] = await Promise.all([
    requireAdmin(),
    getAllJobs(),
  ]);

  return (
    <div style={{ padding: "2rem" }}>
      <JobsClient
        jobs={jobsResult.success ? jobsResult.data || [] : []}
        error={!jobsResult.success ? jobsResult.error : undefined}
      />
    </div>
  );
}