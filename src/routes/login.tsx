import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Coffee, ShieldCheck, Store, ArrowRight, Sparkles } from "lucide-react";
import { useStore, type Role } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CoffeeTrace" },
      { name: "description", content: "Role-based sign-in for CoffeeTrace blockchain coffee traceability." },
    ],
  }),
  component: LoginPage,
});

const roles: Array<{ role: Role; title: string; subtitle: string; desc: string; icon: any; tint: string }> = [
  {
    role: "farmer",
    title: "Farmer",
    subtitle: "Petani",
    desc: "Register harvested coffee batches and track their journey from farm to shop.",
    icon: Coffee,
    tint: "from-coffee/15 to-coffee/5 text-coffee",
  },
  {
    role: "verifier",
    title: "Government Verifier",
    subtitle: "Pemerintah",
    desc: "Validate authenticity and seal batches into the blockchain ledger.",
    icon: ShieldCheck,
    tint: "from-primary/15 to-primary/5 text-primary",
  },
  {
    role: "shop",
    title: "Coffee Shop",
    subtitle: "Kios Kopi",
    desc: "Browse verified beans and receive shipments with full provenance.",
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
              <p className="text-xs text-muted-foreground">Blockchain coffee traceability</p>
            </div>
          </div>
          <span className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground md:inline-flex">
            <Sparkles className="size-3.5 text-primary" />
            Demo Environment
          </span>
        </header>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              From the farmer's hand to your cup
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Every bean, <span className="text-primary">verified</span>.<br />
              Every batch, <span className="text-coffee">on-chain</span>.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              CoffeeTrace connects farmers, government verifiers, and coffee shops in a single
              transparent supply chain — secured by tamper-evident blockchain records.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                { k: "1,240+", v: "Batches traced" },
                { k: "97.3%", v: "Verification rate" },
                { k: "184", v: "Partner farms" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl border bg-card/70 p-3 backdrop-blur">
                  <p className="text-xl font-semibold text-foreground">{s.k}</p>
                  <p className="text-[11px] text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Choose your role to sign in</p>
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
              Demo logins are pre-populated — no password required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
