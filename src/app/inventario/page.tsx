"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/hooks/use-api";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCLP } from "@/lib/utils";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import type { Vehiculo, StandardResponse } from "@/lib/types";

const TABS = ["Todos", "Disponible", "Reservado", "Vendido"];

export default function InventarioPage() {
  const { data, loading, error } = useApi<StandardResponse<Vehiculo[]>>("inventario");
  const [tab, setTab] = useState("Todos");
  const [search, setSearch] = useState("");
  const [vista, setVista] = useState<"cards" | "tabla">("cards");

  const vehiculos = data?.data || [];

  const filtered = vehiculos.filter((v) => {
    if (tab !== "Todos" && v.estado !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.patente?.toLowerCase().includes(q) ||
        v.modelo?.toLowerCase().includes(q) ||
        v.marca?.toLowerCase().includes(q) ||
        v.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Link href="/inventario/nuevo">
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Agregar Vehículo</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={tab} onValueChange={setTab} className="w-full sm:w-auto">
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar patente o modelo..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant={vista === "cards" ? "default" : "outline"} onClick={() => setVista("cards")} className="px-2">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button size="sm" variant={vista === "tabla" ? "default" : "outline"} onClick={() => setVista("tabla")} className="px-2">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EmptyState loading={loading} error={error} empty={filtered.length === 0} emptyMessage="Sin vehículos">
        {vista === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((v) => (
              <Link key={v.id} href={`/inventario/${v.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm font-bold tracking-wide text-primary">{v.patente}</p>
                        <p className="font-semibold">{v.marca ? `${v.marca} ` : ""}{v.modelo}</p>
                      </div>
                      <StatusBadge status={v.estado} />
                    </div>
                    <p className="text-lg font-bold">{formatCLP(v.precio_venta)}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{v.ano}</span>
                      {v.color && <span>{v.color}</span>}
                      <span>{v.kilometros?.toLocaleString("es-CL")} km</span>
                    </div>
                    {v.margen_porcentaje != null && (
                      <p className={`text-xs font-medium ${Number(v.margen_porcentaje) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        Margen: {v.margen_porcentaje}%
                      </p>
                    )}
                    {v.dias_stock != null && (
                      <p className={`text-xs ${v.alerta_estancado ? "text-red-400" : "text-muted-foreground"}`}>
                        {v.dias_stock} días en stock
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-3">Patente</th>
                  <th className="py-2 pr-3">Vehículo</th>
                  <th className="py-2 pr-3">Año</th>
                  <th className="py-2 pr-3">Km</th>
                  <th className="py-2 pr-3">Color</th>
                  <th className="py-2 pr-3 text-right">Precio Venta</th>
                  <th className="py-2 pr-3 text-right">Margen</th>
                  <th className="py-2 pr-3 text-right">Días Stock</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-2 pr-3">
                      <Link href={`/inventario/${v.id}`} className="font-mono font-bold text-primary hover:underline">
                        {v.patente}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 font-medium">{v.marca ? `${v.marca} ` : ""}{v.modelo}</td>
                    <td className="py-2 pr-3">{v.ano}</td>
                    <td className="py-2 pr-3">{v.kilometros?.toLocaleString("es-CL")}</td>
                    <td className="py-2 pr-3">{v.color || "-"}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{formatCLP(v.precio_venta)}</td>
                    <td className={`py-2 pr-3 text-right font-medium ${v.margen_porcentaje != null ? (Number(v.margen_porcentaje) >= 0 ? "text-emerald-400" : "text-red-400") : ""}`}>
                      {v.margen_porcentaje != null ? `${v.margen_porcentaje}%` : "-"}
                    </td>
                    <td className={`py-2 pr-3 text-right ${v.alerta_estancado ? "text-red-400 font-medium" : ""}`}>
                      {v.dias_stock ?? "-"}
                    </td>
                    <td className="py-2"><StatusBadge status={v.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </EmptyState>
    </div>
  );
}
