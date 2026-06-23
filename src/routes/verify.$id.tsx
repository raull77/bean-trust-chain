import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  Coffee, ShieldCheck, MapPin, Calendar, User, Blocks, Hash, Clock3,
  Sprout, FileCheck2, Store as StoreIcon, Truck, ArrowLeft, AlertTriangle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/blockchain";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verifikasi ${params.id} — CoffeeTrace` },
      { name: "description", content: "Halaman verifikasi keaslian kopi publik, diamankan oleh blockchain." },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Coffee className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">CoffeeTrace</p>
              <p className="text-[11px] text-muted-foreground">Verifikasi Publik</p>
            </div>
          </div>
          <Link to="/verify/scan" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Cari Batch Lain
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
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

function VerifiedCard({ batch, verifyUrl }: { batch: NonNullable<ReturnType<typeof useStore.getState>["batches"][number]>; verifyUrl: string }) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-success/30 bg-gradient-to-br from-success/15 via-card to-coffee/10 p-8 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-coffee text-coffee-foreground shadow-md">
              <Coffee className="size-7" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success-foreground">
                <ShieldCheck className="size-3.5" /> Asli dan Terverifikasi
              </span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">{batch.coffeeName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{batch.coffeeType} • Batch <span className="font-mono">{batch.id}</span></p>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-3 shadow-sm">
            <QRCodeSVG value={verifyUrl} size={120} bgColor="transparent" fgColor="#1a1a1a" level="M" />
            <p className="mt-2 text-center text-[10px] text-muted-foreground">Pindai untuk verifikasi ulang</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Informasi Kopi" icon={Coffee}>
            <Pair label="Nama Kopi" value={batch.coffeeName} />
            <Pair label="Jenis Kopi" value={batch.coffeeType} />
            <Pair label="ID Batch" value={batch.id} mono />
            <Pair label="Lokasi Asal" value={batch.farmLocation} />
            <Pair label="Tanggal Panen" value={format(new Date(batch.harvestDate), "d MMMM yyyy", { locale: idLocale })} />
            <Pair label="Jumlah" value={`${batch.quantityKg} kg`} />
          </Section>

          <Section title="Informasi Petani" icon={User}>
            <Pair label="Nama Petani" value={batch.farmerName} />
            <Pair label="Lokasi Kebun" value={batch.farmLocation} />
          </Section>

          {batch.verification && (
            <Section title="Informasi Verifikasi" icon={ShieldCheck}>
              <Pair label="Nama Petugas Verifikasi" value={batch.verification.verifierName} />
              <Pair label="Instansi" value={batch.verification.institution} />
              <Pair label="Tanggal Verifikasi" value={format(new Date(batch.verification.verifiedAt), "d MMMM yyyy, HH:mm", { locale: idLocale })} />
              <Pair label="Status" value="Terverifikasi" />
              {batch.verification.notes && (
                <div className="sm:col-span-2">
                  <Pair label="Catatan" value={batch.verification.notes} />
                </div>
              )}
            </Section>
          )}

          <Section title="Riwayat Rantai Pasok" icon={Sprout}>
            <ol className="mt-2 space-y-4 sm:col-span-2">
              <TimelineStep icon={Sprout} title="Petani Mendaftarkan Kopi" desc={`${batch.farmerName} • ${batch.farmLocation}`} date={batch.submittedAt} done />
              <TimelineStep
                icon={FileCheck2}
                title="Petugas Verifikasi Memeriksa Data"
                desc={batch.verification?.institution ?? "Menunggu peninjauan"}
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
                desc={batch.distribution === "received" ? "Tersedia untuk pelanggan" : "Belum tersedia"}
                date={batch.receivedAt}
                done={batch.distribution === "received"}
              />
            </ol>
          </Section>
        </div>

        <div className="space-y-4">
          {batch.blockchain && (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Blocks className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Catatan Blockchain</h3>
                  <p className="text-xs text-muted-foreground">Entri ledger permanen</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <BField icon={Blocks} label="Nomor Blok" value={`#${batch.blockchain.blockNumber.toLocaleString("id-ID")}`} />
                <BField icon={Clock3} label="Waktu Pencatatan" value={`${format(new Date(batch.blockchain.timestamp), "d MMM yyyy, HH:mm:ss", { locale: idLocale })} WIB`} />
                <BField icon={Hash} label="Hash Sebelumnya" value={shortHash(batch.blockchain.previousHash)} mono />
                <BField icon={Hash} label="Hash Saat Ini" value={shortHash(batch.blockchain.currentHash)} mono />
              </div>
              <div className="mt-5 rounded-xl bg-success px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-success-foreground shadow-sm">
                ✓ Asli dan Terverifikasi
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-card p-5 text-xs text-muted-foreground">
            Halaman ini dapat diakses publik. Siapa pun dapat memindai kode QR pada
            kemasan kopi untuk memverifikasi ulang asal-usulnya pada catatan blockchain.
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Pair({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function TimelineStep({ icon: Icon, title, desc, date, done }: { icon: any; title: string; desc: string; date?: string; done?: boolean }) {
  return (
    <li className="flex gap-3">
      <div className={`grid size-9 shrink-0 place-items-center rounded-full ${done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}{date ? ` • ${format(new Date(date), "d MMM yyyy", { locale: idLocale })}` : ""}</p>
      </div>
    </li>
  );
}

function BField({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border bg-card/70 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className={`mt-0.5 text-sm font-medium ${mono ? "font-mono break-all" : ""}`}>{value}</div>
    </div>
  );
}

function NotFoundCard({ id }: { id: string }) {
  return (
    <div className="rounded-3xl border border-destructive/30 bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold">Batch tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Batch <span className="font-mono font-medium text-foreground">{id}</span> tidak
        terdaftar dalam sistem CoffeeTrace. Periksa kembali ID Batch atau hubungi penjual.
      </p>
      <Link
        to="/verify/scan"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
    <div className="rounded-3xl border border-warning/40 bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid size-14 place-items-center rounded-full bg-warning/20 text-warning-foreground">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold">Belum Terverifikasi</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Batch <span className="font-mono font-medium text-foreground">{id}</span> saat ini
        berstatus{" "}
        <span className="font-medium text-foreground">{label}</span>.
        Batch ini belum dicatat ke blockchain oleh petugas verifikasi pemerintah.
      </p>
      <Link
        to="/verify/scan"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        <ArrowLeft className="size-4" /> Cari Batch Lain
      </Link>
    </div>
  );
}
