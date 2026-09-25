import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card, AdminButton, AdminInput, AdminTextarea, AdminSpinner, Field } from "@/components/admin/ui";
import { Toggle } from "../content/_shared";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/format";
import { Building2, Share2, Search, LayoutTemplate, Info, Mail, Inbox, Send, Plus, X } from "lucide-react";

type Group = "general" | "social" | "seo" | "hero" | "about" | "email" | "inquiry";
const TABS: { id: Group; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "hero", label: "Homepage hero", icon: LayoutTemplate },
  { id: "about", label: "About", icon: Info },
  { id: "seo", label: "SEO", icon: Search },
  { id: "social", label: "Social links", icon: Share2 },
  { id: "email", label: "Email", icon: Mail },
  { id: "inquiry", label: "Inquiry form", icon: Inbox },
];

const LABELS: Record<string, string> = {
  companyName: "Company name", tagline: "Tagline", logoUrl: "Logo URL", email: "Public email", phone: "Phone", whatsapp: "WhatsApp number", whatsapp2: "Second WhatsApp", address: "Address", footerText: "Footer text", googleAnalyticsId: "Google Analytics ID", maintenanceMode: "Maintenance mode", maintenanceMessage: "Maintenance message",
  linkedin: "LinkedIn", github: "GitHub", x: "X (Twitter)", facebook: "Facebook", instagram: "Instagram", youtube: "YouTube",
  defaultTitle: "Default page title", defaultDescription: "Default meta description", ogImage: "Social share image URL",
  heading: "Heading", description: "Description", intro: "Intro", body: "Body", mission: "Mission statement", primaryCtaLabel: "Primary button label", primaryCtaUrl: "Primary button link", secondaryCtaLabel: "Secondary button label", secondaryCtaUrl: "Secondary button link",
  notificationEmail: "Notifications sent to", companyEmail: "From address", senderName: "Sender name", replyTo: "Reply-to address", notifyOnContact: "Notify on contact messages", notifyOnProjectInquiry: "Notify on project inquiries", notifyOnNewsletter: "Notify on new subscribers", sendCustomerConfirmation: "Send confirmation to customers", newsletterDoubleOptIn: "Newsletter double opt-in",
  projectTypes: "Project types", budgetOptions: "Budget ranges", timelineOptions: "Timeline options", heardFromOptions: "\"How did you hear about us\" options",
};
const TEXTAREAS = new Set(["footerText", "maintenanceMessage", "defaultDescription", "description", "intro", "body", "mission"]);

export function SettingsPage() {
  const [tab, setTab] = useState<Group>("general");
  const [all, setAll] = useState<Record<Group, Record<string, unknown>> | null>(null);
  const [meta, setMeta] = useState<{ email?: { configured: boolean; provider: string } } | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { api<{ data: Record<Group, Record<string, unknown>>; meta: { email?: { configured: boolean; provider: string } } }>("/api/admin/settings").then((r) => { setAll(r.data); setMeta(r.meta); }).catch(() => toast.error("Couldn't load settings")); }, []);

  if (!all) return <div className="grid place-items-center py-32"><AdminSpinner className="h-8 w-8" /></div>;
  const groupData = all[tab];
  const setField = (key: string, value: unknown) => setAll((s) => s && ({ ...s, [tab]: { ...s[tab], [key]: value } }));

  async function save() {
    setSaving(true);
    try { const r = await api<{ data: Record<string, unknown> }>(`/api/admin/settings/${tab}`, { method: "PUT", body: groupData }); setAll((s) => s && ({ ...s, [tab]: r.data })); toast.success("Settings saved"); }
    catch (e) { toast.error("Save failed", e instanceof Error ? e.message : undefined); }
    finally { setSaving(false); }
  }

  return (
    <>
      <PageHeader title="Settings" description="Configure your site's content, contact details and behaviour." />
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", tab === t.id ? "bg-brand-500/15 text-brand-300" : "text-mist/60 hover:bg-white/5 hover:text-mist")}><t.icon className="h-4 w-4" />{t.label}</button>)}
        </nav>

        <Card className="p-6">
          {tab === "email" && meta?.email && <div className={cn("mb-5 rounded-lg border px-4 py-3 text-sm", meta.email.configured ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-amber-500/20 bg-amber-500/10 text-amber-200")}>{meta.email.configured ? `Email is configured via ${meta.email.provider}.` : "No email provider is configured yet — emails are logged but not delivered. Set EMAIL_PROVIDER and its keys in your environment."}</div>}

          <div className="space-y-5">
            {tab === "about" ? <AboutEditor data={groupData} setField={setField} />
              : tab === "inquiry" ? <InquiryEditor data={groupData} setField={setField} />
              : Object.entries(groupData).map(([key, value]) => (
                <div key={key}>
                  {typeof value === "boolean" ? <Toggle checked={value} onChange={(v) => setField(key, v)} label={LABELS[key] ?? key} />
                    : <Field label={LABELS[key] ?? key}>{TEXTAREAS.has(key) ? <AdminTextarea value={String(value ?? "")} onChange={(e) => setField(key, e.target.value)} rows={3} /> : <AdminInput value={String(value ?? "")} onChange={(e) => setField(key, e.target.value)} />}</Field>}
                </div>
              ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
            {tab === "email" ? <TestEmailButton /> : <span />}
            <AdminButton onClick={save} loading={saving}>Save changes</AdminButton>
          </div>
        </Card>
      </div>
    </>
  );
}

function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <Field label={label}>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <AdminInput value={item} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <AdminButton variant="ghost" size="sm" onClick={() => onChange(items.filter((_, j) => j !== i))}><X className="h-4 w-4" /></AdminButton>
          </div>
        ))}
        <AdminButton variant="secondary" size="sm" onClick={() => onChange([...items, ""])}><Plus className="h-4 w-4" /> Add option</AdminButton>
      </div>
    </Field>
  );
}

