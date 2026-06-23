import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Users,
  ShieldCheck,
  Store,
  Coffee,
  CheckCircle2,
  XCircle,
  Blocks,
  Activity,
  Hash,
  Clock3,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  ScanLine,
} from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { shortHash } from "@/lib/blockchain";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Dasbor Admin — CoffeeTrace" }],
  }),
  component: AdminDashboard,
});

// ─── Sidebar Admin ────────────────────────────────────────────────────────────

const adminNavs = [
  { to: "/admin", label: "Dasbor", icon: LayoutDashboard, exact: true },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const user = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const userInitials =
    user?.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "A";

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Coffee className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">CoffeeTrace</p>
          <p className="text-[11px] text-sidebar-foreground/60">Telusur Kopi Blockchain</p>
        </div>
      </div>

      <div className="mx-3 mb-4 rounded-xl bg-sidebar-accent/60 p-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-sidebar-primary" />
          <p className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/70">
            Administrator
          </p>
        </div>
        <p className="mt-1 text-sm font-semibold">Panel Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {adminNavs.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          );
        })}
        <Link
          to="/verify/scan"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ScanLine className="size-4" />
          Verifikasi QR
        </Link>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary/20 text-sm font-semibold text-sidebar-primary">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "—"}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {user?.organization ?? user?.email ?? "—"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: any;
  hint?: string;
  tone?: "default" | "success" | "warning" | "info" | "coffee" | "destructive";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning-foreground",
    info: "bg-info/10 text-info",
    coffee: "bg-coffee/10 text-coffee",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={cn("grid size-9 place-items-center rounded-xl", toneClasses[tone])}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Audit Log Icon & Color ───────────────────────────────────────────────────

