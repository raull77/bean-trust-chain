import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Coffee,
  MapPin,
  Calendar,
  Scale,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/farmer/add")({
  component: AddBatchPage,
});

function AddBatchPage() {
  const navigate = useNavigate();
  const user = useStore((s) => s.currentUser);
  const addBatch = useStore((s) => s.addBatch);

  const [form, setForm] = useState({
    coffeeName: "",
    coffeeType: "Arabica",
    farmerName: user?.name ?? "",
    farmLocation: "",
    harvestDate: new Date().toISOString().slice(0, 10),
    quantityKg: 100,
    description: "",
  });
  const [submitted, setSubmitted] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = addBatch({
      ...form,
      farmerId: user?.id ?? "",
      quantityKg: Number(form.quantityKg),
    });
    setSubmitted(id);
  }

  if (submitted) {
    return (
      <DashboardLayout
        role="farmer"
        title="Batch Terkirim"
        description="Batch Anda menunggu verifikasi dari petugas pemerintah."
      >
        <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Batch berhasil didaftarkan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Batch{" "}
            <span className="font-mono font-medium text-foreground">{submitted}</span> telah
            dikirim dan saat ini berstatus{" "}
            <span className="font-medium text-warning-foreground">Menunggu Verifikasi</span>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate({ to: "/farmer/batches" })}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Lihat batch saya
            </button>
            <button
              onClick={() => {
                setSubmitted(null);
                setForm((f) => ({ ...f, coffeeName: "", description: "" }));
              }}
              className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Tambah batch lain
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="farmer"
      title="Tambah Batch Kopi"
      description="Daftarkan panen baru untuk diverifikasi dan ditelusuri."
    >
      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
        {/* Informasi Kopi */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <SectionTitle icon={Coffee} title="Informasi Kopi" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ID Batch">
              <input
                disabled
                value="Dibuat otomatis saat dikirim"
                className="w-full rounded-lg border bg-muted px-3 py-2 text-sm text-muted-foreground"
              />
            </Field>
            <Field label="Jenis Kopi">
              <select
                value={form.coffeeType}
                onChange={(e) => setForm({ ...form, coffeeType: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option>Arabica</option>
                <option>Robusta</option>
                <option>Liberica</option>
                <option>Excelsa</option>
              </select>
            </Field>
            <Field label="Nama Kopi" className="md:col-span-2">
              <input
                required
                value={form.coffeeName}
                onChange={(e) => setForm({ ...form, coffeeName: e.target.value })}
                placeholder="cth. Gayo Highland Arabica"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
          </div>
        </div>

        {/* Informasi Petani */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <SectionTitle icon={MapPin} title="Informasi Petani" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama Petani">
              <input
                required
                value={form.farmerName}
                onChange={(e) => setForm({ ...form, farmerName: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field label="Lokasi Kebun">
              <input
                required
                value={form.farmLocation}
                onChange={(e) => setForm({ ...form, farmLocation: e.target.value })}
                placeholder="Desa, Kecamatan, Provinsi"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
          </div>
        </div>

        {/* Detail Panen */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <SectionTitle icon={Calendar} title="Detail Panen" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tanggal Panen">
              <input
                type="date"
                required
                value={form.harvestDate}
                onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field label="Jumlah Panen (kg)">
              <div className="relative">
                <Scale className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  min={1}
                  required
                  value={form.quantityKg}
                  onChange={(e) =>
                    setForm({ ...form, quantityKg: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </Field>
            <Field label="Deskripsi Kopi" className="md:col-span-2">
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Proses, profil rasa, ketinggian, sertifikasi…"
                  className="w-full rounded-lg border bg-background px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/farmer" })}
            className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Kirim Batch
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
