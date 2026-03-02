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
import { Plus, Search } from "lucide-react";
import type { Vehiculo, StandardResponse } from "@/lib/types";

const TABS = ["Todos", "Disponible", "Reservado", "Vendido"];

export default function InventarioPage() {
  const { data, loading, error } = useApi<StandardResponse<Vehiculo[]>>("inventario");
  const [tab, setTab] = useState("Todos");
  const [search, setSearch] = useState("");

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
      </div>

      <EmptyState loading={loading} error={error} empty={filtered.length === 0} emptyMessage="Sin vehículos">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((v) => (
            <Link key={v.id} href={`/inventario/${v.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{v.id}</p>
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
      </EmptyState>
    </div>
  );
}