function actionMeta(action: string): { label: string; color: string } {
  switch (action) {
    case "BATCH_CREATED":
      return { label: "Batch Dibuat", color: "bg-coffee/10 text-coffee" };
    case "BATCH_VERIFIED":
      return { label: "Batch Diverifikasi", color: "bg-success/10 text-success" };
    case "BATCH_REJECTED":
      return { label: "Batch Ditolak", color: "bg-destructive/10 text-destructive" };
    case "BATCH_DISTRIBUTED":
      return { label: "Batch Didistribusikan", color: "bg-info/10 text-info" };
    case "BATCH_RECEIVED":
      return { label: "Batch Diterima", color: "bg-primary/10 text-primary" };
    case "USER_REGISTERED":
      return { label: "Akun Terdaftar", color: "bg-warning/10 text-warning-foreground" };
    case "USER_ACTIVATED":
      return { label: "Akun Diaktifkan", color: "bg-success/10 text-success" };
    case "USER_DEACTIVATED":
      return { label: "Akun Dinonaktifkan", color: "bg-destructive/10 text-destructive" };
    default:
      return { label: action, color: "bg-muted text-muted-foreground" };
  }
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate();
  const user = useStore((s) => s.currentUser);
  const users = useStore((s) => s.users);
  const batches = useStore((s) => s.batches);
  const auditLogs = useStore((s) => s.auditLogs);
  const setUserActive = useStore((s) => s.setUserActive);
  const logout = useStore((s) => s.logout);

  const [showAllLogs, setShowAllLogs] = useState(false);
  const [verifierFilter, setVerifierFilter] = useState<"all" | "active" | "inactive">("all");

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  // ── Statistik ──
  const farmers = users.filter((u) => u.role === "farmer");
  const verifiers = users.filter((u) => u.role === "verifier");
  const shops = users.filter((u) => u.role === "shop");
  const totalBatches = batches.length;
  const verifiedBatches = batches.filter((b) => b.status === "verified");
  const rejectedBatches = batches.filter((b) => b.status === "rejected");
  const blockchainRecords = batches.filter((b) => b.blockchain);
  const lastHash = blockchainRecords
    .sort((a, b) => (b.blockchain!.blockNumber - a.blockchain!.blockNumber))[0]
    ?.blockchain?.currentHash ?? null;

  // ── Audit Logs ──
  const displayedLogs = showAllLogs ? auditLogs : auditLogs.slice(0, 8);

  // ── Manajemen Verifikator ──
  const filteredVerifiers = useMemo(() => {
    if (verifierFilter === "active") return verifiers.filter((v) => v.isActive);
    if (verifierFilter === "inactive") return verifiers.filter((v) => !v.isActive);
    return verifiers;
  }, [verifiers, verifierFilter]);

  const userInitials =
    user?.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "A";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-card/60 px-6 py-5 backdrop-blur">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Selamat datang, {user?.name.split(" ")[0] ?? "Admin"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Panel administrasi dan pemantauan sistem CoffeeTrace.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </header>

        <div className="flex-1 space-y-8 p-6">

          {/* ── Statistik Pengguna ── */}
          <section>
            <h2 className="mb-4 text-base font-semibold">Statistik Pengguna</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Total Petani"
                value={farmers.length}
                icon={Coffee}
                tone="coffee"
                hint={`${farmers.filter((f) => f.isActive).length} akun aktif`}
              />
              <StatCard
                label="Petugas Verifikasi"
                value={verifiers.length}
                icon={ShieldCheck}
                tone="success"
                hint={`${verifiers.filter((v) => v.isActive).length} akun aktif`}
              />
              <StatCard
                label="Total Kedai Kopi"
                value={shops.length}
                icon={Store}
                tone="info"
                hint={`${shops.filter((s) => s.isActive).length} akun aktif`}
              />
            </div>
          </section>

          {/* ── Statistik Batch ── */}
          <section>
            <h2 className="mb-4 text-base font-semibold">Statistik Batch Kopi</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Total Batch"
                value={totalBatches}
                icon={Coffee}
                hint="Seluruh batch terdaftar"
              />
              <StatCard
                label="Batch Terverifikasi"
                value={verifiedBatches.length}
                icon={CheckCircle2}
                tone="success"
                hint="Tercatat di blockchain"
              />
              <StatCard
                label="Batch Ditolak"
                value={rejectedBatches.length}
                icon={XCircle}
                tone="destructive"
                hint="Dikembalikan ke petani"
              />
            </div>
          </section>

          {/* ── Monitoring Blockchain ── */}
          <section>
            <h2 className="mb-4 text-base font-semibold">Monitoring Blockchain</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Catatan Blockchain"
                value={blockchainRecords.length}
                icon={Blocks}
                tone="info"
                hint="Entri ledger permanen"
              />
              <StatCard
                label="Total Verifikasi On-Chain"
                value={verifiedBatches.length}
                icon={ShieldCheck}
                tone="success"
                hint="Batch dengan rekam blockchain"
              />
              <div className="rounded-2xl border bg-card p-5 shadow-sm sm:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Hash Blok Terakhir</p>
                  <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Hash className="size-4" />
                  </div>
                </div>
                {lastHash ? (
                  <p className="mt-3 font-mono text-sm font-medium break-all text-foreground">
                    {shortHash(lastHash)}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Belum ada catatan blockchain.</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex size-2 rounded-full bg-success" />
                  <span className="text-xs text-muted-foreground">
                    Status Blockchain:{" "}
                    <span className="font-medium text-success">Aktif</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Struktur siap untuk integrasi jaringan Solana.
                </p>
              </div>
            </div>
          </section>

          {/* ── Audit Aktivitas ── */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Riwayat Aktivitas Sistem</h2>
              <span className="text-xs text-muted-foreground">{auditLogs.length} entri</span>
            </div>
            <div className="rounded-2xl border bg-card shadow-sm">
              <div className="divide-y">
                {displayedLogs.map((log) => {
                  const meta = actionMeta(log.action);
                  return (
                    <div key={log.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                      <div
                        className={cn(
                          "mt-0.5 shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                          meta.color
                        )}
                      >
                        {meta.label}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{log.detail}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {log.actorName} •{" "}
                          {format(new Date(log.timestamp), "d MMM yyyy, HH:mm", {
                            locale: idLocale,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {auditLogs.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Belum ada aktivitas tercatat.
                  </p>
                )}
              </div>
              {auditLogs.length > 8 && (
                <div className="border-t px-5 py-3">
                  <button
                    onClick={() => setShowAllLogs((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    {showAllLogs ? (
                      <>
                        <ChevronUp className="size-4" /> Sembunyikan
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-4" /> Tampilkan semua ({auditLogs.length} entri)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ── Manajemen Petugas Verifikasi ── */}
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Manajemen Petugas Verifikasi</h2>
              <div className="inline-flex rounded-lg border bg-card p-1">
                {(["all", "active", "inactive"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setVerifierFilter(f)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition",
                      verifierFilter === f
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f === "all" ? "Semua" : f === "active" ? "Aktif" : "Nonaktif"}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Nama</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Instansi</th>
                    <th className="px-5 py-3">Terdaftar</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredVerifiers.map((v) => (
                    <tr key={v.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {v.name
                              .split(" ")
                              .slice(0, 2)
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <span className="font-medium">{v.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{v.email}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {v.organization ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {format(new Date(v.createdAt), "d MMM yyyy", { locale: idLocale })}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                            v.isActive
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              v.isActive ? "bg-success" : "bg-muted-foreground"
                            )}
                          />
                          {v.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setUserActive(v.id, !v.isActive)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition",
                            v.isActive
                              ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                              : "border-success/30 text-success hover:bg-success/10"
                          )}
                        >
                          {v.isActive ? (
                            <>
                              <ToggleLeft className="size-3.5" /> Nonaktifkan
                            </>
                          ) : (
                            <>
                              <ToggleRight className="size-3.5" /> Aktifkan
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredVerifiers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-8 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada petugas verifikasi yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Daftar Semua Pengguna ── */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Semua Pengguna Terdaftar</h2>
              <span className="text-xs text-muted-foreground">
                {users.filter((u) => u.role !== "admin").length} pengguna
              </span>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Nama</th>
                    <th className="px-5 py-3">Peran</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Organisasi</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users
                    .filter((u) => u.role !== "admin")
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="px-5 py-3 font-medium">{u.name}</td>
                        <td className="px-5 py-3">
                          <RoleBadge role={u.role as "farmer" | "verifier" | "shop"} />
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {u.organization || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                              u.isActive
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                u.isActive ? "bg-success" : "bg-muted-foreground"
                              )}
                            />
                            {u.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function RoleBadge({ role }: { role: "farmer" | "verifier" | "shop" }) {
  const map = {
    farmer: { label: "Petani", cls: "bg-coffee/10 text-coffee" },
    verifier: { label: "Petugas Verifikasi", cls: "bg-success/10 text-success" },
    shop: { label: "Kedai Kopi", cls: "bg-info/10 text-info" },
  };
  const { label, cls } = map[role];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", cls)}>
      {label}
    </span>
  );
}
