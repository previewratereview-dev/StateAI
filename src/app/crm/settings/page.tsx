import { requireAdmin } from "@/lib/auth";
import { getProfiles, getRoles } from "@/app/actions/settings";
import SettingsClient from "@/components/crm/Settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const [profile, profilesResult, rolesResult] = await Promise.all([
    requireAdmin(),
    getProfiles(),
    getRoles(),
  ]);

  return (
    <SettingsClient
      currentUser={profile}
      profiles={profilesResult.data || []}
      roles={rolesResult.data || []}
    />
  );
}
