import { useQuery } from "@tanstack/react-query";
import { api, type Paged, type Wrapped } from "@/lib/api";
import type { Faq, Project, ProjectCard, Service, ServiceCard, Solution, SolutionCard, TeamMember, Testimonial } from "@/lib/types";

export const useServices = () => useQuery({ queryKey: ["services"], queryFn: () => api<Wrapped<ServiceCard[]>>("/api/services").then((r) => r.data), staleTime: 60_000 });
export const useService = (slug: string) => useQuery({ queryKey: ["service", slug], queryFn: () => api<Wrapped<Service>>(`/api/services/${slug}`).then((r) => r.data) });

export const useSolutions = (industry?: string) => useQuery({ queryKey: ["solutions", industry ?? "all"], queryFn: () => api<Wrapped<SolutionCard[]>>("/api/solutions", { params: { industry } }).then((r) => r.data), staleTime: 60_000 });
export const useSolution = (slug: string) => useQuery({ queryKey: ["solution", slug], queryFn: () => api<Wrapped<Solution>>(`/api/solutions/${slug}`).then((r) => r.data) });
export const useIndustries = () => useQuery({ queryKey: ["industries"], queryFn: () => api<Wrapped<{ industry: string; solutions: SolutionCard[] }[]>>("/api/industries").then((r) => r.data), staleTime: 60_000 });

export const useProjects = (params: { category?: string; page?: number } = {}) =>
  useQuery({ queryKey: ["projects", params], queryFn: () => api<Paged<ProjectCard> & { meta: { categories: string[] } }>("/api/projects", { params }), staleTime: 30_000 });
export const useProject = (slug: string) => useQuery({ queryKey: ["project", slug], queryFn: () => api<Wrapped<Project>>(`/api/projects/${slug}`).then((r) => r.data) });


export const useTeam = () => useQuery({ queryKey: ["team"], queryFn: () => api<Wrapped<TeamMember[]>>("/api/team").then((r) => r.data), staleTime: 60_000 });
export const useTestimonials = () => useQuery({ queryKey: ["testimonials"], queryFn: () => api<Wrapped<Testimonial[]>>("/api/testimonials").then((r) => r.data), staleTime: 60_000 });
export const useFaqs = () => useQuery({ queryKey: ["faqs"], queryFn: () => api<Wrapped<Faq[]>>("/api/faqs").then((r) => r.data), staleTime: 60_000 });
