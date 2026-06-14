import { requireAdmin } from "@/lib/auth";
import JobForm from "@/components/crm/JobForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewJobPage() {
  await requireAdmin();

  return (
    <div style={{ padding: "2rem", maxWidth: 800 }}>
      <JobForm />
    </div>
  );
}