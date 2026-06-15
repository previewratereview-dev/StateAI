import { getContact } from "@/app/actions/contacts";
import { requireAuth } from "@/lib/auth";
import { notFound } from "next/navigation";
import ContactDetailClient from "@/components/crm/ContactDetail";
import { getContactStatusHistory } from "@/app/actions/interactions";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, result] = await Promise.all([requireAuth(), getContact(id)]);

  if (!result.data) notFound();

  const contact = result.data;
  const deals = (contact as any).deals || [];
  const notes = (contact as any).crm_notes || [];
  const activities = (contact as any).activities || [];
  const emails = (contact as any).emails || [];

  // Fetch status history
  const statusHistoryResult = await getContactStatusHistory(id);
  const statusHistory = statusHistoryResult.data || [];

  return (
    <ContactDetailClient 
      contact={contact} 
      deals={deals} 
      notes={notes} 
      activities={activities} 
      emails={emails} 
      statusHistory={statusHistory}
      profile={profile} 
    />
  );
}
