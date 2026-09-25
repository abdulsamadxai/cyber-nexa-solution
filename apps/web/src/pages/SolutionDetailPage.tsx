import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { LoadingBlock } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSolution } from "@/hooks/useContent";
import { resolveIcon } from "@/lib/icons";
import { NotFoundPage } from "./NotFoundPage";
import { ArrowRight, Check, AlertCircle } from "lucide-react";

export function SolutionDetailPage() {
  const { slug = "" } = useParams();
  const { data: solution, isLoading, isError } = useSolution(slug);
  if (isLoading) return <LoadingBlock />;
  if (isError || !solution) return <NotFoundPage />;
  const Icon = resolveIcon(solution.icon);

  return (
    <>
      <Seo title={solution.seoTitle || solution.title} description={solution.seoDescription || solution.summary} path={`/solutions/${solution.slug}`} />
      <section className="relative overflow-hidden border-b border-mist bg-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="container-tight relative py-16">
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate"><Link to="/solutions" className="hover:text-brand-600">Solutions</Link><span>/</span><span className="text-ink/70">{solution.title}</span></nav>
          <Badge tone="brand" className="mb-4">{solution.industry}</Badge>
          <div className="flex items-start gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white"><Icon className="h-7 w-7" strokeWidth={1.75} /></span>
            <div>
              <h1 className="text-display font-semibold text-ink">{solution.title}</h1>
              <p className="mt-3 max-w-2xl text-lg text-slate">{solution.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-tight grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="prose-amanah whitespace-pre-line">{solution.description}</div>
          {solution.challenges.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-ink">Challenges this solves</h2>
              <ul className="mt-4 space-y-3">
                {solution.challenges.map((c) => <li key={c} className="flex items-start gap-2.5 text-[15px] text-ink/80"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold" />{c}</li>)}
              </ul>
            </div>
          )}
          {solution.features.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-ink">What it includes</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {solution.features.map((f) => <li key={f} className="flex items-start gap-2.5 text-[15px] text-ink/80"><Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />{f}</li>)}
              </ul>
            </div>
          )}
        </div>
        <aside className="space-y-6">
          {solution.technologies.length > 0 && (
            <div className="rounded-2xl border border-mist bg-white p-6">
              <h3 className="font-display text-sm font-semibold text-ink">Built with</h3>
              <div className="mt-3 flex flex-wrap gap-2">{solution.technologies.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}</div>
            </div>
          )}
          <div className="rounded-2xl bg-gradient-to-br from-petrol to-petrol-600 p-6 text-white">
            <h3 className="font-display text-lg font-semibold">Want this for your business?</h3>
            <p className="mt-2 text-sm text-white/70">We'll tailor it to your workflow and data. Start with a free conversation.</p>
            <LinkButton to="/start-a-project" className="mt-5 w-full bg-spring text-petrol hover:bg-spring/90">Start a project <ArrowRight className="h-4 w-4" /></LinkButton>
          </div>
        </aside>
      </section>
    </>
  );
}
