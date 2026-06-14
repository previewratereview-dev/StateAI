import { requireAdmin } from "@/lib/auth";
import { getJobById } from "@/app/actions/jobs";
import JobForm from "@/components/crm/JobForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const result = await getJobById(id);
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 800 }}>
      <JobForm job={result.data} />
    </div>
  );
}