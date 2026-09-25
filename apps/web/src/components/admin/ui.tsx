import { forwardRef } from "react";
import { cn } from "@/lib/format";
import { Loader2 } from "lucide-react";

/* Buttons tuned for the dark admin surface */
type V = "primary" | "secondary" | "ghost" | "danger";
const bBase = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
const bVariants: Record<V, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-400 shadow-sm",
  secondary: "bg-night-700 text-mist hover:bg-night-600 border border-white/5",
  ghost: "text-mist/70 hover:text-mist hover:bg-white/5",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
};
export const AdminButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V; size?: "sm" | "md"; loading?: boolean }>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading} className={cn(bBase, size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4 text-sm", bVariants[variant], className)} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}{children}
    </button>
  ),
);
AdminButton.displayName = "AdminButton";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-white/5 bg-night-800", className)}>{children}</div>;
}

export function AdminInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-10 w-full rounded-lg border border-white/10 bg-night-900/60 px-3 text-sm text-mist placeholder:text-mist/30 outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-400/40", className)} {...props} />;
}
export function AdminTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-lg border border-white/10 bg-night-900/60 px-3 py-2.5 text-sm text-mist placeholder:text-mist/30 outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-400/40 min-h-[90px] resize-y", className)} {...props} />;
}
export function AdminSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 w-full appearance-none rounded-lg border border-white/10 bg-night-900/60 px-3 pr-9 text-sm text-mist outline-none transition-colors focus:border-brand-400 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat", className)} {...props}>{children}</select>;
}
export function AdminLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <label className="mb-1.5 block text-sm font-medium text-mist/80">{children}{required && <span className="ml-0.5 text-brand-400">*</span>}</label>;
}
export function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return <div><AdminLabel required={required}>{label}</AdminLabel>{children}{error && <p className="mt-1 text-xs text-red-400">{error}</p>}</div>;
}

export function AdminEmpty({ title, description, icon: Icon }: { title: string; description?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
      {Icon && <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-white/5 text-mist/50"><Icon className="h-5 w-5" /></div>}
      <p className="font-medium text-mist">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-mist/50">{description}</p>}
    </div>
  );
}

export function AdminSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-brand-400", className)} />;
}

const statusToneMap: Record<string, string> = {
  NEW: "bg-sky-500/15 text-sky-300 ring-sky-400/20",
  CONTACTED: "bg-violet-500/15 text-violet-300 ring-violet-400/20",
  IN_DISCUSSION: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  PROPOSAL: "bg-indigo-500/15 text-indigo-300 ring-indigo-400/20",
  WON: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  LOST: "bg-red-500/15 text-red-300 ring-red-400/20",
  ARCHIVED: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
  LOW: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
  MEDIUM: "bg-sky-500/15 text-sky-300 ring-sky-400/20",
  HIGH: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  URGENT: "bg-red-500/15 text-red-300 ring-red-400/20",
  SENT: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  FAILED: "bg-red-500/15 text-red-300 ring-red-400/20",
  SKIPPED: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
  CONFIRMED: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  PENDING: "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  UNSUBSCRIBED: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
  PUBLISHED: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  DRAFT: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
  SCHEDULED: "bg-sky-500/15 text-sky-300 ring-sky-400/20",
};
export function StatusPill({ value, className }: { value: string; className?: string }) {
  const tone = statusToneMap[value] ?? "bg-white/5 text-mist/70 ring-white/10";
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1", tone, className)}>{value.replace(/_/g, " ").toLowerCase()}</span>;
}
