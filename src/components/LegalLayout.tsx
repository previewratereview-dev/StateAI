import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalLayout({
  badge,
  title,
  description,
  children,
}: {
  badge: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen glass-page">
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ padding: "9rem 1.5rem 3.5rem", textAlign: "center" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 50% 35% at 50% 10%, rgb(177 178 180 / 6%), transparent 60%),
              radial-gradient(ellipse 40% 30% at 85% 80%, rgb(99 102 241 / 7%), transparent 55%),
              radial-gradient(ellipse 35% 25% at 12% 75%, rgb(139 92 246 / 5%), transparent 50%)
            `,
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-5 animate-silver-glow-box">
            <span className="text-[11px] sm:text-sm text-silver font-medium animate-silver-glow-text">
              {badge}
            </span>
          </div>
          <h1 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-gray-400 leading-6">
              {description}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24" style={{ maxWidth: 860, margin: "0 auto" }}>
        {children}
      </section>

      <Footer />
    </main>
  );
}
