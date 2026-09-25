import { useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card, AdminButton, AdminInput, Field } from "@/components/admin/ui";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { api, ApiError } from "@/lib/api";
import { ShieldCheck, User } from "lucide-react";

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  async function saveProfile() {
    setSavingProfile(true);
    try { const res = await api<{ data: typeof user }>("/api/auth/profile", { method: "PATCH", body: { name } }); if (res.data) setUser(res.data); toast.success("Profile updated"); }
    catch (e) { toast.error("Update failed", e instanceof Error ? e.message : undefined); }
    finally { setSavingProfile(false); }
  }

  async function changePassword() {
    setPwError("");
    if (pw.newPassword !== pw.confirm) { setPwError("New passwords don't match."); return; }
    setSavingPw(true);
    try {
      await api("/api/auth/change-password", { method: "POST", body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      toast.success("Password changed", "Use your new password next time you sign in."); setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) { setPwError(e instanceof ApiError ? e.message : "Couldn't change password."); }
    finally { setSavingPw(false); }
  }

  return (
    <>
      <PageHeader title="Profile & security" description="Manage your account details and password." />
      <div className="grid max-w-3xl gap-6">
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-mist"><User className="h-4 w-4 text-brand-300" /> Your details</h3>
          <div className="space-y-4">
            <Field label="Name"><AdminInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email"><AdminInput value={user?.email ?? ""} disabled className="opacity-60" /></Field>
            <div className="flex items-center justify-between"><span className="text-sm text-mist/50">Role: <span className="text-mist/80">{user?.roleLabel}</span></span><AdminButton onClick={saveProfile} loading={savingProfile} disabled={!name || name === user?.name}>Save changes</AdminButton></div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-mist"><ShieldCheck className="h-4 w-4 text-brand-300" /> Change password</h3>
          <div className="space-y-4">
            <Field label="Current password"><AdminInput type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password"><AdminInput type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></Field>
              <Field label="Confirm new password"><AdminInput type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" /></Field>
            </div>
            <p className="text-xs text-mist/40">At least 10 characters with upper and lower case letters and a number.</p>
            {pwError && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">{pwError}</div>}
            <div className="flex justify-end"><AdminButton onClick={changePassword} loading={savingPw} disabled={!pw.currentPassword || !pw.newPassword}>Update password</AdminButton></div>
          </div>
        </Card>
      </div>
    </>
  );
}
