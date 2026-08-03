import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions - State AI",
  description:
    "The terms that govern your use of State AI's website and services.",
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

export default function TermsPage() {
  return (
    <LegalLayout
      badge="Legal & Terms"
      title="Terms & Conditions"
      description={
        <>
          Effective Date: {effectiveDate} · Last Reviewed: {lastReviewedDate}
        </>
      }
    >
      <div className="space-y-5 sm:space-y-6">
        {/* 1. Acceptance of Terms */}
        <SectionCard num="1" title="Acceptance of Terms">
          <ParaTop>
            These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of
            the STATE AI website, services, and any related materials
            (collectively, the &quot;Services&quot;). By accessing or using our
            Services, you agree to be bound by these Terms. If you do not agree
            with any part of these Terms, you must not use our Services.
          </ParaTop>
        </SectionCard>

        {/* 2. About Our Services */}
        <SectionCard num="2" title="About Our Services">
          <Para>
            STATE AI provides artificial intelligence, machine learning,
            natural language processing, computer vision, and generative AI
            development and consulting services. Any specific scope,
            deliverables, timelines, and fees for services are defined in a
            separate agreement between you and STATE AI. In the event of a
            conflict, the terms of that agreement take precedence over these
            Terms.
          </Para>
        </SectionCard>

        {/* 3. Use of the Website */}
        <SectionCard num="3" title="Use of the Website">
          <ParaTop>When using our website, you agree not to:</ParaTop>
          <ul className="space-y-3">
            {[
              "Use the website in any way that violates applicable law or regulation",
              "Attempt to gain unauthorized access to any part of the website, servers, or systems",
              "Interfere with or disrupt the security, performance, or availability of the website",
              "Reverse engineer, decompile, or attempt to extract the source code of any software",
              "Submit false, misleading, or harmful information through our forms",
              "Use automated tools to scrape or harvest data from the website without permission",
            ].map((item) => (
              <Bullet key={item}>{item}</Bullet>
            ))}
          </ul>
        </SectionCard>

        {/* 4. Intellectual Property */}
        <SectionCard num="4" title="Intellectual Property">
          <Para>
            All content on this website — including text, graphics, logos,
            images, code, and other materials — is the property of STATE AI or
            its licensors and is protected by applicable intellectual property
            laws. You may not copy, reproduce, distribute, or create derivative
            works from any content without our prior written consent.
          </Para>
          <p className="mt-5 text-sm sm:text-base text-gray-400 leading-7">
            Unless otherwise agreed in writing, any intellectual property
            created by STATE AI in the course of a client engagement is owned
            by STATE AI until full payment is received, at which point
            ownership of the agreed deliverables transfers to the client in
            accordance with the applicable agreement.
          </p>
        </SectionCard>

        {/* 5. Client Responsibilities */}
        <SectionCard num="5" title="Client Responsibilities">
          <ParaTop>
            You agree to provide accurate, complete, and timely information and
            access as reasonably required for STATE AI to perform its services.
            You are responsible for:
          </ParaTop>
          <ul className="space-y-3">
            {[
              "Maintaining the confidentiality of any credentials or accounts we provision",
              "Ensuring you have the rights to any data, content, or materials you provide",
              "Complying with all applicable laws in connection with your use of our services",
              "Reviewing deliverables and providing feedback within agreed timelines",
            ].map((item) => (
              <Bullet key={item} dotClass="bg-indigo-400/60">
                {item}
              </Bullet>
            ))}
          </ul>
        </SectionCard>

        {/* 6. Fees and Payment */}
        <SectionCard num="6" title="Fees and Payment">
          <Para>
            Fees for services are as set out in your agreement or proposal.
            Invoices are due within the payment terms specified. Late payments
            may incur interest or suspension of services until payment is
            received. All fees are exclusive of taxes, which will be added
            where applicable.
          </Para>
        </SectionCard>

        {/* 7. Third-Party Services */}
        <SectionCard num="7" title="Third-Party Services">
          <Para>
            Our Services may link to or integrate with third-party websites,
            tools, or platforms. We do not control and are not responsible for
            the content, privacy practices, or availability of any third-party
            services. Your use of such services is subject to their own terms
            and policies.
          </Para>
        </SectionCard>

        {/* 8. Disclaimers */}
        <SectionCard num="8" title="Disclaimers">
          <Para>
            Our Services are provided on an &quot;as is&quot; and
            &quot;as available&quot; basis, without warranties of any kind,
            whether express or implied, including but not limited to implied
            warranties of merchantability, fitness for a particular purpose, or
            non-infringement. While we strive for accuracy, we do not warrant
            that the website will be uninterrupted, error-free, or free of
            harmful components. AI outputs may be imperfect or require review,
            and we make no guarantee regarding the performance or suitability
            of any output for your specific purpose.
          </Para>
        </SectionCard>

        {/* 9. Limitation of Liability */}
        <SectionCard num="9" title="Limitation of Liability">
          <Para>
            To the maximum extent permitted by law, STATE AI shall not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages, or for any loss of profits, revenue, data, or goodwill,
            arising out of or related to your use of the Services. Our total
            aggregate liability for any claim arising from these Terms shall
            not exceed the amounts paid by you to STATE AI in the twelve (12)
            months preceding the claim.
          </Para>
        </SectionCard>

        {/* 10. Indemnification */}
        <SectionCard num="10" title="Indemnification">
          <Para>
            You agree to indemnify, defend, and hold harmless STATE AI and its
            officers, employees, and agents from any claims, damages,
            liabilities, and expenses (including reasonable legal fees) arising
            out of your use of the Services, your violation of these Terms, or
            your infringement of any third-party rights.
          </Para>
        </SectionCard>

        {/* 11. Confidentiality */}
        <SectionCard num="11" title="Confidentiality">
          <Para>
            Each party agrees to keep confidential any non-public information
            disclosed in connection with the Services, and to use such
            information only for the purpose of performing obligations under
            these Terms or the applicable agreement. This obligation does not
            apply to information that is publicly available, independently
            developed, or required to be disclosed by law.
          </Para>
        </SectionCard>

        {/* 12. Termination */}
        <SectionCard num="12" title="Termination">
          <Para>
            We may suspend or terminate your access to the Services at any time
            if you breach these Terms. Upon termination, any rights granted to
            you under these Terms immediately cease. Provisions that by their
            nature should survive termination — including intellectual
            property, disclaimers, limitation of liability, and governing law —
            will survive.
          </Para>
        </SectionCard>

        {/* 13. Governing Law */}
        <SectionCard num="13" title="Governing Law">
          <Para>
            These Terms are governed by and construed in accordance with the
            laws of [Jurisdiction], without regard to its conflict of law
            principles. Any disputes arising under these Terms shall be subject
            to the exclusive jurisdiction of the courts of [Jurisdiction].
          </Para>
        </SectionCard>

        {/* 14. Changes to These Terms */}
        <SectionCard num="14" title="Changes to These Terms">
          <Para>
            We may update these Terms from time to time to reflect legal,
            technical, or business changes. When we do, we will post the
            revised Terms on this page and update the effective date at the
            top. Your continued use of the Services after changes are posted
            constitutes acceptance of the revised Terms.
          </Para>
        </SectionCard>

        {/* 15. Contact */}
        <SectionCard num="15" title="Contact Us">
          <ParaTop>
            If you have any questions about these Terms, please contact us at:
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