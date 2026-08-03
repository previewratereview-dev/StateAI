import { getContacts } from "@/app/actions/contacts";
import { getProfiles } from "@/app/actions/settings";
import { requireAuth } from "@/lib/auth";
import ContactsTable from "@/components/crm/ContactsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactsPage() {
  const [profile, result] = await Promise.all([requireAuth(), getContacts()]);
  const isAdmin = profile.role === "admin";
  const profiles = isAdmin
    ? (await getProfiles()).data || []
    : [{ id: profile.id, full_name: profile.full_name }];
  return (
    <ContactsTable
      initialContacts={result.data || []}
      isAdmin={isAdmin}
      profiles={profiles}
      currentUserId={profile.id}
    />
  );
}
