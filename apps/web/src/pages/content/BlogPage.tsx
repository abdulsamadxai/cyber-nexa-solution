import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminTextarea, AdminSelect, AdminSpinner, Field, StatusPill } from "@/components/admin/ui";
import { Drawer } from "@/components/admin/Drawer";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAdminList } from "@/hooks/useAdmin";
import { TagsInput } from "./_shared";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Newspaper, Trash2 } from "lucide-react";

type PostStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

interface AdminPost {
  id: string; title: string; slug: string; excerpt: string; content: string;
  featuredImage: string | null; status: PostStatus; publishedAt: string | null;
  authorName: string | null; categoryId: string | null;
  category: { name: string } | null; tags: { name: string }[];
  seoTitle: string | null; seoDescription: string | null; updatedAt: string; createdAt: string;
}

interface BlogForm {
  title: string; slug: string; excerpt: string; content: string;
  featuredImage: string; status: PostStatus; publishedAt: string;
  categoryId: string; tags: string[]; seoTitle: string; seoDescription: string;
}

interface BlogCategoryRow { id: string; name: string; slug: string }

const emptyForm: BlogForm = {
  title: "", slug: "", excerpt: "", content: "", featuredImage: "",
  status: "DRAFT", publishedAt: "", categoryId: "", tags: [], seoTitle: "", seoDescription: "",
};

const toForm = (p: AdminPost): BlogForm => ({
  title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
  featuredImage: p.featuredImage ?? "", status: p.status,
  publishedAt: p.publishedAt ? p.publishedAt.slice(0, 16) : "",
  categoryId: p.categoryId ?? "", tags: p.tags.map((t) => t.name),
  seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "",
});

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "SCHEDULED", label: "Scheduled" },
];

export function BlogPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading, refetch } = useAdminList<AdminPost>("blog-posts", "/api/admin/content/blog/posts", { pageSize: 100, status: statusFilter || undefined });
  const confirm = useConfirm();
  const toast = useToast();

  async function remove(p: AdminPost) {
    if (!(await confirm({ title: "Delete post", message: `Remove "${p.title}"?`, danger: true, confirmLabel: "Delete" }))) return;
    await api(`/api/admin/content/blog/posts/${p.id}`, { method: "DELETE" });
    toast.success("Post deleted"); refetch();
  }

  return (
    <>
      <PageHeader
        title="Blog"
        description="Write articles once — they appear on the public blog automatically."
        actions={
          <div className="flex items-center gap-2">
            <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-auto">
              {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </AdminSelect>
            <AdminButton size="sm" onClick={() => nav("/admin/blog/new")}>New post</AdminButton>
          </div>
        }
      />
      <div className="space-y-2.5">
        {isLoading && <div className="grid place-items-center py-16"><AdminSpinner className="h-6 w-6" /></div>}
        {data?.data.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/5 bg-night-800 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-mist">{p.title}</span>
                  <StatusPill value={p.status} />
                  {p.category && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist/40">{p.category.name}</span>}
                </div>
                <p className="mt-1 text-sm text-mist/50 line-clamp-2">{p.excerpt}</p>
                <p className="mt-1 text-xs text-mist/30">Updated {formatDate(p.updatedAt)}{p.publishedAt ? ` · Published ${formatDate(p.publishedAt)}` : ""}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <AdminButton size="sm" variant="ghost" onClick={() => nav(`/admin/blog/${p.id}`)}>Edit</AdminButton>
                <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center rounded-lg text-mist/40 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {data?.data.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-16 text-mist/40">
            <Newspaper className="h-8 w-8" /><span>No posts yet.</span>
          </div>
        )}
      </div>
      <BlogDrawer id={id} onClose={() => nav("/admin/blog")} onSaved={refetch} />
    </>
  );
}

function BlogDrawer({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const editing = !!id && id !== "new";
  const { data: categories } = useAdminList<BlogCategoryRow>("blog-categories", "/api/admin/content/blog/categories", { pageSize: 100 });

  const set = <K extends keyof BlogForm>(key: K, value: BlogForm[K]) => setForm((s) => ({ ...s, [key]: value }));

  useEffect(() => {
    if (!id) return;
    if (id === "new") { setForm(emptyForm); return; }
    setLoading(true);
    api<{ data: AdminPost }>(`/api/admin/content/blog/posts/${id}`)
      .then((r) => setForm(toForm(r.data)))
      .catch(() => { toast.error("Couldn't load post"); onClose(); })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      const body = {
        title: form.title.trim(), slug: form.slug.trim(), excerpt: form.excerpt.trim(), content: form.content.trim(),
        featuredImage: form.featuredImage.trim() || null, status: form.status,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        categoryId: form.categoryId || null, tags: form.tags,
        seoTitle: form.seoTitle.trim() || null, seoDescription: form.seoDescription.trim() || null,
      };
      if (editing) await api(`/api/admin/content/blog/posts/${id}`, { method: "PATCH", body });
      else await api(`/api/admin/content/blog/posts`, { method: "POST", body });
      toast.success(editing ? "Saved" : "Created"); onSaved(); onClose();
    } catch (e) { toast.error("Save failed", e instanceof Error ? e.message : undefined); }
    finally { setSaving(false); }
  }

  const canSave = form.title.trim().length >= 3 && form.excerpt.trim().length >= 10 && form.content.trim().length >= 20;

  return (
    <Drawer open={!!id} onClose={onClose} title={editing ? "Edit post" : "New post"} width="max-w-2xl">
      {loading ? <div className="grid place-items-center py-16"><AdminSpinner className="h-6 w-6" /></div> : (
        <div className="space-y-4">
          <Field label="Title" required><AdminInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="How to choose hosting for your business" /></Field>
          <Field label="Slug"><AdminInput value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="Auto-generated from the title" /></Field>
          <Field label="Excerpt" required><AdminTextarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} placeholder="One or two sentences shown on the blog listing and in search results." /></Field>
          <Field label="Content" required><AdminTextarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={12} placeholder="Write the article here. Line breaks are preserved." /></Field>
          <Field label="Featured image URL"><AdminInput value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} placeholder="https://… or pick one from the Media library" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <AdminSelect value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">No category</option>
                {categories?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </AdminSelect>
            </Field>
            <Field label="Status">
              <AdminSelect value={form.status} onChange={(e) => set("status", e.target.value as PostStatus)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
              </AdminSelect>
            </Field>
          </div>
          <Field label="Tags"><TagsInput value={form.tags} onChange={(v) => set("tags", v)} placeholder="hosting, small business" /></Field>
          <Field label={form.status === "SCHEDULED" ? "Publish date & time (required, must be in the future)" : "Publish date & time (optional — defaults to now when published)"}>
            <AdminInput type="datetime-local" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
          </Field>
          <Field label="SEO title"><AdminInput value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Defaults to the post title" /></Field>
          <Field label="SEO description"><AdminTextarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} placeholder="Defaults to the excerpt" /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton>
            <AdminButton onClick={save} loading={saving} disabled={!canSave}>Save</AdminButton>
          </div>
        </div>
      )}
    </Drawer>
  );
}
