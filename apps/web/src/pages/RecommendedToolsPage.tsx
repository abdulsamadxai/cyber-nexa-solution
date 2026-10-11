import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, BookOpen } from "lucide-react";
import { Seo } from "@/components/Seo";
import { PageHero, SectionHeading, Reveal } from "@/components/site/Section";
import { AffiliateDisclosure } from "@/components/site/AffiliateDisclosure";
import { LinkButton } from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────────────────
//  REPLACE WITH YOUR REAL AFFILIATE LINKS BEFORE PUBLISHING.
//  Sign up for each program, copy your personal link from its dashboard, and
//  paste it below. Pages published with placeholder links earn nothing — and
//  never publish someone else's links.
// ─────────────────────────────────────────────────────────────────────────────
const LINKS = {
  hostinger: "[YOUR_HOSTINGER_AFFILIATE_LINK]",
  cloudways: "[YOUR_CLOUDWAYS_AFFILIATE_LINK]",
  elementor: "[YOUR_ELEMENTOR_AFFILIATE_LINK]",
  make: "[YOUR_MAKE_AFFILIATE_LINK]",
};

interface Tool {
  eyebrow: string;
  name: string;
  tagline: string;
  body: string;
  bestFor: string;
  notFor: string;
  watchOut?: string;
  cta: string;
  href: string;
}

const HOSTING_TOOLS: Tool[] = [
  {
    eyebrow: "Hosting · Best for most small businesses",
    name: "Hostinger",
    tagline: "Affordable managed hosting for a first business website.",
    body: "We recommend Hostinger when a client needs a professional website live quickly, without a developer babysitting a server. Its hPanel is simple for non-technical owners, plans bundle a free domain for the first year and free SSL on eligible plans, and introductory pricing keeps the first term cheap.",
    bestFor: "First websites, portfolios, service businesses, new blogs.",
    notFor: "High-traffic stores or sites expecting big traffic spikes — you will outgrow shared hosting.",
    watchOut: "The headline price needs a long first term, and renewal prices are higher. Budget for the renewal, not just the offer.",
    cta: "Get Hostinger",
    href: LINKS.hostinger,
  },
  {
    eyebrow: "Hosting · Best when speed and growth matter",
    name: "Cloudways",
    tagline: "Managed cloud hosting when your website is a serious sales channel.",
    body: "Cloudways puts your site on cloud infrastructure (DigitalOcean, AWS or Google Cloud) and manages the server layer for you. You pay monthly, with no long contract, and scale up as traffic grows.",
    bestFor: "Growing businesses, WooCommerce stores, agencies, sites with traffic from several countries.",
    notFor: "A first website on a tight budget — it costs more per month, email and domain are separate, and the dashboard assumes some technical confidence (or a team like ours managing it for you).",
    cta: "Try Cloudways",
    href: LINKS.cloudways,
  },
];

const BUILDER_TOOLS: Tool[] = [
  {
    eyebrow: "Website building · WordPress page builder",
    name: "Elementor",
    tagline: "The WordPress builder we use for fast, custom page designs.",
    body: "Elementor Pro unlocks the theme builder, pop-up builder, form widgets and WooCommerce controls that the free version leaves out. For a business that wants a custom-looking WordPress site without a fully hand-coded front end, it is the practical middle ground.",
    bestFor: "WordPress service sites, landing pages, small WooCommerce shops.",
    notFor: "Projects where raw speed is the top priority and a lightweight theme alone would do — a builder always adds some weight, so we optimise around it.",
    cta: "Get Elementor Pro",
    href: LINKS.elementor,
  },
  {
    eyebrow: "Automation",
    name: "Make",
    tagline: "Visual automation for connecting the tools a business already uses.",
    body: "When we build automation systems — a form that creates a CRM record, notifies the team, updates a sheet and sends a follow-up email — Make is one of the platforms we reach for. Its visual builder makes multi-step automations easier to follow than code.",
    bestFor: "Lead handling, CRM and sheet syncing, notifications, multi-step workflows.",
    notFor: "A single, very simple two-app connection — a simpler tool (or a built-in integration) may be enough.",
    cta: "Try Make free",
    href: LINKS.make,
  },
];

function AffiliateButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      rel="sponsored nofollow noopener"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-[15px] font-medium text-white transition-all duration-200 hover:bg-brand-700"
    >
      {children}
      <ExternalLink className="h-4 w-4" aria-hidden />
    </a>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Reveal className="flex h-full flex-col rounded-2xl border border-mist bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{tool.eyebrow}</p>
      <h3 className="mt-2 font-display text-xl font-semibold text-ink">{tool.name}</h3>
      <p className="mt-1 text-[15px] font-medium text-ink/80">{tool.tagline}</p>
      <p className="mt-3 text-[15px] leading-relaxed text-slate">{tool.body}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-ink">Best for:</dt>
          <dd className="text-slate">{tool.bestFor}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold text-ink">Not for:</dt>
          <dd className="text-slate">{tool.notFor}</dd>
        </div>
        {tool.watchOut && (
          <div className="flex gap-2">
            <dt className="shrink-0 font-semibold text-ink">Watch out:</dt>
            <dd className="text-slate">{tool.watchOut}</dd>
          </div>
        )}
      </dl>
      <div className="mt-6 pt-2">
        <AffiliateButton href={tool.href}>{tool.cta}</AffiliateButton>
      </div>
    </Reveal>
  );
}

