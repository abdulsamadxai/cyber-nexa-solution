import { cn } from "@/lib/format";
import { AdminSpinner } from "./ui";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  width?: string;
}

export function DataTable<T extends { id: string }>({ columns, rows, loading, onRowClick, empty }: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-night-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-mist/40">
              {columns.map((col) => <th key={col.key} className={cn("px-4 py-3 font-medium", col.width, col.className)}>{col.header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr><td colSpan={columns.length} className="px-4 py-16 text-center"><AdminSpinner className="mx-auto h-6 w-6" /></td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-16 text-center text-mist/50">{empty ?? "Nothing to show yet."}</td></tr>
            )}
            {!loading && rows.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row)} className={cn("transition-colors", onRowClick && "cursor-pointer hover:bg-white/[0.03]")}>
                {columns.map((col) => <td key={col.key} className={cn("px-4 py-3 text-mist/80", col.className)}>{col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return <p className="px-1 py-3 text-xs text-mist/40">{total} {total === 1 ? "item" : "items"}</p>;
  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm">
      <p className="text-xs text-mist/40">{total} items · page {page} of {totalPages}</p>
      <div className="flex gap-1.5">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-mist/70 transition-colors hover:bg-white/5 disabled:opacity-40">Previous</button>
        <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-mist/70 transition-colors hover:bg-white/5 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
