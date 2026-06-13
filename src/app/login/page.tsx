"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";

import { use } from "react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const urlError = resolvedSearchParams.error as string;
  const [error, setError] = useState<string | null>(urlError ? urlError.replace(/_/g, " ") : null);

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08080c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 70% 50% at 20% 20%, rgba(99,102,241,0.08), transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.06), transparent 55%),
            radial-gradient(ellipse 50% 35% at 50% 50%, rgba(177,178,180,0.03), transparent 65%)
          `,
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(177,178,180,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(177,178,180,0.03) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          padding: "0 1.5rem",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              boxShadow: "0 0 40px rgba(99,102,241,0.15)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#fcfcfe",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            State AI CRM
          </h1>
          <p style={{ color: "#5d5e60", fontSize: "0.85rem", marginTop: 6 }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgb(13 13 18 / 80%)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgb(177 178 180 / 10%)",
            borderRadius: 20,
            padding: "2rem",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#818286",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(177,178,180,0.12)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  color: "#fcfcfe",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(177,178,180,0.12)")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#818286",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(177,178,180,0.12)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  color: "#fcfcfe",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(177,178,180,0.12)")}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 10,
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  color: "rgba(239,68,68,0.9)",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              id="login-submit-btn"
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: 10,
                background: isPending
                  ? "rgba(99,102,241,0.3)"
                  : "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.85))",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#fcfcfe",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: isPending ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.02em",
                boxShadow: isPending ? "none" : "0 4px 20px rgba(99,102,241,0.25)",
                fontFamily: "inherit",
              }}
            >
              {isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#3d3e40",
            fontSize: "0.75rem",
            marginTop: "1.5rem",
          }}
        >
          Access restricted to authorised team members only
        </p>
      </div>
    </div>
  );
}
