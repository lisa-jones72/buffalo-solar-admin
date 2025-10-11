import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "online" | "offline" | "maintenance"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    online: "bg-success/10 text-success border-success/20",
    offline: "bg-destructive/10 text-destructive border-destructive/20",
    maintenance: "bg-warning/10 text-warning border-warning/20",
  }

  const labels = {
    online: "Online",
    offline: "Offline",
    maintenance: "Maintenance",
  }

  return (
    <Badge variant="outline" className={cn("font-medium", variants[status], className)}>
      <span
        className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
          "bg-success": status === "online",
          "bg-destructive": status === "offline",
          "bg-warning": status === "maintenance",
        })}
      />
      {labels[status]}
    </Badge>
  )
}
