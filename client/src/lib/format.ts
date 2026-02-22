import { format } from "date-fns";

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: "always",
  }).format(num);
}

export function formatPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num / 100);
}

export function formatRatio(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return `1:${num.toFixed(2)}`;
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}
