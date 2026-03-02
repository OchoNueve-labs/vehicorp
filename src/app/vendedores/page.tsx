"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { apiPost } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { KpiCard } from "@/components/shared/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCLP, formatNumber } from "@/lib/utils";
import { Plus, Edit, Trash2, Users, ShoppingCart, DollarSign, Percent } from "lucide-react";
import type { Vendedor, DashboardFinanciero } from "@/lib/types";

export default function VendedoresPage() {
  const { data, loading, error, refetch } = useApi<{ vendedores: Vendedor[]; cantidad: number }>("vendedores");
  const { data: finData, loading: finLoading } = useApi<DashboardFinanciero>("dashboard-financiero");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vendedor | null>(null);
  const [form, setForm] = useState({ nombre: "", tipo_comision: "porcentaje", comision_valor: 3 });
  const [saving, setSaving] = useState(false);

  const vendedores = data?.vendedores || [];
  const comisiones = finData?.comisiones_por_vendedor || {};
  const totalVentas = Object.values(comisiones).reduce((s, v) => s + v.ventas, 0);
  const totalVendido = Object.values(comisiones).reduce((s, v) => s + v.total_vendido, 0);
  const totalComisiones = Object.values(comisiones).reduce((s, v) => s + v.comision, 0);

  function openNew() {
    setEditing(null);
    setForm({ nombre: "", tipo_comision: "porcentaje", comision_valor: 3 });
    setOpen(true);
  }

  function openEdit(v: Vendedor) {
    setEditing(v);
    setForm({ nombre: v.nombre, tipo_comision: v.tipo_comision, comision_valor: v.comision_valor });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre) { alert("Nombre es obligatorio"); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiPost("vendedores-update", { id: editing.id, ...form, comision_valor: Number(form.comision_valor) });
      } else {
        await apiPost("vendedores", { ...form, comision_valor: Number(form.comision_valor) });
      }
      setOpen(false);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(v: Vendedor) {
    if (!confirm(`¿Eliminar a ${v.nombre}?`)) return;
    try {
      await apiPost("vendedores-delete", { id: v.id });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendedores</h1>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Agregar Vendedor</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard title="Total Vendedores" value={formatNumber(vendedores.length)} icon={Users} loading={loading} />
        <KpiCard title="Total Ventas" value={formatNumber(totalVentas)} icon={ShoppingCart} loading={finLoading} />
        <KpiCard title="Total Vendido" value={formatCLP(totalVendido)} icon={DollarSign} loading={finLoading} />
        <KpiCard title="Comisiones" value={formatCLP(totalComisiones)} icon={Percent} loading={finLoading} />
      </div>

      <EmptyState loading={loading} error={error} empty={vendedores.length === 0} emptyMessage="Sin vendedores">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vendedores.map((v) => {
            const com = comisiones[v.nombre];
            return (
              <Card key={v.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{v.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.tipo_comision === "porcentaje" ? `${v.comision_valor}%` : formatCLP(v.comision_valor)} · {v.activo ? "Activo" : "Inactivo"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(v)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(v)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {com && (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Ventas: {com.ventas} · Vendido: {formatCLP(com.total_vendido)}</p>
                      <p>Comisión: <span className="text-foreground font-medium">{formatCLP(com.comision)}</span></p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </EmptyState>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Vendedor" : "Agregar Vendedor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-xs">Nombre *</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">Tipo de Comisión</Label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="porcentaje" checked={form.tipo_comision === "porcentaje"} onChange={() => setForm({ ...form, tipo_comision: "porcentaje" })} /> Porcentaje
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" value="monto_fijo" checked={form.tipo_comision === "monto_fijo"} onChange={() => setForm({ ...form, tipo_comision: "monto_fijo" })} /> Monto Fijo
                </label>
              </div>
            </div>
            <div>
              <Label className="text-xs">{form.tipo_comision === "porcentaje" ? "Porcentaje (%)" : "Monto Fijo ($)"}</Label>
              <Input type="number" value={form.comision_valor} onChange={(e) => setForm({ ...form, comision_valor: Number(e.target.value) })} />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Vendedor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
