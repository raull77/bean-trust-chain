import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Coffee,
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  ShieldCheck,
  Inbox,
  Store,
  BookOpen,
  LogOut,
  ScanLine,
  Settings2,
} from "lucide-react";
import { useStore, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navsByRole: Record<Role, Array<{ to: string; label: string; icon: any; exact?: boolean }>> = {
  farmer: [
    { to: "/farmer", label: "Dasbor", icon: LayoutDashboard, exact: true },
    { to: "/farmer/add", label: "Tambah Batch", icon: PlusCircle },
    { to: "/farmer/batches", label: "Daftar Batch", icon: ListChecks },
  ],
  verifier: [
    { to: "/verifier", label: "Dasbor", icon: LayoutDashboard, exact: true },
    { to: "/verifier/queue", label: "Antrian Verifikasi", icon: Inbox },
  ],
  shop: [
    { to: "/shop", label: "Dasbor", icon: LayoutDashboard, exact: true },
    { to: "/shop/catalog", label: "Katalog Kopi", icon: BookOpen },
  ],
  admin: [
    { to: "/admin", label: "Dasbor", icon: LayoutDashboard, exact: true },
  ],
};

const roleMeta: Record<Role, { title: string; subtitle: string; icon: any }> = {
  farmer: { title: "Portal Petani", subtitle: "Petani", icon: Coffee },
  verifier: { title: "Petugas Verifikasi", subtitle: "Instansi Pemerintah", icon: ShieldCheck },
  shop: { title: "Kedai Kopi", subtitle: "Mitra Kedai", icon: Store },
  admin: { title: "Panel Admin", subtitle: "Administrator", icon: Settings2 },
};

export function DashboardLayout({
  role,
  title,
  description,
  actions,
  children,
}: {
  role: Role;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const user = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navs = navsByRole[role];
  const meta = roleMeta[role];
  const RoleIcon = meta.icon;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const userInitials = user?.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        {/* Branding */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Coffee className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">CoffeeTrace</p>
            <p className="text-[11px] text-sidebar-foreground/60">Telusur Kopi Blockchain</p>
          </div>
        </div>

        {/* Identitas Peran */}
        <div className="mx-3 mb-4 rounded-xl bg-sidebar-accent/60 p-3">
          <div className="flex items-center gap-2">
            <RoleIcon className="size-4 text-sidebar-primary" />
            <p className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/70">
              {meta.subtitle}
            </p>
          </div>
          <p className="mt-1 text-sm font-semibold">{meta.title}</p>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 space-y-1 px-3">
          {navs.map((n) => {
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

          {/* Verifikasi QR Publik */}
          <Link
            to="/verify/scan"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
              pathname.startsWith("/verify/scan")
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <ScanLine className="size-4" />
            Verifikasi QR
          </Link>
        </nav>

        {/* Profil Pengguna */}
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

      {/* Konten Utama */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Header Halaman */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-card/60 px-6 py-5 backdrop-blur">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </div>
        </header>

        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
