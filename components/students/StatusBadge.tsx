import { Badge } from "@/components/ui/badge";
import { Status } from "@prisma/client";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; emoji: string }
> = {
  ACTIVE:      { label: "Active",      variant: "default",     emoji: "🟢" },
  IN_PROGRESS: { label: "In Progress", variant: "secondary",   emoji: "🟡" },
  COMPLETED:   { label: "Completed",   variant: "outline",     emoji: "✅" },
  DROPPED:     { label: "Dropped",     variant: "destructive", emoji: "🔴" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant}>
      {config.emoji} {config.label}
    </Badge>
  );
}