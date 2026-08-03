"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import CRMSidebar from "./CRMSidebar";
import type { UserProfile } from "@/lib/auth";

export type CRMTheme = "dark" | "light";

export default function CRMShell({
  profile,
  initialTheme,
  children,
}: {
  profile: UserProfile;
  initialTheme: CRMTheme;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [theme, setTheme] = useState<CRMTheme>(initialTheme);

  const toggleTheme = useCallback(() => {
    const next: CRMTheme = theme === "dark" ? "light" : "dark";
    document.cookie = `crm-theme=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setTheme(next);
    router.refresh();
  }, [theme, router]);

  return (
    <div
      className="crm-shell"
      data-theme={theme}
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--crm-bg)",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <CRMSidebar profile={profile} theme={theme} onToggleTheme={toggleTheme} />

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
            background: "var(--crm-bg-glow)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </main>
    </div>
  );
}
