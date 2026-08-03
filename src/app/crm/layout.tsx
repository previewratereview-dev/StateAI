import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth";
import CRMShell from "@/components/crm/CRMShell";
import type { CRMTheme } from "@/components/crm/CRMShell";
import type { Metadata } from "next";
import "./crm-theme.css";

export const metadata: Metadata = {
  title: "State AI CRM",
  description: "Customer Relationship Management — State AI",
};

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, cookieStore] = await Promise.all([requireAuth(), cookies()]);
  const theme: CRMTheme =
    cookieStore.get("crm-theme")?.value === "light" ? "light" : "dark";

  return (
    <CRMShell profile={profile} initialTheme={theme}>
      {children}
    </CRMShell>
  );
}
