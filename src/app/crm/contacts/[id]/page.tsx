import { getContact } from "@/app/actions/contacts";
import { requireAuth } from "@/lib/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, result] = await Promise.all([requireAuth(), getContact(id)]);

  if (!result.data) notFound();

  const contact = result.data;
  const deals = (contact as any).deals || [];
  const notes = (contact as any).crm_notes || [];
  const activities = (contact as any).activities || [];

  const STATUS_CFG: Record<string, { label: string; color: string }> = {
    lead: { label: "Lead", color: "#f59e0b" },
    prospect: { label: "Prospect", color: "#6366f1" },
    customer: { label: "Customer", color: "#10b981" },
    churned: { label: "Churned", color: "#6b7280" },
  };

  const cfg = STATUS_CFG[contact.status] || STATUS_CFG.lead;

  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      {/* Back */}
      <a href="/crm/contacts" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#5d5e60", fontSize: "0.82rem", textDecoration: "none", marginBottom: "1.5rem" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Back to Contacts
      </a>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Left — Contact Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, padding: "1.5rem" }}>
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`, border: `1px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800, color: cfg.color, marginBottom: 12 }}>
                {(contact.first_name[0] || "") + (contact.last_name[0] || "")}
              </div>
              <h1 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fcfcfe", margin: 0, textAlign: "center" }}>
                {contact.first_name} {contact.last_name}
              </h1>
              {contact.job_title && <p style={{ color: "#818286", fontSize: "0.82rem", margin: "4px 0 0" }}>{contact.job_title}</p>}
              {contact.company && <p style={{ color: "#5d5e60", fontSize: "0.78rem", margin: "2px 0 0" }}>{contact.company}</p>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 12px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em", color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, marginTop: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
                {cfg.label}
              </span>
            </div>
            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "✉️", value: contact.email },
                { icon: "📞", value: contact.phone },
                { icon: "🔗", value: contact.website },
              ].filter(r => r.value).map(r => (
                <div key={r.icon} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.82rem", color: "#818286" }}>
                  <span>{r.icon}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Deals */}
          <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, padding: "1.25rem" }}>
            <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#5d5e60", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.875rem" }}>Deals ({deals.length})</h3>
            {deals.length === 0 ? <p style={{ color: "#3d3e40", fontSize: "0.8rem" }}>No deals linked</p> : deals.map((d: any) => (
              <div key={d.id} style={{ padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(177,178,180,0.06)", marginBottom: 6 }}>
                <div style={{ fontSize: "0.82rem", color: "#fcfcfe", fontWeight: 600 }}>{d.title}</div>
                <div style={{ fontSize: "0.72rem", color: "#5d5e60", marginTop: 2 }}>{d.stage} · ${(d.value || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Activity & Notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Notes */}
          <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fcfcfe", margin: "0 0 1rem" }}>Notes</h2>
            {contact.notes && (
              <div style={{ padding: "0.875rem", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(177,178,180,0.08)", fontSize: "0.875rem", color: "#b1b2b4", lineHeight: 1.65, marginBottom: 12 }}>
                {contact.notes}
              </div>
            )}
            {notes.length === 0 && !contact.notes && <p style={{ color: "#3d3e40", fontSize: "0.85rem" }}>No notes yet.</p>}
            {notes.map((n: any) => (
              <div key={n.id} style={{ padding: "0.875rem", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(177,178,180,0.08)", fontSize: "0.875rem", color: "#b1b2b4", lineHeight: 1.65, marginBottom: 8 }}>
                {n.body}
                <div style={{ fontSize: "0.7rem", color: "#3d3e40", marginTop: 6 }}>
                  {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>

          {/* Activity timeline */}
          <div style={{ background: "rgb(13 13 18 / 70%)", backdropFilter: "blur(20px)", border: "1px solid rgba(177,178,180,0.08)", borderRadius: 16, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fcfcfe", margin: "0 0 1rem" }}>Activity Timeline</h2>
            {activities.length === 0 ? (
              <p style={{ color: "#3d3e40", fontSize: "0.85rem" }}>No activity recorded yet.</p>
            ) : (
              <div style={{ position: "relative", paddingLeft: 24 }}>
                <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 1, background: "rgba(177,178,180,0.08)" }} />
                {activities.map((act: any) => (
                  <div key={act.id} style={{ position: "relative", marginBottom: "1rem" }}>
                    <div style={{ position: "absolute", left: -24, top: 4, width: 14, height: 14, borderRadius: "50%", background: "#1a1a24", border: "1px solid rgba(177,178,180,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>●</div>
                    <div style={{ fontSize: "0.82rem", color: "#b1b2b4" }}>{act.content || act.type.replace(/_/g, " ")}</div>
                    <div style={{ fontSize: "0.7rem", color: "#3d3e40", marginTop: 2 }}>
                      {new Date(act.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
