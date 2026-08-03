import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy - State AI",
  description:
    "How State AI uses cookies and similar technologies on our website.",
};

const effectiveDate = "August 3, 2026";
const lastReviewedDate = "August 3, 2026";

function SectionCard({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-8">
      <h2 className="mb-4 flex items-center gap-3 text-lg sm:text-xl font-bold text-silver-bright">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-xs font-bold text-silver">
          {num}
        </span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Bullet({
  dotClass = "bg-silver/40",
  children,
}: {
  dotClass?: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 text-sm text-gray-400 leading-7">
      <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
      <span>{children}</span>
    </li>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm sm:text-base text-gray-400 leading-7">{children}</p>
  );
}

function ParaTop({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 text-sm sm:text-base text-gray-400 leading-7">
      {children}
    </p>
  );
}

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      badge="Legal & Privacy"
      title="Cookie Policy"
      description={
        <>
          Effective Date: {effectiveDate} · Last Updated: {lastReviewedDate}
        </>
      }
    >
      <div className="space-y-5 sm:space-y-6">
        {/* 1. What Are Cookies */}
        <SectionCard num="1" title="What Are Cookies">
          <Para>
            Cookies are small text files stored on your device (browser or
            similar) when you visit a website. They allow the website to
            recognize your device, remember your preferences, and understand
            how the site is used. Cookies set by the website owner are called
            &quot;first-party cookies,&quot; while cookies set by other parties
            are called &quot;third-party cookies.&quot;
          </Para>
        </SectionCard>

        {/* 2. How We Use Cookies */}
        <SectionCard num="2" title="How We Use Cookies">
          <ParaTop>
            We use cookies and similar technologies to operate our website,
            measure its performance, and improve your experience. The
            categories of cookies we may use include:
          </ParaTop>
          <div className="overflow-hidden rounded-xl border border-white/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-white/[0.04]">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold text-silver-bright">
                      Category
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-silver-bright">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    ["Essential", "Required for core website functionality. Cannot be disabled."],
                    ["Analytics", "Help us understand how visitors use the site so we can improve it."],
                    ["Functional", "Remember your preferences and settings for a smoother experience."],
                    ["Marketing", "Used to display relevant content and measure campaign effectiveness."],
                  ].map(([category, purpose]) => (
                    <tr key={category} className="border-t border-white/[0.06]">
                      <td className="px-5 py-3.5">{category}</td>
                      <td className="px-5 py-3.5">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        {/* 3. Analytics & Vercel */}
        <SectionCard num="3" title="Analytics & Vercel">
          <Para>
            This website is hosted on Vercel and uses{" "}
            <strong className="font-semibold text-silver-bright">
              Vercel Web Analytics
            </strong>{" "}
            to collect anonymized, aggregated information about site usage —
            such as the pages you visit and your approximate location at the
            country or region level. This data helps us understand what content
            is useful and improve the site.
          </Para>
          <p className="mt-5 text-sm sm:text-base text-gray-400 leading-7">
            Vercel Web Analytics does not use persistent cookies and does not
            collect personal data such as your name, email, or IP address as
            personal data. You can learn more in Vercel&apos;s own
            documentation and privacy policy.
          </p>
        </SectionCard>

        {/* 4. Third-Party Cookies */}
        <SectionCard num="4" title="Third-Party Cookies">
          <ParaTop>
            Some cookies are placed by third parties whose services we use.
            These may include:
          </ParaTop>
          <ul className="space-y-3">
            {[
              "Analytics providers, to measure and understand site traffic",
              "Social media platforms, if you use sharing features or follow our links",
              "Advertising partners, only where you have consented to marketing cookies",
              "Frameworks or tools used to provide website features",
            ].map((item) => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </SectionCard>

        {/* 5. Managing Cookies */}
        <SectionCard num="5" title="Managing or Disabling Cookies">
          <ParaTop>
            Most browsers allow you to control cookies through their settings,
            including the ability to view, block, or delete cookies. The exact
            steps vary by browser — refer to your browser&apos;s help section
            for guidance.
          </ParaTop>
          <ul className="space-y-3">
            <Bullet dotClass="bg-indigo-400/60">
              Use your browser settings to block or delete cookies
            </Bullet>
            <Bullet dotClass="bg-indigo-400/60">
              Choose &quot;Do Not Track&quot; or similar privacy settings if
              you prefer
            </Bullet>
            <Bullet dotClass="bg-indigo-400/60">
              Note that disabling essential cookies may affect website
              functionality
            </Bullet>
          </ul>
          <p className="mt-5 text-sm sm:text-base text-gray-400 leading-7">
            Because our approach to cookies may change as we improve this
            website, we encourage you to review this Cookie Policy
            periodically.
          </p>
        </SectionCard>

        {/* 6. Changes to This Policy */}
        <SectionCard num="6" title="Changes to This Cookie Policy">
          <Para>
            We may update this Cookie Policy from time to time to reflect
            changes in technology, our practices, or legal requirements. When
            we do, we will post the revised policy on this page and update the
            effective date at the top.
          </Para>
        </SectionCard>

        {/* 7. Contact */}
        <SectionCard num="7" title="Contact Us">
          <ParaTop>
            If you have any questions about our use of cookies, please contact
            us via our{" "}
            <a
              href="/privacy-policy"
              className="text-indigo-300 underline decoration-indigo-400/40 underline-offset-4 transition hover:text-indigo-200"
            >
              Privacy Policy
            </a>{" "}
            or at:
          </ParaTop>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6">
            <p className="mb-1 text-sm font-semibold text-silver-bright">
              STATE AI
            </p>
            <p className="text-sm text-gray-400">
              Email:{" "}
              <a
                href="mailto:info@stateai.in"
                className="text-indigo-300 underline decoration-indigo-400/40 underline-offset-4 transition hover:text-indigo-200"
              >
                info@stateai.in
              </a>
            </p>
          </div>
        </SectionCard>
      </div>
    </LegalLayout>
  );
}