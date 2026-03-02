import { NextRequest, NextResponse } from "next/server";

const N8N_URL = process.env.N8N_API_URL!;
const API_KEY = process.env.N8N_API_KEY!;

async function proxy(req: NextRequest, method: string) {
  const pathSegments = req.nextUrl.pathname.replace("/api/vehicorp/", "");
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
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message: String(err) } },
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
