export type InteractionChannel =
  | "email"
  | "social_dm"
  | "cold_call"
  | "whatsapp"
  | "linkedin_message"
  | "sms"
  | "meeting"
  | "call"
  | "other_interaction"
  | "note";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost"
  | "churned";

export const CHANNEL_LABELS: Record<InteractionChannel, string> = {
  email: "Email",
  social_dm: "Social Media DM",
  cold_call: "Cold Call",
  whatsapp: "WhatsApp",
  linkedin_message: "LinkedIn Message",
  sms: "SMS",
  meeting: "Meeting",
  call: "Phone Call",
  other_interaction: "Other Interaction",
  note: "Note",
};

export const CHANNEL_ICONS: Record<InteractionChannel, string> = {
  email: "✉️",
  social_dm: "📱",
  cold_call: "📞",
  whatsapp: "💬",
  linkedin_message: "🔗",
  sms: "📨",
  meeting: "🤝",
  call: "📞",
  other_interaction: "📌",
  note: "📝",
};
