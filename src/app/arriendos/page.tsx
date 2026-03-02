"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { apiPost } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatCLP, formatDate } from "@/lib/utils";
import type { Vehiculo, Cliente, Arriendo, StandardResponse } from "@/lib/types";

export default function ArriendosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Arriendos</h1>
      <Tabs defaultValue="nuevo">
        <TabsList>
          <TabsTrigger value="nuevo">Nuevo Arriendo</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="nuevo"><NuevoArriendoForm /></TabsContent>
        <TabsContent value="historial"><HistorialArriendos /></TabsContent>
      </Tabs>
    </div>
  );
}

function NuevoArriendoForm() {
  const { data: vehData } = useApi<{ vehiculos: Vehiculo[]; cantidad: number }>("inventario-disponible");
  const { data: cliData } = useApi<{ clientes: Cliente[]; cantidad: number }>("clientes");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const vehiculos = vehData?.vehiculos || [];
  const clientes = cliData?.clientes || [];

  const [vehiculoId, setVehiculoId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [montoMensual, setMontoMensual] = useState(0);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split("T")[0]);
  const [fechaFin, setFechaFin] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehiculoId || !clienteId || !montoMensual) {
      alert("Vehículo, cliente y monto son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await apiPost("arriendos", {
        vehiculo_id: vehiculoId,
        cliente_id: clienteId,
        monto_mensual: Number(montoMensual),
        fecha_inicio: fechaInicio,
        ...(fechaFin ? { fecha_fin: fechaFin } : {}),
      });
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <Card className="mt-4">
        <CardContent className="p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-emerald-400">Arriendo creado exitosamente</p>
          <Button onClick={() => setSuccess(false)}>Crear otro arriendo</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Datos del Arriendo</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Vehículo</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)}>
              <option value="">Seleccionar vehículo...</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.id} — {v.marca ? `${v.marca} ` : ""}{v.modelo} ({v.patente})</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Cliente</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.rut || "Sin RUT"}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Monto Mensual</Label>
              <input type="number" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={montoMensual} onChange={(e) => setMontoMensual(Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs">Fecha Inicio</Label>
              <input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Fecha Fin (opcional)</Label>
              <input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Creando arriendo..." : "Crear Arriendo"}
      </Button>
    </form>
  );
}

function HistorialArriendos() {
  const { data, loading, error } = useApi<StandardResponse<Arriendo[]>>("arriendos");
  const arriendos = data?.data || [];

  return (
    <div className="mt-4">
      <EmptyState loading={loading} error={error} empty={arriendos.length === 0} emptyMessage="Sin arriendos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Vehículo</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Monto Mensual</th>
                <th className="py-2 pr-3">Inicio</th>
                <th className="py-2 pr-3">Fin</th>
                <th className="py-2 pr-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {arriendos.map((a) => (
                <tr key={a.id} className="border-b border-border">
                  <td className="py-2 pr-3 font-mono text-xs">{a.id}</td>
                  <td className="py-2 pr-3">{a.vehiculo_id}</td>
                  <td className="py-2 pr-3">{a.cliente_id}</td>
                  <td className="py-2 pr-3 font-semibold">{formatCLP(a.monto_mensual)}</td>
                  <td className="py-2 pr-3">{formatDate(a.fecha_inicio)}</td>
                  <td className="py-2 pr-3">{a.fecha_fin ? formatDate(a.fecha_fin) : "-"}</td>
                  <td className="py-2"><StatusBadge status={a.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EmptyState>
    </div>
  );
}