function InquiryEditor({ data, setField }: { data: Record<string, unknown>; setField: (k: string, v: unknown) => void }) {
  return <>{["projectTypes", "budgetOptions", "timelineOptions", "heardFromOptions"].map((key) => <ListEditor key={key} label={LABELS[key]} items={(data[key] as string[]) ?? []} onChange={(v) => setField(key, v)} />)}</>;
}

function AboutEditor({ data, setField }: { data: Record<string, unknown>; setField: (k: string, v: unknown) => void }) {
  const values = (data.values as { title: string; description: string }[]) ?? [];
  return (
    <>
      {["heading", "intro", "body", "mission"].map((key) => <Field key={key} label={LABELS[key]}>{TEXTAREAS.has(key) ? <AdminTextarea value={String(data[key] ?? "")} onChange={(e) => setField(key, e.target.value)} rows={key === "body" ? 6 : 3} /> : <AdminInput value={String(data[key] ?? "")} onChange={(e) => setField(key, e.target.value)} />}</Field>)}
      <Field label="Company values">
        <div className="space-y-3">
          {values.map((v, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-night-900/40 p-3">
              <div className="mb-2 flex items-center justify-between"><span className="text-xs text-mist/40">Value {i + 1}</span><AdminButton variant="ghost" size="sm" onClick={() => setField("values", values.filter((_, j) => j !== i))}><X className="h-4 w-4" /></AdminButton></div>
              <AdminInput value={v.title} placeholder="Title" onChange={(e) => setField("values", values.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <AdminTextarea value={v.description} placeholder="Description" rows={2} className="mt-2" onChange={(e) => setField("values", values.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
            </div>
          ))}
          {values.length < 12 && <AdminButton variant="secondary" size="sm" onClick={() => setField("values", [...values, { title: "", description: "" }])}><Plus className="h-4 w-4" /> Add value</AdminButton>}
        </div>
      </Field>
    </>
  );
}

function TestEmailButton() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  async function test() {
    setLoading(true);
    try { const r = await api<{ data: { ok: boolean; provider: string } }>("/api/admin/settings/test-email", { method: "POST", body: {} }); toast[r.data.ok ? "success" : "error"](r.data.ok ? "Test email sent" : "Test failed", r.data.ok ? `Sent via ${r.data.provider}. Check your inbox.` : "Check your email configuration."); }
    catch (e) { toast.error("Test failed", e instanceof Error ? e.message : undefined); }
    finally { setLoading(false); }
  }
  return <AdminButton variant="secondary" onClick={test} loading={loading}><Send className="h-4 w-4" /> Send test email</AdminButton>;
}
