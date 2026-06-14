import { getActiveJobs } from "@/app/actions/jobs";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Careers - State AI",
  description: "Join the State AI team — explore open positions and help us shape the future of AI-powered solutions.",
};

const DEPARTMENT_COLORS: Record<string, string> = {
  Engineering: "rgba(99,102,241,0.15)",
  "Data Science": "rgba(16,185,129,0.15)",
  Design: "rgba(244,63,94,0.15)",
  Marketing: "rgba(245,158,11,0.15)",
  Sales: "rgba(168,85,247,0.15)",
  Operations: "rgba(14,165,233,0.15)",
  Management: "rgba(236,72,153,0.15)",
  Legal: "rgba(239,68,68,0.15)",
};

function getDepartmentColor(department: string): string {
  return DEPARTMENT_COLORS[department] || "rgba(99,102,241,0.1)";
}

function formatSalary(job: { salary_min: number | null; salary_max: number | null; salary_currency: string }): string | null {
  if (!job.salary_min && !job.salary_max) return null;
  const currency = job.salary_currency || "USD";
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency + " ";
  if (job.salary_min && job.salary_max) {
    return `${symbol}${(job.salary_min / 1000).toFixed(0)}K - ${symbol}${(job.salary_max / 1000).toFixed(0)}K`;
  }
  if (job.salary_min) return `From ${symbol}${(job.salary_min / 1000).toFixed(0)}K`;
  return `Up to ${symbol}${(job.salary_max! / 1000).toFixed(0)}K`;
}

function getTypeBadgeStyle(type: string) {
  const styles: Record<string, { bg: string; color: string }> = {
    "full-time": { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
    "part-time": { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    contract: { bg: "rgba(99,102,241,0.12)", color: "#818cf8" },
    internship: { bg: "rgba(236,72,153,0.12)", color: "#ec4899" },
    freelance: { bg: "rgba(168,85,247,0.12)", color: "#a855f7" },
    commission: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  };
  return styles[type] || styles["full-time"];
}

export default async function CareersPage() {
  const result = await getActiveJobs();
  const jobs = result.success && result.data ? result.data : [];

  // Group jobs by department
  const departments = new Map<string, typeof jobs>();
  for (const job of jobs) {
    const dept = job.department || "Other";
    if (!departments.has(dept)) departments.set(dept, []);
    departments.get(dept)!.push(job);
  }

  const totalCount = jobs.length;

  return (
    <main className="min-h-screen glass-page">
      {/* CSS hover styles for job cards (Server Component-safe) */}
      <style>{`
        .job-card-link {
          display: block;
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(177,178,180,0.08);
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          cursor: pointer;
        }
        .job-card-link:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(99,102,241,0.2);
          transform: translateY(-2px);
        }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section
        style={{
          padding: "10rem 1.5rem 4rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 50% 30% at 50% 20%, rgba(99,102,241,0.08), transparent 60%),
              radial-gradient(ellipse 40% 25% at 80% 80%, rgba(139,92,246,0.05), transparent 55%),
              radial-gradient(ellipse 30% 20% at 20% 70%, rgba(16,185,129,0.04), transparent 50%)
            `,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 999,
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "#818cf8",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {totalCount} open position{totalCount !== 1 ? "s" : ""}
          </div>
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#fcfcfe",
              marginBottom: 16,
            }}
          >
            Join the{" "}
            <span style={{ background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              State AI
            </span>{" "}
            Team
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#818286", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            We're building the future of AI-powered solutions. If you're passionate about innovation and
            cutting-edge technology, we want to hear from you.
          </p>
        </div>
      </section>

      {/* Job Listings */}
      <section style={{ padding: "0 1.5rem 6rem", maxWidth: 900, margin: "0 auto" }}>
        {totalCount === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: 20,
              border: "1px solid rgba(177,178,180,0.08)",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5d5e60" strokeWidth="1.5" style={{ marginBottom: 16 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 style={{ color: "#fcfcfe", fontSize: "1.2rem", fontWeight: 600, marginBottom: 8 }}>No open positions right now</h3>
            <p style={{ color: "#5d5e60", fontSize: "0.9rem" }}>
              We don't have any active job listings at the moment. Check back soon or follow us on social media for updates.
            </p>
          </div>
        ) : (
          Array.from(departments.entries()).map(([department, deptJobs]) => (
            <div key={department} style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: getDepartmentColor(department),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fcfcfe" }}>
                    {department.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fcfcfe", margin: 0 }}>
                    {department}
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "#5d5e60" }}>
                    {deptJobs.length} position{deptJobs.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {deptJobs.map((job) => {
                  const salaryStr = formatSalary(job);
                  const typeStyle = getTypeBadgeStyle(job.type);
                  return (
                    <Link
                      key={job.id}
                      href={`/careers/${job.slug}`}
                      className="job-card-link"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#fcfcfe", margin: "0 0 8px" }}>
                            {job.title}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.82rem", color: "#818286", display: "flex", alignItems: "center", gap: 4 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {job.location}
                            </span>
                            {salaryStr && (
                              <span style={{ fontSize: "0.82rem", color: "#818286", display: "flex", alignItems: "center", gap: 4 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="1" x2="12" y2="23" />
                                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                {salaryStr}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
                              background: typeStyle.bg,
                              color: typeStyle.color,
                            }}
                          >
                            {job.type.replace("-", " ")}
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5d5e60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Why Join Us */}
      <section style={{ padding: "0 1.5rem 6rem", maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            padding: "3rem",
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))",
            border: "1px solid rgba(99,102,241,0.12)",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fcfcfe", marginBottom: 12 }}>
            Why Join State AI?
          </h2>
          <p style={{ color: "#818286", fontSize: "0.95rem", maxWidth: 600, margin: "0 auto 32px" }}>
            We offer a dynamic environment where innovation meets impact. Here's what you can expect.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              textAlign: "left",
            }}
          >
            {[
              { title: "Remote-First", desc: "Work from anywhere in the world with our flexible remote culture." },
              { title: "Competitive Pay", desc: "Top-tier salaries, equity packages, and performance bonuses." },
              { title: "Growth & Learning", desc: "Annual learning budget, conferences, and mentorship programs." },
              { title: "Cutting-Edge Tech", desc: "Work with the latest AI tools, frameworks, and infrastructure." },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "1.25rem",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(177,178,180,0.06)",
                }}
              >
                <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fcfcfe", margin: "0 0 6px" }}>{item.title}</h4>
                <p style={{ fontSize: "0.82rem", color: "#5d5e60", margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}