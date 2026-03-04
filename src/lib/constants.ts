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
  { label: "Inicio", href: "/", icon: LayoutDashboard, adminOnly: true },
  { label: "Inventario", href: "/inventario", icon: Car, adminOnly: false },
  { label: "Nota de Venta", href: "/nota-venta", icon: Receipt, adminOnly: false },
  { label: "Arriendos", href: "/arriendos", icon: Key, adminOnly: false },
  { label: "Documentos", href: "/documentos", icon: FileText, adminOnly: false },
  { label: "Clientes", href: "/clientes", icon: Users, adminOnly: false },
  { label: "Costos Operativos", href: "/costos-fijos", icon: DollarSign, adminOnly: false },
  { label: "Vendedores", href: "/vendedores", icon: UserCheck, adminOnly: false },
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

export const ESTADO_HEX_COLORS: Record<string, string> = {
  Disponible: "#34d399",       // emerald-400
  Vendido: "#60a5fa",          // blue-400
  Reservado: "#c084fc",        // purple-400
  "En preparacion": "#fbbf24", // amber-400
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
