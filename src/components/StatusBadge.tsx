import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  pending: "bg-warning/15 text-warning-foreground border border-warning/40",
  verified: "bg-success/15 text-success border border-success/30",
  rejected: "bg-destructive/10 text-destructive border border-destructive/30",
  distributed: "bg-info/15 text-info border border-info/30",
  received: "bg-coffee/15 text-coffee border border-coffee/30",
  none: "bg-muted text-muted-foreground border border-border",
};

const labels: Record<string, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
  distributed: "Distributed",
  received: "Received",
  none: "—",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[status] ?? variants.none,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {labels[status] ?? status}
    </span>
  );
}
