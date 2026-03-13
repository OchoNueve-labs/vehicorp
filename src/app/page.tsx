"use client";

import { useState, useCallback, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import { KpiCard } from "@/components/shared/KpiCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChartTooltip } from "@/components/shared/ChartTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCLP, formatNumber } from "@/lib/utils";
import { ESTADO_HEX_COLORS } from "@/lib/constants";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Percent,
  Wallet,
  Car,
  CheckCircle,
  Bookmark,
  ShoppingCart,
  BarChart3,
  Clock,
  AlertTriangle,
  CalendarDays,
  Home,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  DashboardData,
  DashboardFinanciero,
  Vehiculo,
  StandardResponse,
} from "@/lib/types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function getMonthRange() {
  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  return { desde, hasta };
}

export default function DashboardPage() {
  const defaultRange = getMonthRange();
  const [fechaDesde, setFechaDesde] = useState(defaultRange.desde);
  const [fechaHasta, setFechaHasta] = useState(defaultRange.hasta);

  const { data: dashData, loading: l1, error: e1 } = useApi<DashboardData>("dashboard");
  const { data: invData, loading: l3, error: e3 } = useApi<StandardResponse<Vehiculo[]>>("inventario");

  // Financial data with date filter
  const [finData, setFinData] = useState<DashboardFinanciero | null>(null);
  const [l2, setL2] = useState(true);
  const [e2, setE2] = useState<string | null>(null);

  const fetchFinanciero = useCallback(async () => {
    setL2(true);
    setE2(null);
    try {
      const params = `?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;
      const result = await apiGet<DashboardFinanciero>(`dashboard-financiero${params}`);
      setFinData(result);
    } catch (err) {
      setE2(err instanceof Error ? err.message : "Error");
    } finally {
      setL2(false);
    }
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    fetchFinanciero();
  }, [fetchFinanciero]);

  const loading = l1 || l2 || l3;
  const error = e1 || e2 || e3;

  const resumen = dashData?.data?.resumen;
  const financiero = dashData?.data?.financiero;
  const tiempos = dashData?.data?.tiempos;
  const fin = finData?.resumen;
  const vehiculos = invData?.data || [];

  // Distribución por estado
  const estadoCounts: Record<string, number> = {};
  vehiculos.forEach((v) => {
    estadoCounts[v.estado] = (estadoCounts[v.estado] || 0) + 1;
  });
  const pieData = Object.entries(estadoCounts).map(([name, value]) => ({ name, value }));

  // Distribución por tipo (Propio vs Consignación)
  const tipoCounts: Record<string, number> = {};
  vehiculos.forEach((v) => {
    tipoCounts[v.tipo] = (tipoCounts[v.tipo] || 0) + 1;
  });
  const tipoData = Object.entries(tipoCounts).map(([name, value]) => ({ name, value }));

  // Top 5 por margen
  const top5 = [...vehiculos]
    .filter((v) => v.margen != null)
    .sort((a, b) => (b.margen || 0) - (a.margen || 0))
    .slice(0, 5)
    .map((v) => ({
      name: `${v.modelo} (${v.patente})`,
      margen: v.margen || 0,
    }));

  // Comisiones por vendedor
  const comisionesData = finData?.comisiones_por_vendedor
    ? Object.entries(finData.comisiones_por_vendedor).map(([name, data]) => ({
        name,
        comision: data.comision,
        ventas: data.ventas,
      }))
    : [];

  // Costos por categoría
  const costosData = finData?.costos_por_categoria
    ? Object.entries(finData.costos_por_categoria).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  // Vehículos estancados (>30 días)
  const estancados = vehiculos
    .filter((v) => v.alerta_estancado && v.estado === "Disponible")
    .sort((a, b) => (b.dias_stock || 0) - (a.dias_stock || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            className="w-auto h-8 text-xs"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="date"
            className="w-auto h-8 text-xs"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => {
              const r = getMonthRange();
              setFechaDesde(r.desde);
              setFechaHasta(r.hasta);
            }}
          >
            Este mes
          </Button>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Resumen Financiero {finData?.periodo ? `(${finData.periodo.desde} — ${finData.periodo.hasta})` : ""}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KpiCard title="Total Ventas" value={formatCLP(fin?.total_ventas)} icon={DollarSign} loading={loading} />
          <KpiCard title="Utilidad Bruta" value={formatCLP(fin?.utilidad_bruta)} icon={TrendingUp} loading={loading} valueColor={(fin?.utilidad_bruta ?? 0) < 0 ? "text-red-500" : "text-emerald-500"} />
          <KpiCard title="Financiamiento" value={formatCLP(fin?.margen_financiamiento)} icon={Percent} loading={loading} valueColor="text-blue-500" />
          <KpiCard title="Arriendos" value={formatCLP(fin?.ingresos_arriendo)} icon={Home} loading={loading} valueColor="text-cyan-500" />
          <KpiCard title="Costos Operativos" value={formatCLP(fin?.costos_fijos)} icon={Receipt} loading={loading} />
          <KpiCard title="Comisiones" value={formatCLP(fin?.comisiones)} icon={Percent} loading={loading} />
          <KpiCard title="Utilidad Neta" value={formatCLP(fin?.utilidad_neta)} icon={Wallet} loading={loading} valueColor={(fin?.utilidad_neta ?? 0) < 0 ? "text-red-500" : "text-emerald-500"} />
        </div>
      </div>

      {/* Valor del Inventario */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Valor del Inventario y Márgenes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <KpiCard title="Valor Total Inventario" value={formatCLP(financiero?.valor_inventario)} icon={BarChart3} loading={loading} />
          <KpiCard title="Margen Potencial" value={formatCLP(financiero?.margen_potencial)} icon={TrendingUp} loading={loading} valueColor="text-emerald-500" />
        </div>
      </div>

      {/* KPIs Inventario */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">KPIs Inventario</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard title="Total en Stock" value={formatNumber(resumen?.total_stock)} icon={Car} loading={loading} />
          <KpiCard title="Disponibles" value={formatNumber(resumen?.disponibles)} icon={CheckCircle} loading={loading} valueColor="text-emerald-500" />
          <KpiCard title="Reservados" value={formatNumber(resumen?.reservados)} icon={Bookmark} loading={loading} valueColor="text-purple-500" />
          <KpiCard title="Vendidos este Mes" value={formatNumber(resumen?.vendidos_mes)} icon={ShoppingCart} loading={loading} valueColor="text-blue-500" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Distribución de Estados */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribución de Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState loading={loading} error={error} empty={pieData.length === 0} emptyMessage="Sin vehículos">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" animationDuration={800}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={ESTADO_HEX_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" style={{ fill: "var(--foreground)", fontSize: "1.5rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {vehiculos.length}
                    </text>
                    <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" style={{ fill: "var(--muted-foreground)", fontSize: "0.7rem" }}>
                      vehículos
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </EmptyState>
          </CardContent>
        </Card>

        {/* Distribución por Tipo */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribución por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState loading={loading} error={error} empty={tipoData.length === 0} emptyMessage="Sin datos">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tipoData} layout="vertical">
                    <defs>
                      <linearGradient id="gradTipo" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                    <Bar dataKey="value" fill="url(#gradTipo)" radius={[0, 4, 4, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </EmptyState>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 + Comisiones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Vehículos por Margen */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Vehículos por Margen</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState loading={loading} error={error} empty={top5.length === 0} emptyMessage="Sin datos">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5} layout="vertical">
                    <defs>
                      <linearGradient id="gradTop5" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <XAxis type="number" tickFormatter={(v) => formatCLP(v)} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip formatter={(v) => formatCLP(v)} />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                    <Bar dataKey="margen" fill="url(#gradTop5)" radius={[0, 4, 4, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </EmptyState>
          </CardContent>
        </Card>

        {/* Comisiones por Vendedor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comisiones por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState loading={loading} error={error} empty={comisionesData.length === 0} emptyMessage="Sin comisiones">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comisionesData}>
                    <defs>
                      <linearGradient id="gradComisiones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => formatCLP(v)} width={100} tick={{ fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip formatter={(v) => formatCLP(v)} />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                    <Bar dataKey="comision" fill="url(#gradComisiones)" radius={[4, 4, 0, 0]} maxBarSize={60} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </EmptyState>
          </CardContent>
        </Card>
      </div>

      {/* Costos por Categoría */}
      {costosData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Costos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costosData}>
                  <defs>
                    <linearGradient id="gradCostos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatCLP(v)} width={100} tick={{ fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip formatter={(v) => formatCLP(v)} />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                  <Bar dataKey="value" fill="url(#gradCostos)" radius={[4, 4, 0, 0]} maxBarSize={60} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehículos Estancados + Tiempos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Vehículos Estancados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState loading={loading} error={error} empty={estancados.length === 0} emptyMessage="Sin vehículos estancados">
              <div className="space-y-2">
                {estancados.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{v.modelo} — {v.patente}</p>
                      <p className="text-xs text-muted-foreground">{v.id} · {formatCLP(v.precio_venta)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={v.estado} />
                      <span className="text-sm font-bold text-red-400 tabular-nums">{v.dias_stock}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </EmptyState>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <KpiCard title="Promedio Días en Stock" value={`${tiempos?.promedio_dias_stock ?? 0} días`} icon={Clock} loading={loading} />
          <KpiCard title="Máximo Días en Stock" value={`${tiempos?.max_dias_stock ?? 0} días`} icon={Clock} loading={loading} valueColor="text-amber-400" />
          <KpiCard title="Vehículos Estancados" value={formatNumber(tiempos?.vehiculos_estancados)} icon={AlertTriangle} loading={loading} valueColor="text-red-400" />
        </div>
      </div>
    </div>
  );
}
