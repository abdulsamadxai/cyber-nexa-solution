import { Helmet } from "react-helmet-async";
import { useSettings } from "@/hooks/useSettings";

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: object | object[];
  published?: string | null;
  modified?: string | null;
}

export function Seo({ title, description, image, path, type = "website", noindex, jsonLd, published, modified }: SeoProps) {
  const { data: settings } = useSettings();
  const company = settings?.general.companyName ?? "Cyber Nexa Solution";
  const fullTitle = title ? `${title} · ${company}` : settings?.seo.defaultTitle ?? company;
  const desc = description ?? settings?.seo.defaultDescription ?? "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = origin + (path ?? (typeof window !== "undefined" ? window.location.pathname : ""));
  const ogImage = image || settings?.seo.ogImage || settings?.general.logoUrl || "";
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={company} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {published && <meta property="article:published_time" content={published} />}
      {modified && <meta property="article:modified_time" content={modified} />}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  );
}