const SITE_URL = "https://www.cybernexasolution.com";

export function RecommendedToolsPage() {
  const allTools = [...HOSTING_TOOLS, ...BUILDER_TOOLS];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tools We Recommend — Cyber Nexa Solution",
    description: "The hosting, website and automation tools we use and recommend for client projects.",
    url: `${SITE_URL}/recommended-tools`,
    itemListElement: allTools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.name,
      description: tool.tagline,
    })),
  };

  return (
    <>
      <Seo
        title="Tools We Recommend"
        description="The hosting, website and automation tools we use and recommend for client projects at Cyber Nexa Solution — what each is best for, what it is not for, and what it costs."
        path="/recommended-tools"
        jsonLd={jsonLd}
      />

      <PageHero
        eyebrow="Resources"
        title="Tools we recommend — and actually build with"
        description="Clients ask us on almost every project: which hosting, builder and automation tools should we pay for? This page is our answer. Everything below is a tool we use, deploy, or set up for clients. If a tool stops earning its place, it comes off this page."
      />

      <div className="container-tight pt-10">
        <div className="mx-auto max-w-3xl">
          <AffiliateDisclosure text="Some links on this page are affiliate links. If you buy through them, we may earn a commission at no extra cost to you. It never changes what we recommend — we recommend the same tools on paid client projects where we earn nothing extra for doing so. See the disclosure at the foot of this page." />
        </div>
      </div>

      {/* ── Hosting ── */}
      <section className="container-tight py-14">
        <SectionHeading eyebrow="Hosting" title="Start here" description="Hosting is the foundation everything else sits on. Pick the tier that matches where your business is today — you can always move up later." />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {HOSTING_TOOLS.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </section>

      {/* ── Builders & automation ── */}
      <section className="border-t border-mist bg-white">
        <div className="container-tight py-14">
          <SectionHeading eyebrow="Build & automate" title="Website building and automation tools" />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {BUILDER_TOOLS.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>

          <Reveal className="mt-4 rounded-2xl border border-mist bg-paper p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-ink">About Zapier — deliberately not a buy button</h3>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-slate">
              Clients often ask about Zapier, and we use it on projects where its app coverage is the right fit. Zapier does not offer a
              public sign-up-and-share affiliate link program — its partner route is application-based for solution partners. So we list
              Zapier here as a tool we work with, with a link to our automation services instead of an affiliate button.
            </p>
            <LinkButton to="/services/ai-solutions" variant="secondary" size="sm" className="mt-4">
              Our automation services <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </Reveal>
        </div>
      </section>

      {/* ── Related reading ── */}
      <section className="container-tight py-14">
        <Reveal className="flex flex-col items-start gap-4 rounded-2xl border border-mist bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:p-8">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <BookOpen className="h-6 w-6" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-ink">Choosing hosting? Read our comparison first</h3>
            <p className="mt-1 text-[15px] text-slate">Hostinger vs Cloudways for a small business website — an honest breakdown of price, ease, speed and scaling from a team that builds client sites on both.</p>
          </div>
          <LinkButton to="/blog/best-hosting-small-business-website" variant="secondary">
            Read the guide <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </Reveal>
      </section>

      {/* ── Closing CTA ── */}
      <section className="container-tight pb-16">
        <div className="rounded-2xl border border-mist bg-white p-8 text-center sm:p-12">
          <h2 className="font-display text-xl font-semibold text-ink">Not sure which stack fits your project?</h2>
          <p className="mx-auto mt-2 max-w-lg text-slate">
            Tell us what you are building and we will recommend the combination we would use ourselves — including when the honest answer is the free or cheaper option.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton to="/contact">Contact us <ArrowRight className="h-4 w-4" /></LinkButton>
            <LinkButton to="/services" variant="secondary">Browse services</LinkButton>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-xs leading-relaxed text-slate/80">
          Affiliate disclosure (full text): Cyber Nexa Solution participates in affiliate programs including Hostinger, Cloudways, Elementor
          and Make. If you purchase through a link marked on this page, we may receive a commission from the provider at no additional cost
          to you. Commissions help us keep publishing guides. They do not buy a place on this page: every tool listed is one we use or deploy
          for clients.
        </p>
        <p className="mx-auto mt-4 max-w-3xl text-xs text-slate/60">
          Prefer browsing? See <Link to="/services" className="underline hover:text-ink">our services</Link> or read the{" "}
          <Link to="/blog/best-hosting-small-business-website" className="underline hover:text-ink">hosting comparison guide</Link>.
        </p>
      </section>
    </>
  );
}
