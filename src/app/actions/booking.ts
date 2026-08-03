/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export interface BookingInput {
  name: string;
  email: string;
  company?: string;
  purpose: string;
  meeting_date: string; // YYYY-MM-DD
  meeting_time: string; // e.g., "10:00 AM"
  duration: number; // minutes
  notes?: string;
}

export async function createBooking(data: BookingInput) {
  try {
    // Server-side validation
    if (
      !data.name ||
      !data.email ||
      !data.purpose ||
      !data.meeting_date ||
      !data.meeting_time ||
      !data.duration
    ) {
      return { success: false, error: "All required fields must be filled." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    // Insert into Supabase
    const { data: result, error } = await supabase
      .from("bookings")
      .insert([
        {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          company: data.company?.trim() || null,
          purpose: data.purpose,
          meeting_date: data.meeting_date,
          meeting_time: data.meeting_time,
          duration: Number(data.duration),
          notes: data.notes?.trim() || null,
          status: "pending", // Default status for CRM pipeline
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert database error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
  } catch (err: unknown) {
    console.error("Booking action handler exception:", err);
    return {
      success: false,
      error: (err as Error).message || "A server exception occurred while booking.",
    };
  }
}
