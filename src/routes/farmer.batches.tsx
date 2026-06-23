import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/farmer/batches")({
  component: BatchesPage,
});

const filterLabels: Record<string, string> = {
  all: "Semua",
  pending: "Menunggu",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

function BatchesPage() {
  const batches = useStore((s) => s.batches);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (q && !`${b.id} ${b.coffeeName} ${b.farmLocation}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [batches, q, filter]);

  return (
    <DashboardLayout
      role="farmer"
      title="Daftar Batch Kopi Saya"
      description="Seluruh batch yang Anda daftarkan untuk verifikasi."
      actions={
        <Link
          to="/farmer/add"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Tambah Batch
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari berdasarkan batch, kopi, atau lokasi…"
            className="w-full rounded-lg border bg-card px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="inline-flex rounded-lg border bg-card p-1 text-sm">
          {(["all", "pending", "verified", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                filter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">ID Batch</th>
              <th className="px-5 py-3">Nama Kopi</th>
              <th className="px-5 py-3">Tanggal Panen</th>
              <th className="px-5 py-3">Verifikasi</th>
              <th className="px-5 py-3">Distribusi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{b.id}</td>
                <td className="px-5 py-3">
                  <p className="font-medium">{b.coffeeName}</p>
                  <p className="text-xs text-muted-foreground">{b.coffeeType} • {b.farmLocation}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{format(new Date(b.harvestDate), "d MMM yyyy", { locale: idLocale })}</td>
                <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3"><StatusBadge status={b.distribution} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  Tidak ada batch ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
