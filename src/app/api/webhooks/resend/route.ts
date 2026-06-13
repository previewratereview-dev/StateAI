import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Resend inbound webhook structure
    // payload.type = "email.received"
    // payload.data contains from, to, subject, html, text

    if (payload.type !== "email.received") {
      return NextResponse.json({ success: true, message: "Ignored non-inbound event" });
    }

    const { from, to, subject, html, text, messageId } = payload.data;

    // We can extract the actual email address if it comes as "Name <email@domain.com>"
    const fromAddressMatch = from.match(/<(.+)>/);
    const fromAddress = fromAddressMatch ? fromAddressMatch[1] : from;
    const fromName = fromAddressMatch ? from.replace(/<.+>/, "").trim() : from;

    // Check if the sender matches an existing contact
    const { data: contact } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("email", fromAddress)
      .single();

    // Insert into emails table
    const { error } = await supabaseAdmin.from("emails").insert({
      message_id: messageId,
      from_address: fromAddress,
      from_name: fromName,
      to_addresses: Array.isArray(to) ? to : [to],
      subject: subject || "No Subject",
      body_html: html || "",
      body_text: text || "",
      status: "inbox",
      contact_id: contact?.id || null,
      read: false,
    });

    if (error) {
      console.error("Failed to insert email:", error);
      return NextResponse.json({ error: "Failed to store email" }, { status: 500 });
    }

    // Also create an activity record if contact exists
    if (contact) {
      await supabaseAdmin.from("activities").insert({
        type: "email",
        content: `Received email: ${subject || "No Subject"}`,
        contact_id: contact.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
