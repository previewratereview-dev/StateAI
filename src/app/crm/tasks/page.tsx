import { getTasks } from "@/app/actions/tasks";
import { getContacts } from "@/app/actions/contacts";
import { getDeals } from "@/app/actions/deals";
import { requireAuth } from "@/lib/auth";
import TasksBoard from "@/components/crm/TasksBoard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TasksPage() {
  const [profile, tasksResult, contactsResult, dealsResult] = await Promise.all([
    requireAuth(),
    getTasks(),
    getContacts(),
    getDeals(),
  ]);

  const contacts = (contactsResult.data || []).map(c => ({
    id: c.id,
    first_name: c.first_name,
    last_name: c.last_name,
  }));

  const deals = (dealsResult.data || []).map(d => ({
    id: d.id,
    title: d.title,
  }));

  return (
    <TasksBoard
      initialTasks={tasksResult.data || []}
      contacts={contacts}
      deals={deals}
      isAdmin={profile.role === "admin"}
    />
  );
}
