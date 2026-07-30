import { supabaseAdmin } from "@/lib/supabase-admin";
import { getProfile } from "@/lib/auth";

export async function logAuditAction(action: string, metadata: any = {}) {
  try {
    const profile = await getProfile();
    if (!profile) return; // Non-authenticated actions not logged in audit_logs

    const { headers } = await import("next/headers");
    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent") || "";
    const ipAddress = reqHeaders.get("x-forwarded-for")?.split(",")[0] || 
                      reqHeaders.get("x-real-ip") || 
                      "127.0.0.1";

    // Deduce OS, Browser, Device from user-agent
    let os = "Unknown OS";
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS X")) os = "macOS";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
    else if (userAgent.includes("Linux")) os = "Linux";

    let browser = "Unknown Browser";
    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Chrome") && !userAgent.includes("Chromium") && !userAgent.includes("Edg")) browser = "Chrome";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
    else if (userAgent.includes("Edg")) browser = "Edge";
    else if (userAgent.includes("Trident") || userAgent.includes("MSIE")) browser = "Internet Explorer";

    let device = "Desktop";
    if (userAgent.includes("Mobi") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      device = "Mobile";
    } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
      device = "Tablet";
    }

    // Insert into audit_logs
    await supabaseAdmin.from("audit_logs").insert({
      user_id: profile.id,
      action,
      ip_address: ipAddress,
      user_agent: userAgent,
      browser,
      os,
      device,
      metadata
    });

    // Mirror to activities log as a live activity stream record for CRM
    await supabaseAdmin.from("activities").insert({
      type: "audit_log",
      content: `${profile.full_name || profile.email}: ${action}`,
      created_by: profile.id,
      metadata: { ...metadata, action, ip: ipAddress, device }
    });

  } catch (err) {
    console.error("Failed to log audit action:", err);
  }
}
