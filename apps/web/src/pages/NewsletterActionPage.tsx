import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/Feedback";
import { CheckCircle2, XCircle, Mail } from "lucide-react";

export function NewsletterActionPage({ action }: { action: "confirm" | "unsubscribe" }) {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "This link is missing its confirmation token.");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await api<{ data: { message: string } }>(`/api/newsletter/${action}`, { method: "POST", body: { token } });
        setState("ok"); setMessage(res.data.message);
      } catch (err) {
        setState("error"); setMessage(err instanceof Error ? err.message : "This link is invalid or has expired.");
      }
    })();
  }, [token, action]);

  const titles = { confirm: "Confirm your subscription", unsubscribe: "Unsubscribe" };

  return (
    <>
      <Seo title={titles[action]} noindex />
      <section className="container-tight flex min-h-[60vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-3xl border border-mist bg-white p-8 text-center shadow-soft sm:p-12">
          {state === "loading" && <><Spinner className="mx-auto h-8 w-8" /><p className="mt-4 text-slate">Just a moment…</p></>}
          {state === "ok" && <><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></div><h1 className="mt-4 font-display text-xl font-semibold text-ink">{action === "confirm" ? "You're subscribed" : "You've been unsubscribed"}</h1><p className="mt-2 text-slate">{message}</p></>}
          {state === "error" && <><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600"><XCircle className="h-7 w-7" /></div><h1 className="mt-4 font-display text-xl font-semibold text-ink">Link problem</h1><p className="mt-2 text-slate">{message}</p></>}
          <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"><Mail className="h-4 w-4" /> Back to homepage</Link>
        </div>
      </section>
    </>
  );
}
