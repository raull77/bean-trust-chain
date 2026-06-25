import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Coffee,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  PackageCheck,
  Hash,
  Blocks,
  Clock3,
  ArrowLeft,
  Sprout,
  FileCheck2,
  Truck,
  Store as StoreIcon,
  ExternalLink,
  Copy,
  Check,
  BadgeCheck,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/blockchain";
import { getExplorerUrl } from "@/lib/solana";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/shop/trace/$id")({
  component: TracePage,
  notFoundComponent: () => (
    <DashboardLayout role="shop" title="Batch tidak ditemukan">
      <p className="text-sm text-muted-foreground">Batch ini tidak tersedia.</p>
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
      title="Telusur Kopi"
      description="Riwayat lengkap rantai pasok batch ini."
      actions={
        <Link
          to="/shop/catalog"
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium transition hover:bg-accent"
        >
          <ArrowLeft className="size-4" /> Kembali ke Katalog
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Kolom kiri ── */}
        <div className="space-y-5 lg:col-span-2">
          {/* Hero card */}
          <div className="relative overflow-hidden rounded-2xl border border-success/20 bg-linear-to-br from-success/8 via-card to-coffee/5 p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-success/6" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-coffee/15 text-coffee shadow-sm">
                  <Coffee className="size-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{batch.coffeeName}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {batch.coffeeType} •{" "}
                    <span className="font-mono text-xs">{batch.id}</span>
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-foreground shadow-sm">
                <BadgeCheck className="size-3.5" /> Kopi Asli Terverifikasi
              </span>
            </div>
            <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
              {batch.description}
            </p>
          </div>

          {/* Timeline */}
          <Timeline batch={batch} />

          {/* Info cards grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={User} title="Petani">
              <Row
                label="Nama"
                value={batch.farmerName}
              />
              <Row
                label="Dikirim"
                value={format(new Date(batch.submittedAt), "d MMM yyyy", {
                  locale: idLocale,
                })}
              />
            </InfoCard>
            <InfoCard icon={MapPin} title="Lokasi Kebun">
              <Row label="Asal" value={batch.farmLocation} />
              <Row label="Jumlah" value={`${batch.quantityKg} kg`} />
            </InfoCard>
            <InfoCard icon={Calendar} title="Panen">
              <Row
                label="Tanggal"
                value={format(new Date(batch.harvestDate), "d MMMM yyyy", {
                  locale: idLocale,
                })}
              />
              <Row label="Jenis" value={batch.coffeeType} />
            </InfoCard>
            {batch.verification && (
              <InfoCard icon={ShieldCheck} title="Informasi Verifikasi">
                <Row
                  label="Nama Petugas"
                  value={batch.verification.verifierName}
                />
                <Row label="Instansi" value={batch.verification.institution} />
                <Row
                  label="Tanggal"
                  value={format(
                    new Date(batch.verification.verifiedAt),
                    "d MMM yyyy",
                    { locale: idLocale }
                  )}
                />
                <Row label="Status" value="Terverifikasi ✓" />
              </InfoCard>
            )}
          </div>
        </div>

        {/* ── Kolom kanan — Blockchain ── */}
        <div className="space-y-4">
          {batch.solana ? (
            <SolanaCard solana={batch.solana} />
          ) : batch.blockchain ? (
            <LocalBlockchainCard b={batch.blockchain} />
          ) : null}

          <Link
            to="/verify/$id"
            params={{ id: batch.id }}
            className="group flex items-center justify-between rounded-xl border border-dashed bg-card/60 px-4 py-3 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-card hover:shadow-sm"
          >
            <span>Buka halaman verifikasi QR publik</span>
            <ExternalLink className="size-4 opacity-60 transition group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

type BatchType = NonNullable<
  ReturnType<typeof useStore.getState>["batches"][number]
>;

function Timeline({ batch }: { batch: BatchType }) {
  const steps = [
    {
      icon: Sprout,
      title: "Petani Mendaftarkan Kopi",
      desc: `${batch.farmerName} mendaftarkan hasil panen`,
      date: batch.submittedAt,
      done: true,
    },
    {
      icon: FileCheck2,
      title: "Petugas Verifikasi Memeriksa Data",
      desc: batch.verification
        ? `${batch.verification.verifierName} (${batch.verification.institution})`
        : "Menunggu verifikasi",
      date: batch.verification?.verifiedAt,
      done: batch.status === "verified" || batch.status === "rejected",
    },
    {
      icon: ShieldCheck,
      title: "Kopi Dinyatakan Terverifikasi",
      desc:
        batch.status === "verified"
          ? "Tercatat permanen di blockchain"
          : "Belum disetujui",
      date:
        batch.status === "verified"
          ? batch.verification?.verifiedAt
          : undefined,
      done: batch.status === "verified",
    },
    {
      icon: Truck,
      title: "Kedai Kopi Menerima Produk",
      desc:
        batch.distribution === "received"
          ? `Diterima oleh ${batch.shopName}`
          : "Belum diterima kedai",
      date: batch.receivedAt,
      done: batch.distribution === "received",
    },
    {
      icon: StoreIcon,
      title: "Produk Siap Dijual",
      desc:
        batch.distribution === "received"
          ? "Tersedia untuk pelanggan"
          : "Menunggu kesiapan",
      date: batch.receivedAt,
      done: batch.distribution === "received",
    },
  ];

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <PackageCheck className="size-3.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Riwayat Rantai Pasok</h3>
          <p className="text-[11px] text-muted-foreground">
            Dari kebun hingga ke kedai Anda
          </p>
        </div>
      </div>
      <ol className="space-y-0">
        {steps.map((s, i) => (
          <li key={i} className={`relative flex gap-4 ${i < steps.length - 1 ? "pb-5" : ""}`}>
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[17px] top-9 bottom-0 w-px transition ${
                  s.done ? "bg-success/30" : "bg-border/50"
                }`}
              />
            )}
            <div
              className={`relative z-10 mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-2 transition ${
                s.done
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border/50 bg-muted/50 text-muted-foreground"
              }`}
            >
              <s.icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <p
                  className={`text-sm font-medium ${s.done ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {s.title}
                </p>
                {s.date && (
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {format(new Date(s.date), "d MMM yyyy", {
                      locale: idLocale,
                    })}
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

// ─── Solana Card ──────────────────────────────────────────────────────────────

function SolanaCard({ solana }: { solana: NonNullable<BatchType["solana"]> }) {
  const [copied, setCopied] = useState(false);
  const explorerUrl = getExplorerUrl(solana.transactionSignature);

  const handleCopy = () => {
    navigator.clipboard.writeText(solana.transactionSignature).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-b from-primary/8 to-card shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-primary/10 bg-primary/5 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <SolanaIcon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Solana Devnet</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Blockchain Record
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-success ring-1 ring-success/25">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          On-Chain
        </span>
      </div>

      <div className="space-y-2.5 p-5">
        <Field label="Jaringan" value={solana.blockchainNetwork} />
        <Field label="Diverifikasi Oleh" value={solana.verifiedBy} />
        <Field
          label="Waktu Verifikasi"
          value={format(
            new Date(solana.verifiedAt),
            "d MMM yyyy, HH:mm:ss",
            { locale: idLocale }
          )}
        />

        {/* Signature block */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Hash className="size-3" /> TX Signature
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-success" />
                  <span className="text-success">Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" /> Salin
                </>
              )}
            </button>
          </div>
          <div className="rounded-lg border bg-muted/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-foreground/80 break-all">
            {solana.transactionSignature}
          </div>
        </div>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          <SolanaIcon className="size-4" />
          Lihat di Solana Explorer
          <ExternalLink className="size-3.5 opacity-70 transition group-hover:opacity-100" />
        </a>

        <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success ring-1 ring-success/20">
          <BadgeCheck className="size-4" />
          Asli dan Terverifikasi — On-Chain
        </div>
      </div>
    </div>
  );
}

// ─── Local Blockchain Card ────────────────────────────────────────────────────

function LocalBlockchainCard({
  b,
}: {
  b: NonNullable<BatchType["blockchain"]>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-b from-primary/5 to-card shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-primary/10 bg-primary/4 px-5 py-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Blocks className="size-4" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Catatan Blockchain</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Ledger Internal CoffeeTrace
          </p>
        </div>
      </div>
      <div className="space-y-2.5 p-5">
        <Field
          label="Nomor Blok"
          value={`#${b.blockNumber.toLocaleString("id-ID")}`}
        />
        <Field
          label="Waktu Pencatatan"
          value={`${format(new Date(b.timestamp), "d MMM yyyy, HH:mm:ss", { locale: idLocale })} WIB`}
        />
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hash Sebelumnya
          </p>
          <p className="font-mono text-xs text-foreground/70 break-all">
            {shortHash(b.previousHash)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Hash Saat Ini
          </p>
          <p className="font-mono text-xs text-foreground/70 break-all">
            {shortHash(b.currentHash)}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success ring-1 ring-success/20">
          <BadgeCheck className="size-4" />
          Asli dan Terverifikasi
        </div>
      </div>
    </div>
  );
}

// ─── InfoCard ─────────────────────────────────────────────────────────────────

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-foreground/70">
          {title}
        </h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium">{value}</span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

// ─── Solana SVG Icon ──────────────────────────────────────────────────────────

function SolanaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 397.7 311.7"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M64.6 237.9a12 12 0 0 1 8.4-3.5h317.4c5.3 0 8 6.4 4.2 10.2l-62.7 62.7a12 12 0 0 1-8.4 3.5H6.1c-5.3 0-8-6.4-4.2-10.2l62.7-62.7zm0-164.1a12 12 0 0 1 8.4-3.5h317.4c5.3 0 8 6.4 4.2 10.2l-62.7 62.7a12 12 0 0 1-8.4 3.5H6.1c-5.3 0-8-6.4-4.2-10.2l62.7-62.7zM331.1 73.8a12 12 0 0 1-8.4 3.5H5.3c-5.3 0-8-6.4-4.2-10.2L63.8 4.4A12 12 0 0 1 72.2.9h317.4c5.3 0 8 6.4 4.2 10.2l-62.7 62.7z" />
    </svg>
  );
}
