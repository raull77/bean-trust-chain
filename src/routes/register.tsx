import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Coffee, Eye, EyeOff, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Daftar Akun — CoffeeTrace" },
      { name: "description", content: "Buat akun baru di platform CoffeeTrace." },
    ],
  }),
  component: RegisterPage,
});

type RegisterRole = "farmer" | "shop" | "verifier";

const roleOptions: Array<{ value: RegisterRole; label: string; desc: string }> = [
  {
    value: "farmer",
    label: "Petani",
    desc: "Daftarkan batch kopi dan pantau rantai pasok.",
  },
  {
    value: "shop",
    label: "Kedai Kopi",
    desc: "Akses katalog kopi terverifikasi dan kelola stok.",
  },
  {
    value: "verifier",
    label: "Petugas Verifikasi",
    desc: "Verifikasi batch kopi dan catat ke blockchain.",
  },
];

function orgLabel(role: RegisterRole) {
  if (role === "farmer") return "Nama Kebun / Kelompok Tani";
  if (role === "shop") return "Nama Kedai Kopi";
  return "Instansi Pemerintah";
}

function orgPlaceholder(role: RegisterRole) {
  if (role === "farmer") return "cth. Kebun Kopi Gayo Sejahtera";
  if (role === "shop") return "cth. Kopi Nusantara Café";
  return "cth. Kementerian Pertanian RI";
}

function RegisterPage() {
  const navigate = useNavigate();
  const register = useStore((s) => s.register);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer" as RegisterRole,
    organization: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 3) {
      setError("Nama lengkap minimal 3 karakter.");
      return;
    }
    if (form.password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Kata sandi dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        organization: form.organization.trim() || undefined,
      });
      setLoading(false);
      if (!result.success) {
        setError(result.message);
        return;
      }
      if (form.role === "farmer") navigate({ to: "/farmer" });
      else if (form.role === "verifier") navigate({ to: "/verifier" });
      else navigate({ to: "/shop" });
    }, 300);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-secondary to-background">
      <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary)_0,transparent_45%),radial-gradient(circle_at_80%_80%,var(--color-coffee)_0,transparent_45%)]" />

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Coffee className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">CoffeeTrace</p>
              <p className="text-xs text-muted-foreground">Telusur kopi berbasis blockchain</p>
            </div>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Sudah punya akun? Masuk
          </Link>
        </header>

        <div className="my-auto pt-10 pb-16">
          <div className="rounded-2xl border bg-card/80 p-8 shadow-lg backdrop-blur">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Buat Akun Baru</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Isi data di bawah untuk mendaftar sebagai pengguna CoffeeTrace.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pilih Peran */}
              <div>
                <span className="mb-2 block text-sm font-medium">Peran</span>
                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => {
                        setField("role", r.value);
                        setField("organization", "");
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        form.role === r.value
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      <p className="text-sm font-semibold">{r.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-tight">
                        {r.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Lengkap */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Nama Lengkap</span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              {/* Email */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              {/* Nama Organisasi — label dinamis berdasarkan peran */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  {orgLabel(form.role)}
                  <span className="ml-1 text-xs text-muted-foreground">(opsional)</span>
                </span>
                <input
                  type="text"
                  autoComplete="organization"
                  value={form.organization}
                  onChange={(e) => setField("organization", e.target.value)}
                  placeholder={orgPlaceholder(form.role)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              {/* Kata Sandi */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Kata Sandi</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              {/* Konfirmasi Kata Sandi */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Konfirmasi Kata Sandi</span>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => setField("confirmPassword", e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {loading ? "Memproses…" : "Buat Akun"}
              </button>
            </form>

            <div className="mt-5 border-t pt-5 text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
