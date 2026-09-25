import { useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { PageHero } from "@/components/site/Section";
import { LoadingBlock, EmptyState } from "@/components/ui/Feedback";
import { LinkButton } from "@/components/ui/Button";
import { useFaqs } from "@/hooks/useContent";
import { cn } from "@/lib/format";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function FaqPage() {
  const { data, isLoading } = useFaqs();
  const [open, setOpen] = useState<string | null>(null);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof data>();
    (data ?? []).forEach((f) => { const k = f.category || "General"; map.set(k, [...(map.get(k) ?? []), f]); });
    return [...map.entries()];
  }, [data]);

  const jsonLd = data && data.length > 0 ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: data.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) } : undefined;

  return (
    <>
      <Seo title="FAQ" description="Answers to common questions about working with Cyber Nexa Solution." path="/faq" jsonLd={jsonLd} />
      <PageHero eyebrow="FAQ" title="Questions, answered" description="Everything you might want to know about how we work, pricing, timelines and support. Can't find your answer? Just ask." />
      <section className="container-tight max-w-3xl py-16">
        {isLoading && <LoadingBlock />}
        {data && data.length === 0 && <EmptyState icon={HelpCircle} title="No FAQs yet" description="Get in touch and we'll answer any question directly." />}
        <div className="space-y-10">
          {grouped.map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-4 font-display text-lg font-semibold text-ink">{category}</h2>
              <div className="space-y-3">
                {items?.map((faq) => {
                  const isOpen = open === faq.id;
                  return (
                    <div key={faq.id} className={cn("overflow-hidden rounded-2xl border bg-white transition-colors", isOpen ? "border-brand-200" : "border-mist")}>
                      <button onClick={() => setOpen(isOpen ? null : faq.id)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={isOpen}>
                        <span className="font-medium text-ink">{faq.question}</span>
                        <ChevronDown className={cn("h-5 w-5 shrink-0 text-brand-600 transition-transform", isOpen && "rotate-180")} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                            <p className="whitespace-pre-line px-5 pb-5 leading-relaxed text-slate">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-brand-100 bg-brand-50/50 p-8 text-center">
          <h3 className="font-display text-lg font-semibold text-ink">Still have a question?</h3>
          <p className="mx-auto mt-2 max-w-md text-slate">We're happy to help. Reach out and we'll get back to you within one business day.</p>
          <LinkButton to="/contact" className="mt-5">Contact us <ArrowRight className="h-4 w-4" /></LinkButton>
        </div>
      </section>
    </>
  );
}
