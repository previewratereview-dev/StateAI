/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);

function brandedEmail(bodyText: string): string {
  const safe = bodyText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:580px;margin:0 auto;padding:32px 24px">
<div style="padding-bottom:16px;margin-bottom:24px;border-bottom:1px solid #eee">
<span style="font-size:15px;font-weight:700;color:#111;letter-spacing:-0.3px">State AI</span>
</div>
<div style="font-size:15px;line-height:1.7;color:#222;padding-bottom:40px">${safe}</div>
<div style="border-top:1px solid #eee;padding-top:16px;font-size:12px;color:#999">State AI &middot; stateai.in</div>
</div>
</body></html>`;
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
  await requireAuth();
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
      html: brandedEmail(bodyText),
      text: bodyText,
    };
    
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
      body_html: brandedEmail(bodyText),
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
