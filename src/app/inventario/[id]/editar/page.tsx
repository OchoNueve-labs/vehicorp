"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCLP } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { Vehiculo } from "@/lib/types";

export default function EditarVehiculoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    marca: "",
    modelo: "",
    ano: 2026,
    patente: "",
    kilometros: 0,
    color: "",
    chassis: "",
    motor: "",
    tipo: "Propio",
    ubicacion: "",
    precio_compra: 0,
    gastos: 0,
    precio_venta: 0,
    notas: "",
  });

  useEffect(() => {
    apiPost<{ success: boolean; data: Vehiculo }>("inventario-get", { id })
      .then((res) => {
        const v = res.data;
        setForm({
          id: v.id,
          marca: v.marca || "",
          modelo: v.modelo,
          ano: v.ano,
          patente: v.patente,
          kilometros: v.kilometros,
          color: v.color || "",
          chassis: v.chassis || "",
          motor: v.motor || "",
          tipo: v.tipo,
          ubicacion: v.ubicacion || "",
          precio_compra: v.precio_compra,
          gastos: v.gastos,
          precio_venta: v.precio_venta,
          notas: v.notas || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost("inventario-update", {
        ...form,
        ano: Number(form.ano),
        kilometros: Number(form.kilometros),
        precio_compra: Number(form.precio_compra),
        gastos: Number(form.gastos),
        precio_venta: Number(form.precio_venta),
      });
      router.push(`/inventario/${id}`);
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
      <Button variant="ghost" size="sm" onClick={() => router.push(`/inventario/${id}`)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </Button>
      <h1 className="text-2xl font-bold">Editar Vehículo</h1>

      <EmptyState loading={loading} error={error}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Datos del Vehículo</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Field label="Marca" value={form.marca} onChange={(v) => update("marca", v)} />
              <Field label="Modelo" value={form.modelo} onChange={(v) => update("modelo", v)} />
              <Field label="Año" value={String(form.ano)} onChange={(v) => update("ano", v)} type="number" />
              <Field label="Patente" value={form.patente} onChange={(v) => update("patente", v)} />
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
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </EmptyState>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
