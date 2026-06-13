import { getContacts } from "@/app/actions/contacts";
import { requireAuth } from "@/lib/auth";
import ContactsTable from "@/components/crm/ContactsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactsPage() {
  const [profile, result] = await Promise.all([requireAuth(), getContacts()]);
  return (
    <ContactsTable
      initialContacts={result.data || []}
      isAdmin={profile.role === "admin"}
    />
  );
}
