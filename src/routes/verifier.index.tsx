import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, ShieldCheck, XCircle, Layers, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/verifier/")({
  component: VerifierDashboard,
});

function VerifierDashboard() {
  const user = useStore((s) => s.currentUser);
  const batches = useStore((s) => s.batches);

  const firstName = user?.name.split(" ")[0] ?? "Petugas";

  const total = batches.length;
  const pending = batches.filter((b) => b.status === "pending").length;
  const verified = batches.filter((b) => b.status === "verified").length;
  const rejected = batches.filter((b) => b.status === "rejected").length;

  // Batch yang diverifikasi oleh petugas ini
  const myVerified = batches.filter(
    (b) =>
      (b.status === "verified" || b.status === "rejected") &&
      b.verification?.verifierId === user?.id
  );

  const recent = [...batches]
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
    .slice(0, 5);

  return (
    <DashboardLayout
      role="verifier"
      title={`Selamat datang, ${firstName}`}
      description="Tinjau dan verifikasi batch kopi yang dikirimkan oleh petani mitra."
      actions={
        <Link
          to="/verifier/queue"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Buka Antrian
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Batch Masuk"
          value={total}
          icon={Layers}
          hint="Seluruh pengiriman"
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={pending}
          icon={Inbox}
          tone="warning"
          hint="Perlu peninjauan segera"
        />
        <StatCard
          label="Batch Terverifikasi"
          value={verified}
          icon={ShieldCheck}
          tone="success"
          hint="Tercatat di blockchain"
        />
        <StatCard
          label="Batch Ditolak"
          value={rejected}
          icon={XCircle}
          tone="info"
          hint="Dikembalikan ke petani"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Pengiriman Terbaru */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Pengiriman Terbaru</h2>
              <p className="text-xs text-muted-foreground">
                Batch terbaru yang masuk ke sistem.
              </p>
            </div>
            <Link
              to="/verifier/queue"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Antrian Lengkap <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y">
            {recent.map((b) => (
              <Link
                to="/verifier/$id"
                params={{ id: b.id }}
                key={b.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.coffeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.id} • {b.farmerName} • Dikirim{" "}
                    {format(new Date(b.submittedAt), "d MMM yyyy", {
                      locale: idLocale,
                    })}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Riwayat verifikasi oleh petugas ini */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Riwayat Verifikasi Anda</h2>
              <p className="text-xs text-muted-foreground">
                Batch yang pernah Anda tinjau.
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {myVerified.length} keputusan
            </span>
          </div>
          <div className="divide-y">
            {myVerified.slice(0, 5).map((b) => (
              <Link
                to="/verifier/$id"
                params={{ id: b.id }}
                key={b.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{b.coffeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.farmerName} •{" "}
                    {b.verification?.verifiedAt
                      ? format(new Date(b.verification.verifiedAt), "d MMM yyyy", {
                          locale: idLocale,
                        })
                      : "—"}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
            {myVerified.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Anda belum melakukan verifikasi.
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
