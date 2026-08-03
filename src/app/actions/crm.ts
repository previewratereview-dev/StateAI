/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string | null;
  purpose: string;
  meeting_date: string;
  meeting_time: string;
  duration: number;
  notes: string | null;
  status: BookingStatus;
  admin_notes: string | null;
}

export async function getAllBookings(): Promise<{
  success: boolean;
  data?: Booking[];
  error?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CRM fetch error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Booking[] };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || "Failed to fetch bookings" };
  }
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateAdminNotes(
  id: string,
  admin_notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ admin_notes })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteBooking(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}
