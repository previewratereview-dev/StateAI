"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function brandedEmail(bodyText: string, useCid: boolean = false): string {
  const safe = bodyText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  const logoSrc = useCid ? "cid:logo" : `${APP_URL}/stateai-logo.png`;
  const bannerSrc = useCid ? "cid:banner" : `${APP_URL}/banner-image.png`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;padding:40px 16px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
<tr><td style="padding:24px 32px 20px;border-bottom:1px solid #f3f4f6">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="left" valign="middle" style="width:32px"><img src="${logoSrc}" width="32" height="32" alt="State AI" style="display:block;border-radius:8px;border:1px solid #e5e7eb;background-color:#ffffff"></td>
<td align="left" valign="middle" style="padding-left:12px"><div style="font-family:'Playfair Display', Georgia, serif;font-size:16px;font-weight:700;color:#111827;font-style:italic">State AI</div></td>
</tr></table>
</td></tr>
<tr><td style="padding:64px 40px 80px;font-size:15px;line-height:1.6;color:#374151;white-space:pre-wrap;word-break:break-word">${safe}</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin-top:24px">
<tr><td align="center" style="padding:0"><img src="${bannerSrc}" width="320" alt="State AI Banner" style="display:block;width:100%;max-width:320px;height:auto;border:0;border-radius:8px;opacity:0.9"></td></tr>
<tr><td style="padding:16px 32px 0;font-size:12px;color:#9ca3af;line-height:1.5;text-align:center">Sent via State AI CRM</td></tr>
</table>
</td></tr></table></body></html>`;
}

export async function getEmails(folder: "inbox" | "sent" | "archived" | "trash" = "inbox") {
  const profile = await requireAuth();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("emails")
    .select("id, from_address, from_name, to_addresses, subject, body_text, read, created_at, contact_id, status, attachments")
    .eq("status", folder)
    .order("created_at", { ascending: false })
    .limit(50);

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

export async function getEmail(emailId: string) {
  const profile = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("emails")
    .select("*, contacts(id, first_name, last_name)")
    .eq("id", emailId)
    .single();

  if (error) {
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

    const resendPayload: any = {
      from: `State AI <${fromBox}>`,
      to: [to],
      subject: subject,
      html: brandedEmail(bodyText, true),
      text: bodyText,
    };
    
    try {
      const logoPath = path.join(process.cwd(), "public", "stateai-logo.png");
      const bannerPath = path.join(process.cwd(), "public", "banner-image.png");
      if (fs.existsSync(logoPath)) {
        attachments.push({ filename: "stateai-logo.png", content: fs.readFileSync(logoPath), content_id: "logo" });
      }
      if (fs.existsSync(bannerPath)) {
        attachments.push({ filename: "banner-image.png", content: fs.readFileSync(bannerPath), content_id: "banner" });
      }
    } catch (e) {
      console.error("Failed to load inline images", e);
    }
    
    if (attachments.length > 0) {
      resendPayload.attachments = attachments;
    }

    // 1. Send via Resend
    const { data: resendData, error: resendError } = await resend.emails.send(resendPayload);

    if (resendError) {
      return { success: false, error: resendError.message };
    }

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
      body_html: brandedEmail(bodyText, false),
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
