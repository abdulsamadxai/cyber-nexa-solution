import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LoadingBlock } from "@/components/ui/Feedback";
import { HomePage } from "@/pages/HomePage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { SolutionsPage } from "@/pages/SolutionsPage";
import { SolutionDetailPage } from "@/pages/SolutionDetailPage";
import { IndustriesPage } from "@/pages/IndustriesPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { StartProjectPage } from "@/pages/StartProjectPage";
import { FaqPage } from "@/pages/FaqPage";
import { LegalPage } from "@/pages/LegalPage";
import { NewsletterActionPage } from "@/pages/NewsletterActionPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const AdminApp = lazy(() => import("@/pages/admin/AdminApp").then((m) => ({ default: m.AdminApp })));

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/:slug" element={<ServiceDetailPage />} />
        <Route path="solutions" element={<SolutionsPage />} />
        <Route path="solutions/:slug" element={<SolutionDetailPage />} />
        <Route path="industries" element={<IndustriesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="start-a-project" element={<StartProjectPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy" element={<LegalPage kind="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" />} />
        <Route path="newsletter/confirm" element={<NewsletterActionPage action="confirm" />} />
        <Route path="newsletter/unsubscribe" element={<NewsletterActionPage action="unsubscribe" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin/*" element={<Suspense fallback={<div className="grid min-h-screen place-items-center bg-night-900"><LoadingBlock label="Loading admin…" /></div>}><AdminApp /></Suspense>} />
    </Routes>
  );
}
