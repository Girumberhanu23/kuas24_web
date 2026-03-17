import Link from "next/link";

const sectionLinks = [
  { id: "introduction", label: "1. Introduction" },
  { id: "information-we-collect", label: "2. Information We Collect" },
  { id: "how-we-use", label: "3. How We Use Your Information" },
  { id: "data-sharing", label: "4. Data Sharing and Disclosure" },
  { id: "data-retention", label: "5. Data Retention" },
  { id: "security", label: "6. Security" },
  { id: "your-rights", label: "7. Your Rights" },
  { id: "childrens-privacy", label: "8. Children's Privacy" },
  { id: "third-party-services", label: "9. Third-Party Services" },
  { id: "changes", label: "10. Changes to This Policy" },
  { id: "contact", label: "11. Contact Us" },
] as const;

function PolicySection({
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

export default function PrivacyPolicyPage() {
  const lastUpdated = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-1 sm:space-y-8">
      <header className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-text sm:text-3xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Last Updated: {lastUpdated}
        </p>
      </header>

      <nav
        aria-label="Privacy policy sections"
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

      <PolicySection id="introduction" title="1. Introduction">
        <p>
          Welcome to Sports News. Your privacy is important to us. This Privacy
          Policy explains how we collect, use, and protect your information when
          you use our application.
        </p>
        <p>By using our app, you agree to the terms of this Privacy Policy.</p>
      </PolicySection>

      <PolicySection id="information-we-collect" title="2. Information We Collect">
        <p>We may collect the following types of information:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Personal Information:
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Name</li>
              <li>Phone number</li>
            </ul>
          </li>
          <li>
            Account Information:
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>User ID</li>
              <li>Role (user or broadcaster)</li>
            </ul>
          </li>
          <li>
            Usage Data:
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>App interactions</li>
              <li>Preferences (selected leagues and clubs)</li>
            </ul>
          </li>
          <li>
            Device Information (if applicable):
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Device type</li>
              <li>Operating system</li>
              <li>App version</li>
            </ul>
          </li>
        </ul>
        <p>
          We do not collect sensitive personal data such as financial
          information.
        </p>
      </PolicySection>

      <PolicySection id="how-we-use" title="3. How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Create and manage your account</li>
          <li>Provide personalized sports news content</li>
          <li>Improve app performance and user experience</li>
          <li>Communicate important updates (e.g., password reset OTP)</li>
          <li>Ensure security and prevent misuse</li>
        </ul>
      </PolicySection>

      <PolicySection id="data-sharing" title="4. Data Sharing and Disclosure">
        <p>We do not sell your personal data.</p>
        <p>We may share data only in the following cases:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>With service providers that help operate the app</li>
          <li>When required by law or legal processes</li>
          <li>
            To protect the rights, safety, and security of users and the
            platform
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="data-retention" title="5. Data Retention">
        <p>We retain your data only as long as necessary to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Maintain your account</li>
          <li>Provide services</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>You may request deletion of your data at any time.</p>
      </PolicySection>

      <PolicySection id="security" title="6. Security">
        <p>We take reasonable measures to protect your data, including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Secure API communication (HTTPS)</li>
          <li>Authentication using tokens (JWT)</li>
          <li>Restricted access to user data</li>
        </ul>
        <p>However, no system is completely secure.</p>
      </PolicySection>

      <PolicySection id="your-rights" title="7. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Access your data</li>
          <li>Update your information</li>
          <li>Request deletion of your account</li>
          <li>Withdraw consent (by stopping use of the app)</li>
        </ul>
      </PolicySection>

      <PolicySection id="childrens-privacy" title="8. Children's Privacy">
        <p>
          This app is not intended for children under 13. We do not knowingly
          collect data from children.
        </p>
      </PolicySection>

      <PolicySection
        id="third-party-services"
        title="9. Third-Party Services"
      >
        <p>
          The app may use third-party services (e.g., analytics, hosting).
          These services may collect limited information as per their own
          privacy policies.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="10. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time.</p>
        <p>
          Users will be notified of significant changes through the app or
          website.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="11. Contact Us">
        <p>If you have any questions about this Privacy Policy, contact us at:</p>
        <p>
          Email:{" "}
          <a
            href="mailto:support@sportsnews.com"
            className="font-medium text-primary hover:text-primary-hover"
          >
            support@sportsnews.com
          </a>
        </p>
      </PolicySection>

      <section className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-red-300 sm:text-xl">
          Delete Your Account
        </h2>
        <p className="mt-3 text-sm leading-7 text-red-200 sm:text-base">
          You can request permanent deletion of your account and associated
          data at any time.
        </p>
        <div className="mt-5">
          <Link
            href="/account-deletion"
            className="inline-flex rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
          >
            Delete Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}