import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import {
  Coffee,
  ShieldCheck,
  User,
  Blocks,
  Hash,
  Clock3,
  Sprout,
  FileCheck2,
  Store as StoreIcon,
  Truck,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Globe,
  BadgeCheck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/blockchain";
import { getExplorerUrl } from "@/lib/solana";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verifikasi ${params.id} — CoffeeTrace` },
      {
        name: "description",
        content:
          "Halaman verifikasi keaslian kopi publik, diamankan oleh blockchain.",
      },
    ],
  }),
  component: PublicVerify,
});

function PublicVerify() {
  const { id } = Route.useParams();
  const batch = useStore((s) => s.batches.find((b) => b.id === id));

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${id}`
      : `https://coffeetrace.app/verify/${id}`;

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-secondary/30 to-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Coffee className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">CoffeeTrace</p>
              <p className="text-[10px] text-muted-foreground">Platform Telusur Kopi</p>
            </div>
          </div>
          <Link
            to="/verify/scan"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Cari Batch Lain
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {!batch ? (
          <NotFoundCard id={id} />
        ) : batch.status !== "verified" ? (
          <UnverifiedCard id={id} status={batch.status} />
        ) : (
          <VerifiedCard batch={batch} verifyUrl={verifyUrl} />
        )}
      </main>
    </div>
  );
}

// ─── Verified Card ────────────────────────────────────────────────────────────

type BatchType = NonNullable<
  ReturnType<typeof useStore.getState>["batches"][number]
>;

