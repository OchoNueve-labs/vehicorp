import { NextRequest, NextResponse } from "next/server";

const N8N_URL = process.env.N8N_API_URL;
const API_KEY = process.env.N8N_API_KEY;

const ALLOWED_PATHS = new Set([
  "inventario", "inventario-disponible", "inventario-update",
  "inventario-delete", "inventario-get", "inventario-estado",
  "ventas", "notas-venta",
  "clientes", "clientes-update", "clientes-delete",
  "vendedores", "vendedores-update", "vendedores-delete",
  "costos-fijos", "costos-fijos-update", "costos-fijos-delete",
  "categorias-costos", "categorias-costos-delete",
  "arriendos", "pagos-arriendo", "pagos-arriendo-create",
  "dashboard", "dashboard-financiero",
  "documentos-generar", "documentos-historial", "documentos-delete",
]);

async function proxy(req: NextRequest, method: string) {
  if (!N8N_URL || !API_KEY) {
    return NextResponse.json(
      { success: false, error: { code: "CONFIG_ERROR", message: "Servidor no configurado" } },
      { status: 500 }
    );
  }

  const pathSegments = req.nextUrl.pathname.replace("/api/vehicorp/", "");

  if (!ALLOWED_PATHS.has(pathSegments)) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Endpoint no permitido" } },
      { status: 403 }
    );
  }

  const search = req.nextUrl.search;
  const targetUrl = `${N8N_URL}/${pathSegments}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };

  const options: RequestInit = { method, headers };

  if (method === "POST") {
    try {
      const body = await req.json();
      options.body = JSON.stringify(body);
    } catch {
      // No body
    }
  }

  try {
    const res = await fetch(targetUrl, options);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message: "Error de conexión con el servidor" } },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxy(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxy(req, "POST");
}
