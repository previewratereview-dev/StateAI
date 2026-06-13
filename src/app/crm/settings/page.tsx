import { requireAdmin } from "@/lib/auth";
import { getProfiles } from "@/app/actions/settings";
import SettingsClient from "@/components/crm/Settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const [profile, profilesResult] = await Promise.all([
    requireAdmin(),
    getProfiles(),
  ]);

  return (
    <SettingsClient
      currentUser={profile}
      profiles={profilesResult.data || []}
    />
  );
}
