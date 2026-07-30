"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { logAuditAction } from "@/lib/audit-logger";
import { logTargetProgress } from "./targets";
import { createAdminNotification, createNotification } from "./notifications";
import { revalidatePath } from "next/cache";

export interface Quote {
  id: string;
  created_at: string;
  deal_id: string | null;
  contact_id: string | null;
  title: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "declined";
  created_by: string | null;
}

export interface Invoice {
  id: string;
  created_at: string;
  deal_id: string | null;
  contact_id: string | null;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  created_by: string | null;
}

export async function getQuotes(dealId?: string, contactId?: string): Promise<{ success: boolean; data?: Quote[]; error?: string }> {
  const profile = await requireAuth();

  try {
    let query = supabaseAdmin.from("quotes").select("*");

    if (dealId) query = query.eq("deal_id", dealId);
    if (contactId) query = query.eq("contact_id", contactId);

    // Sales restriction
    if (profile.role !== "admin") {
      query = query.eq("created_by", profile.id);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };

    return { success: true, data: data as Quote[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createQuote(formData: FormData): Promise<{ success: boolean; data?: Quote; error?: string }> {
  const profile = await requireAuth();

  const dealId = formData.get("deal_id") as string || null;
  const contactId = formData.get("contact_id") as string || null;
  const title = formData.get("title") as string;
  const amount = parseFloat(formData.get("amount") as string || "0");
  const status = (formData.get("status") as any) || "sent";

  if (!title || amount <= 0) {
    return { success: false, error: "Title and a valid amount are required." };
  }

  try {
    const payload = {
      deal_id: dealId,
      contact_id: contactId,
      title,
      amount,
      status,
      created_by: profile.id
    };

    const { data, error } = await supabaseAdmin
      .from("quotes")
      .insert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // Log action & audit
    await logAuditAction("Quote Sent", { title, amount, deal_id: dealId });
    await logTargetProgress(profile.id, "quotes", 1);
    await createAdminNotification("Quote Sent by Sales", `${profile.full_name} sent a quote of $${amount} for "${title}".`);

    revalidatePath(`/crm/contacts/${contactId}`);
    return { success: true, data: data as Quote };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateQuoteStatus(id: string, status: "draft" | "sent" | "accepted" | "declined"): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();

  try {
    // Check ownership for sales
    const { data: existing } = await supabaseAdmin.from("quotes").select("created_by, title, amount, deal_id, contact_id").eq("id", id).single();
    if (existing && profile.role !== "admin" && existing.created_by !== profile.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabaseAdmin
      .from("quotes")
      .update({ status })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    await logAuditAction(`Quote Status Updated: ${status}`, { quote_id: id, status });

    if (status === "accepted" && existing) {
      // Create invoice automatically when quote is accepted
      const invoicePayload = {
        deal_id: existing.deal_id || null,
        contact_id: existing.contact_id || null,
        amount: existing.amount,
        status: "sent",
        created_by: profile.id
      };
      await supabaseAdmin.from("invoices").insert(invoicePayload);
      await createNotification(existing.created_by || profile.id, "Quote Accepted!", `Your quote "${existing.title}" was accepted. Invoice created!`, "success");
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getInvoices(dealId?: string, contactId?: string): Promise<{ success: boolean; data?: Invoice[]; error?: string }> {
  const profile = await requireAuth();

  try {
    let query = supabaseAdmin.from("invoices").select("*");

    if (dealId) query = query.eq("deal_id", dealId);
    if (contactId) query = query.eq("contact_id", contactId);

    // Sales restriction
    if (profile.role !== "admin") {
      query = query.eq("created_by", profile.id);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };

    return { success: true, data: data as Invoice[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createInvoice(formData: FormData): Promise<{ success: boolean; data?: Invoice; error?: string }> {
  const profile = await requireAuth();

  const dealId = formData.get("deal_id") as string || null;
  const contactId = formData.get("contact_id") as string || null;
  const amount = parseFloat(formData.get("amount") as string || "0");
  const status = (formData.get("status") as any) || "sent";

  if (amount <= 0) {
    return { success: false, error: "Valid amount is required." };
  }

  try {
    const payload = {
      deal_id: dealId,
      contact_id: contactId,
      amount,
      status,
      created_by: profile.id
    };

    const { data, error } = await supabaseAdmin
      .from("invoices")
      .insert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditAction("Invoice Created", { amount, deal_id: dealId });

    revalidatePath(`/crm/contacts/${contactId}`);
    return { success: true, data: data as Invoice };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateInvoiceStatus(id: string, status: "draft" | "sent" | "paid" | "overdue"): Promise<{ success: boolean; error?: string }> {
  const profile = await requireAuth();

  try {
    // Check ownership for sales
    const { data: existing } = await supabaseAdmin.from("invoices").select("created_by, amount").eq("id", id).single();
    if (existing && profile.role !== "admin" && existing.created_by !== profile.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabaseAdmin
      .from("invoices")
      .update({ status })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    await logAuditAction(`Invoice Status Updated: ${status}`, { invoice_id: id, status });

    if (status === "paid" && existing) {
      // Progress target revenue progress
      await logTargetProgress(existing.created_by || profile.id, "revenue", existing.amount);
      await createNotification(existing.created_by || profile.id, "Deal Paid!", `Invoice of $${existing.amount} was paid. Revenue recorded!`, "success");
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
