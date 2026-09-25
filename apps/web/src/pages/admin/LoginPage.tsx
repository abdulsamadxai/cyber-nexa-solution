import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { AdminButton, AdminInput, Field } from "@/components/admin/ui";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { Logo } from "@/components/site/Logo";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(email, password);
      navigate(location.state?.from ?? "/admin", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen bg-night-900 lg:grid-cols-2">
      <Seo title="Sign in" noindex />
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="[&_a]:!text-mist"><Logo variant="light" /></div>
          <h1 className="mt-10 font-display text-2xl font-semibold text-mist">Sign in to the dashboard</h1>
          <p className="mt-2 text-sm text-mist/50">Manage inquiries, content and settings for your website.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="Email address" required><AdminInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required autoFocus placeholder="cybernexasolution@gmail.com" /></Field>
            <Field label="Password" required>
              <AdminInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required placeholder="••••••••••" />
            </Field>
            {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">{error}</div>}
            <AdminButton type="submit" loading={loading} className="w-full">Sign in <ArrowRight className="h-4 w-4" /></AdminButton>
          </form>
          <div className="mt-4 text-center">
            <Link to="/admin/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">Forgot your password?</Link>
          </div>
          <p className="mt-8 text-center text-xs text-mist/30"><Link to="/" className="hover:text-mist/60">← Back to website</Link></p>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-petrol to-petrol-600 lg:block">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)", backgroundSize: "36px 36px" }} />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-spring/20 blur-[100px]" />
        <div className="relative flex h-full flex-col justify-center px-16 text-white">
          <ShieldCheck className="h-12 w-12 text-spring" />
          <h2 className="mt-6 max-w-md font-display text-3xl font-semibold leading-tight">Your business, managed with care.</h2>
          <p className="mt-4 max-w-md text-white/70">A calm, secure control centre for everything on your website — leads, content, media and the settings that keep it running.</p>
          <ul className="mt-8 space-y-2.5 text-sm text-white/60">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-spring" /> Encrypted sessions and audit logging</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-spring" /> Role-based access for your team</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-spring" /> Every inquiry tracked end to end</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
