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
import { Switch } from "@/components/ui/switch";
import { formatCLP, formatDate } from "@/lib/utils";
import type { Vehiculo, Cliente, Vendedor, NotaVenta, StandardResponse } from "@/lib/types";

export default function NotaVentaPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nota de Venta</h1>
      <Tabs defaultValue="nueva">
        <TabsList>
          <TabsTrigger value="nueva">Nueva Nota</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="nueva"><NuevaNotaForm /></TabsContent>
        <TabsContent value="historial"><HistorialNotas /></TabsContent>
      </Tabs>
    </div>
  );
}

function NuevaNotaForm() {
  const { data: vehData } = useApi<{ vehiculos: Vehiculo[]; cantidad: number }>("inventario-disponible");
  const { data: cliData } = useApi<{ clientes: Cliente[]; cantidad: number }>("clientes");
  const { data: venData } = useApi<{ vendedores: Vendedor[]; cantidad: number }>("vendedores");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const vehiculos = vehData?.vehiculos || [];
  const clientes = cliData?.clientes || [];
  const vendedores = venData?.vendedores || [];

  const [vehiculoId, setVehiculoId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [costoTransferencia, setCostoTransferencia] = useState(400000);
  const [formaPago, setFormaPago] = useState("Contado");
  const [montoFinanciado, setMontoFinanciado] = useState(0);
  const [margenFinanciamiento, setMargenFinanciamiento] = useState(0);
  const [tieneRetoma, setTieneRetoma] = useState(false);
  const [retomaDetalle, setRetomaDetalle] = useState("");
  const [esReserva, setEsReserva] = useState(false);
  const [montoReserva, setMontoReserva] = useState(0);

  const veh = vehiculos.find((v) => v.id === vehiculoId);
  const cli = clientes.find((c) => c.id === clienteId);
  const vend = vendedores.find((v) => v.id === vendedorId);

  const valorVehiculo = veh?.precio_venta || 0;
  const valorFinal = valorVehiculo - descuento;
  const totalCliente = valorFinal + costoTransferencia;
  const comisionPorcentaje = vend?.tipo_comision === "porcentaje" ? vend.comision_valor : 0;
  const comisionMonto = vend?.tipo_comision === "monto_fijo" ? vend.comision_valor : valorFinal * (comisionPorcentaje / 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehiculoId || !clienteId || !vendedorId) {
      alert("Selecciona vehículo, cliente y vendedor");
      return;
    }
    setSaving(true);
    try {
      await apiPost("notas-venta", {
        id_vehiculo: vehiculoId,
        id_cliente: clienteId,
        transaccion: {
          valor_vehiculo: valorVehiculo,
          descuento,
          costo_transferencia: costoTransferencia,
          forma_pago_tipo: formaPago,
          ...(formaPago === "Financiamiento" ? { monto_financiado: montoFinanciado, margen_financiamiento: margenFinanciamiento } : {}),
        },
        cliente: {
          nombre: cli?.nombre || "",
          rut: cli?.rut || "",
          email: cli?.correo || "",
          telefono: cli?.telefono || "",
        },
        vendedor: {
          id: vendedorId,
          nombre: vend?.nombre || "",
          comision_porcentaje: comisionPorcentaje,
        },
        retoma: {
          tiene_retoma: tieneRetoma,
          ...(tieneRetoma ? { detalle: retomaDetalle } : {}),
        },
        reserva: {
          es_reserva: esReserva,
          ...(esReserva ? { monto_reserva: montoReserva } : {}),
        },
      });
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al crear nota");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <Card className="mt-4">
        <CardContent className="p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-emerald-400">Nota de venta creada exitosamente</p>
          <Button onClick={() => setSuccess(false)}>Crear otra nota</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* Vehículo */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Vehículo</CardTitle></CardHeader>
        <CardContent>
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)}>
            <option value="">Seleccionar vehículo...</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>{v.id} — {v.marca ? `${v.marca} ` : ""}{v.modelo} ({v.patente}) — {formatCLP(v.precio_venta)}</option>
            ))}
          </select>
          {veh && (
            <div className="mt-2 text-xs text-muted-foreground">
              {veh.ano} · {veh.color} · {veh.kilometros?.toLocaleString("es-CL")} km · Precio: {formatCLP(veh.precio_venta)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cliente */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Cliente</CardTitle></CardHeader>
        <CardContent>
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} — {c.rut || "Sin RUT"}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Detalle de Transacción */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Detalle de Transacción</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">Valor Vehículo</Label>
            <p className="text-sm font-semibold mt-1">{formatCLP(valorVehiculo)}</p>
          </div>
          <div>
            <Label className="text-xs">Descuento</Label>
            <input type="number" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={descuento} onChange={(e) => setDescuento(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Valor Final</Label>
            <p className="text-sm font-bold mt-1 text-emerald-400">{formatCLP(valorFinal)}</p>
          </div>
          <div>
            <Label className="text-xs">Costo Transferencia</Label>
            <input type="number" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={costoTransferencia} onChange={(e) => setCostoTransferencia(Number(e.target.value))} />
          </div>
          <div className="col-span-2 md:col-span-4">
            <p className="text-sm font-bold">Total Cliente: {formatCLP(totalCliente)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Forma de Pago */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Forma de Pago</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="formaPago" value="Contado" checked={formaPago === "Contado"} onChange={() => setFormaPago("Contado")} /> Contado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="formaPago" value="Financiamiento" checked={formaPago === "Financiamiento"} onChange={() => setFormaPago("Financiamiento")} /> Financiamiento
            </label>
          </div>
          {formaPago === "Financiamiento" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Monto Financiado</Label>
                <input type="number" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={montoFinanciado} onChange={(e) => setMontoFinanciado(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Margen Financiamiento ($)</Label>
                <input type="number" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={margenFinanciamiento} onChange={(e) => setMargenFinanciamiento(Number(e.target.value))} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retoma */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Retoma</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch checked={tieneRetoma} onCheckedChange={setTieneRetoma} />
            <Label className="text-sm">Tiene retoma</Label>
          </div>
          {tieneRetoma && (
            <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" placeholder="Detalle de la retoma..." value={retomaDetalle} onChange={(e) => setRetomaDetalle(e.target.value)} />
          )}
        </CardContent>
      </Card>

      {/* Vendedor */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Vendedor y Comisión</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={vendedorId} onChange={(e) => setVendedorId(e.target.value)}>
            <option value="">Seleccionar vendedor...</option>
            {vendedores.filter((v) => v.activo).map((v) => (
              <option key={v.id} value={v.id}>{v.nombre} — {v.tipo_comision === "porcentaje" ? `${v.comision_valor}%` : formatCLP(v.comision_valor)}</option>
            ))}
          </select>
          {vend && (
            <p className="text-sm text-muted-foreground">
              Comisión estimada: <span className="font-semibold text-foreground">{formatCLP(comisionMonto)}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reserva */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Reserva</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch checked={esReserva} onCheckedChange={setEsReserva} />
            <Label className="text-sm">Es reserva</Label>
          </div>
          {esReserva && (
            <div>
              <Label className="text-xs">Monto Reserva</Label>
              <input type="number" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={montoReserva} onChange={(e) => setMontoReserva(Number(e.target.value))} />
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Creando nota..." : "Crear Nota de Venta"}
      </Button>
    </form>
  );
}

function HistorialNotas() {
  const { data, loading, error } = useApi<StandardResponse<NotaVenta[]>>("notas-venta");
  const notas = data?.data || [];

  return (
    <div className="mt-4">
      <EmptyState loading={loading} error={error} empty={notas.length === 0} emptyMessage="Sin notas de venta">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Vehículo</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Valor Final</th>
                <th className="py-2 pr-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((n) => (
                <tr key={n.id} className="border-b border-border">
                  <td className="py-2 pr-3 font-mono text-xs">{n.id}</td>
                  <td className="py-2 pr-3">{formatDate(n.fecha)}</td>
                  <td className="py-2 pr-3">{n.vehiculo_detalle || n.vehiculo_id}</td>
                  <td className="py-2 pr-3">{n.cliente_nombre}</td>
                  <td className="py-2 pr-3 font-semibold">{formatCLP(n.valor_final)}</td>
                  <td className="py-2"><StatusBadge status={n.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EmptyState>
    </div>
  );
}
