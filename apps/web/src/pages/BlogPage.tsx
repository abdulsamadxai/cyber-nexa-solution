import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { PageHero, Reveal } from "@/components/site/Section";
import { LoadingBlock, ErrorState, EmptyState } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { usePosts, useBlogCategories } from "@/hooks/useContent";
import { formatDate, cn } from "@/lib/format";
import { ArrowUpRight, ChevronLeft, ChevronRight, ImageIcon, Newspaper } from "lucide-react";
import type { PostCard } from "@/lib/types";

export function PostCardTile({ post, index = 0 }: { post: PostCard; index?: number }) {
  return (
    <Reveal delay={index * 0.05}>
      <Link to={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mist bg-white transition-all hover:-translate-y-0.5 hover:shadow-lift">
        <div className="relative aspect-[16/10] overflow-hidden bg-brand-50">
          {post.featuredImage ? (
            <img src={post.featuredImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-brand-200"><ImageIcon className="h-10 w-10" /></div>
          )}
          {post.category && <span className="absolute left-3 top-3"><Badge tone="brand">{post.category.name}</Badge></span>}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-xs text-slate">
            {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
            <span className="text-mist">·</span>
            <span>{post.readingMinutes} min read</span>
            {post.authorName && <><span className="text-mist">·</span><span>{post.authorName}</span></>}
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink group-hover:text-brand-700">{post.title}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate line-clamp-3">{post.excerpt}</p>
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((t) => <span key={t.slug} className="rounded-md bg-paper px-2 py-0.5 text-xs text-slate ring-1 ring-mist">{t.name}</span>)}
            </div>
          )}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">Read article <ArrowUpRight className="h-4 w-4" /></span>
        </div>
      </Link>
    </Reveal>
  );
}

export function BlogPage() {
  const [category, setCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = usePosts({ category, page });
  const { data: categories } = useBlogCategories();

  const totalPages = data?.meta.totalPages ?? 1;

  const pickCategory = (slug: string | undefined) => { setCategory(slug); setPage(1); };

  return (
    <>
      <Seo title="Blog" description="Guides and notes from the Cyber Nexa Solution team — websites, automation, AI, and growing a business online." path="/blog" />
      <PageHero eyebrow="Blog" title="Notes from the team" description="Practical guides on websites, automation, and AI — written from real client work." />
      <section className="container-tight py-16">
        {(categories?.length ?? 0) > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button onClick={() => pickCategory(undefined)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors", !category ? "bg-brand-600 text-white" : "bg-white text-slate ring-1 ring-mist hover:ring-brand-200")}>All</button>
            {categories!.map((c) => (
              <button key={c.slug} onClick={() => pickCategory(c.slug)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors", category === c.slug ? "bg-brand-600 text-white" : "bg-white text-slate ring-1 ring-mist hover:ring-brand-200")}>{c.name}</button>
            ))}
          </div>
        )}
        {isLoading && <LoadingBlock />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && data.data.length === 0 && (
          <EmptyState icon={Newspaper} title="No posts yet" description="We're writing our first articles — check back soon." />
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((post, i) => <PostCardTile key={post.id} post={post} index={i} />)}
        </div>
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate ring-1 ring-mist transition-colors hover:ring-brand-200 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Newer</button>
            <span className="text-sm text-slate">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate ring-1 ring-mist transition-colors hover:ring-brand-200 disabled:opacity-40">Older <ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </section>
    </>
  );
}
