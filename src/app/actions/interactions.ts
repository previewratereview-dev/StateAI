"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { InteractionChannel, LeadStatus } from "@/lib/interaction-types";

// Feature toggle: set AUTO_CREATE_DEALS_ON_STATUS=false to disable auto-creation
const AUTO_CREATE = process.env.AUTO_CREATE_DEALS_ON_STATUS !== "false";

// Map interaction outcomes to deal stages (used for interaction-driven creation)
const OUTCOME_TO_STAGE: Record<string, string> = {
  interested: "qualified",
  demo_scheduled: "proposal",
  demo_completed: "proposal",
};

export async function logInteraction(formData: FormData) {
  const profile = await requireAuth();
  const contactId = formData.get("contactId") as string;
  const channel = formData.get("channel") as InteractionChannel;
  const content = formData.get("content") as string;
  const outcome = formData.get("outcome") as string;
  const followUpDate = formData.get("followUpDate") as string;

  if (!contactId || !channel || !content) {
    return { success: false, error: "Missing required fields" };
  }

  // Check lock / claim status on the contact. If it's locked by another active user, deny.
  const { data: contactLock } = await supabaseAdmin
    .from("contacts")
    .select("assigned_to, locked_by, locked_at")
    .eq("id", contactId)
    .single();

  try {
    const now = Date.now();
    let lockExpired = true;
    if (contactLock?.locked_at) {
      const lockedAt = new Date(contactLock.locked_at).getTime();
      lockExpired = lockedAt + 15 * 60 * 1000 < now; // 15 minute TTL
    }

    if (contactLock?.locked_by && contactLock.locked_by !== profile.id && !lockExpired && profile.role !== "admin") {
      return { success: false, error: "Contact is locked by another user" };
    }
  } catch (e) {
    // ignore lock-check errors and proceed
  }

  try {
    const { error: activityError } = await supabaseAdmin.from("activities").insert({
      type: channel === "note" ? "note" : channel,
      content: content,
      contact_id: contactId,
      created_by: profile.id,
      metadata: {
        channel,
        outcome: outcome || null,
        follow_up_date: followUpDate || null,
      },
    });

    if (activityError) {
      return { success: false, error: activityError.message };
    }

    // If this is a first interaction, auto-update contact status to "contacted"
    const { count } = await supabaseAdmin
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("contact_id", contactId);

    if (count !== null && count <= 1) {
      await updateContactStatus(contactId, "contacted", "First interaction logged");
    }

    // Claim the contact for the current user (set lock)
    try {
      await supabaseAdmin
        .from("contacts")
        .update({ locked_by: profile.id, locked_at: new Date().toISOString() })
        .eq("id", contactId);
    } catch (e) {
      // non-fatal
    }

    // Interaction-driven creation: if the interaction outcome indicates strong interest,
    // optionally create a deal (if auto-create enabled and no active deals exist).
    if (AUTO_CREATE && outcome) {
      const outcomeKey = outcome.toLowerCase();
      const targetStage = OUTCOME_TO_STAGE[outcomeKey];
      if (targetStage) {
        // Fetch contact to attribute assignment and title
        const { data: contact } = await supabaseAdmin
          .from("contacts")
          .select("assigned_to, first_name, last_name, company")
          .eq("id", contactId)
          .single();

        // Check for linked active deals
        const { data: linkedDeals } = await supabaseAdmin
          .from("deals")
          .select("id, stage")
          .eq("contact_id", contactId);

        const hasActive = (linkedDeals || []).some((d: any) => !["won", "lost"].includes(d.stage));

        if (!hasActive) {
          const namePart = (contact?.first_name || contact?.last_name) ? `${(contact?.first_name || "").trim()} ${(contact?.last_name || "").trim()}`.trim() : null;
          const title = namePart ? `${namePart} — Opportunity` : (contact?.company ? `${contact.company} — Opportunity` : `Opportunity`);
          const assigned_to = contact?.assigned_to || profile.id;
          const probability =
            targetStage === "won" ? 100 :
            targetStage === "lost" ? 0 :
            targetStage === "qualified" ? 25 :
            targetStage === "proposal" ? 50 :
            targetStage === "negotiation" ? 75 :
            targetStage === "new" ? 10 : 0;

          const { data: createdDeal, error: createError } = await supabaseAdmin
            .from("deals")
            .insert({
              title,
              contact_id: contactId,
              value: 0,
              stage: targetStage,
              probability,
              expected_close_date: null,
              description: null,
              assigned_to,
              created_by: profile.id,
            })
            .select()
            .single();

          if (!createError && createdDeal) {
            const { error: aErr } = await supabaseAdmin.from("activities").insert({
              type: "deal_created",
              content: `Auto-created deal "${createdDeal.title}" from interaction outcome \"${outcome}\"`,
              contact_id: contactId,
              deal_id: createdDeal.id,
              created_by: profile.id,
              metadata: {
                auto_created: true,
                sync_source: "interaction_outcome",
                outcome,
                target_stage: targetStage,
              },
            });

            if (aErr) console.error("Failed to log auto-created deal activity (interaction):", aErr);
            revalidatePath("/crm/deals");
            revalidatePath("/crm/leads");
          } else if (createError) {
            console.error("Failed to auto-create deal (interaction):", createError);
          }
        }
      }
    }

    revalidatePath(`/crm/contacts/${contactId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to log interaction";
    return { success: false, error: message };
  }
}

export async function updateContactStatus(
  contactId: string,
  newStatus: LeadStatus,
  reason?: string
) {
  const profile = await requireAuth();

  try {
    // Get current status and useful contact fields for attribution/creation
    const { data: contact } = await supabaseAdmin
      .from("contacts")
      .select("status, assigned_to, first_name, last_name, company, locked_by, locked_at")
      .eq("id", contactId)
      .single();

    if (!contact) {
      return { success: false, error: "Contact not found" };
    }

    const oldStatus = contact.status;

    // Enforce hybrid permission model: only admin, assigned_to, or lock owner can change core fields
    try {
      const now = Date.now();
      let lockExpired = true;
      if (contact?.locked_at) {
        const lockedAt = new Date(contact.locked_at).getTime();
        lockExpired = lockedAt + 15 * 60 * 1000 < now;
      }
      if (contact?.locked_by && contact.locked_by !== profile.id && !lockExpired && profile.role !== "admin") {
        return { success: false, error: "Contact is locked by another user" };
      }
      if (profile.role !== "admin" && contact.assigned_to && contact.assigned_to !== profile.id && contact.locked_by !== profile.id) {
        // Not assigned, not lock owner, not admin
        return { success: false, error: "Not authorized to change contact status" };
      }
    } catch (e) {
      // swallow permission check errors and proceed conservatively
    }

    if (oldStatus === newStatus) {
      return { success: true };
    }

    // Update contact status
    const { error: updateError } = await supabaseAdmin
      .from("contacts")
      .update({ status: newStatus })
      .eq("id", contactId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Record in status history
    const { error: historyError } = await supabaseAdmin
      .from("contact_status_history")
      .insert({
        contact_id: contactId,
        from_status: oldStatus,
        to_status: newStatus,
        changed_by: profile.id,
        reason: reason || null,
      });

    if (historyError) {
      console.error("Failed to record status history:", historyError);
    }

    // Log as activity
    const { error: activityError } = await supabaseAdmin.from("activities").insert({
      type: "status_change",
      content: `Status changed from "${oldStatus}" to "${newStatus}"${reason ? `: ${reason}` : ""}`,
      contact_id: contactId,
      created_by: profile.id,
      metadata: {
        from_status: oldStatus,
        to_status: newStatus,
        reason: reason || null,
      },
    });

    if (activityError) {
      console.error("Failed to log status change activity:", activityError);
    }

    // ── Sync with Deal Pipeline ─────────────────────────────────────────────
    // Map contact status to a valid deal stage (if applicable)
    const STATUS_TO_DEAL_STAGE: Record<string, string | null> = {
      new: null,
      contacted: "new",
      qualified: "qualified",
      proposal: "proposal",
      negotiation: "negotiation",
      won: "won",
      lost: "lost",
      churned: null,
    };

    const targetDealStage = STATUS_TO_DEAL_STAGE[newStatus];

    if (targetDealStage) {
      // Find linked deals for this contact and update their stage
      const { data: linkedDeals } = await supabaseAdmin
        .from("deals")
        .select("id, stage, title, assigned_to")
        .eq("contact_id", contactId);

      if (linkedDeals && linkedDeals.length > 0) {
        // Update all linked deals to the new stage
        for (const deal of linkedDeals) {
          if (deal.stage !== targetDealStage) {
            const { error: dealError } = await supabaseAdmin
              .from("deals")
              .update({
                stage: targetDealStage,
                probability:
                  targetDealStage === "won" ? 100 :
                  targetDealStage === "lost" ? 0 :
                  targetDealStage === "qualified" ? 25 :
                  targetDealStage === "proposal" ? 50 :
                  targetDealStage === "negotiation" ? 75 :
                  targetDealStage === "new" ? 10 : 0,
              })
              .eq("id", deal.id);

            if (!dealError) {
              // Log deal stage change as activity
              await supabaseAdmin.from("activities").insert({
                type: "status_change",
                content: `Deal "${deal.title}" stage updated to "${targetDealStage}" (synced from contact status)`,
                contact_id: contactId,
                deal_id: deal.id,
                created_by: profile.id,
                metadata: {
                  from_status: deal.stage,
                  to_status: targetDealStage,
                  sync_source: "contact_status_change",
                },
              });
            }
          }
        }
        revalidatePath("/crm/deals");
        revalidatePath("/crm/leads");
      } else {
        // No linked deals: optionally auto-create a new deal for key status transitions
        const AUTO_CREATE_TRIGGERS = ["qualified", "proposal", "negotiation", "won"];
        if (AUTO_CREATE && AUTO_CREATE_TRIGGERS.includes(newStatus)) {
          // Build a friendly title
          const namePart = (contact.first_name || contact.last_name) ? `${(contact.first_name || "").trim()} ${(contact.last_name || "").trim()}`.trim() : null;
          const title = namePart ? `${namePart} — Opportunity` : (contact.company ? `${contact.company} — Opportunity` : `Opportunity`);

          const assigned_to = contact.assigned_to || profile.id;
          const probability =
            targetDealStage === "won" ? 100 :
            targetDealStage === "lost" ? 0 :
            targetDealStage === "qualified" ? 25 :
            targetDealStage === "proposal" ? 50 :
            targetDealStage === "negotiation" ? 75 :
            targetDealStage === "new" ? 10 : 0;

          const { data: createdDeal, error: createError } = await supabaseAdmin
            .from("deals")
            .insert({
              title,
              contact_id: contactId,
              value: 0,
              stage: targetDealStage,
              probability,
              expected_close_date: null,
              description: null,
              assigned_to,
              created_by: profile.id,
            })
            .select()
            .single();

          if (!createError && createdDeal) {
            const { error: aErr } = await supabaseAdmin.from("activities").insert({
              type: "deal_created",
              content: `Auto-created deal "${createdDeal.title}" from contact status change`,
              contact_id: contactId,
              deal_id: createdDeal.id,
              created_by: profile.id,
              metadata: {
                auto_created: true,
                sync_source: "contact_status_change",
                target_stage: targetDealStage,
              },
            });

            if (aErr) console.error("Failed to log auto-created deal activity:", aErr);
            revalidatePath("/crm/deals");
            revalidatePath("/crm/leads");
          } else if (createError) {
            console.error("Failed to auto-create deal:", createError);
          }
        }
      }
    }

    revalidatePath(`/crm/contacts/${contactId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update status";
    return { success: false, error: message };
  }
}

export async function getContactStatusHistory(contactId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("contact_status_history")
      .select("*, profiles(full_name)")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });

    if (error) return { error: error.message };
    return { data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getContactInteractions(contactId: string) {
  try {
    const { data: activities, error: activityError } = await supabaseAdmin
      .from("activities")
      .select("*, profiles!activities_created_by_fkey(full_name)")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });

    if (activityError) return { error: activityError.message };

    const { data: statusHistory, error: statusError } = await supabaseAdmin
      .from("contact_status_history")
      .select("*, profiles(full_name)")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });

    if (statusError) return { error: statusError.message };

    return {
      activities: activities || [],
      statusHistory: statusHistory || [],
    };
  } catch (err: any) {
    return { error: err.message };
  }
}
