import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { resolveIcon } from "@/lib/icons";
import type { ServiceCard } from "@/lib/types";

export function ServiceCardTile({ service }: { service: ServiceCard }) {
  const Icon = resolveIcon(service.icon);
  return (
    <Link
      to={`/services/${service.slug}`}
      className="group relative flex flex-col rounded-2xl border border-mist bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">{service.shortDescription}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
        Learn more <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
