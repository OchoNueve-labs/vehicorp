"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { apiPost } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCLP, formatDate } from "@/lib/utils";
import { ArrowLeftRight, Bookmark } from "lucide-react";
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
  const [retomaMarca, setRetomaMarca] = useState("");
  const [retomaModelo, setRetomaModelo] = useState("");
  const [retomaPatente, setRetomaPatente] = useState("");
  const [retomaAno, setRetomaAno] = useState<number>(0);
  const [retomaKms, setRetomaKms] = useState<number>(0);
  const [retomaValor, setRetomaValor] = useState<number>(0);
  const [esReserva, setEsReserva] = useState(false);
  const [montoReserva, setMontoReserva] = useState(0);
  const [reservaFechaVencimiento, setReservaFechaVencimiento] = useState("");
  const [reservaNotas, setReservaNotas] = useState("");

  const veh = vehiculos.find((v) => v.id === vehiculoId);
  const cli = clientes.find((c) => c.id === clienteId);
  const vend = vendedores.find((v) => v.id === vendedorId);

  const valorVehiculo = veh?.precio_venta || 0;
  const valorFinal = valorVehiculo - descuento;
  const totalCliente = valorFinal + costoTransferencia - (tieneRetoma ? retomaValor : 0);
  const comisionPorcentaje = vend?.tipo_comision === "porcentaje" ? vend.comision_valor : 0;
  const comisionMonto = vend?.tipo_comision === "monto_fijo" ? vend.comision_valor : valorFinal * (comisionPorcentaje / 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehiculoId || !clienteId || !vendedorId) {
      toast.error("Selecciona vehículo, cliente y vendedor");
      return;
    }
    if (tieneRetoma && (!retomaMarca || !retomaModelo || !retomaPatente || !retomaAno || !retomaKms)) {
      toast.error("Completa todos los campos de retoma");
      return;
    }
    if (esReserva && !montoReserva) {
      toast.error("Ingresa el monto de reserva");
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
          tiene: tieneRetoma,
          ...(tieneRetoma ? {
            marca: retomaMarca,
            modelo: retomaModelo,
            patente: retomaPatente,
            año: retomaAno,
            kms: retomaKms,
            valor: retomaValor,
          } : {}),
        },
        reserva: {
          monto: esReserva ? montoReserva : 0,
          ...(esReserva ? {
            fecha_vencimiento: reservaFechaVencimiento || null,
            notas: reservaNotas || null,
          } : {}),
        },
      });
      toast.success("Nota de venta creada exitosamente");
      setVehiculoId("");
      setClienteId("");
      setVendedorId("");
      setDescuento(0);
      setCostoTransferencia(400000);
      setFormaPago("Contado");
      setMontoFinanciado(0);
      setMargenFinanciamiento(0);
      setTieneRetoma(false);
      setRetomaMarca("");
      setRetomaModelo("");
      setRetomaPatente("");
      setRetomaAno(0);
      setRetomaKms(0);
      setRetomaValor(0);
      setEsReserva(false);
      setMontoReserva(0);
      setReservaFechaVencimiento("");
      setReservaNotas("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear nota");
    } finally {
      setSaving(false);
    }
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
            <Input type="number" value={descuento} onChange={(e) => setDescuento(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Valor Final</Label>
            <p className="text-sm font-bold mt-1 text-emerald-400">{formatCLP(valorFinal)}</p>
          </div>
          <div>
            <Label className="text-xs">Costo Transferencia</Label>
            <Input type="number" value={costoTransferencia} onChange={(e) => setCostoTransferencia(Number(e.target.value))} />
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
                <Input type="number" value={montoFinanciado} onChange={(e) => setMontoFinanciado(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Margen Financiamiento ($)</Label>
                <Input type="number" value={margenFinanciamiento} onChange={(e) => setMargenFinanciamiento(Number(e.target.value))} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retoma */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            Retoma
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch checked={tieneRetoma} onCheckedChange={setTieneRetoma} />
            <Label className="text-sm">¿Incluye retoma?</Label>
          </div>
          {tieneRetoma && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Marca *</Label>
                <Input placeholder="Ej: Toyota" value={retomaMarca} onChange={(e) => setRetomaMarca(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Modelo *</Label>
                <Input placeholder="Ej: Hilux" value={retomaModelo} onChange={(e) => setRetomaModelo(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Patente *</Label>
                <Input placeholder="Ej: ABCD-12" value={retomaPatente} onChange={(e) => setRetomaPatente(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Año *</Label>
                <Input type="number" placeholder="2020" value={retomaAno || ""} onChange={(e) => setRetomaAno(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Kilómetros *</Label>
                <Input type="number" placeholder="50000" value={retomaKms || ""} onChange={(e) => setRetomaKms(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Valor Retoma *</Label>
                <Input type="number" placeholder="0" value={retomaValor || ""} onChange={(e) => setRetomaValor(Number(e.target.value))} />
              </div>
            </div>
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

      {/* Reserva (Seña) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            Reserva (Seña)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch checked={esReserva} onCheckedChange={setEsReserva} />
            <Label className="text-sm">¿Es una reserva?</Label>
          </div>
          {esReserva && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Monto de Reserva *</Label>
                  <Input type="number" value={montoReserva || ""} onChange={(e) => setMontoReserva(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <span>Fecha de Vencimiento</span>
                  </Label>
                  <Input type="date" value={reservaFechaVencimiento} onChange={(e) => setReservaFechaVencimiento(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Notas de Reserva</Label>
                <Textarea placeholder="Ej: Cliente paga saldo en 7 días" value={reservaNotas} onChange={(e) => setReservaNotas(e.target.value)} />
              </div>
              {montoReserva > 0 && montoReserva >= totalCliente && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
                  El monto ingresado cubre el valor total del vehículo. Al continuar, se le preguntará si desea procesar como venta completa.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          {esReserva && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              RESERVA
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {esReserva && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEsReserva(false);
                setMontoReserva(0);
                setReservaFechaVencimiento("");
                setReservaNotas("");
              }}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            className={esReserva ? "bg-purple-600 hover:bg-purple-700" : ""}
            disabled={saving}
          >
            {saving
              ? (esReserva ? "Generando reserva..." : "Creando nota...")
              : (esReserva ? "Generar Reserva" : "Crear Nota de Venta")
            }
          </Button>
        </div>
      </div>
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
