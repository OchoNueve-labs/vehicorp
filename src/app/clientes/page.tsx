"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { apiPost } from "@/lib/api";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import type { Cliente } from "@/lib/types";

const EMPTY_FORM = {
  nombre: "", rut: "", nacionalidad: "", estado_civil: "",
  correo: "", telefono: "", direccion: "", ciudad: "", comuna: "",
};

export default function ClientesPage() {
  const { data, loading, error, refetch } = useApi<{ clientes: Cliente[]; cantidad: number }>("clientes");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const clientes = data?.clientes || [];
  const filtered = clientes.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.nombre?.toLowerCase().includes(q) || c.rut?.toLowerCase().includes(q);
  });

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      nombre: c.nombre || "",
      rut: c.rut || "",
      nacionalidad: c.nacionalidad || "",
      estado_civil: c.estado_civil || "",
      correo: c.correo || "",
      telefono: c.telefono || "",
      direccion: c.direccion || "",
      ciudad: c.ciudad || "",
      comuna: c.comuna || "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.rut) {
      alert("Nombre y RUT son obligatorios");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiPost("clientes-update", { id: editing.id, ...form });
      } else {
        await apiPost("clientes", form);
      }
      setOpen(false);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Cliente) {
    if (!confirm(`¿Eliminar a ${c.nombre}?`)) return;
    try {
      await apiPost("clientes-delete", { id: c.id });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nuevo Cliente</Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o RUT..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <EmptyState loading={loading} error={error} empty={filtered.length === 0} emptyMessage="Sin clientes">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3">Nombre</th>
                <th className="py-2 pr-3">RUT</th>
                <th className="py-2 pr-3">Teléfono</th>
                <th className="py-2 pr-3">Correo</th>
                <th className="py-2 pr-3">Ciudad</th>
                <th className="py-2 pr-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border">
                  <td className="py-2 pr-3 font-medium">{c.nombre}</td>
                  <td className="py-2 pr-3">{c.rut || "-"}</td>
                  <td className="py-2 pr-3">{c.telefono || "-"}</td>
                  <td className="py-2 pr-3">{c.correo || "-"}</td>
                  <td className="py-2 pr-3">{c.ciudad || "-"}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EmptyState>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Nombre *</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">RUT *</Label>
              <Input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} required />
            </div>
            <div>
              <Label className="text-xs">Nacionalidad</Label>
              <Input value={form.nacionalidad} onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Estado Civil</Label>
              <Input value={form.estado_civil} onChange={(e) => setForm({ ...form, estado_civil: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Correo</Label>
              <Input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Dirección</Label>
              <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Ciudad</Label>
              <Input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Comuna</Label>
              <Input value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Guardando..." : editing ? "Guardar Cambios" : "Crear Cliente"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
