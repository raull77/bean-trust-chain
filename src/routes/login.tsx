import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Coffee, Eye, EyeOff, LogIn } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — CoffeeTrace" },
      {
        name: "description",
        content:
          "Masuk ke platform CoffeeTrace, sistem telusur kopi berbasis blockchain.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulasi delay jaringan ringan
    setTimeout(() => {
      const result = login(email.trim(), password);
      setLoading(false);
      if (!result.success) {
        setError(result.message);
        return;
      }
      // Arahkan ke dasbor sesuai peran
      const user = useStore.getState().currentUser;
      if (user?.role === "farmer") navigate({ to: "/farmer" });
      else if (user?.role === "verifier") navigate({ to: "/verifier" });
      else if (user?.role === "shop") navigate({ to: "/shop" });
      else if (user?.role === "admin") navigate({ to: "/admin" });
    }, 300);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-secondary to-background">
      <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,var(--color-primary)_0,transparent_45%),radial-gradient(circle_at_80%_80%,var(--color-coffee)_0,transparent_45%)]" />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
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
          <span className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground md:inline-flex">
            <span className="size-1.5 rounded-full bg-success" />
            Sistem Aktif
          </span>
        </header>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Kolom kiri — narasi */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              Dari tangan petani hingga ke cangkir Anda
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Setiap biji,{" "}
              <span className="text-primary">terverifikasi</span>.<br />
              Setiap batch,{" "}
              <span className="text-coffee">tercatat di blockchain</span>.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              CoffeeTrace menghubungkan petani, petugas verifikasi pemerintah,
              dan kedai kopi dalam satu rantai pasok transparan — diamankan oleh
              catatan blockchain yang tidak dapat diubah.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { k: "1.240+", v: "Batch tertelusur" },
                { k: "97,3%", v: "Tingkat verifikasi" },
                { k: "184", v: "Kebun mitra" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-xl border bg-card/70 p-3 backdrop-blur"
                >
                  <p className="text-xl font-semibold text-foreground">{s.k}</p>
                  <p className="text-[11px] text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom kanan — form login */}
          <div>
            <div className="rounded-2xl border bg-card/80 p-8 shadow-lg backdrop-blur">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Masuk ke Akun Anda</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Masukkan email dan kata sandi untuk melanjutkan.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">
                    Kata Sandi
                  </span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
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
                    <LogIn className="size-4" />
                  )}
                  {loading ? "Memproses…" : "Masuk"}
                </button>
              </form>

              <div className="mt-5 border-t pt-5 text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Daftar Akun
                </Link>
              </div>
            </div>

            <p className="mt-4 px-1 text-center text-xs text-muted-foreground">
              Platform traceability kopi resmi. Hanya pengguna terdaftar yang
              dapat mengakses sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
