"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function globalSearch(queryText: string) {
  const profile = await requireAuth();
  if (!queryText || queryText.trim() === "") return { contacts: [], deals: [], tasks: [] };

  const searchPattern = `%${queryText}%`;

  try {
    // 1. Search Contacts
    let contactsQuery = supabaseAdmin
      .from("contacts")
      .select("id, first_name, last_name, company, email");
    
    if (profile.role !== "admin") {
      contactsQuery = contactsQuery.eq("assigned_to", profile.id);
    }
    const { data: contacts } = await contactsQuery.or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},company.ilike.${searchPattern},email.ilike.${searchPattern}`).limit(5);

    // 2. Search Deals
    let dealsQuery = supabaseAdmin
      .from("deals")
      .select("id, title, value, stage");
    
    if (profile.role !== "admin") {
      dealsQuery = dealsQuery.eq("assigned_to", profile.id);
    }
    const { data: deals } = await dealsQuery.ilike("title", searchPattern).limit(5);

    // 3. Search Tasks
    let tasksQuery = supabaseAdmin
      .from("tasks")
      .select("id, title, status");
    
    if (profile.role !== "admin") {
      tasksQuery = tasksQuery.eq("assigned_to", profile.id);
    }
    const { data: tasks } = await tasksQuery.ilike("title", searchPattern).limit(5);

    return {
      contacts: contacts || [],
      deals: deals || [],
      tasks: tasks || []
    };
  } catch (err) {
    console.error("Global search error:", err);
    return { contacts: [], deals: [], tasks: [] };
  }
}
