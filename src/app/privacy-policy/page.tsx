export default function PrivacyPolicyPage() {
  const effectiveDate = "July 16, 2026";
  const lastReviewedDate = "July 16, 2026";
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#fcfcfe]">
      <div className="mx-auto max-w-4xl px-6 py-24 sm:px-8">
        {/* Header */}
        <header className="mb-16">
          <span className="mb-5 inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-400">
            Legal & Privacy
          </span>

          <h1 className="mb-6 text-4xl font-extrabold tracking-[-0.03em] text-[#fcfcfe] sm:text-5xl">
            Privacy Policy
          </h1>

          <div className="space-y-2 text-sm text-[#818286]">
            <p>
              <strong className="text-[#fcfcfe]">Effective Date:</strong>{' '}
              {effectiveDate}
            </p>

            <p>
              <strong className="text-[#fcfcfe]">Policy Owner:</strong>{' '}
             Legal Team
            </p>

            <p>
              <strong className="text-[#fcfcfe]">Last Reviewed:</strong>{' '}
              {lastReviewedDate}
            </p>
          </div>
        </header>

        <div className="space-y-12">
          {/* 1. Who We Are */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              1. Who We Are
            </h2>

            <p className="mb-5 leading-8 text-[#818286]">
              STATE AI (“we,” “our,” or “us”) is the data controller
              responsible for your personal data under this policy. If you have
              any questions or concerns, you can contact us at:
            </p>

            <address className="rounded-2xl border border-white/8 bg-white/2 p-6 not-italic leading-8 text-[#818286]">
              <p className="text-[#fcfcfe]">STATE AI</p>
              <p>[Company Address]</p>

              <p>
                Email:{' '}
                <a
                  href="mailto:info@stateai.in"
                  className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-4 transition hover:text-indigo-300"
                >
                  info@stateai.in
                </a>
              </p>

              <p> 

              WhatsApp:{' '}
                <a
                  href="https://wa.me/917006993325"
                  className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-4 transition hover:text-indigo-300"
                >
                  +917006993325
                </a>
              </p>
            </address>
          </section>

          {/* 2. What Personal Data We Collect */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              2. What Personal Data We Collect
            </h2>

            <p className="mb-5 leading-8 text-[#818286]">
              We may collect and process the following types of personal data:
            </p>

            <ul className="space-y-3 text-[#818286]">
              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">
                    Identification data:
                  </strong>{' '}
                  Name, address, email, phone number
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">
                    Employment data:
                  </strong>{' '}
                  Job title, CV/resume, references, performance data
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">Payment data:</strong> Bank
                  details, transaction records
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">Technical data:</strong> IP
                  address, browser type, device identifiers
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">Usage data:</strong>{' '}
                  Interactions with our website, services, or communications
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">
                    Marketing preferences:
                  </strong>{' '}
                  Consent history
                </span>
              </li>
            </ul>

            <p className="mt-5 leading-8 text-[#818286]">
              We collect personal data directly from you, and
              automatically through cookies or similar technologies.
            </p>
          </section>

          {/* 3. Why We Collect Your Data */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              3. Why We Collect Your Data
            </h2>

            <p className="mb-6 leading-8 text-[#818286]">
              We process your personal data for the following purposes:
            </p>

            <div className="overflow-hidden rounded-2xl border border-white/8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-150 text-left text-sm">
                  <thead className="bg-white/4">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-[#fcfcfe]">
                        Purpose
                      </th>
                      <th className="px-5 py-4 font-semibold text-[#fcfcfe]">
                        Legal Basis
                      </th>
                    </tr>
                  </thead>

                  <tbody className="text-[#818286]">
                    {[
                      [
                        'Processing job applications',
                        'Consent / Pre-contractual necessity',
                      ],
                      [
                        'Providing our products or services',
                        'Contractual necessity',
                      ],
                      [
                        'Sending service-related communications',
                        'Legitimate interests / Contractual necessity',
                      ],
                      [
                        'Marketing',
                        'Consent',
                      ],
                      [
                        'Analyzing website performance',
                        'Consent / Legitimate interests',
                      ],
                      [
                        'Complying with legal obligations',
                        'Legal obligation',
                      ],
                    ].map(([purpose, legalBasis]) => (
                      <tr
                        key={purpose}
                        className="border-t border-white/6"
                      >
                        <td className="px-5 py-4">{purpose}</td>
                        <td className="px-5 py-4">{legalBasis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 4. How Long We Keep Your Data */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              4. How Long We Keep Your Data
            </h2>

            <p className="mb-5 leading-8 text-[#818286]">
              We retain personal data only for as long as necessary for the
              purpose for which it was collected, including legal or regulatory
              requirements.
            </p>

            <p className="mb-4 text-[#818286]">For example:</p>

            <ul className="space-y-3 text-[#818286]">
              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                <span>
                  <strong className="text-[#fcfcfe]">
                    Recruitment data:
                  </strong>{' '}
                  up to 12 months after the hiring decision
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                <span>
                  <strong className="text-[#fcfcfe]">Customer data:</strong> as
                  long as you use our services + [Insert period]
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                <span>
                  <strong className="text-[#fcfcfe]">
                    Website analytics:
                  </strong>{' '}
                  anonymized data retained for [Insert period]
                </span>
              </li>
            </ul>

            <p className="mt-5 leading-8 text-[#818286]">
              You can request deletion of your data at any time unless we are
              required by law to retain it.
            </p>
          </section>

          {/* 5. Who We Share Your Data With */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              5. Who We Share Your Data With
            </h2>

            <p className="mb-5 leading-8 text-[#818286]">
              We may share your data with:
            </p>

            <ul className="space-y-3 text-[#818286]">
              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">
                    Service providers and vendors:
                  </strong>{' '}
                  Hosting, email, analytics, and HR systems
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">
                    Government authorities or regulators:
                  </strong>{' '}
                  Where required by law
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">
                    Legal and professional advisors:
                  </strong>{' '}
                  In the course of business operations or dispute resolution
                </span>
              </li>

              <li className="flex gap-3 leading-7">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>
                  <strong className="text-[#fcfcfe]">Third parties:</strong>{' '}
                  Only with your explicit consent or under legal obligation
                </span>
              </li>
            </ul>

            <p className="mt-5 leading-8 text-[#818286]">
              We do not sell or rent your personal data to third parties.
            </p>
          </section>

          {/* 6. International Data Transfers */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              6. International Data Transfers
            </h2>

            <p className="mb-5 leading-8 text-[#818286]">
              If we transfer your personal data, we will ensure appropriate safeguards are in place,
              such as:
            </p>

            <ul className="space-y-3 text-[#818286]">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-purple-400" />
                Standard Contractual Clauses (SCCs)
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-purple-400" />
                Transfers to countries with adequate protection laws
              </li>

              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-purple-400" />
                Binding corporate rules or certification mechanisms
              </li>
            </ul>
          </section>

          {/* 7. Your Data Protection Rights */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              7. Your Data Protection Rights
            </h2>

            <p className="mb-5 leading-8 text-[#818286]">
              Under the GDPR, you have the right to:
            </p>

            <ul className="space-y-3 text-[#818286]">
              {[
                'Access your personal data and obtain a copy',
                'Rectify inaccurate or incomplete data',
                'Erase your personal data (“right to be forgotten”)',
                'Restrict or object to processing in certain situations',
                'Withdraw consent at any time',
                'Port your data to another provider',
                'Complain to a supervisory authority',
              ].map((right) => (
                <li key={right} className="flex gap-3 leading-7">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  {right}
                </li>
              ))}
            </ul>

            <p className="mt-5 leading-8 text-[#818286]">
              To exercise your rights, contact us at{' '}
              <a
                href="mailto:contact@stateai.in"
                className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-4 hover:text-indigo-300"
              >
                contact@stateai.in
              </a>
              .
            </p>
          </section>

          {/* 8. Data Security */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              8. Data Security
            </h2>

            <p className="mb-5 leading-8 text-[#818286]">
              We use reasonable and appropriate technical and organizational
              security measures to protect your data from unauthorized access,
              loss, alteration, or misuse.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Encrypted storage and transmission',
                'Access controls and password protections',
                'Employee training and awareness',
                'Regular audits of our systems and vendors',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/6 bg-white/2 p-5 text-sm text-[#818286]"
                >
                  {item}
                </div>
              ))}
            </div>

            <p className="mt-5 leading-8 text-[#818286]">
              Despite these measures, no method of data transmission is 100%
              secure. We encourage you to contact us immediately if you believe
              your personal data has been compromised.
            </p>
          </section>

          {/* 9. Changes to This Policy */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#fcfcfe]">
              9. Changes to This Policy
            </h2>

            <p className="leading-8 text-[#818286]">
              We may update this privacy policy from time to time to reflect
              legal, technical, or business changes. When we do, we’ll post the
              revised policy on our website and update the effective date at the
              top.
            </p>
          </section>

        
         {/* FAQ */}
<section>
  <h2 className="mb-8 text-2xl font-bold text-[#fcfcfe]">
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
              className="text-indigo-400 underline underline-offset-4 transition hover:text-indigo-300"
            >
              Cookie Policy
            </a>
            .
          </>
        ),
      },
      {
        question: "How do I withdraw consent?",
        answer:
          (
            <>
            "You can opt out of marketing emails by clicking “unsubscribe” or contact us at 
            <a
                href="mailto:contact@stateai.in"
                className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-4 hover:text-indigo-300"
              >
                contact@stateai.in
              </a>
             to withdraw any other type of consent."</>),
      },
      {
        question: "What happens if I don't want you to collect my data?",
        answer:
          "In some cases, we may not be able to provide you with certain services without some personal data. We'll always explain what's optional and what's required.",
      },
    ].map((faq, index) => (
      <details
        key={faq.question}
        className="group overflow-hidden rounded-2xl border border-white/8 bg-white/2 transition-all duration-300 hover:border-indigo-500/20 hover:bg-white/4"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5">
          <span className="text-sm font-semibold text-[#fcfcfe] sm:text-base">
            {faq.question}
          </span>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/3 text-[#818286] transition-all duration-300 group-open:rotate-180 group-open:border-indigo-500/30 group-open:bg-indigo-500/10 group-open:text-indigo-400">
            <svg
              className="h-4 w-4"
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

        <div className="border-t border-white/6 px-6 pb-6 pt-5">
          <p className="max-w-3xl text-sm leading-7 text-[#818286]">
            {faq.answer}
          </p>
        </div>
      </details>
    ))}
  </div>
</section>
        </div>
      </div>
    </main>
  );
}