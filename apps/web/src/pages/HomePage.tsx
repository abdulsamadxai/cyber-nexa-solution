import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Handshake, Star } from "lucide-react";
import { Seo } from "@/components/Seo";
import { SystemMap } from "@/components/site/SystemMap";
import { Reveal, SectionHeading } from "@/components/site/Section";
import { ServiceCardTile } from "@/components/site/ServiceCardTile";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useServices, useSolutions, useTestimonials } from "@/hooks/useContent";
import { useSettings } from "@/hooks/useSettings";
import { resolveIcon } from "@/lib/icons";
import { Skeleton } from "@/components/ui/Feedback";

const approach = [
  { title: "Understand", body: "We start by learning how your business runs — where time is lost and what a better day looks like for your team." },
  { title: "Design", body: "We map the solution and build clickable prototypes you can react to, before a line of production code is written." },
  { title: "Build", body: "We deliver in stages with regular demos, so you see working software every one to two weeks — never a black box." },
  { title: "Support", body: "After launch we stay involved: monitoring, improvements and advice as your business changes and grows." },
];

const trust = [
  { icon: Handshake, title: "Clear, honest estimates", body: "You know the scope, timeline and cost before work begins. No surprises." },
  { icon: ShieldCheck, title: "Security in every build", body: "Encrypted connections, hashed passwords, access control and audit logs as standard." },
  { icon: Sparkles, title: "You own everything", body: "On completion, the code, designs and data belong to your business — with full handover." },
];

export function HomePage() {
  const { data: settings } = useSettings();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: solutions } = useSolutions();
  const { data: testimonials } = useTestimonials();
  const hero = settings?.hero;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.general.companyName ?? "Cyber Nexa Solution",
    description: settings?.seo.defaultDescription,
    url: typeof window !== "undefined" ? window.location.origin : "",
    ...(settings?.general.email ? { email: settings.general.email } : {}),
    ...(settings?.general.phone ? { telephone: settings.general.phone } : {}),
  };

  return (
    <>
      <Seo jsonLd={jsonLd} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-petrol to-petrol-600 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="container-tight relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge tone="brand" className="border border-spring/20 bg-spring/10 text-spring" dot>Technology partner for growing businesses</Badge>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }} className="mt-5 text-display-lg font-bold tracking-tight text-white">
              {hero?.heading ?? "Technology Built Around Your Business."}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }} className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              {hero?.description ?? "We design and build websites, applications, AI solutions, automation systems, and custom software that help businesses work smarter and grow."}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }} className="mt-8 flex flex-wrap gap-3">
              <LinkButton to={hero?.primaryCtaUrl ?? "/start-a-project"} size="lg" className="bg-spring text-petrol hover:bg-spring/90 hover:shadow-glow">
                {hero?.primaryCtaLabel ?? "Start a Project"} <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton to={hero?.secondaryCtaUrl ?? "/services"} size="lg" variant="secondary" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30">
                {hero?.secondaryCtaLabel ?? "Explore Services"}
              </LinkButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
              {["Websites & apps", "AI & automation", "Business systems"].map((t) => (
                <span key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-spring" />{t}</span>
              ))}
            </motion.div>
          </div>
          <div className="relative">
            <SystemMap />
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* ── Services ── */}
      <section className="container-tight py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="What we do" title="Everything you need to build and run modern technology" description="From your public website to the systems that run your operations, we design, build and support it — so you work with one team that understands the whole picture." />
          <LinkButton to="/services" variant="secondary" size="sm">All services <ArrowRight className="h-4 w-4" /></LinkButton>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicesLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          {services?.slice(0, 6).map((service) => <ServiceCardTile key={service.id} service={service} />)}
        </div>
      </section>

      {/* ── Approach (a real sequence, hence numbered) ── */}
      <section className="border-y border-mist bg-white">
        <div className="container-tight py-20 sm:py-24">
          <SectionHeading eyebrow="How we work" title="A calm, transparent process from first call to launch" description="Trust is earned, not claimed. Our process is built to earn it — with visibility at every step and no surprises." />
          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {approach.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <li className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white">{i + 1}</span>
                    {i < approach.length - 1 && <span className="hidden h-px flex-1 bg-gradient-to-r from-brand-200 to-transparent lg:block" />}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{step.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Solutions ── */}
      <section className="container-tight py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Solutions by need" title="Ready-shaped systems for common business challenges" description="Proven starting points we tailor to your operation — from restaurants and retail to clinics, schools and service businesses." />
          <LinkButton to="/solutions" variant="secondary" size="sm">Browse solutions <ArrowRight className="h-4 w-4" /></LinkButton>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutions?.slice(0, 6).map((solution, i) => {
            const Icon = resolveIcon(solution.icon);
            return (
              <Reveal key={solution.id} delay={i * 0.05}>
                <Link to={`/solutions/${solution.slug}`} className="group flex items-start gap-4 rounded-2xl border border-mist bg-white p-5 transition-all hover:border-brand-200 hover:shadow-soft">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" strokeWidth={1.75} /></span>
                  <span>
                    <span className="block text-xs font-medium text-brand-600">{solution.industry}</span>
                    <span className="mt-0.5 block font-display font-semibold text-ink group-hover:text-brand-700">{solution.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate">{solution.summary}</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Trust band ── */}
      <section className="border-y border-mist bg-brand-50/40">
        <div className="container-tight py-20 sm:py-24">
          <SectionHeading align="center" eyebrow="Why Cyber Nexa" title="Built on trust, delivered with care" />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {trust.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-mist bg-white p-6 text-center">
                  <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-white"><item.icon className="h-6 w-6" strokeWidth={1.75} /></div>
                  <h3 className="font-display text-base font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials (only if present; samples are labelled) ── */}
      {testimonials && testimonials.length > 0 && (
        <section className="container-tight py-20 sm:py-24">
          <SectionHeading eyebrow="In their words" title="What working with us is like" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure key={t.id} className="flex flex-col rounded-2xl border border-mist bg-white p-6">
                {t.rating && <div className="mb-3 flex gap-0.5">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</div>}
                <blockquote className="flex-1 text-[15px] leading-relaxed text-ink/80">“{t.content}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-display text-sm font-semibold text-brand-700">{t.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">{t.name}{t.isSample && <Badge tone="amber" className="text-[10px]">Sample</Badge>}</div>
                    {(t.role || t.company) && <div className="text-xs text-slate">{[t.role, t.company].filter(Boolean).join(", ")}</div>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="container-tight pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-petrol to-petrol-600 px-8 py-14 text-center text-white sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-spring/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-heading font-semibold text-white">Have a project in mind? Let's talk.</h2>
            <p className="mt-4 text-lg text-white/70">Tell us what you're trying to achieve. We'll reply within one business day with honest, practical next steps — no obligation.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton to="/start-a-project" size="lg" className="bg-spring text-petrol hover:bg-spring/90">Start a Project <ArrowRight className="h-4 w-4" /></LinkButton>
              <LinkButton to="/contact" size="lg" variant="secondary" className="border-white/20 bg-white/5 text-white hover:bg-white/10">Contact us</LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
