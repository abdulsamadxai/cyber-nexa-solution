import { Info } from "lucide-react";

/**
 * Prominent affiliate disclosure banner. Shown at the top of every page
 * that contains affiliate links, plus a full-text version in the footer
 * of the page.
 */
export function AffiliateDisclosure({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900" role="note">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <p>
        <strong className="font-semibold">Affiliate disclosure: </strong>
        {text}
      </p>
    </div>
  );
}
