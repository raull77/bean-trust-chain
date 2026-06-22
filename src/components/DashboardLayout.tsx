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
} from "lucide-react";
import { useStore, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navsByRole: Record<Role, Array<{ to: string; label: string; icon: any; exact?: boolean }>> = {
  farmer: [
    { to: "/farmer", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/farmer/add", label: "Add Coffee Batch", icon: PlusCircle },
    { to: "/farmer/batches", label: "My Batches", icon: ListChecks },
  ],
  verifier: [
    { to: "/verifier", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/verifier/queue", label: "Verification Queue", icon: Inbox },
  ],
  shop: [
    { to: "/shop", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/shop/catalog", label: "Coffee Catalog", icon: BookOpen },
  ],
};

const roleMeta: Record<Role, { title: string; subtitle: string; icon: any }> = {
  farmer: { title: "Farmer Portal", subtitle: "Petani", icon: Coffee },
  verifier: { title: "Government Verifier", subtitle: "Pemerintah", icon: ShieldCheck },
  shop: { title: "Coffee Shop", subtitle: "Kios Kopi", icon: Store },
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

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Coffee className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">CoffeeTrace</p>
            <p className="text-[11px] text-sidebar-foreground/60">Blockchain Traceability</p>
          </div>
        </div>

        <div className="mx-3 mb-4 rounded-xl bg-sidebar-accent/60 p-3">
          <div className="flex items-center gap-2">
            <RoleIcon className="size-4 text-sidebar-primary" />
            <p className="text-xs font-medium uppercase tracking-wide text-sidebar-foreground/70">
              {meta.subtitle}
            </p>
          </div>
          <p className="mt-1 text-sm font-semibold">{meta.title}</p>
        </div>

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
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
          <Link
            to="/verify/$id"
            params={{ id: "BATCH-DEMO" }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ScanLine className="size-4" />
            Public QR Demo
          </Link>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="grid size-9 place-items-center rounded-full bg-sidebar-accent text-sm font-semibold">
              {user?.name.slice(0, 1) ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user?.organization}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-card/60 px-6 py-5 backdrop-blur">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex items-center gap-3">{actions}</div>
        </header>

        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
