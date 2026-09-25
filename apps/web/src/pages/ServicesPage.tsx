import { Seo } from "@/components/Seo";
import { PageHero } from "@/components/site/Section";
import { ServiceCardTile } from "@/components/site/ServiceCardTile";
import { LoadingBlock, ErrorState } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";
import { useServices } from "@/hooks/useContent";
import { ArrowRight } from "lucide-react";

export function ServicesPage() {
  const { data, isLoading, isError, refetch } = useServices();
  return (
    <>
      <Seo title="Services" description="Web and mobile development, AI solutions, automation, custom software and business systems — designed around how your business works." path="/services" />
      <PageHero eyebrow="Services" title="Technology services, end to end" description="One team for your website, applications, AI, automation and the systems that run your business. Explore what we build and how it fits together." />
      <section className="container-tight py-16">
        {isLoading && <LoadingBlock />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((service) => <ServiceCardTile key={service.id} service={service} />)}
          </div>
        )}
        <div className="mt-14 rounded-2xl border border-mist bg-white p-8 text-center sm:p-12">
          <h2 className="font-display text-xl font-semibold text-ink">Not sure which service you need?</h2>
          <p className="mx-auto mt-2 max-w-lg text-slate">Tell us the problem you're trying to solve and we'll recommend the right approach — even if that's not the biggest project.</p>
          <LinkButton to="/start-a-project" className="mt-6">Start a project <ArrowRight className="h-4 w-4" /></LinkButton>
        </div>
      </section>
    </>
  );
}
