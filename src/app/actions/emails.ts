"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit-logger";
import { logTargetProgress } from "./targets";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

export async function getEmails(folder: "inbox" | "sent" | "archived" | "trash" = "inbox") {
  const profile = await requireAuth();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("emails")
    .select("*, contacts(id, first_name, last_name)")
    .eq("status", folder)
    .order("created_at", { ascending: false });

  // Sales users only see emails to/from their assigned mailbox
  if (profile.role === "sales" && profile.assigned_mailbox) {
    query = query.or(
      `to_addresses.cs.{"${profile.assigned_mailbox}"},from_address.eq.${profile.assigned_mailbox}`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load emails:", error);
    return { error: error.message };
  }
  return { data };
}

export async function sendEmail(formData: FormData) {
  const profile = await requireAuth();
  
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const bodyText = formData.get("body") as string;
  const fromBox = formData.get("fromBox") as string || "contact@stateai.in"; // default sender

  if (!to || !subject || !bodyText) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    const formDataFiles = formData.getAll("attachments") as File[];
    const attachments = [];
    const dbAttachments = [];
    
    for (const file of formDataFiles) {
      if (file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        attachments.push({
          filename: file.name,
          content: buffer,
        });
        dbAttachments.push({
          filename: file.name,
          size: file.size,
          url: "#" // Stored without public URL initially for metadata purposes
        });
      }
    }

    const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; color: #334155; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <div style="width: 100%; background-color: #F8FAFC; padding: 40px 20px; box-sizing: border-box;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
      <div style="background-color: #0F172A; padding: 24px 32px; text-align: left;">
        <div style="display: inline-block; vertical-align: middle;">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;">
            <rect width="100" height="100" rx="20" fill="black" />
            <path d="M28 75 L53 25 L61 38 L43 75 H28 Z" fill="white" />
            <path d="M54 50 L64 38 L80 75 H69 L61 57 Z" fill="white" />
          </svg>
          <span style="color: #F8FAFC; font-size: 18px; font-weight: 800; letter-spacing: -0.02em; margin-left: 10px; display: inline-block; vertical-align: middle; font-family: inherit;">StateAI</span>
        </div>
      </div>
      <div style="padding: 32px; line-height: 1.6; font-size: 15px; color: #334155;">
        ${bodyText
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;")
          .split(/\n\s*\n/)
          .map(para => `<p style="margin: 0 0 16px 0;">${para.replace(/\n/g, "<br>")}</p>`)
          .join("")}
      </div>
      <div style="background-color: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B;">
        Sent via <strong>StateAI CRM</strong>.<br>
        © ${new Date().getFullYear()} StateAI. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const resendPayload: any = {
      from: `State AI <${fromBox}>`,
      to: [to],
      subject: subject,
      text: bodyText,
      html: bodyHtml,
    };
    
    if (attachments.length > 0) {
      resendPayload.attachments = attachments;
    }

    // 1. Send via Resend
    const { data: resendData, error: resendError } = await resend.emails.send(resendPayload);

    if (resendError) {
      return { success: false, error: resendError.message };
    }

    // Audit and progress targets
    await logAuditAction("Email Sent", { to, subject });
    await logTargetProgress(profile.id, "followups", 1);

    // 2. Try to find if recipient is a contact
    const { data: contact } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("email", to)
      .single();

    // 3. Save to database as "sent"
    const { error: dbError } = await supabaseAdmin.from("emails").insert({
      message_id: resendData?.id,
      from_address: fromBox,
      from_name: profile.full_name || "State AI",
      to_addresses: [to],
      subject: subject,
      body_text: bodyText,
      status: "sent",
      contact_id: contact?.id || null,
      read: true,
      attachments: dbAttachments.length > 0 ? dbAttachments : null,
    });

    if (dbError) {
      console.error("Failed to save sent email to DB:", dbError);
      // Still return success since the email actually sent
    }

    if (contact) {
      await supabaseAdmin.from("activities").insert({
        type: "email",
        content: `Sent email: ${subject}`,
        contact_id: contact.id,
        created_by: profile.id,
      });
    }

    revalidatePath("/crm/mailbox");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { success: false, error: message };
  }
}

export async function updateEmailStatus(emailId: string, status: "inbox" | "sent" | "archived" | "trash") {
  await requireAuth();
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from("emails")
    .update({ status })
    .eq("id", emailId);
    
  if (error) return { success: false, error: error.message };
  revalidatePath("/crm/mailbox");
  return { success: true };
}

export async function markEmailRead(emailId: string) {
  await requireAuth();
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from("emails")
    .update({ read: true })
    .eq("id", emailId);
    
  if (error) return { success: false, error: error.message };
  revalidatePath("/crm/mailbox");
  return { success: true };
}
