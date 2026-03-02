"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface EmptyStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function EmptyState({ loading, error, empty, emptyMessage, emptyIcon, children }: EmptyStateProps) {
  if (loading) {
    return (
      <div className="space-y-3 py-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyIcon || <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">--</div>}
        <p className="text-sm text-muted-foreground">{emptyMessage || "Sin datos"}</p>
        <p className="text-xs text-muted-foreground mt-1">Agrega un nuevo registro para comenzar</p>
      </div>
    );
  }

  return <>{children}</>;
}
