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
