import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, CheckCircle2, Clock, Truck, ArrowUpRight, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/farmer/")({
  component: FarmerDashboard,
});

function FarmerDashboard() {
  const user = useStore((s) => s.currentUser);
  const batches = useStore((s) => s.batches);
  const mine = batches; // all batches in demo belong to the farmer view

  const total = mine.length;
  const verified = mine.filter((b) => b.status === "verified").length;
  const pending = mine.filter((b) => b.status === "pending").length;
  const distributed = mine.filter((b) => b.distribution !== "none").length;

  const recent = mine.slice(0, 5);

  return (
    <DashboardLayout
      role="farmer"
      title={`Selamat datang, ${user?.name.split(" ").slice(-1)[0]}`}
      description="Overview of your coffee harvests and their journey through the supply chain."
      actions={
        <Link
          to="/farmer/add"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className="size-4" />
          New batch
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Coffee Batches" value={total} icon={Coffee} tone="coffee" hint="All harvests submitted" />
        <StatCard label="Verified Batches" value={verified} icon={CheckCircle2} tone="success" hint="Approved by government" />
        <StatCard label="Pending Verification" value={pending} icon={Clock} tone="warning" hint="Awaiting verifier review" />
        <StatCard label="Distributed Batches" value={distributed} icon={Truck} tone="info" hint="Shipped to coffee shops" />
      </div>

      <div className="mt-6 rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Recent harvests</h2>
            <p className="text-xs text-muted-foreground">Latest batches you have registered.</p>
          </div>
          <Link to="/farmer/batches" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <div className="divide-y">
          {recent.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="grid size-10 place-items-center rounded-xl bg-coffee/10 text-coffee">
                <Coffee className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.coffeeName}</p>
                <p className="text-xs text-muted-foreground">
                  {b.id} • {b.farmLocation} • {format(new Date(b.harvestDate), "d MMM yyyy")}
                </p>
              </div>
              <StatusBadge status={b.status} />
              <StatusBadge status={b.distribution} />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
