import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Coffee, ShieldCheck, PackageCheck } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/shop/catalog")({
  component: CatalogPage,
});

function CatalogPage() {
  const user = useStore((s) => s.currentUser);
  const batches = useStore((s) => s.batches);
  const receiveBatch = useStore((s) => s.receiveBatch);
  const [q, setQ] = useState("");

  const verified = useMemo(
    () =>
      batches
        .filter((b) => b.status === "verified")
        .filter((b) => (q ? `${b.coffeeName} ${b.farmerName} ${b.farmLocation}`.toLowerCase().includes(q.toLowerCase()) : true)),
    [batches, q],
  );

  return (
    <DashboardLayout
      role="shop"
      title="Katalog Kopi Terverifikasi"
      description="Telusuri seluruh batch yang sudah diverifikasi pemerintah serta riwayat perjalanannya."
    >
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari berdasarkan nama, petani, atau asal…"
          className="w-full rounded-lg border bg-card px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {verified.map((b) => (
          <div key={b.id} className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
            <div className="relative h-32 bg-gradient-to-br from-coffee/30 via-coffee/15 to-primary/15">
              <div className="absolute inset-0 grid place-items-center text-coffee/70">
                <Coffee className="size-12" />
              </div>
              <div className="absolute right-3 top-3">
                <StatusBadge status={b.distribution === "received" ? "received" : "verified"} />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold leading-tight">{b.coffeeName}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.coffeeType} • {b.id}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                  <ShieldCheck className="size-3" /> On-chain
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>

              <dl className="mt-4 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coffee className="size-3.5" /> {b.farmerName}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-3.5" /> {b.farmLocation}
                </div>
              </dl>

              <div className="mt-5 flex items-center gap-2">
                <Link
                  to="/shop/trace/$id"
                  params={{ id: b.id }}
                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Lihat Telusur
                </Link>
                {b.distribution !== "received" && (
                  <button
                    onClick={() => receiveBatch(b.id, user?.organization ?? "Kedai Kopi")}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-accent"
                  >
                    <PackageCheck className="size-3.5" /> Terima
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {verified.length === 0 && (
          <p className="col-span-full rounded-2xl border bg-card py-12 text-center text-sm text-muted-foreground">
            Belum ada kopi terverifikasi yang tersedia.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
