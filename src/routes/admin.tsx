import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const user = useStore.getState().currentUser;
    if (!user || user.role !== "admin") throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
