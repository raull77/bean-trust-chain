import {
  createFileRoute,
  useNavigate,
  Link,
  notFound,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  Coffee,
  User,
  MapPin,
  Calendar,
  Scale,
  ShieldCheck,
  XCircle,
  ArrowLeft,
  Blocks,
  Hash,
  Clock3,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/blockchain";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/verifier/$id")({
  component: VerifyDetail,
  notFoundComponent: () => (
    <DashboardLayout role="verifier" title="Batch tidak ditemukan">
      <p className="text-sm text-muted-foreground">
        Batch yang diminta tidak tersedia.
      </p>
    </DashboardLayout>
  ),
});

function VerifyDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const user = useStore((s) => s.currentUser);
  const batch = useStore((s) => s.batches.find((b) => b.id === id));
  const verify = useStore((s) => s.verifyBatch);
  const reject = useStore((s) => s.rejectBatch);

  const [form, setForm] = useState({
    verifierName: user?.name ?? "",
    institution: user?.organization ?? "",
    notes: "",
  });

  if (!batch) throw notFound();

  const onApprove = () => {
    verify(batch.id, {
      verifierName: form.verifierName,
      verifierId: user?.id ?? "",
      institution: form.institution,
      notes: form.notes,
    });
  };

  const onReject = () => {
    reject(batch.id, {
      verifierName: form.verifierName,
      verifierId: user?.id ?? "",
      institution: form.institution,
      notes: form.notes,
    });
  };

  return (
    <DashboardLayout
      role="verifier"
      title={`Batch ${batch.id}`}
      description="Tinjau detail panen sebelum menyetujui atau menolak."
      actions={
        <button
          onClick={() => navigate({ to: "/verifier/queue" })}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Antrian
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Header batch */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-xl bg-coffee/10 text-coffee">
                  <Coffee className="size-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{batch.coffeeName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {batch.coffeeType} • {batch.id}
                  </p>
                </div>
              </div>
              <StatusBadge status={batch.status} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {batch.description}
            </p>
          </div>

          {/* Detail */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={User} label="Informasi Petani">
              <Row label="Nama" value={batch.farmerName} />
              <Row
                label="Dikirim"
                value={format(
                  new Date(batch.submittedAt),
                  "d MMM yyyy, HH:mm",
                  { locale: idLocale }
                )}
              />
            </InfoCard>
            <InfoCard icon={MapPin} label="Lokasi Kebun">
              <Row label="Asal" value={batch.farmLocation} />
              <Row label="Jenis Kopi" value={batch.coffeeType} />
            </InfoCard>
            <InfoCard icon={Calendar} label="Informasi Panen">
              <Row
                label="Tanggal"
                value={format(new Date(batch.harvestDate), "d MMMM yyyy", {
                  locale: idLocale,
                })}
              />
              <Row label="Jumlah" value={`${batch.quantityKg} kg`} />
            </InfoCard>
            <InfoCard icon={Scale} label="Metrik Batch">
              <Row label="ID Batch" value={batch.id} mono />
              <Row label="Status" value={statusLabel(batch.status)} />
            </InfoCard>
          </div>

          {/* Riwayat verifikasi jika sudah diproses */}
          {batch.verification && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <h3 className="text-base font-semibold">Informasi Verifikasi</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Row
                  label="Nama Petugas"
                  value={batch.verification.verifierName}
                />
                <Row label="Instansi" value={batch.verification.institution} />
                <Row
                  label="Tanggal Verifikasi"
                  value={format(
                    new Date(batch.verification.verifiedAt),
                    "d MMMM yyyy, HH:mm",
                    { locale: idLocale }
                  )}
                />
                <Row label="Status" value={statusLabel(batch.status)} />
                {batch.verification.notes && (
                  <div className="sm:col-span-2">
                    <Row label="Catatan" value={batch.verification.notes} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Catatan blockchain */}
          {batch.status === "verified" && batch.blockchain && (
            <div className="rounded-2xl border border-success/30 bg-gradient-to-br from-success/10 to-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-success text-success-foreground">
                  <Blocks className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Catatan Blockchain</h3>
                  <p className="text-xs text-muted-foreground">
                    Tercatat permanen pada ledger.
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-foreground">
                  <ShieldCheck className="size-3.5" /> Asli
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <BlockField
                  icon={Blocks}
                  label="Nomor Blok"
                  value={`#${batch.blockchain.blockNumber.toLocaleString("id-ID")}`}
                />
                <BlockField
                  icon={Clock3}
                  label="Waktu Pencatatan"
                  value={`${format(
                    new Date(batch.blockchain.timestamp),
                    "d MMM yyyy, HH:mm:ss",
                    { locale: idLocale }
                  )} WIB`}
                />
                <BlockField
                  icon={Hash}
                  label="Hash Sebelumnya"
                  value={batch.blockchain.previousHash}
                  mono
                  full
                />
                <BlockField
                  icon={Hash}
                  label="Hash Saat Ini"
                  value={batch.blockchain.currentHash}
                  mono
                  full
                />
              </div>
            </div>
          )}
        </div>

        {/* Panel Verifikasi */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold">Formulir Verifikasi</h3>
            <p className="text-xs text-muted-foreground">
              Catat keputusan Anda dan simpan ke blockchain.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Nama Petugas Verifikasi
                </span>
                <input
                  value={form.verifierName}
                  onChange={(e) =>
                    setForm({ ...form, verifierName: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Nama Instansi
                </span>
                <input
                  value={form.institution}
                  onChange={(e) =>
                    setForm({ ...form, institution: e.target.value })
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Catatan Verifikasi
                </span>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Hasil tinjauan dokumen, uji sampel…"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>

            {batch.status === "pending" ? (
              <div className="mt-5 space-y-2">
                <button
                  onClick={onApprove}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground shadow-sm transition hover:opacity-90"
                >
                  <ShieldCheck className="size-4" /> Setujui Batch
                </button>
                <button
                  onClick={onReject}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                >
                  <XCircle className="size-4" /> Tolak Batch
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Batch ini sudah{" "}
                <span className="font-medium text-foreground">
                  {statusLabel(batch.status)}
                </span>
                {batch.verification && (
                  <>
                    {" "}
                    pada{" "}
                    {format(
                      new Date(batch.verification.verifiedAt),
                      "d MMM yyyy",
                      { locale: idLocale }
                    )}{" "}
                    oleh {batch.verification.verifierName}.
                  </>
                )}
              </div>
            )}
          </div>

          {batch.status === "verified" && (
            <Link
              to="/verify/$id"
              params={{ id: batch.id }}
              className="block rounded-2xl border border-dashed bg-card/50 p-4 text-center text-sm font-medium text-primary hover:bg-card"
            >
              Lihat halaman verifikasi QR publik →
            </Link>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function statusLabel(s: string) {
  return s === "verified"
    ? "Terverifikasi"
    : s === "pending"
      ? "Menunggu Verifikasi"
      : s === "rejected"
        ? "Ditolak"
        : s;
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h4 className="text-sm font-semibold">{label}</h4>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function BlockField({
  icon: Icon,
  label,
  value,
  mono,
  full,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card/60 p-3 ${full ? "sm:col-span-2" : ""}`}
    >
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div
        className={`text-sm font-medium ${mono ? "font-mono break-all" : ""}`}
      >
        {mono ? <span title={value}>{shortHash(value)}</span> : value}
      </div>
    </div>
  );
}
