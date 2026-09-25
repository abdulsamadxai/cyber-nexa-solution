import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { LoadingBlock } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/site/Section";
import { useService } from "@/hooks/useContent";
import { resolveIcon } from "@/lib/icons";
import { NotFoundPage } from "./NotFoundPage";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

export function ServiceDetailPage() {
  const { slug = "" } = useParams();
  const { data: service, isLoading, isError } = useService(slug);
  if (isLoading) return <LoadingBlock />;
  if (isError || !service) return <NotFoundPage />;
  const Icon = resolveIcon(service.icon);

  return (
    <>
      <Seo title={service.seoTitle || service.title} description={service.seoDescription || service.shortDescription} path={`/services/${service.slug}`}
        jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: service.title, description: service.shortDescription, provider: { "@type": "Organization", name: "Cyber Nexa Solution" } }} />
      <section className="relative overflow-hidden border-b border-mist bg-gradient-to-b from-petrol to-petrol-600 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)", backgroundSize: "38px 38px" }} />
        <div className="container-tight relative py-16 sm:py-20">
          <nav className="mb-6 flex items-center gap-2 text-sm text-white/60"><Link to="/services" className="hover:text-spring">Services</Link><span>/</span><span className="text-white/80">{service.title}</span></nav>
          <div className="flex items-start gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-spring backdrop-blur"><Icon className="h-7 w-7" strokeWidth={1.75} /></span>
            <div>
              <h1 className="text-display font-bold text-white">{service.title}</h1>
              <p className="mt-3 max-w-2xl text-lg text-white/70">{service.shortDescription}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-tight grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="prose-amanah whitespace-pre-line">{service.description}</div>
          {service.features.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-ink">What's included</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {service.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] text-ink/80"><Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside className="space-y-6">
          {service.technologies.length > 0 && (
            <div className="rounded-2xl border border-mist bg-white p-6">
              <h3 className="font-display text-sm font-semibold text-ink">Technologies we use</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {service.technologies.map((t) => <Badge key={t} tone="brand">{t}</Badge>)}
              </div>
            </div>
          )}
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
            <h3 className="font-display text-lg font-semibold">{service.ctaLabel || "Ready to start?"}</h3>
            <p className="mt-2 text-sm text-white/80">Tell us about your project and we'll get back within one business day.</p>
            <LinkButton to={service.ctaUrl || "/start-a-project"} className="mt-5 w-full bg-white !text-brand-700 hover:bg-white/90">Start a project <ArrowRight className="h-4 w-4" /></LinkButton>
          </div>
        </aside>
      </section>

      {service.related && service.related.length > 0 && (
        <section className="border-t border-mist bg-white">
          <div className="container-tight py-16">
            <h2 className="font-display text-xl font-semibold text-ink">Related services</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {service.related.map((r, i) => {
                const RIcon = resolveIcon(r.icon);
                return (
                  <Reveal key={r.id} delay={i * 0.05}>
                    <Link to={`/services/${r.slug}`} className="group flex flex-col rounded-2xl border border-mist bg-paper p-5 transition-all hover:border-brand-200 hover:shadow-soft">
                      <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600"><RIcon className="h-5 w-5" strokeWidth={1.75} /></span>
                      <span className="font-display font-semibold text-ink group-hover:text-brand-700">{r.title}</span>
                      <span className="mt-1 flex-1 text-sm text-slate">{r.shortDescription}</span>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">Learn more <ArrowUpRight className="h-3.5 w-3.5" /></span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
