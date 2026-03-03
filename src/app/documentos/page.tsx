"use client";

import { useState, useMemo } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import { FileText, Shield, Car, FileCheck, Handshake, Trash2 } from "lucide-react";
import type { Vehiculo, Cliente, Documento, StandardResponse } from "@/lib/types";

const DOC_TYPES = [
  { tipo: "renuncia_seguro", label: "Renuncia de Seguro", icon: Shield, desc: "Documento de renuncia de seguro del vehículo" },
  { tipo: "carta_responsabilidad", label: "Carta de Responsabilidad", icon: FileText, desc: "Carta de responsabilidad del comprador" },
  { tipo: "certificado_entrega", label: "Certificado de Entrega", icon: FileCheck, desc: "Certificado de entrega del vehículo" },
  { tipo: "contrato_consignacion", label: "Contrato Consignación", icon: Handshake, desc: "Contrato de consignación del vehículo" },
  { tipo: "autorizacion_consignacion", label: "Autorización Consignación", icon: Car, desc: "Autorización de consignación" },
];

export default function DocumentosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Documentos</h1>
      <Tabs defaultValue="nuevo">
        <TabsList>
          <TabsTrigger value="nuevo">Nuevo Documento</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="nuevo"><NuevoDocumento /></TabsContent>
        <TabsContent value="historial"><HistorialDocumentos /></TabsContent>
      </Tabs>
    </div>
  );
}

function NuevoDocumento() {
  const { data: vehData } = useApi<{ vehiculos: Vehiculo[]; cantidad: number }>("inventario-disponible");
  const { data: cliData } = useApi<{ clientes: Cliente[]; cantidad: number }>("clientes");
  const [vehiculoId, setVehiculoId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [result, setResult] = useState<{ tipo: string; url?: string } | null>(null);

  const vehiculos = vehData?.vehiculos || [];
  const clientes = cliData?.clientes || [];

  async function generate(tipo: string) {
    if (!vehiculoId || !clienteId) {
      toast.error("Selecciona vehículo y cliente");
      return;
    }
    setGenerating(tipo);
    setResult(null);
    try {
      const res = await apiPost<{ success: boolean; url?: string }>("documentos-generar", {
        tipo,
        vehiculo_id: vehiculoId,
        cliente_id: clienteId,
      });
      toast.success("Documento generado exitosamente");
      setResult({ tipo, url: res.url });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al generar");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Seleccionar Datos</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DOC_TYPES.map((doc) => (
          <Card key={doc.tipo} className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-2">
                  <doc.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-medium text-sm">{doc.label}</p>
              </div>
              <p className="text-xs text-muted-foreground">{doc.desc}</p>
              <Button size="sm" className="w-full" disabled={generating !== null} onClick={() => generate(doc.tipo)}>
                {generating === doc.tipo ? "Generando..." : "Generar PDF"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {result && (
        <Card className="border-emerald-500/30">
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-sm font-medium text-emerald-400">Documento generado exitosamente</p>
            {result.url && (
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                Descargar PDF
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function HistorialDocumentos() {
  const { data, loading, error, refetch } = useApi<StandardResponse<Documento[]>>("documentos-historial");
  const { data: invData } = useApi<StandardResponse<Vehiculo[]>>("inventario");
  const { data: cliData } = useApi<{ clientes: Cliente[]; cantidad: number }>("clientes");
  const [deleteTarget, setDeleteTarget] = useState<Documento | null>(null);

  const documentos = data?.data || [];

  const vehiculoMap = useMemo(() => {
    const m = new Map<string, string>();
    (invData?.data || []).forEach((v) => {
      m.set(v.id, `${v.marca ? v.marca + " " : ""}${v.modelo} (${v.patente})`);
    });
    return m;
  }, [invData]);

  const clienteMap = useMemo(() => {
    const m = new Map<string, string>();
    (cliData?.clientes || []).forEach((c) => {
      m.set(c.id, c.nombre);
    });
    return m;
  }, [cliData]);

  async function handleDelete(id: string) {
    try {
      await apiPost("documentos-delete", { id });
      toast.success("Documento eliminado");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="mt-4">
      <EmptyState loading={loading} error={error} empty={documentos.length === 0} emptyMessage="Sin documentos generados">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Vehículo</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">PDF</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((d) => (
                <tr key={d.id} className="border-b border-border">
                  <td className="py-2 pr-3">{d.tipo}</td>
                  <td className="py-2 pr-3">{vehiculoMap.get(d.vehiculo_id) || d.vehiculo_id}</td>
                  <td className="py-2 pr-3">{clienteMap.get(d.cliente_id) || d.cliente_id}</td>
                  <td className="py-2 pr-3">{formatDate(d.created_at)}</td>
                  <td className="py-2 pr-3">
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">Ver PDF</a>
                    ) : "-"}
                  </td>
                  <td className="py-2">
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(d)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </EmptyState>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar documento"
        description={deleteTarget ? `${deleteTarget.tipo}` : ""}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}
