import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { AdminSpinner } from "@/components/admin/ui";
import { LoginPage } from "./LoginPage";
import { ForgotPasswordPage, ResetPasswordPage, AcceptInvitePage, VerifyEmailPage } from "./AuthActionPages";
import { DashboardPage } from "./DashboardPage";
import { InquiriesPage } from "./InquiriesPage";
import { ContactsPage } from "./ContactsPage";
import { MediaLibraryPage } from "./MediaLibraryPage";
import { NotificationsPage } from "./NotificationsPage";
import { EmailsPage } from "./EmailsPage";
import { SubscribersPage } from "./SubscribersPage";
import { AnalyticsPage } from "./AnalyticsPage";
import { AuditLogPage } from "./AuditLogPage";
import { AdminUsersPage } from "./AdminUsersPage";
import { SettingsPage } from "./SettingsPage";
import { ProfilePage } from "./ProfilePage";
import { ServicesPage } from "../content/ServicesPage";
import { SolutionsPage } from "../content/SolutionsPage";
import { ProjectsPage } from "../content/ProjectsPage";
import { TestimonialsPage } from "../content/TestimonialsPage";
import { TeamPage } from "../content/TeamPage";
import { FaqsPage } from "../content/FaqsPage";

function ProtectedRoute({ children, permission }: { children: React.ReactNode; permission?: string }) {
  const { user, loading, can } = useAuth();
  const location = useLocation();
  if (loading) return <div className="grid min-h-screen place-items-center bg-night-900"><AdminSpinner className="h-8 w-8" /></div>;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  if (permission && !can(permission)) return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div><h2 className="font-display text-xl font-semibold text-mist">No access</h2><p className="mt-2 text-sm text-mist/50">You don't have permission to view this section.</p></div>
    </div>
  );
  return <>{children}</>;
}

function Shell({ children, permission }: { children: React.ReactNode; permission?: string }) {
  return <ProtectedRoute permission={permission}><AdminLayout>{children}</AdminLayout></ProtectedRoute>;
}

export function AdminApp() {
  return (
    <ConfirmProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="accept-invite" element={<AcceptInvitePage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />

        <Route path="" element={<Shell><DashboardPage /></Shell>} />
        <Route path="inquiries" element={<Shell permission="inquiries.read"><InquiriesPage /></Shell>} />
        <Route path="inquiries/:id" element={<Shell permission="inquiries.read"><InquiriesPage /></Shell>} />
        <Route path="contacts" element={<Shell permission="contacts.read"><ContactsPage /></Shell>} />
        <Route path="contacts/:id" element={<Shell permission="contacts.read"><ContactsPage /></Shell>} />

        <Route path="projects" element={<Shell permission="content.read"><ProjectsPage /></Shell>} />
        <Route path="projects/:id" element={<Shell permission="content.read"><ProjectsPage /></Shell>} />
        <Route path="services" element={<Shell permission="content.read"><ServicesPage /></Shell>} />
        <Route path="services/:id" element={<Shell permission="content.read"><ServicesPage /></Shell>} />
        <Route path="solutions" element={<Shell permission="content.read"><SolutionsPage /></Shell>} />
        <Route path="solutions/:id" element={<Shell permission="content.read"><SolutionsPage /></Shell>} />
        <Route path="testimonials" element={<Shell permission="content.read"><TestimonialsPage /></Shell>} />
        <Route path="testimonials/:id" element={<Shell permission="content.read"><TestimonialsPage /></Shell>} />
        <Route path="team" element={<Shell permission="content.read"><TeamPage /></Shell>} />
        <Route path="team/:id" element={<Shell permission="content.read"><TeamPage /></Shell>} />
        <Route path="faqs" element={<Shell permission="content.read"><FaqsPage /></Shell>} />
        <Route path="faqs/:id" element={<Shell permission="content.read"><FaqsPage /></Shell>} />
        <Route path="media" element={<Shell permission="media.read"><MediaLibraryPage /></Shell>} />

        <Route path="notifications" element={<Shell permission="notifications.read"><NotificationsPage /></Shell>} />
        <Route path="emails" element={<Shell permission="emails.read"><EmailsPage /></Shell>} />
        <Route path="subscribers" element={<Shell permission="subscribers.read"><SubscribersPage /></Shell>} />
        <Route path="analytics" element={<Shell permission="analytics.read"><AnalyticsPage /></Shell>} />
        <Route path="users" element={<Shell permission="users.read"><AdminUsersPage /></Shell>} />
        <Route path="audit" element={<Shell permission="audit.read"><AuditLogPage /></Shell>} />
        <Route path="settings" element={<Shell permission="settings.read"><SettingsPage /></Shell>} />
        <Route path="profile" element={<Shell><ProfilePage /></Shell>} />

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </ConfirmProvider>
  );
}
