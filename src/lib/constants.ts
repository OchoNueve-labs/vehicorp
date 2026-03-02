import {
  LayoutDashboard,
  Car,
  Receipt,
  Key,
  FileText,
  Users,
  DollarSign,
  UserCheck,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Inicio", href: "/", icon: LayoutDashboard },
  { label: "Inventario", href: "/inventario", icon: Car },
  { label: "Nota de Venta", href: "/nota-venta", icon: Receipt },
  { label: "Arriendos", href: "/arriendos", icon: Key },
  { label: "Documentos", href: "/documentos", icon: FileText },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Costos Operativos", href: "/costos-fijos", icon: DollarSign },
  { label: "Vendedores", href: "/vendedores", icon: UserCheck },
] as const;

export const ESTADO_COLORS: Record<string, string> = {
  Disponible: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Vendido: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Reservado: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "En preparacion": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Activo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Completada: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Pendiente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export const CATEGORIA_COLORS: Record<string, string> = {
  Sueldo: "bg-blue-500",
  Arriendo: "bg-purple-500",
  Servicios: "bg-red-500",
  Marketing: "bg-orange-500",
  Mantenimiento: "bg-gray-500",
  Otros: "bg-rose-500",
  Seguros: "bg-teal-500",
};
