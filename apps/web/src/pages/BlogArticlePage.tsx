import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { LoadingBlock } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { usePost } from "@/hooks/useContent";
import { formatDate } from "@/lib/format";
import { api } from "@/lib/api";
import { NotFoundPage } from "./NotFoundPage";
import { PostCardTile } from "./BlogPage";

const SITE_URL = "https://www.cybernexasolution.com";

export function BlogArticlePage() {
  const { slug = "" } = useParams();
  const { data: post, isLoading, isError } = usePost(slug);

  useEffect(() => {
    if (post?.slug) api(`/api/blog/posts/${post.slug}/view`, { method: "POST" }).catch(() => {});
  }, [post?.slug]);

  if (isLoading) return <LoadingBlock />;
  if (isError || !post) return <NotFoundPage />;

  const description = post.seoDescription || post.excerpt;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    ...(post.featuredImage ? { image: post.featuredImage } : {}),
    author: { "@type": "Organization", name: "Cyber Nexa Solution", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Cyber Nexa Solution",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <Seo
        title={post.seoTitle || post.title}
        description={description}
        path={`/blog/${post.slug}`}
        image={post.featuredImage || undefined}
        type="article"
        published={post.publishedAt}
        modified={post.updatedAt}
        jsonLd={jsonLd}
      />
      <section className="border-b border-mist bg-white">
        <div className="container-tight py-16">
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate"><Link to="/blog" className="hover:text-brand-600">Blog</Link><span>/</span><span className="text-ink/70">{post.title}</span></nav>
          <div className="flex flex-wrap items-center gap-3">
            {post.category && <Badge tone="brand">{post.category.name}</Badge>}
            {post.publishedAt && <span className="text-sm text-slate">{formatDate(post.publishedAt)}</span>}
            <span className="text-sm text-slate">·</span>
            <span className="text-sm text-slate">{post.readingMinutes} min read</span>
            {post.authorName && <><span className="text-sm text-slate">·</span><span className="text-sm text-slate">By {post.authorName}</span></>}
          </div>
          <h1 className="mt-4 max-w-3xl text-display font-semibold text-ink">{post.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate">{post.excerpt}</p>
        </div>
      </section>

      {post.featuredImage && (
        <section className="border-b border-mist bg-paper">
          <div className="container-tight py-12">
            <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-soft">
              <img src={post.featuredImage} alt={post.title} className="aspect-[16/9] w-full object-cover" />
            </div>
          </div>
        </section>
      )}

      <section className="container-tight py-16">
        <div className="prose-amanah mx-auto max-w-3xl whitespace-pre-line">{post.content}</div>
        {post.tags.length > 0 && (
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-2">
            {post.tags.map((t) => <Badge key={t.slug} tone="neutral">{t.name}</Badge>)}
          </div>
        )}
      </section>

      {(post.related?.length ?? 0) > 0 && (
        <section className="border-t border-mist bg-paper">
          <div className="container-tight py-16">
            <h2 className="font-display text-2xl font-semibold text-ink">Keep reading</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {post.related!.map((rel, i) => <PostCardTile key={rel.id} post={rel} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
