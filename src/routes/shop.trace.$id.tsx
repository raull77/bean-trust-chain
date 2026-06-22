import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Coffee, MapPin, Calendar, User, ShieldCheck, PackageCheck, Hash, Blocks,
  Clock3, ArrowLeft, Sprout, FileCheck2, Truck, Store as StoreIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/blockchain";
import { format } from "date-fns";

export const Route = createFileRoute("/shop/trace/$id")({
  component: TracePage,
  notFoundComponent: () => (
    <DashboardLayout role="shop" title="Batch not found">
      <p className="text-sm text-muted-foreground">This batch does not exist.</p>
    </DashboardLayout>
  ),
});

function TracePage() {
  const { id } = Route.useParams();
  const batch = useStore((s) => s.batches.find((b) => b.id === id));
  if (!batch) throw notFound();

  return (
    <DashboardLayout
      role="shop"
      title="Coffee traceability"
      description="Complete supply chain history for this batch."
      actions={
        <Link
          to="/shop/catalog"
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
        >
          <ArrowLeft className="size-4" /> Back to catalog
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-gradient-to-br from-success/10 to-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-coffee/15 text-coffee">
                  <Coffee className="size-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{batch.coffeeName}</h2>
                  <p className="text-sm text-muted-foreground">{batch.coffeeType} • {batch.id}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-semibold text-success-foreground shadow-sm">
                <ShieldCheck className="size-4" /> Verified Authentic Coffee
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{batch.description}</p>
          </div>

          <Timeline batch={batch} />

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={User} title="Farmer">
              <Row label="Name" value={batch.farmerName} />
              <Row label="Submitted" value={format(new Date(batch.submittedAt), "d MMM yyyy")} />
            </InfoCard>
            <InfoCard icon={MapPin} title="Farm Location">
              <Row label="Origin" value={batch.farmLocation} />
              <Row label="Quantity" value={`${batch.quantityKg} kg`} />
            </InfoCard>
            <InfoCard icon={Calendar} title="Harvest">
              <Row label="Date" value={format(new Date(batch.harvestDate), "d MMMM yyyy")} />
              <Row label="Type" value={batch.coffeeType} />
            </InfoCard>
            {batch.verification && (
              <InfoCard icon={ShieldCheck} title="Verification">
                <Row label="Verifier" value={batch.verification.verifierName} />
                <Row label="Date" value={format(new Date(batch.verification.verifiedAt), "d MMM yyyy")} />
              </InfoCard>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {batch.blockchain && <BlockchainCard b={batch.blockchain} />}
          <Link
            to="/verify/$id"
            params={{ id: batch.id }}
            className="block rounded-2xl border border-dashed bg-card/60 p-4 text-center text-sm font-medium text-primary hover:bg-card"
          >
            Open public QR verification page →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Timeline({ batch }: { batch: NonNullable<ReturnType<typeof useStore.getState>["batches"][number]> }) {
  const steps = [
    {
      icon: Sprout,
      title: "Farmer Registration",
      desc: `${batch.farmerName} registered the harvest`,
      date: batch.submittedAt,
      done: true,
    },
    {
      icon: FileCheck2,
      title: "Government Verification",
      desc: batch.verification
        ? `${batch.verification.verifierName} (${batch.verification.institution})`
        : "Awaiting verification",
      date: batch.verification?.verifiedAt,
      done: batch.status === "verified",
    },
    {
      icon: Truck,
      title: "Distribution",
      desc: batch.distribution !== "none" ? `Distributed to ${batch.shopName}` : "Not yet distributed",
      date: batch.distribution !== "none" ? batch.verification?.verifiedAt : undefined,
      done: batch.distribution !== "none",
    },
    {
      icon: StoreIcon,
      title: "Coffee Shop Receipt",
      desc: batch.distribution === "received" ? `Received by ${batch.shopName}` : "Pending shop receipt",
      date: batch.receivedAt,
      done: batch.distribution === "received",
    },
  ];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="text-base font-semibold">Supply chain timeline</h3>
      <p className="text-xs text-muted-foreground">From the farm to your shop.</p>
      <ol className="mt-5 space-y-5">
        {steps.map((s, i) => (
          <li key={i} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[19px] top-10 bottom-[-20px] w-px ${
                  s.done ? "bg-success/40" : "bg-border"
                }`}
              />
            )}
            <div
              className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border ${
                s.done
                  ? "border-success/40 bg-success/15 text-success"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              <s.icon className="size-4" />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{s.title}</p>
                {s.date && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(s.date), "d MMM yyyy")}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BlockchainCard({ b }: { b: NonNullable<ReturnType<typeof useStore.getState>["batches"][number]["blockchain"]> }) {
  return (
    <div className="rounded-2xl border border-success/30 bg-gradient-to-br from-primary/5 to-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Blocks className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Blockchain record</h3>
          <p className="text-xs text-muted-foreground">Immutable ledger entry</p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <Field icon={Blocks} label="Block Number" value={`#${b.blockNumber.toLocaleString()}`} />
        <Field icon={Clock3} label="Timestamp" value={format(new Date(b.timestamp), "d MMM yyyy, HH:mm:ss")} />
        <Field icon={Hash} label="Previous Hash" value={shortHash(b.previousHash)} mono />
        <Field icon={Hash} label="Current Hash" value={shortHash(b.currentHash)} mono />
      </div>
      <span className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-semibold text-success-foreground">
        <ShieldCheck className="size-4" /> AUTHENTIC AND VERIFIED
      </span>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Field({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border bg-card/70 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className={`mt-0.5 text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
