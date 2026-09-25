import { useRef, useState } from "react";
import { Seo } from "@/components/Seo";
import { Label, Input, Textarea, Select, ErrorText } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Honeypot } from "@/components/site/Honeypot";
import { useToast } from "@/components/ui/Toast";
import { useSettings } from "@/hooks/useSettings";
import { api, ApiError } from "@/lib/api";
import { CheckCircle2, ArrowRight, ShieldCheck, Clock, MessageSquare } from "lucide-react";

const emptyForm = { name: "", email: "", phone: "", company: "", country: "", projectType: "", budget: "", timeline: "", requiredFeatures: "", referenceUrl: "", heardFrom: "", description: "", website: "" };

export function StartProjectPage() {
  const { data: settings } = useSettings();
  const toast = useToast();
  const started = useRef(Date.now());
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const opts = settings?.inquiry;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      const res = await api<{ data: { reference: string; message: string } }>("/api/inquiries", { method: "POST", body: { ...form, startedAt: started.current } });
      setDone(res.data.reference);
      toast.success("Project inquiry sent", `Reference #${res.data.reference}`);
      setForm(emptyForm);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields);
        toast.error("Couldn't submit", err.message);
      }
    } finally { setLoading(false); }
  }

  if (done) {
    return (
      <>
        <Seo title="Project inquiry received" noindex />
        <section className="container-tight flex min-h-[70vh] items-center justify-center py-16">
          <div className="w-full max-w-lg rounded-3xl border border-mist bg-white p-8 text-center shadow-soft sm:p-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-ink">Your project inquiry is in</h1>
            <p className="mt-3 text-slate">Thank you. Your reference number is</p>
            <div className="mx-auto mt-3 inline-block rounded-xl bg-brand-50 px-5 py-2.5 font-display text-2xl font-bold text-brand-700">#{done}</div>
            <p className="mt-4 text-slate">We've emailed you a confirmation and will reply with next steps within one business day. Keep the reference handy for any follow-up.</p>
            <div className="mt-8 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setDone(null)}>Submit another</Button>
              <a href="/"><Button>Back home</Button></a>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo title="Start a Project" description="Tell us about your project and we'll respond with honest, practical next steps within one business day." path="/start-a-project" />
      <section className="border-b border-mist bg-gradient-to-b from-petrol to-petrol-600 py-16 text-white">
        <div className="container-tight">
          <div className="mb-3 flex items-center gap-2"><span className="h-px w-6 bg-spring" /><span className="text-sm font-semibold text-spring">Start a project</span></div>
          <h1 className="text-display font-bold">Tell us what you'd like to build</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">The more you share, the better we can prepare. Nothing here is binding — it just helps us have a useful first conversation.</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-spring" />Reply within 1 business day</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-spring" />Your details stay private</span>
            <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-spring" />No obligation</span>
          </div>
        </div>
      </section>

      <section className="container-tight py-16">
        <form onSubmit={submit} className="relative mx-auto max-w-2xl space-y-8">
          <Honeypot value={form.website} onChange={(v) => setForm((f) => ({ ...f, website: v }))} />

          <fieldset className="space-y-4 rounded-2xl border border-mist bg-white p-6 sm:p-8">
            <legend className="px-2 font-display text-sm font-semibold text-brand-700">About you</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="name" required>Name</Label><Input id="name" value={form.name} onChange={set("name")} error={!!errors.name} autoComplete="name" required /><ErrorText>{errors.name}</ErrorText></div>
              <div><Label htmlFor="email" required>Email</Label><Input id="email" type="email" value={form.email} onChange={set("email")} error={!!errors.email} autoComplete="email" required /><ErrorText>{errors.email}</ErrorText></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={form.phone} onChange={set("phone")} autoComplete="tel" /></div>
              <div><Label htmlFor="company">Company</Label><Input id="company" value={form.company} onChange={set("company")} autoComplete="organization" /></div>
              <div><Label htmlFor="country">Country</Label><Input id="country" value={form.country} onChange={set("country")} autoComplete="country-name" /></div>
              <div>
                <Label htmlFor="heardFrom">How did you hear about us?</Label>
                <Select id="heardFrom" value={form.heardFrom} onChange={set("heardFrom")}><option value="">Select…</option>{opts?.heardFromOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-mist bg-white p-6 sm:p-8">
            <legend className="px-2 font-display text-sm font-semibold text-brand-700">About the project</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><Label htmlFor="projectType" required>Project type</Label><Select id="projectType" value={form.projectType} onChange={set("projectType")} error={!!errors.projectType} required><option value="">Select…</option>{opts?.projectTypes.map((o) => <option key={o} value={o}>{o}</option>)}</Select><ErrorText>{errors.projectType}</ErrorText></div>
              <div><Label htmlFor="budget" required>Budget</Label><Select id="budget" value={form.budget} onChange={set("budget")} error={!!errors.budget} required><option value="">Select…</option>{opts?.budgetOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Select><ErrorText>{errors.budget}</ErrorText></div>
              <div><Label htmlFor="timeline" required>Timeline</Label><Select id="timeline" value={form.timeline} onChange={set("timeline")} error={!!errors.timeline} required><option value="">Select…</option>{opts?.timelineOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Select><ErrorText>{errors.timeline}</ErrorText></div>
            </div>
            <div><Label htmlFor="description" required>Describe your project</Label><Textarea id="description" value={form.description} onChange={set("description")} error={!!errors.description} rows={6} placeholder="What are you trying to achieve? What problem should this solve? Who will use it?" required /><ErrorText>{errors.description}</ErrorText></div>
            <div><Label htmlFor="requiredFeatures">Key features or requirements</Label><Textarea id="requiredFeatures" value={form.requiredFeatures} onChange={set("requiredFeatures")} rows={3} placeholder="Any specific features, integrations or must-haves" /></div>
            <div><Label htmlFor="referenceUrl">Reference or existing site</Label><Input id="referenceUrl" value={form.referenceUrl} onChange={set("referenceUrl")} placeholder="https://…" /><ErrorText>{errors.referenceUrl}</ErrorText></div>
          </fieldset>

          <div className="flex flex-col items-center gap-3">
            <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto sm:px-12">Submit project inquiry <ArrowRight className="h-4 w-4" /></Button>
            <p className="text-center text-xs text-slate">By submitting you agree to our <a href="/privacy" className="underline hover:text-brand-600">privacy policy</a>. We'll only use your details to respond to your inquiry.</p>
          </div>
        </form>
      </section>
    </>
  );
}
