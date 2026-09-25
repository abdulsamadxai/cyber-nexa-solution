import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { LoadingBlock } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useProject } from "@/hooks/useContent";
import { formatDate } from "@/lib/format";
import { NotFoundPage } from "./NotFoundPage";
import { ArrowRight, Check, ExternalLink, Github } from "lucide-react";

export function ProjectDetailPage() {
  const { slug = "" } = useParams();
  const { data: project, isLoading, isError } = useProject(slug);
  const [active, setActive] = useState(0);
  if (isLoading) return <LoadingBlock />;
  if (isError || !project) return <NotFoundPage />;

  return (
    <>
      <Seo title={project.seoTitle || project.title} description={project.seoDescription || project.summary} path={`/projects/${project.slug}`} image={project.coverImage || undefined} />
      <section className="border-b border-mist bg-white">
        <div className="container-tight py-16">
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate"><Link to="/projects" className="hover:text-brand-600">Work</Link><span>/</span><span className="text-ink/70">{project.title}</span></nav>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="brand">{project.category}</Badge>
            {project.isSample && <Badge tone="amber">Sample project</Badge>}
            {project.date && <span className="text-sm text-slate">{formatDate(project.date)}</span>}
          </div>
          <h1 className="mt-4 max-w-3xl text-display font-semibold text-ink">{project.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate">{project.summary}</p>
          {(project.projectUrl || project.githubUrl) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.projectUrl && <LinkButton to={project.projectUrl} external variant="secondary" size="sm">Visit site <ExternalLink className="h-4 w-4" /></LinkButton>}
              {project.githubUrl && <LinkButton to={project.githubUrl} external variant="secondary" size="sm"><Github className="h-4 w-4" /> Code</LinkButton>}
            </div>
          )}
        </div>
      </section>

      {project.images.length > 0 && (
        <section className="border-b border-mist bg-paper">
          <div className="container-tight py-12">
            <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-soft">
              <img src={project.images[active]?.url} alt={project.images[active]?.alt || project.title} className="aspect-[16/9] w-full object-cover" />
            </div>
            {project.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {project.images.map((img, i) => (
                  <button key={img.id} onClick={() => setActive(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition-all ${active === i ? "ring-brand-600" : "ring-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="container-tight grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          {project.description && <div className="prose-amanah whitespace-pre-line">{project.description}</div>}
          {project.problem && <div><h2 className="font-display text-xl font-semibold text-ink">The challenge</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-ink/80">{project.problem}</p></div>}
          {project.solution && <div><h2 className="font-display text-xl font-semibold text-ink">Our solution</h2><p className="mt-3 whitespace-pre-line leading-relaxed text-ink/80">{project.solution}</p></div>}
          {project.features.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Key features</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">{project.features.map((f) => <li key={f} className="flex items-start gap-2.5 text-[15px] text-ink/80"><Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />{f}</li>)}</ul>
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-mist bg-white p-6">
            {project.clientName && <div className="mb-4"><div className="text-xs font-medium uppercase tracking-wide text-slate/70">Client</div><div className="mt-0.5 font-medium text-ink">{project.clientName}</div></div>}
            {project.technologies.length > 0 && (
              <div><div className="text-xs font-medium uppercase tracking-wide text-slate/70">Technologies</div><div className="mt-2 flex flex-wrap gap-1.5">{project.technologies.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}</div></div>
            )}
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
            <h3 className="font-display text-lg font-semibold">Have a similar project?</h3>
            <p className="mt-2 text-sm text-white/80">Let's talk about what you're trying to build.</p>
            <LinkButton to="/start-a-project" className="mt-5 w-full bg-white !text-brand-700 hover:bg-white/90">Start a project <ArrowRight className="h-4 w-4" /></LinkButton>
          </div>
        </aside>
      </section>
    </>
  );
}
