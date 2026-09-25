import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { AdminButton, AdminInput, Field, AdminSpinner } from "@/components/admin/ui";
import { Logo } from "@/components/site/Logo";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-night-900 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="[&_a]:!text-mist"><Logo variant="light" /></div>
        <h1 className="mt-10 font-display text-2xl font-semibold text-mist">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-mist/50">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try { await api("/api/auth/forgot-password", { method: "POST", body: { email } }); } catch { /* same response either way */ }
    setSent(true); setLoading(false);
  }
  return (
    <Shell title="Reset your password" subtitle="Enter your email and we'll send a link to reset it.">
      <Seo title="Reset password" noindex />
      {sent ? (
        <div className="rounded-lg border border-brand-500/20 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">If an account exists for {email}, a reset link is on its way. Check your inbox.</div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email address" required><AdminInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></Field>
          <AdminButton type="submit" loading={loading} className="w-full">Send reset link</AdminButton>
        </form>
      )}
      <p className="mt-6 text-center text-sm"><Link to="/admin/login" className="text-brand-400 hover:text-brand-300">Back to sign in</Link></p>
    </Shell>
  );
}

function SetPasswordForm({ endpoint, tokenLabel, successTitle }: { endpoint: string; tokenLabel: string; successTitle: string }) {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const needsName = endpoint.includes("accept-invite");
  const [invite, setInvite] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    if (needsName && token) api<{ data: { email: string; name: string } }>(`/api/auth/invite?token=${encodeURIComponent(token)}`).then((r) => { setInvite(r.data); setName(r.data.name || ""); }).catch(() => setError("This invitation is invalid or has expired."));
  }, [token, needsName]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api(endpoint, { method: "POST", body: needsName ? { token, name, password } : { token, password } });
      setDone(true);
      await refresh();
      setTimeout(() => navigate("/admin", { replace: true }), 1200);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  if (!token) return <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">This link is missing its {tokenLabel} token.</div>;
  if (done) return <div className="flex flex-col items-center py-6 text-center"><div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><CheckCircle2 className="h-6 w-6" /></div><p className="mt-3 font-medium text-mist">{successTitle}</p><p className="mt-1 text-sm text-mist/50">Taking you to the dashboard…</p></div>;

  return (
    <form onSubmit={submit} className="space-y-4">
      {needsName && invite && <div className="rounded-lg border border-white/10 bg-night-800 px-3 py-2 text-sm text-mist/70">Setting up access for <span className="font-medium text-mist">{invite.email}</span></div>}
      {needsName && <Field label="Your name" required><AdminInput value={name} onChange={(e) => setName(e.target.value)} required /></Field>}
      <Field label="New password" required><AdminInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder="At least 10 characters" /></Field>
      <Field label="Confirm password" required><AdminInput type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" /></Field>
      <p className="text-xs text-mist/40">Use at least 10 characters with upper and lower case letters and a number.</p>
      {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">{error}</div>}
      <AdminButton type="submit" loading={loading} className="w-full">Set password <ArrowRight className="h-4 w-4" /></AdminButton>
    </form>
  );
}

export function ResetPasswordPage() {
  return <Shell title="Choose a new password" subtitle="Enter a new password for your account."><Seo title="Reset password" noindex /><SetPasswordForm endpoint="/api/auth/reset-password" tokenLabel="reset" successTitle="Password updated" /></Shell>;
}
export function AcceptInvitePage() {
  return <Shell title="Accept your invitation" subtitle="Set up your account to access the dashboard."><Seo title="Accept invitation" noindex /><SetPasswordForm endpoint="/api/auth/accept-invite" tokenLabel="invitation" successTitle="Welcome aboard" /></Shell>;
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!token) { setMessage("This link is missing its verification token."); return; }
    api<{ data: { message: string } }>("/api/auth/verify-email", { method: "POST", body: { token } })
      .then((r) => { setState("ok"); setMessage(r.data.message); })
      .catch((err) => { setState("error"); setMessage(err instanceof ApiError ? err.message : "This link is invalid or expired."); });
  }, [token]);
  return (
    <Shell title="Email verification">
      <Seo title="Verify email" noindex />
      <div className="flex flex-col items-center py-4 text-center">
        {state === "loading" && <AdminSpinner className="h-7 w-7" />}
        {state === "ok" && <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-400"><CheckCircle2 className="h-6 w-6" /></div>}
        {state === "error" && <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-400"><XCircle className="h-6 w-6" /></div>}
        {message && <p className="mt-3 text-sm text-mist/70">{message}</p>}
        <Link to="/admin/login" className="mt-6 text-sm text-brand-400 hover:text-brand-300">Continue to sign in</Link>
      </div>
    </Shell>
  );
}
