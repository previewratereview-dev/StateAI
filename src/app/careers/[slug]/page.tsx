import { getJobBySlug, getActiveJobs } from "@/app/actions/jobs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobApplicationForm from "@/components/JobApplicationForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await getActiveJobs();
  if (!result.success || !result.data) return [];
  return result.data.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getJobBySlug(slug);
  if (!result.success || !result.data) return { title: "Job Not Found - State AI" };

  return {
    title: `${result.data.title} - State AI Careers`,
    description: result.data.description.slice(0, 160),
  };
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

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getJobBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const job = result.data;
  const salaryStr = formatSalary(job);

  const typeBgMap: Record<string, string> = {
    "full-time": "rgba(16,185,129,0.12)",
    "part-time": "rgba(245,158,11,0.12)",
    contract: "rgba(99,102,241,0.12)",
    internship: "rgba(236,72,153,0.12)",
    freelance: "rgba(168,85,247,0.12)",
    commission: "rgba(239,68,68,0.12)",
  };
  const typeColorMap: Record<string, string> = {
    "full-time": "#10b981",
    "part-time": "#f59e0b",
    contract: "#818cf8",
    internship: "#ec4899",
    freelance: "#a855f7",
    commission: "#ef4444",
  };

  return (
    <main className="min-h-screen glass-page">
      {/* Server Component-safe hover styles */}
      <style>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #818286;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(177,178,180,0.08);
          transition: all 0.2s;
        }
        .back-link:hover {
          color: #818cf8;
          border-color: rgba(99,102,241,0.3);
        }
        .apply-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15));
          border: 1px solid rgba(99,102,241,0.3);
          color: #818cf8;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .apply-button:hover {
          background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.25));
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99,102,241,0.2);
        }
      `}</style>

      <Navbar />

      {/* Back link */}
      <section style={{ padding: "8rem 1.5rem 0", maxWidth: 800, margin: "0 auto" }}>
        <Link href="/careers" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All Positions
        </Link>
      </section>

      {/* Job Header */}
      <section style={{ padding: "2rem 1.5rem 3rem", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "capitalize",
                background: typeBgMap[job.type] || "rgba(16,185,129,0.12)",
                color: typeColorMap[job.type] || "#10b981",
              }}
            >
              {job.type.replace("-", " ")}
            </span>
            <span style={{ color: "#5d5e60", fontSize: "0.85rem" }}>•</span>
            <span style={{ color: "#818286", fontSize: "0.85rem" }}>{job.department}</span>
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "#fcfcfe",
              margin: "0 0 16px",
            }}
          >
            {job.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.9rem", color: "#818286", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.location}
            </span>
            {salaryStr && (
              <span style={{ fontSize: "0.9rem", color: "#818286", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                {salaryStr}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Job Content */}
      <section style={{ padding: "0 1.5rem 4rem", maxWidth: 800, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 32,
          }}
        >
          {/* Description */}
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fcfcfe", marginBottom: 12 }}>About the Role</h2>
            <div
              style={{ color: "#a1a3a6", fontSize: "0.95rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
            >
              {job.description}
            </div>
          </div>

          {/* Responsibilities */}
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fcfcfe", marginBottom: 12 }}>Responsibilities</h2>
            <div
              style={{ color: "#a1a3a6", fontSize: "0.95rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
            >
              {job.responsibilities}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fcfcfe", marginBottom: 12 }}>Requirements</h2>
            <div
              style={{ color: "#a1a3a6", fontSize: "0.95rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}
            >
              {job.requirements}
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div
          style={{
            marginTop: 48,
            padding: "2.5rem",
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))",
            border: "1px solid rgba(99,102,241,0.12)",
          }}
        >
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fcfcfe", margin: "0 0 4px" }}>
            Apply for this Position
          </h3>
          <p style={{ color: "#818286", fontSize: "0.85rem", margin: "0 0 24px" }}>
            Fill out the form below and we'll get back to you.
          </p>
          <JobApplicationForm jobId={job.id} jobTitle={job.title} />
        </div>
      </section>

      <Footer />
    </main>
  );
}