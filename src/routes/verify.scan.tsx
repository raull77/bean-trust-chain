import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Coffee,
  Search,
  ScanLine,
  ArrowRight,
  Hash,
  ShieldCheck,
  Blocks,
} from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/verify/scan")({
  head: () => ({
    meta: [
      { title: "Verifikasi QR Batch — CoffeeTrace" },
      {
        name: "description",
        content:
          "Cari dan verifikasi keaslian batch kopi menggunakan ID Batch dari kode QR pada kemasan.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const batches = useStore((s) => s.batches);

  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = input.trim().toUpperCase();
    if (!id) {
      setError("Masukkan ID Batch terlebih dahulu.");
      return;
    }
    setError("");
    navigate({ to: "/verify/$id", params: { id } });
  };

  const verifiedBatches = batches
    .filter((b) => b.status === "verified")
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-secondary/30 to-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Coffee className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">CoffeeTrace</p>
              <p className="text-[10px] text-muted-foreground">
                Platform Telusur Kopi
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            Masuk ke Sistem
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {/* ── Hero ── */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg ring-8 ring-primary/8">
            <ScanLine className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Verifikasi Keaslian Kopi
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Masukkan ID Batch dari kode QR pada kemasan kopi untuk memeriksa
            keaslian dan riwayat rantai pasoknya.
          </p>
        </div>

        {/* ── Form Pencarian ── */}
        <div className="rounded-2xl border bg-card p-6 shadow-md sm:p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                ID Batch
              </label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="cth. BATCH-VL101WPT"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border bg-background px-3 py-3 pl-10 font-mono text-sm uppercase tracking-wide transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md active:scale-[0.99]"
            >
              <Search className="size-4" />
              Telusuri Batch
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            ID Batch tertera pada label kemasan atau kode QR produk kopi.
          </p>
        </div>

        {/* ── Referensi batch terverifikasi ── */}
        {verifiedBatches.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-success" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Batch terverifikasi tersedia
              </p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {verifiedBatches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() =>
                    navigate({ to: "/verify/$id", params: { id: b.id } })
                  }
                  className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3.5 text-left transition hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-success/10 text-success">
                      {b.solana ? (
                        <Blocks className="size-3.5" />
                      ) : (
                        <ShieldCheck className="size-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {b.coffeeName}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {b.id}
                        {b.solana && (
                          <span className="ml-1.5 text-[10px] font-semibold text-primary">
                            · On-Chain
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <p className="mt-10 text-center text-xs leading-relaxed text-muted-foreground">
          Halaman ini dapat diakses publik tanpa perlu masuk ke sistem.
          <br />
          Data verifikasi diamankan oleh catatan blockchain yang tidak dapat
          diubah.
        </p>
      </main>
    </div>
  );
}
