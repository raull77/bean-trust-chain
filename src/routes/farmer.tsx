import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/farmer")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const user = useStore.getState().currentUser;
    if (!user || user.role !== "farmer") throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
