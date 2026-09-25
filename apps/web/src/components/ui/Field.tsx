import { cn } from "@/lib/format";

const inputBase =
  "w-full rounded-xl border bg-white text-ink placeholder:text-slate/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:bg-mist/30 disabled:cursor-not-allowed";

export function Label({ children, htmlFor, required }: { children: React.ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required && <span className="ml-0.5 text-brand-600" aria-hidden>*</span>}
    </label>
  );
}

export function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-red-600">{children}</p>;
}

export function Input({ error, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input className={cn(inputBase, "h-11 px-3.5", error ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-mist", className)} {...props} />;
}

export function Textarea({ error, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return <textarea className={cn(inputBase, "px-3.5 py-2.5 min-h-[120px] resize-y", error ? "border-red-300 focus:ring-red-200" : "border-mist", className)} {...props} />;
}

export function Select({ error, className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select className={cn(inputBase, "h-11 px-3 pr-9 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235B6B72%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_0.6rem_center] bg-no-repeat", error ? "border-red-300" : "border-mist", className)} {...props}>
      {children}
    </select>
  );
}
