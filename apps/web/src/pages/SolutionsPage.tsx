import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { PageHero, Reveal } from "@/components/site/Section";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/ui/Feedback";
import { useSolutions } from "@/hooks/useContent";
import { resolveIcon } from "@/lib/icons";
import { ArrowUpRight, Boxes } from "lucide-react";

export function SolutionsPage() {
  const { data, isLoading, isError, refetch } = useSolutions();
  return (
    <>
      <Seo title="Solutions" description="Ready-shaped software solutions for common business challenges — tailored to your operation." path="/solutions" />
      <PageHero eyebrow="Solutions" title="Systems shaped around real business needs" description="Proven starting points for the challenges businesses face most often. Each one is tailored to how you actually work." />
      <section className="container-tight py-16">
        {isLoading && <LoadingBlock />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && data.length === 0 && <EmptyState icon={Boxes} title="Solutions coming soon" description="We're preparing our solutions catalogue. In the meantime, tell us your challenge directly." />}
        {data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((solution, i) => {
              const Icon = resolveIcon(solution.icon);
              return (
                <Reveal key={solution.id} delay={i * 0.04}>
                  <Link to={`/solutions/${solution.slug}`} className="group flex h-full flex-col rounded-2xl border border-mist bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift">
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white"><Icon className="h-5 w-5" strokeWidth={1.75} /></span>
                      <span className="text-xs font-medium text-brand-600">{solution.industry}</span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold text-ink">{solution.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">{solution.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">Explore <ArrowUpRight className="h-4 w-4" /></span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
