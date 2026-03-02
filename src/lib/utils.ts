import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCLP(value: number | null | undefined): string {
  if (value == null) return "$0";
  return value.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "0";
  return value.toLocaleString("es-CL");
}
