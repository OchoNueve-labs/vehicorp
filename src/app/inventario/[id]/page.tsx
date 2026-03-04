"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useApi } from "@/lib/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCLP, formatDate } from "@/lib/utils";
import { ArrowLeft, Trash2, Edit, Bookmark, ShoppingCart } from "lucide-react";
import type { Vehiculo } from "@/lib/types";

export default function VehiculoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id === "nuevo") return;
    setLoading(true);
    apiPost<{ success: boolean; data: Vehiculo }>("inventario-get", { id })
      .then((res) => setVehiculo(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (id === "nuevo") {
    return <VehiculoForm />;
  }

  async function changeEstado(estado: string) {
    if (!vehiculo) return;
    setActionLoading(true);
    try {
      await apiPost("inventario-estado", { id: vehiculo.id, estado });
      setVehiculo({ ...vehiculo, estado });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!vehiculo || !confirm("¿Eliminar este vehículo?")) return;
    setActionLoading(true);
    try {
      await apiPost("inventario-delete", { id: vehiculo.id });
      router.push("/inventario");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
      setActionLoading(false);
    }
  }

  const v = vehiculo;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/inventario")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>

      <EmptyState loading={loading} error={error} empty={!v} emptyMessage="Vehículo no encontrado">
        {v && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{v.marca ? `${v.marca} ` : ""}{v.modelo}</h1>
                <p className="text-sm text-muted-foreground">{v.id} · {v.patente}</p>
              </div>
              <StatusBadge status={v.estado} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Info del Vehículo */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Información del Vehículo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="Marca" value={v.marca} />
                  <Row label="Modelo" value={v.modelo} />
                  <Row label="Año" value={String(v.ano)} />
                  <Row label="Patente" value={v.patente} />
                  <Row label="Color" value={v.color} />
                  <Row label="Kilómetros" value={v.kilometros?.toLocaleString("es-CL")} />
                  <Row label="Ubicación" value={v.ubicacion} />
                  <Row label="Tipo" value={v.tipo} />
                  <Row label="Chassis" value={v.chassis} />
                  <Row label="Motor" value={v.motor} />
                </CardContent>
              </Card>

              {/* Info Financiera */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Información Financiera</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="Precio Compra" value={formatCLP(v.precio_compra)} />
                  <Row label="Gastos" value={formatCLP(v.gastos)} />
                  <Row label="Costo Total" value={formatCLP(v.costo_total)} bold />
                  <Row label="Precio Venta" value={formatCLP(v.precio_venta)} />
                  <Row label="Margen" value={formatCLP(v.margen)} valueColor={(v.margen || 0) >= 0 ? "text-emerald-400" : "text-red-400"} />
                  <Row label="Margen %" value={v.margen_porcentaje != null ? `${v.margen_porcentaje}%` : "-"} valueColor={Number(v.margen_porcentaje) >= 0 ? "text-emerald-400" : "text-red-400"} />
                  <div className="border-t pt-2 mt-2">
                    <Row label="Fecha Ingreso" value={formatDate(v.fecha_ingreso)} />
                    <Row label="Días en Stock" value={v.dias_stock != null ? `${v.dias_stock} días` : "-"} valueColor={v.alerta_estancado ? "text-red-400" : ""} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acciones */}
            <Card>
              <CardContent className="p-4 flex flex-wrap gap-2">
                {v.estado === "Disponible" && (
                  <>
                    <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => changeEstado("Reservado")}>
                      <Bookmark className="h-4 w-4 mr-1" /> Reservar
                    </Button>
                    <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => changeEstado("Vendido")}>
                      <ShoppingCart className="h-4 w-4 mr-1" /> Marcar Vendido
                    </Button>
                  </>
                )}
                {v.estado === "Reservado" && (
                  <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => changeEstado("Disponible")}>
                    Liberar Reserva
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => router.push(`/inventario/${v.id}/editar`)}>
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="destructive" disabled={actionLoading} onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </EmptyState>
    </div>
  );
}

function Row({ label, value, bold, valueColor }: { label: string; value?: string | null; bold?: boolean; valueColor?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-semibold" : ""} ${valueColor || ""}`}>{value || "-"}</span>
    </div>
  );
}

// === Formulario Crear/Editar Vehículo ===

function VehiculoForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    ano: new Date().getFullYear(),
    patente: "",
    kilometros: 0,
    color: "",
    chassis: "",
    motor: "",
    tipo: "Propio",
    ubicacion: "Patio principal",
    precio_compra: 0,
    gastos: 0,
    precio_venta: 0,
    notas: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
  });

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.modelo || !form.patente) {
      alert("Modelo y patente son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await apiPost("inventario", {
        ...form,
        ano: Number(form.ano),
        kilometros: Number(form.kilometros),
        precio_compra: Number(form.precio_compra),
        gastos: Number(form.gastos),
        precio_venta: Number(form.precio_venta),
      });
      router.push("/inventario");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const costoTotal = Number(form.precio_compra) + Number(form.gastos);
  const margen = Number(form.precio_venta) - costoTotal;
  const margenPct = costoTotal > 0 ? ((margen / costoTotal) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/inventario")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>
      <h1 className="text-2xl font-bold">Agregar Vehículo</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Datos del Vehículo</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Field label="Marca" value={form.marca} onChange={(v) => update("marca", v)} />
            <Field label="Modelo *" value={form.modelo} onChange={(v) => update("modelo", v)} required />
            <Field label="Año" value={String(form.ano)} onChange={(v) => update("ano", v)} type="number" />
            <Field label="Patente *" value={form.patente} onChange={(v) => update("patente", v)} required />
            <Field label="Kilómetros" value={String(form.kilometros)} onChange={(v) => update("kilometros", v)} type="number" />
            <Field label="Color" value={form.color} onChange={(v) => update("color", v)} />
            <Field label="Chassis" value={form.chassis} onChange={(v) => update("chassis", v)} />
            <Field label="Motor" value={form.motor} onChange={(v) => update("motor", v)} />
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.tipo} onChange={(e) => update("tipo", e.target.value)}>
                <option>Propio</option>
                <option>Consignación</option>
              </select>
            </div>
            <Field label="Ubicación" value={form.ubicacion} onChange={(v) => update("ubicacion", v)} />
            <div>
              <label className="text-xs text-muted-foreground">Fecha Ingreso</label>
              <input
                type="date"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.fecha_ingreso}
                onChange={(e) => update("fecha_ingreso", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Notas</label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={form.notas} onChange={(e) => update("notas", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Información Financiera</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Field label="Precio Compra" value={String(form.precio_compra)} onChange={(v) => update("precio_compra", v)} type="number" />
              <Field label="Gastos" value={String(form.gastos)} onChange={(v) => update("gastos", v)} type="number" />
              <Field label="Precio Venta" value={String(form.precio_venta)} onChange={(v) => update("precio_venta", v)} type="number" />
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Costo Total</span>
                  <span className="font-semibold">{formatCLP(costoTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margen</span>
                  <span className={`font-semibold ${margen >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCLP(margen)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margen %</span>
                  <span className={`font-semibold ${margen >= 0 ? "text-emerald-400" : "text-red-400"}`}>{margenPct}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Vehículo"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
