/** Convert a display phone (e.g. "+92 330 5961567" or "03305961567") to a wa.me link. */
export function waLink(number: string, text?: string): string {
  let d = (number || "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1); // local Pakistani format -> international
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${d}${q}`;
}
