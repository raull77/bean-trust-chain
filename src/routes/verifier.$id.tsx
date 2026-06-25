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
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  BadgeCheck,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/blockchain";
import {
  createBatchHash,
  submitBatchToSolana,
  getExplorerUrl,
} from "@/lib/solana";
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

type ApprovePhase =
  | "idle"
  | "submitting"    // mengirim ke Solana (belum simpan lokal)
  | "done"
  | "error";

function VerifyDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const user = useStore((s) => s.currentUser);
  const batch = useStore((s) => s.batches.find((b) => b.id === id));
  const verify = useStore((s) => s.verifyBatch);
  const reject = useStore((s) => s.rejectBatch);
  const updateSolana = useStore((s) => s.updateBatchSolana);

  const [form, setForm] = useState({
    verifierName: user?.name ?? "",
    institution: user?.organization ?? "",
    notes: "",
  });

  const [approvePhase, setApprovePhase] = useState<ApprovePhase>("idle");
  const [solanaError, setSolanaError] = useState("");

  if (!batch) throw notFound();

  const onApprove = async () => {
    if (approvePhase !== "idle" && approvePhase !== "error") return;
    setSolanaError("");
    setApprovePhase("submitting");

    // 1. Kirim ke Solana DULU — status lokal belum berubah
    const verifiedAt = new Date().toISOString();
    const payload = createBatchHash({
      batchId: batch.id,
      coffeeName: batch.coffeeName,
      farmerName: batch.farmerName,
      farmLocation: batch.farmLocation,
      harvestDate: batch.harvestDate,
      quantityKg: batch.quantityKg,
      verifierName: form.verifierName,
      institution: form.institution,
      verifiedAt,
    });

    const result = await submitBatchToSolana(payload);

    if (!result.success) {
      // Solana gagal — status batch TIDAK berubah, tetap "pending"
      setSolanaError(result.error);
      setApprovePhase("error");
      return;
    }

    // 2. Solana berhasil — simpan verifikasi lokal + data Solana sekaligus
    verify(batch.id, {
      verifierName: form.verifierName,
      verifierId: user?.id ?? "",
      institution: form.institution,
      notes: form.notes,
    });
    updateSolana(batch.id, {
      blockchainNetwork: "Solana Devnet",
      transactionSignature: result.transactionSignature,
      verifiedAt: result.submittedAt,
      verifiedBy: form.verifierName,
      onChain: true,
    });
    setApprovePhase("done");
  };

  const onReject = () => {
    reject(batch.id, {
      verifierName: form.verifierName,
      verifierId: user?.id ?? "",
      institution: form.institution,
      notes: form.notes,
    });
  };

  const isSubmitting = approvePhase === "submitting";

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
        {/* ── Kolom kiri: detail batch ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
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

          {/* Info cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={User} label="Informasi Petani">
              <Row label="Nama" value={batch.farmerName} />
              <Row
                label="Dikirim"
                value={format(new Date(batch.submittedAt), "d MMM yyyy, HH:mm", {
                  locale: idLocale,
                })}
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

          {/* Informasi Verifikasi */}
          {batch.verification && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <h3 className="text-base font-semibold">Informasi Verifikasi</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label="Nama Petugas" value={batch.verification.verifierName} />
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

          {/* Catatan Blockchain Lokal */}
          {batch.status === "verified" && batch.blockchain && (
            <div className="rounded-2xl border border-success/30 bg-linear-to-br from-success/10 to-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-success text-success-foreground">
                  <Blocks className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Catatan Blockchain Lokal</h3>
                  <p className="text-xs text-muted-foreground">
                    Hash internal CoffeeTrace
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

          {/* Catatan Solana */}
          {batch.solana && (
            <SolanaCard solana={batch.solana} />
          )}
        </div>

        {/* ── Kolom kanan: form verifikasi ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold">Formulir Verifikasi</h3>
            <p className="text-xs text-muted-foreground">
              Setujui untuk mencatat batch ke Solana Devnet.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Nama Petugas Verifikasi
                </span>
                <input
                  value={form.verifierName}
                  onChange={(e) => setForm({ ...form, verifierName: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Nama Instansi
                </span>
                <input
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
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
                  disabled={isSubmitting}
                  placeholder="Hasil tinjauan dokumen, uji sampel…"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                />
              </label>
            </div>

            {/* Error Solana */}
            {approvePhase === "error" && solanaError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <div>
                  <p className="font-medium">Gagal mengirim ke Solana Devnet</p>
                  <p className="mt-0.5 text-muted-foreground">{solanaError}</p>
                  <p className="mt-1 font-medium text-foreground">
                    Status batch <em>tidak</em> berubah. Anda dapat memperbaiki masalah dan mencoba lagi.
                  </p>
                </div>
              </div>
            )}

            {/* Progress saat submitting */}
            {isSubmitting && (
              <div className="mt-4 space-y-2 rounded-lg border bg-muted/40 p-3">
                <ProgressStep
                  done={false}
                  active={true}
                  label="Mengirim transaksi ke Solana Devnet…"
                />
              </div>
            )}

            {batch.status === "pending" ? (
              <div className="mt-5 space-y-2">
                <button
                  onClick={onApprove}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Mengirim ke Solana Devnet…
                    </>
                  ) : approvePhase === "error" ? (
                    <>
                      <ShieldCheck className="size-4" /> Coba Lagi — Catat ke Solana
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" /> Setujui & Catat ke Solana
                    </>
                  )}
                </button>
                <button
                  onClick={onReject}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
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
                    {" "}pada{" "}
                    {format(new Date(batch.verification.verifiedAt), "d MMM yyyy", {
                      locale: idLocale,
                    })}{" "}
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

// ─── Solana Card ──────────────────────────────────────────────────────────────

function SolanaCard({
  solana,
}: {
  solana: NonNullable<ReturnType<typeof useStore.getState>["batches"][number]["solana"]>;
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
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <SolanaIcon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Solana Devnet</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Blockchain Record</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-success ring-1 ring-success/25">
          <span className="size-1.5 animate-pulse rounded-full bg-success" />
          On-Chain
        </span>
      </div>

      <div className="space-y-2.5 p-5">
        <SolField label="Jaringan" value={solana.blockchainNetwork} />
        <SolField label="Diverifikasi Oleh" value={solana.verifiedBy} />
        <SolField
          label="Waktu Verifikasi"
          value={format(new Date(solana.verifiedAt), "d MMM yyyy, HH:mm:ss", {
            locale: idLocale,
          })}
        />

        {/* Signature block + copy button */}
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

function SolField({ label, value }: { label: string; value: string }) {
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

// ─── Progress Step ────────────────────────────────────────────────────────────

function ProgressStep({
  done,
  active,
  label,
}: {
  done: boolean;
  active: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {done ? (
        <ShieldCheck className="size-3.5 shrink-0 text-success" />
      ) : active ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
      ) : (
        <span className="size-3.5 shrink-0 rounded-full border border-muted-foreground/30" />
      )}
      <span
        className={
          done
            ? "text-success"
            : active
              ? "text-foreground font-medium"
              : "text-muted-foreground"
        }
      >
        {label}
      </span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
