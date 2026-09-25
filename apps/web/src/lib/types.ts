export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "SALES";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleLabel: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  permissions: string[];
}

export interface PublicSettings {
  general: { companyName: string; tagline: string; logoUrl: string; email: string; phone: string; whatsapp: string; whatsapp2: string; address: string; footerText: string; googleAnalyticsId: string; maintenanceMode: boolean; maintenanceMessage: string };
  social: { linkedin: string; github: string; x: string; facebook: string; instagram: string; youtube: string };
  seo: { defaultTitle: string; defaultDescription: string; ogImage: string };
  hero: { heading: string; description: string; primaryCtaLabel: string; primaryCtaUrl: string; secondaryCtaLabel: string; secondaryCtaUrl: string };
  about: { heading: string; intro: string; body: string; mission: string; values: { title: string; description: string }[] };
  inquiry: { projectTypes: string[]; budgetOptions: string[]; timelineOptions: string[]; heardFromOptions: string[] };
}

export interface ServiceCard { id: string; title: string; slug: string; icon: string; shortDescription: string; order: number }
export interface Service extends ServiceCard {
  description: string; features: string[]; technologies: string[]; ctaLabel: string | null; ctaUrl: string | null;
  seoTitle: string | null; seoDescription: string | null; published: boolean; related?: ServiceCard[];
}
export interface SolutionCard { id: string; title: string; slug: string; icon: string; industry: string; summary: string }
export interface Solution extends SolutionCard {
  description: string; challenges: string[]; features: string[]; technologies: string[];
  seoTitle: string | null; seoDescription: string | null; published: boolean; related?: SolutionCard[];
}
export interface ProjectImage { id: string; url: string; alt: string | null; order: number }
export interface ProjectCard { id: string; title: string; slug: string; category: string; clientName: string | null; isSample: boolean; summary: string; coverImage: string | null; technologies: string[]; date: string | null; featured: boolean }
export interface Project extends ProjectCard {
  description: string; problem: string; solution: string; features: string[]; projectUrl: string | null; githubUrl: string | null;
  images: ProjectImage[]; published: boolean; seoTitle: string | null; seoDescription: string | null;
}
export interface PostCard {
  id: string; title: string; slug: string; excerpt: string; featuredImage: string | null; publishedAt: string | null;
  authorName: string | null; readingMinutes: number; isSample: boolean;
  category: { name: string; slug: string } | null; tags: { name: string; slug: string }[];
}
export interface Post extends PostCard { content: string; seoTitle: string | null; seoDescription: string | null; updatedAt: string; related?: PostCard[] }
export interface TeamMember { id: string; name: string; role: string; bio: string | null; photo: string | null; linkedin: string | null; github: string | null; email: string | null }
export interface Testimonial { id: string; name: string; company: string | null; role: string | null; photo: string | null; content: string; rating: number | null; isSample: boolean }
export interface Faq { id: string; question: string; answer: string; category: string }

export interface Inquiry {
  id: string; number: number; reference?: string; type: "CONTACT" | "PROJECT";
  status: InquiryStatus; priority: Priority; name: string; email: string; phone: string | null;
  company: string | null; country: string | null; subject: string | null; message: string;
  projectType: string | null; budget: string | null; timeline: string | null; requiredFeatures: string | null;
  referenceUrl: string | null; heardFrom: string | null; followUpAt: string | null; createdAt: string;
  assignedTo: { id: string; name: string; email?: string } | null;
  contact?: { id: string; name: string; email: string; company: string | null; _count: { inquiries: number } } | null;
  notes?: InquiryNote[]; activities?: Activity[];
}
export type InquiryStatus = "NEW" | "CONTACTED" | "IN_DISCUSSION" | "PROPOSAL" | "WON" | "LOST" | "ARCHIVED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export interface InquiryNote { id: string; content: string; createdAt: string; author: { id: string; name: string } | null }
export interface Activity { id: string; type: string; message: string; meta?: Record<string, unknown> | null; createdAt: string; user?: { id?: string; name: string } | null }

export interface Contact {
  id: string; name: string; email: string; phone: string | null; company: string | null; country: string | null;
  source: string | null; notes: string | null; createdAt: string; updatedAt: string;
  _count?: { inquiries: number };
  inquiries?: { id: string; number: number; type: string; status: string; subject: string | null; projectType: string | null; createdAt: string }[];
  activities?: Activity[];
}
export interface Notification { id: string; type: string; title: string; message: string; link: string | null; readAt: string | null; createdAt: string }
export interface MediaItem { id: string; filename: string; originalName: string; mimeType: string; size: number; width: number | null; height: number | null; url: string; folder: string; createdAt: string; uploadedBy?: { name: string } | null }
export interface AdminUser { id: string; email: string; name: string; role: Role; isActive: boolean; emailVerifiedAt: string | null; lastLoginAt: string | null; lockedUntil: string | null; createdAt: string; invitePending: boolean }
export interface Subscriber { id: string; email: string; status: "PENDING" | "CONFIRMED" | "UNSUBSCRIBED"; source: string | null; confirmedAt: string | null; createdAt: string }
export interface EmailLogRow { id: string; to: string; subject: string; template: string; status: "SENT" | "FAILED" | "SKIPPED"; provider: string; error: string | null; createdAt: string }
export interface AuditRow { id: string; action: string; resource: string; resourceId: string | null; meta: Record<string, unknown> | null; ip: string | null; createdAt: string; user: { name: string; email: string } | null }
