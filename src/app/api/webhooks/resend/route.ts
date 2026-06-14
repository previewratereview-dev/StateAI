import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend, type GetReceivingEmailResponseSuccess } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type ResendReceivedEmailWebhook = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    created_at?: string;
    from?: string;
    to?: string[] | string;
    bcc?: string[];
    cc?: string[];
    message_id?: string;
    messageId?: string;
    subject?: string;
    html?: string;
    text?: string;
    attachments?: unknown[];
  };
};

function toAddressList(value: string[] | string | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseEmailAddress(value: string) {
  const match = value.match(/^(?:"?([^"<]*)"?\s*)?<([^>]+)>$/);

  if (!match) {
    return { address: value.trim(), name: null };
  }

  const name = match[1]?.trim() || null;
  return { address: match[2].trim(), name };
}

async function getReceivedEmail(
  emailId: string | undefined
): Promise<GetReceivingEmailResponseSuccess | null> {
  if (!emailId || !process.env.RESEND_API_KEY) return null;

  const { data, error } = await resend.emails.receiving.get(emailId);
  if (error) {
    console.error("Failed to fetch received email body from Resend:", error);
    return null;
  }

  return data;
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ResendReceivedEmailWebhook;

    if (payload.type !== "email.received") {
      return NextResponse.json({ success: true, message: "Ignored non-inbound event" });
    }

    const eventData = payload.data ?? {};
    const receivedEmail: GetReceivingEmailResponseSuccess | null =
      await getReceivedEmail(eventData.email_id);

    const from = receivedEmail?.from || eventData.from;
    const toAddresses = receivedEmail?.to?.length
      ? receivedEmail.to
      : toAddressList(eventData.to);

    if (!from || toAddresses.length === 0) {
      return NextResponse.json(
        { error: "Missing sender or recipient in webhook payload" },
        { status: 400 }
      );
    }

    const subject = receivedEmail?.subject || eventData.subject || "No Subject";
    const messageId =
      receivedEmail?.message_id ||
      eventData.message_id ||
      eventData.messageId ||
      eventData.email_id ||
      null;
    const receivedAt =
      receivedEmail?.created_at ||
      eventData.created_at ||
      payload.created_at ||
      null;

    const { address: fromAddress, name: fromName } = parseEmailAddress(from);

    // Check if the sender matches an existing contact
    const { data: contact } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("email", fromAddress)
      .maybeSingle();

    // Process attachments
    const processedAttachments = [];
    const rawAttachments = receivedEmail?.attachments || [];

    for (const attachment of rawAttachments) {
      try {
        // @ts-ignore - The Resend SDK types might be outdated, but this API exists
        const { data: attachmentData, error: attachmentError } = await resend.emails.receiving.attachments.get({
          emailId: eventData.email_id!,
          id: attachment.id,
        });

        if (attachmentError || !attachmentData?.download_url) {
          console.error(`Failed to get download URL for attachment ${attachment.id}:`, attachmentError);
          continue;
        }

        // Fetch the file content from the download URL
        const fileResponse = await fetch(attachmentData.download_url);
        if (!fileResponse.ok) {
          console.error(`Failed to download attachment ${attachment.id} from Resend`);
          continue;
        }

        const buffer = await fileResponse.arrayBuffer();
        
        // Upload to Supabase Storage
        const filePath = `${eventData.email_id}/${attachment.filename}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("email-attachments")
          .upload(filePath, buffer, {
            contentType: attachment.content_type || "application/octet-stream",
            upsert: true,
          });

        if (uploadError) {
          console.error(`Failed to upload attachment ${attachment.id} to Supabase:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from("email-attachments")
          .getPublicUrl(filePath);

        processedAttachments.push({
          id: attachment.id,
          filename: attachment.filename,
          content_type: attachment.content_type,
          size: attachment.size,
          url: publicUrl,
        });
      } catch (err) {
        console.error(`Error processing attachment ${attachment.id}:`, err);
      }
    }

    const emailRecord: Record<string, unknown> = {
      message_id: messageId,
      from_address: fromAddress,
      from_name: fromName,
      to_addresses: toAddresses,
      subject,
      body_html: receivedEmail?.html || eventData.html || "",
      body_text: receivedEmail?.text || eventData.text || "",
      status: "inbox",
      thread_id: eventData.email_id || null,
      contact_id: contact?.id || null,
      read: false,
      attachments_count: processedAttachments.length,
      attachments: processedAttachments,
    };

    if (receivedAt) {
      emailRecord.created_at = receivedAt;
    }

    // Resend can retry successful deliveries, so keep inbound storage idempotent.
    const { error } = messageId
      ? await supabaseAdmin
          .from("emails")
          .upsert(emailRecord, { onConflict: "message_id" })
      : await supabaseAdmin.from("emails").insert(emailRecord);

    if (error) {
      console.error("Failed to insert email:", error);
      return NextResponse.json({ error: "Failed to store email" }, { status: 500 });
    }

    // Also create an activity record if contact exists
    if (contact) {
      await supabaseAdmin.from("activities").insert({
        type: "email",
        content: `Received email: ${subject}`,
        contact_id: contact.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    const message = error instanceof Error ? error.message : "Invalid webhook payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
