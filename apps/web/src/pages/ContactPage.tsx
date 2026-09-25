import { useRef, useState } from "react";
import { Seo } from "@/components/Seo";
import { Label, Input, Textarea, ErrorText } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Honeypot } from "@/components/site/Honeypot";
import { useToast } from "@/components/ui/Toast";
import { useSettings } from "@/hooks/useSettings";
import { api, ApiError } from "@/lib/api";
import { CheckCircle2, Mail, MapPin, Phone, ArrowRight, MessageSquare, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/whatsapp";

export function ContactPage() {
  const { data: settings } = useSettings();
  const toast = useToast();
  const started = useRef(Date.now());
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", subject: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      const res = await api<{ data: { reference: string; message: string } }>("/api/contact", { method: "POST", body: { ...form, startedAt: started.current } });
      setDone(res.data.reference);
      toast.success("Message sent", res.data.message);
      setForm({ name: "", email: "", phone: "", company: "", subject: "", message: "", website: "" });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields);
        toast.error("Couldn't send message", err.message);
      }
    } finally { setLoading(false); }
  }

  const g = settings?.general;
  const contactItems = [
    g?.email && { icon: Mail, label: "Email", value: g.email, href: `mailto:${g.email}` },
    g?.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: g.whatsapp, href: waLink(g.whatsapp, "Hi Cyber Nexa Solution, I'd like to talk about a project.") },
    g?.whatsapp2 && { icon: MessageCircle, label: "WhatsApp", value: g.whatsapp2, href: waLink(g.whatsapp2, "Hi Cyber Nexa Solution, I'd like to talk about a project.") },
    g?.phone && { icon: Phone, label: "Phone", value: g.phone, href: `tel:${g.phone}` },
    g?.address && { icon: MapPin, label: "Office", value: g.address },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string }[];

  return (
    <>
      <Seo title="Contact" description="Get in touch with Cyber Nexa Solution. We reply within one business day." path="/contact" />
      <section className="border-b border-mist bg-gradient-to-b from-petrol to-petrol-600 py-16 text-white">
        <div className="container-tight">
          <div className="mb-3 flex items-center gap-2"><span className="h-px w-6 bg-spring" /><span className="text-sm font-semibold text-spring">Contact</span></div>
          <h1 className="text-display font-bold">Let's talk about your project</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">Whether you have a detailed brief or just an idea, we're happy to help you think it through. We reply within one business day.</p>
        </div>
      </section>

      <section className="container-tight grid gap-12 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            {contactItems.map((item) => (
              <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-mist bg-white p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><item.icon className="h-5 w-5" /></span>
                <div><div className="text-xs font-medium uppercase tracking-wide text-slate/70">{item.label}</div>{item.href ? <a href={item.href} className="mt-0.5 block font-medium text-ink hover:text-brand-600">{item.value}</a> : <div className="mt-0.5 font-medium text-ink">{item.value}</div>}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-6">
            <h3 className="flex items-center gap-2 font-display font-semibold text-ink"><MessageSquare className="h-5 w-5 text-brand-600" /> Prefer a bigger conversation?</h3>
            <p className="mt-2 text-sm text-slate">If you're planning a full project, our project form captures the details so we can prepare properly.</p>
            <a href="/start-a-project" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">Start a project <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-white p-6 sm:p-8">
          {done ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-7 w-7" /></div>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">Thank you — message received</h2>
              <p className="mt-2 max-w-sm text-slate">Your reference is <span className="font-semibold text-ink">#{done}</span>. We'll be in touch within one business day.</p>
              <Button variant="secondary" className="mt-6" onClick={() => setDone(null)}>Send another message</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="relative space-y-4">
              <Honeypot value={form.website} onChange={(v) => setForm((f) => ({ ...f, website: v }))} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="name" required>Name</Label><Input id="name" value={form.name} onChange={set("name")} error={!!errors.name} autoComplete="name" required /><ErrorText>{errors.name}</ErrorText></div>
                <div><Label htmlFor="email" required>Email</Label><Input id="email" type="email" value={form.email} onChange={set("email")} error={!!errors.email} autoComplete="email" required /><ErrorText>{errors.email}</ErrorText></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={form.phone} onChange={set("phone")} autoComplete="tel" /></div>
                <div><Label htmlFor="company">Company</Label><Input id="company" value={form.company} onChange={set("company")} autoComplete="organization" /></div>
              </div>
              <div><Label htmlFor="subject" required>Subject</Label><Input id="subject" value={form.subject} onChange={set("subject")} error={!!errors.subject} required /><ErrorText>{errors.subject}</ErrorText></div>
              <div><Label htmlFor="message" required>Message</Label><Textarea id="message" value={form.message} onChange={set("message")} error={!!errors.message} rows={6} placeholder="Tell us a little about what you need…" required /><ErrorText>{errors.message}</ErrorText></div>
              <Button type="submit" loading={loading} size="lg" className="w-full">Send message <ArrowRight className="h-4 w-4" /></Button>
              <p className="text-center text-xs text-slate">By sending this you agree to our <a href="/privacy" className="underline hover:text-brand-600">privacy policy</a>.</p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
