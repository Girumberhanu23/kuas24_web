const sectionLinks = [
  { id: "introduction", label: "1. Introduction" },
  { id: "user-accounts", label: "2. User Accounts" },
  { id: "roles-and-permissions", label: "3. User Roles and Permissions" },
  { id: "content-and-ip", label: "4. Content and Intellectual Property" },
  { id: "acceptable-use", label: "5. Acceptable Use" },
  { id: "termination", label: "6. Termination" },
  { id: "warranties", label: "7. Disclaimer of Warranties" },
  { id: "liability", label: "8. Limitation of Liability" },
  { id: "privacy", label: "9. Privacy" },
  { id: "changes", label: "10. Changes to Terms" },
  { id: "governing-law", label: "11. Governing Law" },
  { id: "contact", label: "12. Contact Us" },
] as const;

function TermsSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-text sm:text-xl">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-text-secondary sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default function TermsAndConditionsPage() {
  const lastUpdated = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-1 sm:space-y-8">
      <header className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-text sm:text-3xl">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Last Updated: {lastUpdated}
        </p>
      </header>

      <nav
        aria-label="Terms and conditions sections"
        className="rounded-2xl border border-border bg-card p-4 sm:p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Quick Navigation
        </h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {sectionLinks.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="rounded-md text-text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <TermsSection id="introduction" title="1. Introduction">
        <p>
          Welcome to Sports News. These Terms and Conditions govern your use of
          our application and services.
        </p>
        <p>By accessing or using the app, you agree to be bound by these Terms.</p>
        <p>If you do not agree, you must not use the app.</p>
      </TermsSection>

      <TermsSection id="user-accounts" title="2. User Accounts">
        <p>To use certain features, you must create an account.</p>
        <p>You agree to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide accurate and complete information</li>
          <li>Keep your login credentials secure</li>
          <li>Be responsible for all activities under your account</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate
          these Terms.
        </p>
      </TermsSection>

      <TermsSection
        id="roles-and-permissions"
        title="3. User Roles and Permissions"
      >
        <p>The app supports different user roles:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>User - can browse and consume content</li>
          <li>Broadcaster - can create and publish news posts</li>
        </ul>
        <p>Broadcasters are solely responsible for the content they publish.</p>
        <p>
          We reserve the right to remove or moderate content that violates our
          policies.
        </p>
      </TermsSection>

      <TermsSection
        id="content-and-ip"
        title="4. Content and Intellectual Property"
      >
        <p>
          All content on the platform, including text, images, and branding, is
          owned by or licensed to Sports News.
        </p>
        <p>Users and broadcasters agree:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Not to copy, reproduce, or distribute content without permission</li>
          <li>
            Not to upload content that infringes on copyrights or intellectual
            property
          </li>
        </ul>
        <p>
          By submitting content, broadcasters grant us a license to display and
          distribute it within the platform.
        </p>
      </TermsSection>

      <TermsSection id="acceptable-use" title="5. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Post false, misleading, or harmful content</li>
          <li>Use the app for illegal activities</li>
          <li>Attempt to hack, disrupt, or misuse the system</li>
          <li>Impersonate others</li>
        </ul>
        <p>Violation may result in account suspension or permanent ban.</p>
      </TermsSection>

      <TermsSection id="termination" title="6. Termination">
        <p>We may suspend or terminate your account if:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>You violate these Terms</li>
          <li>You misuse the platform</li>
          <li>Required by law</li>
        </ul>
        <p>You may stop using the app at any time.</p>
      </TermsSection>

      <TermsSection id="warranties" title="7. Disclaimer of Warranties">
        <p>The app is provided &quot;as is&quot; without warranties of any kind.</p>
        <p>We do not guarantee:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>uninterrupted service</li>
          <li>error-free functionality</li>
          <li>accuracy of all content</li>
        </ul>
      </TermsSection>

      <TermsSection id="liability" title="8. Limitation of Liability">
        <p>To the maximum extent permitted by law:</p>
        <p>Sports News shall not be liable for:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>indirect or consequential damages</li>
          <li>data loss</li>
          <li>service interruptions</li>
        </ul>
        <p>Use the app at your own risk.</p>
      </TermsSection>

      <TermsSection id="privacy" title="9. Privacy">
        <p>
          Your use of the app is also governed by our{" "}
          <a
            href="/privacy-policy"
            className="font-medium text-primary hover:text-primary-hover"
          >
            Privacy Policy
          </a>
          .
        </p>
      </TermsSection>

      <TermsSection id="changes" title="10. Changes to Terms">
        <p>We may update these Terms from time to time.</p>
        <p>
          Continued use of the app after updates means you accept the changes.
        </p>
      </TermsSection>

      <TermsSection id="governing-law" title="11. Governing Law">
        <p>These Terms shall be governed by applicable laws and regulations.</p>
      </TermsSection>

      <TermsSection id="contact" title="12. Contact Us">
        <p>For any questions regarding these Terms, contact:</p>
        <p>
          Email:{" "}
          <a
            href="mailto:support@sportsnews.com"
            className="font-medium text-primary hover:text-primary-hover"
          >
            support@sportsnews.com
          </a>
        </p>
      </TermsSection>
    </div>
  );
}