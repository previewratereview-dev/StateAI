import { getContacts } from "@/app/actions/contacts";
import { getProfiles } from "@/app/actions/settings";
import { requireAuth } from "@/lib/auth";
import ContactsTable from "@/components/crm/ContactsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactsPage() {
  const profile = await requireAuth();
  const [result, profilesResult] = await Promise.all([
    getContacts(),
    getProfiles()
  ]);

  return (
    <ContactsTable
      initialContacts={result.data || []}
      isAdmin={profile.role === "admin"}
      salespeople={profilesResult.data || []}
    />
  );
}
