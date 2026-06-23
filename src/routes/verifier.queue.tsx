import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/verifier/queue")({
  component: QueuePage,
});

const filterLabels: Record<string, string> = {
  pending: "Menunggu",
  verified: "Terverifikasi",
  rejected: "Ditolak",
  all: "Semua",
};

function QueuePage() {
  const batches = useStore((s) => s.batches);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");

  const filtered = useMemo(() => {
    return batches
      .filter((b) => (filter === "all" ? true : b.status === filter))
      .filter((b) => (q ? `${b.id} ${b.coffeeName} ${b.farmerName} ${b.farmLocation}`.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
  }, [batches, q, filter]);

  return (
    <DashboardLayout role="verifier" title="Antrian Verifikasi" description="Tinjau dan otentikasi batch kopi yang masuk.">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari batch, petani, atau lokasi…"
            className="w-full rounded-lg border bg-card px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="inline-flex rounded-lg border bg-card p-1 text-sm">
          {(["pending", "verified", "rejected", "all"] as const).map((f) => (
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
              <th className="px-5 py-3">Petani</th>
              <th className="px-5 py-3">Lokasi</th>
              <th className="px-5 py-3">Tanggal Panen</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs">{b.id}</td>
                <td className="px-5 py-3 font-medium">{b.coffeeName}</td>
                <td className="px-5 py-3 text-muted-foreground">{b.farmerName}</td>
                <td className="px-5 py-3 text-muted-foreground">{b.farmLocation}</td>
                <td className="px-5 py-3 text-muted-foreground">{format(new Date(b.harvestDate), "d MMM yyyy", { locale: idLocale })}</td>
                <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to="/verifier/$id"
                    params={{ id: b.id }}
                    className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                  >
                    <Eye className="size-3.5" />
                    Lihat Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
