import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, ShieldCheck, PackageCheck, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/shop/")({
  component: ShopDashboard,
});

function ShopDashboard() {
  const batches = useStore((s) => s.batches);
  const verified = batches.filter((b) => b.status === "verified");
  const available = verified.filter((b) => b.distribution !== "received");
  const received = batches.filter((b) => b.distribution === "received");

  return (
    <DashboardLayout
      role="shop"
      title="Welcome to your shop dashboard"
      description="Source verified coffee with full provenance, sealed on the blockchain."
      actions={
        <Link
          to="/shop/catalog"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse catalog
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Available Coffee" value={available.length} icon={Coffee} tone="coffee" hint="Verified & ready" />
        <StatCard label="Verified Coffee" value={verified.length} icon={ShieldCheck} tone="success" hint="Sealed on-chain" />
        <StatCard label="Received Coffee" value={received.length} icon={PackageCheck} tone="info" hint="In your inventory" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-base font-semibold">Fresh verified arrivals</h2>
            <Link to="/shop/catalog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Catalog <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {available.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4">
                <div className="grid size-10 place-items-center rounded-xl bg-coffee/10 text-coffee">
                  <Coffee className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.coffeeName}</p>
                  <p className="text-xs text-muted-foreground">{b.farmerName} • {b.farmLocation}</p>
                </div>
                <StatusBadge status="verified" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-base font-semibold">Recently received</h2>
            <span className="text-xs text-muted-foreground">{received.length} in stock</span>
          </div>
          <div className="divide-y">
            {received.slice(0, 5).map((b) => (
              <Link
                to="/shop/trace/$id"
                params={{ id: b.id }}
                key={b.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-success/10 text-success">
                  <PackageCheck className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.coffeeName}</p>
                  <p className="text-xs text-muted-foreground">{b.id} • {b.quantityKg} kg</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
            {received.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No shipments received yet.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
