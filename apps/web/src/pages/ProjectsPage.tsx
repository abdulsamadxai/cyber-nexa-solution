import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { PageHero, Reveal } from "@/components/site/Section";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { useProjects } from "@/hooks/useContent";
import { cn } from "@/lib/format";
import { Briefcase, ArrowUpRight, ImageIcon } from "lucide-react";

export function ProjectsPage() {
  const [category, setCategory] = useState<string | undefined>();
  const { data, isLoading, isError, refetch } = useProjects({ category });
  const categories = (data?.meta.categories as string[]) ?? [];

  return (
    <>
      <Seo title="Our Work" description="A selection of projects we've designed and built — websites, applications, and business systems." path="/projects" />
      <PageHero eyebrow="Our work" title="Projects we've designed and built" description="A look at how we turn business challenges into working software. Sample projects are clearly labelled." />
      <section className="container-tight py-16">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button onClick={() => setCategory(undefined)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors", !category ? "bg-brand-600 text-white" : "bg-white text-slate ring-1 ring-mist hover:ring-brand-200")}>All</button>
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors", category === c ? "bg-brand-600 text-white" : "bg-white text-slate ring-1 ring-mist hover:ring-brand-200")}>{c}</button>
            ))}
          </div>
        )}
        {isLoading && <LoadingBlock />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && data.data.length === 0 && <EmptyState icon={Briefcase} title="Work samples coming soon" description="We're curating our portfolio. Get in touch to see relevant examples for your project." />}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.05}>
              <Link to={`/projects/${project.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mist bg-white transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <div className="relative aspect-[16/10] overflow-hidden bg-brand-50">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-200"><ImageIcon className="h-10 w-10" /></div>
                  )}
                  {project.isSample && <span className="absolute left-3 top-3"><Badge tone="amber">Sample project</Badge></span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-brand-600">{project.category}{project.clientName && <><span className="text-mist">·</span><span className="text-slate">{project.clientName}</span></>}</div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-ink group-hover:text-brand-700">{project.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate">{project.summary}</p>
                  {project.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 3).map((t) => <span key={t} className="rounded-md bg-paper px-2 py-0.5 text-xs text-slate ring-1 ring-mist">{t}</span>)}
                    </div>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">View project <ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
