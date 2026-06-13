import { getDeals } from "@/app/actions/deals";
import { getContacts } from "@/app/actions/contacts";
import { requireAuth } from "@/lib/auth";
import DealsTable from "@/components/crm/DealsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DealsPage() {
  const [profile, dealsResult, contactsResult] = await Promise.all([
    requireAuth(),
    getDeals(),
    getContacts(),
  ]);

  const contacts = (contactsResult.data || []).map(c => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
  }));

  return (
    <DealsTable
      initialDeals={dealsResult.data || []}
      contacts={contacts}
      isAdmin={profile.role === "admin"}
    />
  );
}
