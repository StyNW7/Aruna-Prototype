// Formatter angka gaya Indonesia: titik pemisah ribuan, koma pemisah desimal.

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatKg(value: number, decimals = 0): string {
  return `${formatNumber(value, decimals)} kg`;
}

export function formatRupiah(value: number, decimals = 0): string {
  return `Rp${formatNumber(value, decimals)}`;
}

export function formatRupiahJuta(value: number, decimals = 1): string {
  return `Rp${formatNumber(value, decimals)} juta`;
}

export function formatUSD(value: number, decimals = 2): string {
  return `US$${formatNumber(value, decimals)}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

export function formatKwh(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)} kWh`;
}

export const KURS_USD_IDR = 16481;

export function usdToIdr(usd: number): number {
  return usd * KURS_USD_IDR;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
