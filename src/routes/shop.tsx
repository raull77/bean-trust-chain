import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/shop")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const user = useStore.getState().currentUser;
    if (!user || user.role !== "shop") throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
