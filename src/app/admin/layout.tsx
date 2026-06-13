import type { Metadata } from "next";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "CRM Dashboard — State AI",
  description: "Internal CRM for managing bookings and client inquiries.",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#08080c" }}>
      {children}
    </div>
  );
}