function VerifiedCard({
  batch,
  verifyUrl,
}: {
  batch: BatchType;
  verifyUrl: string;
}) {
  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-success/25 bg-linear-to-br from-success/10 via-card to-coffee/5 p-6 shadow-md sm:p-8">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-success/8" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 size-28 rounded-full bg-coffee/8" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          {/* Info kopi */}
          <div className="flex items-start gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-coffee text-coffee-foreground shadow-lg ring-4 ring-coffee/10">
              <Coffee className="size-7" />
            </div>
            <div>
              {/* Badge terverifikasi */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-success-foreground shadow-sm">
                <BadgeCheck className="size-3" /> Asli dan Terverifikasi
              </span>
              <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
                {batch.coffeeName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {batch.coffeeType} •{" "}
                <span className="font-mono text-xs">{batch.id}</span>
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center rounded-xl border bg-white p-3 shadow-md">
            <QRCodeSVG
              value={verifyUrl}
              size={100}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
              level="M"
            />
            <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Pindai untuk verifikasi
            </p>
          </div>
        </div>
      </div>

      {/* ── Konten Utama ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Kolom kiri — Info */}
        <div className="space-y-5 lg:col-span-2">
          <InfoSection title="Informasi Kopi" icon={Coffee}>
            <PairGrid>
              <Pair label="Nama Kopi" value={batch.coffeeName} />
              <Pair label="Jenis Kopi" value={batch.coffeeType} />
              <Pair label="ID Batch" value={batch.id} mono />
              <Pair label="Lokasi Asal" value={batch.farmLocation} />
              <Pair
                label="Tanggal Panen"
                value={format(new Date(batch.harvestDate), "d MMMM yyyy", {
                  locale: idLocale,
                })}
              />
              <Pair label="Jumlah" value={`${batch.quantityKg} kg`} />
            </PairGrid>
          </InfoSection>

          <InfoSection title="Informasi Petani" icon={User}>
            <PairGrid>
              <Pair label="Nama Petani" value={batch.farmerName} />
              <Pair label="Lokasi Kebun" value={batch.farmLocation} />
            </PairGrid>
          </InfoSection>

          {batch.verification && (
            <InfoSection title="Informasi Verifikasi" icon={ShieldCheck}>
              <PairGrid>
                <Pair
                  label="Nama Petugas"
                  value={batch.verification.verifierName}
                />
                <Pair label="Instansi" value={batch.verification.institution} />
                <Pair
                  label="Tanggal Verifikasi"
                  value={format(
                    new Date(batch.verification.verifiedAt),
                    "d MMMM yyyy, HH:mm",
                    { locale: idLocale }
                  )}
                />
                <Pair label="Status" value="Terverifikasi ✓" />
                {batch.verification.notes && (
                  <div className="col-span-2">
                    <Pair label="Catatan" value={batch.verification.notes} />
                  </div>
                )}
              </PairGrid>
            </InfoSection>
          )}

          {/* Riwayat Rantai Pasok */}
          <InfoSection title="Riwayat Rantai Pasok" icon={Sprout}>
            <ol className="col-span-2 space-y-0">
              <TimelineStep
                icon={Sprout}
                title="Petani Mendaftarkan Kopi"
                desc={`${batch.farmerName} • ${batch.farmLocation}`}
                date={batch.submittedAt}
                done
              />
              <TimelineStep
                icon={FileCheck2}
                title="Petugas Verifikasi Memeriksa Data"
                desc={
                  batch.verification?.institution ?? "Menunggu peninjauan"
                }
                date={batch.verification?.verifiedAt}
                done={!!batch.verification}
              />
              <TimelineStep
                icon={ShieldCheck}
                title="Kopi Dinyatakan Terverifikasi"
                desc="Tercatat permanen di blockchain"
                date={batch.verification?.verifiedAt}
                done={batch.status === "verified"}
              />
              <TimelineStep
                icon={Truck}
                title="Kedai Kopi Menerima Produk"
                desc={batch.shopName ?? "Menunggu pengiriman"}
                date={batch.receivedAt}
                done={batch.distribution === "received"}
              />
              <TimelineStep
                icon={StoreIcon}
                title="Produk Siap Dijual"
                desc={
                  batch.distribution === "received"
                    ? "Tersedia untuk pelanggan"
                    : "Belum tersedia"
                }
                date={batch.receivedAt}
                done={batch.distribution === "received"}
                isLast
              />
            </ol>
          </InfoSection>
        </div>

        {/* Kolom kanan — Blockchain */}
        <div className="space-y-4">
          {batch.solana ? (
            <SolanaCard solana={batch.solana} />
          ) : batch.blockchain ? (
            <LocalBlockchainCard b={batch.blockchain} />
          ) : null}

          <div className="rounded-xl border bg-muted/30 p-4 text-center text-xs leading-relaxed text-muted-foreground">
            <Globe className="mx-auto mb-1.5 size-4 opacity-50" />
            Halaman ini dapat diakses publik. Siapa pun dapat memindai kode QR
            untuk memverifikasi keaslian kopi.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Solana Card (polished) ───────────────────────────────────────────────────

function SolanaCard({
  solana,
}: {
  solana: NonNullable<BatchType["solana"]>;
}) {
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
      {/* Header stripe */}
      <div className="flex items-center justify-between gap-3 border-b border-primary/10 bg-primary/5 px-5 py-3">
        <div className="flex items-center gap-2.5">
          {/* Solana icon SVG */}
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <SolanaIcon className="size-4.5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Solana Devnet</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Blockchain Record
            </p>
          </div>
        </div>
        {/* On-Chain badge */}
        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-success ring-1 ring-success/30">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          On-Chain
        </span>
      </div>

      <div className="space-y-3 p-5">
        {/* Meta fields */}
        <BlockField label="Jaringan" value={solana.blockchainNetwork} />
        <BlockField label="Diverifikasi Oleh" value={solana.verifiedBy} />
        <BlockField
          label="Waktu Verifikasi"
          value={format(
            new Date(solana.verifiedAt),
            "d MMM yyyy, HH:mm:ss",
            { locale: idLocale }
          )}
          icon={<Clock3 className="size-3" />}
        />

        {/* Transaction Signature — code block with copy */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Hash className="size-3" /> Transaction Signature
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

        {/* Explorer button */}
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          <SolanaIcon className="size-4" />
          Lihat di Solana Explorer
          <ExternalLink className="size-3.5 opacity-70 transition group-hover:opacity-100" />
        </a>

        {/* Verified stamp */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success ring-1 ring-success/20">
          <BadgeCheck className="size-4" />
          Asli dan Terverifikasi — On-Chain
        </div>
      </div>
    </div>
  );
}

// ─── Local Blockchain Card (fallback) ─────────────────────────────────────────

function LocalBlockchainCard({
  b,
}: {
  b: NonNullable<BatchType["blockchain"]>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-b from-primary/6 to-card shadow-sm">
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
        <BlockField
          label="Nomor Blok"
          value={`#${b.blockNumber.toLocaleString("id-ID")}`}
          icon={<Blocks className="size-3" />}
        />
        <BlockField
          label="Waktu Pencatatan"
          value={`${format(new Date(b.timestamp), "d MMM yyyy, HH:mm:ss", { locale: idLocale })} WIB`}
          icon={<Clock3 className="size-3" />}
        />
        <BlockField
          label="Hash Sebelumnya"
          value={shortHash(b.previousHash)}
          icon={<Hash className="size-3" />}
          mono
        />
        <BlockField
          label="Hash Saat Ini"
          value={shortHash(b.currentHash)}
          icon={<Hash className="size-3" />}
          mono
        />
        <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-semibold text-success ring-1 ring-success/20">
          <BadgeCheck className="size-4" />
          Asli dan Terverifikasi
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function InfoSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground/80">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function PairGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid gap-2.5 sm:grid-cols-2">{children}</dl>
  );
}

function Pair({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-medium leading-snug ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function BlockField({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2">
      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p
        className={`text-sm font-medium leading-snug ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function TimelineStep({
  icon: Icon,
  title,
  desc,
  date,
  done,
  isLast,
}: {
  icon: any;
  title: string;
  desc: string;
  date?: string;
  done?: boolean;
  isLast?: boolean;
}) {
  return (
    <li className={`relative flex gap-4 ${isLast ? "" : "pb-5"}`}>
      {/* connector line */}
      {!isLast && (
        <span
          className={`absolute left-[17px] top-9 bottom-0 w-px ${
            done ? "bg-success/30" : "bg-border/50"
          }`}
        />
      )}
      <div
        className={`relative z-10 mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-2 transition ${
          done
            ? "border-success/30 bg-success/12 text-success"
            : "border-border/60 bg-muted/50 text-muted-foreground"
        }`}
      >
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p
            className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}
          >
            {title}
          </p>
          {date && (
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {format(new Date(date), "d MMM yyyy", { locale: idLocale })}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </li>
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

// ─── Not Found & Unverified ───────────────────────────────────────────────────

function NotFoundCard({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-destructive/20 bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/8 text-destructive">
        <AlertTriangle className="size-8" />
      </div>
      <h1 className="mt-5 text-xl font-bold">Batch Tidak Ditemukan</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Batch{" "}
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
          {id}
        </span>{" "}
        tidak terdaftar dalam sistem CoffeeTrace. Periksa kembali ID Batch atau
        hubungi penjual.
      </p>
      <Link
        to="/verify/scan"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.98]"
      >
        <ArrowLeft className="size-4" /> Cari Batch Lain
      </Link>
    </div>
  );
}

function UnverifiedCard({ id, status }: { id: string; status: string }) {
  const label =
    status === "pending"
      ? "Menunggu Verifikasi"
      : status === "rejected"
        ? "Ditolak"
        : status;
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-warning/30 bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-warning/10 text-warning-foreground">
        <AlertTriangle className="size-8" />
      </div>
      <h1 className="mt-5 text-xl font-bold">Belum Terverifikasi</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Batch{" "}
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
          {id}
        </span>{" "}
        saat ini berstatus{" "}
        <span className="font-semibold text-foreground">{label}</span>. Batch
        ini belum dicatat ke blockchain oleh petugas verifikasi pemerintah.
      </p>
      <Link
        to="/verify/scan"
        className="mt-6 inline-flex items-center gap-2 rounded-xl border bg-background px-5 py-2.5 text-sm font-semibold transition hover:bg-accent active:scale-[0.98]"
      >
        <ArrowLeft className="size-4" /> Cari Batch Lain
      </Link>
    </div>
  );
}
