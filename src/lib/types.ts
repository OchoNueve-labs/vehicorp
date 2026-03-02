// === API Response Wrappers ===

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  total: number;
}

export interface NamedResponse<T> {
  cantidad: number;
  [key: string]: T[] | number;
}

// === Entities ===

export interface Vehiculo {
  id: string;
  marca: string | null;
  modelo: string;
  ano: number;
  patente: string;
  kilometros: number;
  color: string | null;
  chassis: string | null;
  motor: string | null;
  tipo: string;
  ubicacion: string | null;
  precio_compra: number;
  gastos: number;
  precio_venta: number;
  estado: string;
  link_fotos: string | null;
  notas: string | null;
  fecha_ingreso: string | null;
  activo: boolean;
  created_at: string | null;
  updated_at: string | null;
  // Campos computados (solo en GET /inventario)
  dias_stock?: number;
  margen_porcentaje?: string;
  costo_total?: number;
  margen?: number;
  alerta_estancado?: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  rut: string | null;
  nacionalidad: string | null;
  estado_civil: string | null;
  correo: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  comuna: string | null;
  created_at: string | null;
}

export interface Vendedor {
  id: string;
  nombre: string;
  tipo_comision: string;
  comision_valor: number;
  activo: boolean;
  created_at: string | null;
}

export interface Venta {
  id: string;
  fecha: string;
  vehiculo_id: string | null;
  cliente_id: string | null;
  vendedor_id: string | null;
  nota_venta_id: string | null;
  precio_compra: number;
  gastos: number;
  precio_venta: number;
  descuento: number;
  valor_final: number;
  margen: number;
  margen_porcentaje: number;
  forma_pago: string;
  monto_financiado: number;
  margen_financiamiento: number;
  comision_monto: number;
  comision_porcentaje: number;
  vendedor_nombre: string | null;
  created_at: string | null;
}

export interface NotaVenta {
  id: string;
  fecha: string;
  vehiculo_id: string | null;
  cliente_id: string | null;
  vendedor_id: string | null;
  vehiculo_detalle: string | null;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  patente: string | null;
  color: string | null;
  kms: number | null;
  cliente_nombre: string | null;
  cliente_rut: string | null;
  cliente_email: string | null;
  cliente_telefono: string | null;
  cliente_direccion: string | null;
  cliente_ciudad: string | null;
  cliente_comuna: string | null;
  valor_vehiculo: number;
  descuento: number;
  valor_final: number;
  costo_transferencia: number;
  total_cliente: number;
  forma_pago: string;
  monto_financiado: number;
  margen_financiamiento: number;
  tiene_retoma: boolean;
  retoma_detalle: string | null;
  vendedor_nombre: string | null;
  comision_monto: number;
  comision_porcentaje: number;
  es_reserva: boolean;
  monto_reserva: number;
  estado: string;
  created_at: string | null;
}

export interface CostoFijo {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  recurrente: boolean;
  created_at: string | null;
}

export interface CostosResponse {
  costos: CostoFijo[];
  total: number;
  por_categoria: Record<string, number>;
  cantidad: number;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Arriendo {
  id: string;
  vehiculo_id: string;
  cliente_id: string;
  monto_mensual: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  created_at: string | null;
}

export interface PagoArriendo {
  id: string;
  arriendo_id: string;
  periodo: string;
  monto: number;
  fecha_pago: string;
  estado: string;
  created_at: string | null;
}

export interface Documento {
  id: string;
  vehiculo_id: string;
  cliente_id: string;
  tipo: string;
  url: string | null;
  created_at: string | null;
}

// === Dashboard ===

export interface DashboardData {
  success: boolean;
  data: {
    resumen: {
      total_stock: number;
      disponibles: number;
      reservados: number;
      vendidos_mes: number;
    };
    financiero: {
      valor_inventario: number;
      margen_potencial: number;
      utilidad_mes: number;
    };
    tiempos: {
      promedio_dias_stock: number;
      max_dias_stock: number;
      vehiculos_estancados: number;
    };
  };
}

export interface DashboardFinanciero {
  periodo: { desde: string; hasta: string };
  resumen: {
    total_ventas: number;
    utilidad_bruta: number;
    margen_financiamiento: number;
    costos_fijos: number;
    comisiones: number;
    utilidad_neta: number;
  };
  cantidad_ventas: number;
  comisiones_por_vendedor: Record<string, {
    ventas: number;
    total_vendido: number;
    comision: number;
  }>;
  costos_por_categoria: Record<string, number>;
}
