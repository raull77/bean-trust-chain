import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Coffee, Search, ScanLine, ArrowRight, Hash } from "lucide-react";
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

  // Tampilkan beberapa batch terverifikasi sebagai referensi
  const verifiedBatches = batches.filter((b) => b.status === "verified").slice(0, 4);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Coffee className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">CoffeeTrace</p>
              <p className="text-[11px] text-muted-foreground">Verifikasi Keaslian Kopi</p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Masuk ke Sistem
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <ScanLine className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Verifikasi Keaslian Kopi
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Masukkan ID Batch dari kode QR pada kemasan kopi untuk memeriksa
            keaslian dan riwayat rantai pasoknya.
          </p>
        </div>

        {/* Form Pencarian */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">ID Batch</span>
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
                  className="w-full rounded-lg border bg-background px-3 py-3 pl-10 font-mono text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
              )}
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Search className="size-4" />
              Telusuri Batch
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            ID Batch tertera pada label kemasan atau kode QR produk kopi.
          </p>
        </div>

        {/* Daftar Batch Terverifikasi sebagai referensi */}
        {verifiedBatches.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Batch terverifikasi yang tersedia:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {verifiedBatches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() =>
                    navigate({ to: "/verify/$id", params: { id: b.id } })
                  }
                  className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-card/80 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{b.coffeeName}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {b.id}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Halaman ini dapat diakses publik tanpa perlu masuk ke sistem.
          <br />
          Data verifikasi diamankan oleh catatan blockchain yang tidak dapat
          diubah.
        </p>
      </main>
    </div>
  );
}
