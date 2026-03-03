"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  loading?: boolean;
  valueColor?: string;
  trend?: { value: number; label?: string };
}

export function KpiCard({ title, value, subtitle, icon: Icon, loading, valueColor, trend }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <p className={`text-2xl font-bold tracking-tight ${valueColor || ""}`}>{value}</p>
            )}
            {trend && !loading && (
              <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trend.value >= 0 ? "+" : ""}{trend.value}%</span>
                {trend.label && <span className="text-muted-foreground font-normal">{trend.label}</span>}
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="rounded-md bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
