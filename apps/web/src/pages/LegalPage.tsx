import { Seo } from "@/components/Seo";
import { PageHero } from "@/components/site/Section";
import { useSettings } from "@/hooks/useSettings";

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const { data: settings } = useSettings();
  const company = settings?.general.companyName ?? "Cyber Nexa Solution";
  const email = settings?.general.email ?? "cybernexasolution@gmail.com";
  const updated = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const isPrivacy = kind === "privacy";

  return (
    <>
      <Seo title={isPrivacy ? "Privacy Policy" : "Terms of Service"} path={`/${kind}`} />
      <PageHero eyebrow="Legal" title={isPrivacy ? "Privacy Policy" : "Terms of Service"} description={`Last updated ${updated}`} />
      <section className="container-tight max-w-3xl py-16">
        <div className="prose-amanah">
          {isPrivacy ? (
            <>
              <p>This Privacy Policy explains how {company} ("we", "us") collects, uses and protects the information you provide when you use our website or contact us. We are committed to handling your data responsibly and transparently.</p>
              <h2>Information we collect</h2>
              <p>When you submit a contact message, project inquiry or newsletter subscription, we collect the details you provide — such as your name, email address, phone number, company and the content of your message. We also collect privacy-friendly, aggregated analytics about how our website is used. We do not use tracking cookies, and our analytics do not store your raw IP address or personally identify you.</p>
              <h2>How we use your information</h2>
              <p>We use the information you provide to respond to your inquiries, deliver services you request, and — only where you have opted in — send occasional updates. We never sell your personal data to third parties.</p>
              <h2>Data retention</h2>
              <p>We keep inquiry and contact records for as long as needed to provide our services and meet legal obligations. You may ask us to delete your information at any time.</p>
              <h2>Your rights</h2>
              <p>You have the right to access, correct or delete the personal information we hold about you, and to withdraw consent for marketing communications. To exercise any of these rights, contact us at <a href={`mailto:${email}`}>{email}</a>.</p>
              <h2>Security</h2>
              <p>We protect your data with encryption in transit, hashed credentials, access controls and audit logging. While no system is perfectly secure, we take reasonable measures to safeguard your information.</p>
              <h2>Contact</h2>
              <p>For any questions about this policy or your data, email us at <a href={`mailto:${email}`}>{email}</a>.</p>
              <p className="text-sm text-slate">This template is provided for convenience and does not constitute legal advice. Please have it reviewed against the laws that apply to your business.</p>
            </>
          ) : (
            <>
              <p>These Terms of Service govern your use of the {company} website and any services we provide. By using our website or engaging our services, you agree to these terms.</p>
              <h2>Use of our website</h2>
              <p>You may use our website for lawful purposes only. You agree not to misuse the site, attempt to gain unauthorised access, or interfere with its normal operation.</p>
              <h2>Services and engagements</h2>
              <p>Any project we undertake is governed by a separate written agreement setting out scope, deliverables, timelines and fees. Information on this website — including pricing guidance — is indicative and does not constitute a binding offer.</p>
              <h2>Intellectual property</h2>
              <p>The content, branding and design of this website are owned by {company}. On completion and full payment of a project, ownership of the agreed deliverables transfers to the client as set out in the relevant agreement.</p>
              <h2>Limitation of liability</h2>
              <p>To the extent permitted by law, we are not liable for indirect or consequential losses arising from the use of our website. Nothing in these terms excludes liability that cannot be excluded by law.</p>
              <h2>Changes</h2>
              <p>We may update these terms from time to time. Continued use of the website after changes take effect constitutes acceptance of the revised terms.</p>
              <h2>Contact</h2>
              <p>Questions about these terms can be sent to <a href={`mailto:${email}`}>{email}</a>.</p>
              <p className="text-sm text-slate">This template is provided for convenience and does not constitute legal advice. Please have it reviewed against the laws that apply to your business.</p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
