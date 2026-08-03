import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy - State AI",
  description:
    "How State AI collects, uses, and protects your personal data.",
};

const effectiveDate = "July 16, 2026";
const lastReviewedDate = "July 16, 2026";

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

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      badge="Legal & Privacy"
      title="Privacy Policy"
      description={
        <>
          Effective Date: {effectiveDate} · Last Reviewed: {lastReviewedDate}
        </>
      }
    >
      <div className="space-y-5 sm:space-y-6">
        {/* 1. Who We Are */}
        <SectionCard num="1" title="Who We Are">
          <p className="mb-5 text-sm sm:text-base text-gray-400 leading-7">
            STATE AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is the
            data controller responsible for your personal data under this
            policy. If you have any questions or concerns, you can contact us
            at:
          </p>
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

        {/* 2. What Personal Data We Collect */}
        <SectionCard num="2" title="What Personal Data We Collect">
          <p className="mb-5 text-sm sm:text-base text-gray-400 leading-7">
            We may collect and process the following types of personal data:
          </p>
          <ul className="space-y-3">
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Identification data:
              </strong>{" "}
              Name, address, email, phone number
            </Bullet>
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Employment data:
              </strong>{" "}
              Job title, CV/resume, references, performance data
            </Bullet>
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Payment data:
              </strong>{" "}
              Bank details, transaction records
            </Bullet>
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Technical data:
              </strong>{" "}
              IP address, browser type, device identifiers
            </Bullet>
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Usage data:
              </strong>{" "}
              Interactions with our website, services, or communications
            </Bullet>
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Marketing preferences:
              </strong>{" "}
              Consent history
            </Bullet>
          </ul>
          <p className="mt-5 text-sm sm:text-base text-gray-400 leading-7">
            We collect personal data directly from you, and automatically
            through cookies or similar technologies.
          </p>
        </SectionCard>

        {/* 3. Why We Collect Your Data */}
        <SectionCard num="3" title="Why We Collect Your Data">
          <p className="mb-6 text-sm sm:text-base text-gray-400 leading-7">
            We process your personal data for the following purposes:
          </p>
          <div className="overflow-hidden rounded-xl border border-white/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-white/[0.04]">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold text-silver-bright">
                      Purpose
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-silver-bright">
                      Legal Basis
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    ["Processing job applications", "Consent / Pre-contractual necessity"],
                    ["Providing our products or services", "Contractual necessity"],
                    ["Sending service-related communications", "Legitimate interests / Contractual necessity"],
                    ["Marketing", "Consent"],
                    ["Analyzing website performance", "Consent / Legitimate interests"],
                    ["Complying with legal obligations", "Legal obligation"],
                  ].map(([purpose, legalBasis]) => (
                    <tr key={purpose} className="border-t border-white/[0.06]">
                      <td className="px-5 py-3.5">{purpose}</td>
                      <td className="px-5 py-3.5">{legalBasis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        {/* 4. How Long We Keep Your Data */}
        <SectionCard num="4" title="How Long We Keep Your Data">
          <p className="mb-5 text-sm sm:text-base text-gray-400 leading-7">
            We retain personal data only for as long as necessary for the
            purpose for which it was collected, including legal or regulatory
            requirements.
          </p>
          <p className="mb-4 text-sm text-gray-400">For example:</p>
          <ul className="space-y-3">
            <Bullet dotClass="bg-indigo-400/60">
              <strong className="font-semibold text-silver-bright">
                Recruitment data:
              </strong>{" "}
              up to 12 months after the hiring decision
            </Bullet>
            <Bullet dotClass="bg-indigo-400/60">
              <strong className="font-semibold text-silver-bright">
                Customer data:
              </strong>{" "}
              as long as you use our services
            </Bullet>
            <Bullet dotClass="bg-indigo-400/60">
              <strong className="font-semibold text-silver-bright">
                Website analytics:
              </strong>{" "}
              anonymized data retained for analytics purposes
            </Bullet>
          </ul>
          <p className="mt-5 text-sm sm:text-base text-gray-400 leading-7">
            You can request deletion of your data at any time unless we are
            required by law to retain it.
          </p>
        </SectionCard>

        {/* 5. Who We Share Your Data With */}
        <SectionCard num="5" title="Who We Share Your Data With">
          <p className="mb-5 text-sm sm:text-base text-gray-400 leading-7">
            We may share your data with:
          </p>
          <ul className="space-y-3">
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Service providers and vendors:
              </strong>{" "}
              Hosting, email, analytics, and HR systems
            </Bullet>
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Government authorities or regulators:
              </strong>{" "}
              Where required by law
            </Bullet>
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Legal and professional advisors:
              </strong>{" "}
              In the course of business operations or dispute resolution
            </Bullet>
            <Bullet>
              <strong className="font-semibold text-silver-bright">
                Third parties:
              </strong>{" "}
              Only with your explicit consent or under legal obligation
            </Bullet>
          </ul>
          <p className="mt-5 text-sm sm:text-base text-gray-400 leading-7">
            We do not sell or rent your personal data to third parties.
          </p>
        </SectionCard>

        {/* 6. International Data Transfers */}
        <SectionCard num="6" title="International Data Transfers">
          <p className="mb-5 text-sm sm:text-base text-gray-400 leading-7">
            If we transfer your personal data, we will ensure appropriate
            safeguards are in place, such as:
          </p>
          <ul className="space-y-3">
            <Bullet dotClass="bg-indigo-400/60">
              Standard Contractual Clauses (SCCs)
            </Bullet>
            <Bullet dotClass="bg-indigo-400/60">
              Transfers to countries with adequate protection laws
            </Bullet>
            <Bullet dotClass="bg-indigo-400/60">
              Binding corporate rules or certification mechanisms
            </Bullet>
          </ul>
        </SectionCard>

        {/* 7. Your Data Protection Rights */}
        <SectionCard num="7" title="Your Data Protection Rights">
          <p className="mb-5 text-sm sm:text-base text-gray-400 leading-7">
            Under the GDPR, you have the right to:
          </p>
          <ul className="space-y-3">
            {[
              "Access your personal data and obtain a copy",
              "Rectify inaccurate or incomplete data",
              "Erase your personal data (\u201Cright to be forgotten\u201D)",
              "Restrict or object to processing in certain situations",
              "Withdraw consent at any time",
              "Port your data to another provider",
              "Complain to a supervisory authority",
            ].map((right) => (
              <Bullet key={right}>{right}</Bullet>
            ))}
          </ul>
          <p className="mt-5 text-sm sm:text-base text-gray-400 leading-7">
            To exercise your rights, contact us at{" "}
            <a
              href="mailto:contact@stateai.in"
              className="text-indigo-300 underline decoration-indigo-400/40 underline-offset-4 transition hover:text-indigo-200"
            >
              contact@stateai.in
            </a>
            .
          </p>
        </SectionCard>

        {/* 8. Data Security */}
        <SectionCard num="8" title="Data Security">
          <p className="mb-5 text-sm sm:text-base text-gray-400 leading-7">
            We use reasonable and appropriate technical and organizational
            security measures to protect your data from unauthorized access,
            loss, alteration, or misuse.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Encrypted storage and transmission",
              "Access controls and password protections",
              "Employee training and awareness",
              "Regular audits of our systems and vendors",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-gray-400"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm sm:text-base text-gray-400 leading-7">
            Despite these measures, no method of data transmission is 100%
            secure. We encourage you to contact us immediately if you believe
            your personal data has been compromised.
          </p>
        </SectionCard>

        {/* 9. Changes to This Policy */}
        <SectionCard num="9" title="Changes to This Policy">
          <p className="text-sm sm:text-base text-gray-400 leading-7">
            We may update this privacy policy from time to time to reflect
            legal, technical, or business changes. When we do, we&apos;ll post
            the revised policy on our website and update the effective date at
            the top.
          </p>
        </SectionCard>

        {/* FAQ */}
        <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-8">
          <h2 className="mb-6 flex items-center gap-3 text-lg sm:text-xl font-bold text-silver-bright">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-xs font-bold text-silver">
              FAQ
            </span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                question: "What does GDPR mean for me as a job applicant?",
                answer:
                  "It means your personal information, such as your resume and contact information, is protected. You can request to see, update, or delete your data at any time.",
              },
              {
                question: "Do you use cookies or tracking technologies?",
                answer: (
                  <>
                    Yes — but only with your consent. For more detail, see our{" "}
                    <a
                      href="/cookie-policy"
                      className="text-indigo-300 underline decoration-indigo-400/40 underline-offset-4 transition hover:text-indigo-200"
                    >
                      Cookie Policy
                    </a>
                    .
                  </>
                ),
              },
              {
                question: "How do I withdraw consent?",
                answer: (
                  <>
                    You can opt out of marketing emails by clicking
                    &quot;unsubscribe&quot; or contact us at{" "}
                    <a
                      href="mailto:contact@stateai.in"
                      className="text-indigo-300 underline decoration-indigo-400/40 underline-offset-4 transition hover:text-indigo-200"
                    >
                      contact@stateai.in
                    </a>{" "}
                    to withdraw any other type of consent.
                  </>
                ),
              },
              {
                question:
                  "What happens if I don't want you to collect my data?",
                answer:
                  "In some cases, we may not be able to provide you with certain services without some personal data. We'll always explain what's optional and what's required.",
              },
            ].map((faq) => (
              <details
                key={faq.question}
                className="group overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.14]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-4">
                  <span className="text-sm font-semibold text-silver-bright sm:text-base">
                    {faq.question}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-silver-dim transition-all duration-300 group-open:rotate-180 group-open:border-white/[0.2] group-open:bg-white/[0.08]">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-white/[0.06] px-5 pb-5 pt-4">
                  <p className="max-w-3xl text-sm leading-7 text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
