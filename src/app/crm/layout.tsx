import { requireAuth } from "@/lib/auth";
import CRMSidebar from "@/components/crm/CRMSidebar";
import CRMHeader from "@/components/crm/CRMHeader";
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
        background: "#F8FAFC",
        color: "#1E293B",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <CRMSidebar profile={profile} />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          overflowY: "auto",
          minWidth: 0,
          position: "relative",
          height: "100vh",
        }}
      >
        <CRMHeader profile={profile} />

        {/* Children content area */}
        <div style={{ flex: 1, position: "relative", zIndex: 1, padding: 0 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
