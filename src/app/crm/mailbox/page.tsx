import { requireAuth } from "@/lib/auth";
import { getEmails } from "@/app/actions/emails";
import MailboxClient from "@/components/crm/Mailbox";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MailboxPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAuth();
  
  // By default, fetch inbox
  const folderParam = (await searchParams).folder;
  const folder = (folderParam as any) || "inbox";
  
  const emailsResult = await getEmails(folder);

  return (
    <MailboxClient 
      initialEmails={emailsResult.data || []} 
      currentFolder={folder}
      currentUser={profile}
    />
  );
}
