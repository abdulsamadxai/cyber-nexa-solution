import { motion } from "framer-motion";
import { cn } from "@/lib/format";

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: { eyebrow?: string; title: string; description?: string; align?: "left" | "center"; className?: string }) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {eyebrow && (
        <div className={cn("mb-3 flex items-center gap-2", align === "center" && "justify-center")}>
          <span className="h-px w-6 bg-brand-400" />
          <span className="text-sm font-semibold text-brand-600">{eyebrow}</span>
        </div>
      )}
      <h2 className="text-heading font-semibold text-ink">{title}</h2>
      {description && <p className="mt-3 text-[16px] leading-relaxed text-slate">{description}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-mist bg-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:22px_22px] opacity-60" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/40 blur-3xl" />
      <div className="container-tight relative py-16 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
          {eyebrow && (
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-6 bg-brand-400" />
              <span className="text-sm font-semibold text-brand-600">{eyebrow}</span>
            </div>
          )}
          <h1 className="text-display font-semibold text-ink">{title}</h1>
          {description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate">{description}</p>}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
