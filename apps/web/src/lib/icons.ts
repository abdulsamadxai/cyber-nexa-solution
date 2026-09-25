import {
  Globe, AppWindow, Smartphone, BrainCircuit, MessagesSquare, Code2, Users, Building2, ShoppingCart,
  LayoutDashboard, Workflow, Plug, Network, PenTool, Cloud, Boxes, UtensilsCrossed, Store, Plane,
  GraduationCap, HeartPulse, Package, Contact, CreditCard, Bot, CalendarCheck, Sparkles, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Globe, AppWindow, Smartphone, BrainCircuit, MessagesSquare, Code2, Users, Building2, ShoppingCart,
  LayoutDashboard, Workflow, Plug, Network, PenTool, Cloud, Boxes, UtensilsCrossed, Store, Plane,
  GraduationCap, HeartPulse, Package, Contact, CreditCard, Bot, CalendarCheck,
};

export const iconOptions = Object.keys(map);
export const resolveIcon = (name: string | null | undefined): LucideIcon => (name && map[name]) || Sparkles;
