import { requireAuth } from "@/lib/auth";
import CRMSidebar from "@/components/crm/CRMSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "State AI CRM",
  description: "Customer Relationship Management — State AI",
};

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#08080c",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <CRMSidebar profile={profile} />

      <main
        style={{
          flex: 1,
          overflowX: "hidden",
          overflowY: "auto",
          minWidth: 0,
          position: "relative",
        }}
      >
        {/* Global subtle background */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background: `
              radial-gradient(ellipse 60% 40% at 80% 10%, rgba(99,102,241,0.04), transparent 55%),
              radial-gradient(ellipse 50% 35% at 20% 90%, rgba(139,92,246,0.03), transparent 55%)
            `,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </main>
    </div>
  );
}
