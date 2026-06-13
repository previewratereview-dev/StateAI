"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getEmails(folder: "inbox" | "sent" | "archived" | "trash" = "inbox") {
  const profile = await requireAuth();
  const supabase = await createSupabaseServerClient();

  // If the user doesn't have mailbox permissions, block them (assuming roles table setup allows this check later, 
  // for now we let everyone who is authenticated view the shared inbox)

  const { data, error } = await supabase
    .from("emails")
    .select("*, contacts(id, first_name, last_name, avatar_url)")
    .eq("status", folder)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
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
    // 1. Send via Resend
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: `State AI <${fromBox}>`,
      to: [to],
      subject: subject,
      text: bodyText,
    });

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
      status: "sent",
      contact_id: contact?.id || null,
      read: true,
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
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send email" };
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
