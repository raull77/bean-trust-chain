import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Coffee, ShieldCheck, Store, ArrowRight, Sparkles } from "lucide-react";
import { useStore, type Role } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — CoffeeTrace" },
      { name: "description", content: "Masuk berbasis peran untuk CoffeeTrace, telusur kopi berbasis blockchain." },
    ],
  }),
  component: LoginPage,
});

const roles: Array<{ role: Role; title: string; subtitle: string; desc: string; icon: any; tint: string }> = [
  {
    role: "farmer",
    title: "Petani",
    subtitle: "Farmer",
    desc: "Daftarkan batch kopi hasil panen dan pantau perjalanannya hingga kedai kopi.",
    icon: Coffee,
    tint: "from-coffee/15 to-coffee/5 text-coffee",
  },
  {
    role: "verifier",
    title: "Petugas Verifikasi",
    subtitle: "Pemerintah",
    desc: "Validasi keaslian kopi dan catat batch ke dalam ledger blockchain.",
    icon: ShieldCheck,
    tint: "from-primary/15 to-primary/5 text-primary",
  },
  {
    role: "shop",
    title: "Kedai Kopi",
    subtitle: "Coffee Shop",
    desc: "Telusuri biji kopi terverifikasi dan terima pengiriman dengan riwayat lengkap.",
    icon: Store,
    tint: "from-info/15 to-info/5 text-info",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);

  const signIn = (role: Role) => {
    login(role);
    navigate({ to: role === "farmer" ? "/farmer" : role === "verifier" ? "/verifier" : "/shop" });
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
            <Sparkles className="size-3.5 text-primary" />
            Lingkungan Demo
          </span>
        </header>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              Dari tangan petani hingga ke cangkir Anda
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Setiap biji, <span className="text-primary">terverifikasi</span>.<br />
              Setiap batch, <span className="text-coffee">tercatat di blockchain</span>.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              CoffeeTrace menghubungkan petani, petugas verifikasi pemerintah, dan kedai kopi
              dalam satu rantai pasok transparan — diamankan oleh catatan blockchain yang tidak dapat diubah.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { k: "1.240+", v: "Batch tertelusur" },
                { k: "97,3%", v: "Tingkat verifikasi" },
                { k: "184", v: "Kebun mitra" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl border bg-card/70 p-3 backdrop-blur">
                  <p className="text-xl font-semibold text-foreground">{s.k}</p>
                  <p className="text-[11px] text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Pilih peran Anda untuk masuk</p>
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => signIn(r.role)}
                className={`group flex w-full items-center gap-4 rounded-2xl border bg-gradient-to-br ${r.tint} p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="grid size-12 place-items-center rounded-xl bg-card shadow-sm">
                  <r.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{r.title}</p>
                    <span className="rounded-full bg-card/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {r.subtitle}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{r.desc}</p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
              </button>
            ))}
            <p className="px-1 pt-2 text-xs text-muted-foreground">
              Akun demo sudah tersedia — tanpa kata sandi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
