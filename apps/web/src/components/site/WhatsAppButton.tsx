import { useSettings } from "@/hooks/useSettings";
import { waLink } from "@/lib/whatsapp";

/** Fixed WhatsApp chat button shown on all public pages. Uses the primary WhatsApp number. */
export function WhatsAppButton() {
  const { data } = useSettings();
  const number = data?.general.whatsapp || data?.general.whatsapp2;
  if (!number) return null;
  const company = data?.general.companyName ?? "Cyber Nexa Solution";
  return (
    <a
      href={waLink(number, `Hi ${company}, I'd like to talk about a project.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-3 text-white shadow-lift transition-all hover:pr-5 hover:shadow-glow sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0" fill="currentColor" aria-hidden>
        <path d="M16.02 3.2c-7.1 0-12.86 5.76-12.86 12.86 0 2.27.6 4.48 1.73 6.43L3.2 28.8l6.5-1.7a12.8 12.8 0 0 0 6.32 1.64h.01c7.1 0 12.86-5.76 12.86-12.86S23.12 3.2 16.02 3.2zm0 23.4h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.86 1.01 1.03-3.76-.25-.4a10.55 10.55 0 0 1-1.62-5.63c0-5.86 4.77-10.63 10.65-10.63 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 0 1 3.11 7.52c0 5.86-4.77 10.63-10.65 10.63zm5.84-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.35-.26-.62-.52-.53-.71-.54l-.61-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.76.75.32 1.34.52 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.38.19-1.52-.08-.14-.29-.21-.61-.37z"/>
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[120px] group-hover:opacity-100">WhatsApp us</span>
    </a>
  );
}
