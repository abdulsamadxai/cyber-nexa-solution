import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { PageHero, Reveal } from "@/components/site/Section";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/ui/Feedback";
import { useIndustries } from "@/hooks/useContent";
import { resolveIcon } from "@/lib/icons";
import { Building2, ArrowUpRight } from "lucide-react";

export function IndustriesPage() {
  const { data, isLoading, isError, refetch } = useIndustries();
  return (
    <>
      <Seo title="Industries" description="Technology solutions tailored to the way different industries work — retail, hospitality, healthcare, education, professional services and more." path="/industries" />
      <PageHero eyebrow="Industries" title="We build for the way your industry works" description="Every sector has its own rhythm, rules and pressures. Here's how we shape technology to fit yours." />
      <section className="container-tight py-16">
        {isLoading && <LoadingBlock />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && data.length === 0 && <EmptyState icon={Building2} title="Industry pages coming soon" description="Tell us your sector and we'll share relevant examples directly." />}
        <div className="space-y-14">
          {data?.map((group, gi) => (
            <Reveal key={group.industry} delay={gi * 0.05}>
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><Building2 className="h-5 w-5" strokeWidth={1.75} /></span>
                  <h2 className="font-display text-xl font-semibold text-ink">{group.industry}</h2>
                  <span className="h-px flex-1 bg-mist" />
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.solutions.map((s) => {
                    const Icon = resolveIcon(s.icon);
                    return (
                      <Link key={s.id} to={`/solutions/${s.slug}`} className="group flex items-start gap-3.5 rounded-2xl border border-mist bg-white p-5 transition-all hover:border-brand-200 hover:shadow-soft">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon className="h-5 w-5" strokeWidth={1.75} /></span>
                        <span>
                          <span className="flex items-center gap-1 font-display font-semibold text-ink group-hover:text-brand-700">{s.title}<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" /></span>
                          <span className="mt-1 block text-sm text-slate">{s.summary}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
