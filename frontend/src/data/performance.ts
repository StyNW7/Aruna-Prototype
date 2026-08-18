import type { PerformanceMetric } from "@/types";

// Data ilustratif untuk prototype.
export const performanceMetrics: PerformanceMetric[] = [
  { kpi: "Yield Whole Fish → Loin", planned: 61.5, actual: 59.07, unit: "%", variancePct: -3.95 },
  { kpi: "Output Finished Goods", planned: 11500, actual: 10980, unit: "kg", variancePct: -4.52 },
  { kpi: "Revenue", planned: 1850, actual: 1782, unit: "juta Rupiah", variancePct: -3.68 },
  { kpi: "Margin", planned: 612, actual: 574, unit: "juta Rupiah", variancePct: -6.21 },
  { kpi: "Konsumsi Energi", planned: 820, actual: 848, unit: "kWh", variancePct: 3.41 },
  { kpi: "Energy Intensity", planned: 0.071, actual: 0.077, unit: "kWh/kg", variancePct: 8.45 },
  { kpi: "Excess Product Ratio", planned: 4.0, actual: 6.3, unit: "%", variancePct: 57.5 },
  { kpi: "Waktu Proses Rata-rata", planned: 5.2, actual: 5.6, unit: "jam/batch", variancePct: 7.69 },
];

export const yieldTrend = [
  { period: "Minggu 1", planned: 61.0, actual: 58.4 },
  { period: "Minggu 2", planned: 61.2, actual: 59.1 },
  { period: "Minggu 3", planned: 61.5, actual: 58.8 },
  { period: "Minggu 4", planned: 61.5, actual: 59.07 },
];

export const marginVarianceTrend = [
  { period: "Minggu 1", planned: 148, actual: 132 },
  { period: "Minggu 2", planned: 152, actual: 144 },
  { period: "Minggu 3", planned: 155, actual: 141 },
  { period: "Minggu 4", planned: 157, actual: 157 },
];

export const energyVarianceTrend = [
  { period: "Minggu 1", planned: 198, actual: 205 },
  { period: "Minggu 2", planned: 204, actual: 211 },
  { period: "Minggu 3", planned: 206, actual: 214 },
  { period: "Minggu 4", planned: 212, actual: 218 },
];

export const rootCauseVariance = [
  { title: "Freshness campuran lebih rendah dari rencana", impact: "Yield turun 2,4 pp pada batch 20 UP", category: "Supply" },
  { title: "Downtime bandsaw 45 menit akibat maintenance", impact: "Energy intensity naik 0,004 kWh/kg", category: "Mesin" },
  { title: "Demand SAKU melebihi kapasitas alokasi rencana", impact: "Realokasi ke Steak menurunkan margin 3,1%", category: "Demand" },
];
