"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/hooks/use-api";
import { apiPost } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { KpiCard } from "@/components/shared/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCLP, formatDate } from "@/lib/utils";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { CATEGORIA_COLORS } from "@/lib/constants";
import { useSort } from "@/lib/hooks/use-sort";
import { SortHeader } from "@/components/shared/SortHeader";
import type { CostosResponse, Categoria, CostoFijo } from "@/lib/types";

export default function CostosFijosPage() {
  const { data, loading, error, refetch } = useApi<CostosResponse>("costos-fijos");
  const { data: catData } = useApi<{ categorias: Categoria[]; cantidad: number }>("categorias-costos");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [filterDesde, setFilterDesde] = useState("");
  const [filterHasta, setFilterHasta] = useState("");
  const [form, setForm] = useState({ fecha: new Date().toISOString().split("T")[0], categoria: "", descripcion: "", monto: 0, recurrente: false });
  const [deleteTarget, setDeleteTarget] = useState<CostoFijo | null>(null);

  const costos = data?.costos || [];
  const porCategoria = data?.por_categoria || {};
  const categorias = catData?.categorias || [];

  const searched = costos.filter((c) => {
    if (filterCat && c.categoria !== filterCat) return false;
    if (filterDesde && c.fecha < filterDesde) return false;
    if (filterHasta && c.fecha > filterHasta) return false;
    return true;
  });
  const { sorted: filtered, sortKey, sortDir, toggleSort } = useSort(searched, "fecha");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descripcion || !form.monto || !form.categoria) {
      toast.error("Categoría, descripción y monto son obligatorios");
      return;
    }
    setSaving(true);
    try {
      await apiPost("costos-fijos", { ...form, monto: Number(form.monto) });
      setOpen(false);
      setForm({ fecha: new Date().toISOString().split("T")[0], categoria: "", descripcion: "", monto: 0, recurrente: false });
      toast.success("Costo agregado");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiPost("costos-fijos-delete", { id });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Costos Operativos</h1>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Agregar Costo</Button>
      </div>

      {/* KPI por categoría */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(porCategoria).map(([cat, total]) => (
          <KpiCard key={cat} title={cat} value={formatCLP(total)} icon={DollarSign} loading={loading} />
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.nombre}>{c.nombre}</option>
          ))}
        </select>
        <Input type="date" className="w-auto" value={filterDesde} onChange={(e) => setFilterDesde(e.target.value)} placeholder="Desde" />
        <Input type="date" className="w-auto" value={filterHasta} onChange={(e) => setFilterHasta(e.target.value)} placeholder="Hasta" />
      </div>

      <EmptyState loading={loading} error={error} empty={filtered.length === 0} emptyMessage="Sin costos registrados">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3"><SortHeader label="Fecha" active={sortKey === "fecha"} direction={sortDir} onClick={() => toggleSort("fecha")} /></th>
                <th className="py-2 pr-3"><SortHeader label="Categoría" active={sortKey === "categoria"} direction={sortDir} onClick={() => toggleSort("categoria")} /></th>
                <th className="py-2 pr-3">Descripción</th>
                <th className="py-2 pr-3"><SortHeader label="Monto" active={sortKey === "monto"} direction={sortDir} onClick={() => toggleSort("monto")} /></th>
                <th className="py-2 pr-3">Recurrente</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border">
                  <td className="py-2 pr-3">{formatDate(c.fecha)}</td>
                  <td className="py-2 pr-3">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${CATEGORIA_COLORS[c.categoria] || "bg-gray-500"}`}></span>
                    {c.categoria}
                  </td>
                  <td className="py-2 pr-3">{c.descripcion}</td>
                  <td className="py-2 pr-3 font-semibold">{formatCLP(c.monto)}</td>
                  <td className="py-2 pr-3">{c.recurrente ? "Sí" : "No"}</td>
                  <td className="py-2">
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EmptyState>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar Costo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label className="text-xs">Fecha</Label>
              <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Categoría *</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.nombre}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Descripción *</Label>
              <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">Monto *</Label>
              <Input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} required />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.recurrente} onCheckedChange={(v) => setForm({ ...form, recurrente: v })} />
              <Label className="text-sm">Recurrente</Label>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Guardando..." : "Agregar Costo"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="¿Eliminar este costo?"
        description={deleteTarget ? `${deleteTarget.descripcion} — ${deleteTarget.categoria}` : ""}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id); }}
      />
    </div>
  );
}
