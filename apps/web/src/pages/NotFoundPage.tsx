import { Seo } from "@/components/Seo";
import { LinkButton } from "@/components/ui/Button";
import { Home, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <section className="container-tight flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="font-display text-[110px] font-bold leading-none text-brand-100">404</div>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">We couldn't find that page</h1>
        <p className="mt-3 max-w-md text-slate">The page may have moved or no longer exists. Let's get you back on track.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton to="/"><Home className="h-4 w-4" /> Back home</LinkButton>
          <LinkButton to="/services" variant="secondary"><Search className="h-4 w-4" /> Browse services</LinkButton>
        </div>
      </section>
    </>
  );
}
