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
  const user = useStore((s) => s.currentUser);
  const batches = useStore((s) => s.batches);

  const firstName = user?.name.split(" ")[0] ?? "Mitra";

  // Semua batch yang telah terverifikasi tersedia di katalog
  const verified = batches.filter((b) => b.status === "verified");
  const available = verified.filter((b) => b.distribution !== "received");

  // Batch yang telah diterima oleh kedai ini
  const myReceived = batches.filter(
    (b) => b.distribution === "received" && b.shopId === user?.id
  );

  return (
    <DashboardLayout
      role="shop"
      title={`Selamat datang, ${firstName}`}
      description="Dapatkan kopi terverifikasi dengan riwayat lengkap yang tercatat di blockchain."
      actions={
        <Link
          to="/shop/catalog"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Lihat Katalog
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Kopi Tersedia di Katalog"
          value={available.length}
          icon={Coffee}
          tone="coffee"
          hint="Terverifikasi & siap dipesan"
        />
        <StatCard
          label="Total Kopi Terverifikasi"
          value={verified.length}
          icon={ShieldCheck}
          tone="success"
          hint="Tercatat di blockchain"
        />
        <StatCard
          label="Kopi Diterima Kedai Anda"
          value={myReceived.length}
          icon={PackageCheck}
          tone="info"
          hint="Stok kedai Anda saat ini"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Kopi terbaru tersedia */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-base font-semibold">Kopi Terverifikasi Terbaru</h2>
            <Link
              to="/shop/catalog"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Katalog <ArrowUpRight className="size-3.5" />
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
                  <p className="text-xs text-muted-foreground">
                    {b.farmerName} • {b.farmLocation}
                  </p>
                </div>
                <StatusBadge status="verified" />
              </div>
            ))}
            {available.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Belum ada kopi terverifikasi yang tersedia.
              </p>
            )}
          </div>
        </div>

        {/* Kopi yang sudah diterima kedai ini */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-base font-semibold">Baru Saja Diterima Kedai Anda</h2>
            <span className="text-xs text-muted-foreground">
              {myReceived.length} di stok
            </span>
          </div>
          <div className="divide-y">
            {myReceived.slice(0, 5).map((b) => (
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
                  <p className="text-xs text-muted-foreground">
                    {b.id} • {b.quantityKg} kg
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
            {myReceived.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada pengiriman yang diterima.
                </p>
                <Link
                  to="/shop/catalog"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Telusuri katalog kopi
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
