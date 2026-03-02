"use client";

import { Badge } from "@/components/ui/badge";
import { ESTADO_COLORS } from "@/lib/constants";

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-muted-foreground">-</span>;
  const colors = ESTADO_COLORS[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return (
    <Badge variant="outline" className={colors}>
      {status}
    </Badge>
  );
}
