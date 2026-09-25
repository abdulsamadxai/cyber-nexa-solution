import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/format";

export function Newsletter({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await api<{ data: { message: string } }>("/api/newsletter/subscribe", { method: "POST", body: { email, source: "footer" } });
      setStatus("done");
      setMessage(res.data.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className={cn("flex items-center gap-2.5 rounded-xl bg-brand-500/10 px-4 py-3 text-sm text-brand-100", className)}>
        <CheckCircle2 className="h-5 w-5 shrink-0 text-spring" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("space-y-2", className)}>
      <div className="flex overflow-hidden rounded-xl border border-white/15 bg-white/5 focus-within:border-spring/50">
        <input
          type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder="you@company.com"
          className="h-11 w-full bg-transparent px-3.5 text-sm text-white placeholder:text-white/40 outline-none"
          aria-label="Email address"
        />
        <button type="submit" disabled={status === "loading"} className="flex shrink-0 items-center gap-1.5 bg-spring px-4 text-sm font-semibold text-petrol transition-colors hover:bg-spring/90 disabled:opacity-70" aria-label="Subscribe">
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-red-300">{message}</p>}
    </form>
  );
}
