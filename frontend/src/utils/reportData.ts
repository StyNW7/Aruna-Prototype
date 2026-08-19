import { productionPlans } from "@/data/production";
import { energyProcesses, totalEnergyKwh, totalEnergyCostRupiah, skuEnergyProfiles } from "@/data/energy";
import { skus } from "@/data/skus";
import { shipments } from "@/data/shipment";
import { performanceMetrics } from "@/data/performance";
import { formatNumber, formatKg, formatRupiah, formatUSD, formatPercent, formatKwh, usdToIdr } from "@/utils/format";

export interface ReportColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
}

export interface ReportTable {
  title: string;
  columns: ReportColumn[];
  rows: (string | number)[][];
}

export interface ReportDoc {
  key: string;
  name: string;
  generatedAt: string;
  period: string;
  summary: { label: string; value: string }[];
  tables: ReportTable[];
  notes?: string[];
}

function nowStr() {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function buildReport(reportName: string, period: string): ReportDoc {
  const generatedAt = nowStr();

  switch (reportName) {
    case "Production Summary": {
      const totalInput = productionPlans.reduce((a, b) => a + b.inputKg, 0);
      const totalTarget = productionPlans.reduce((a, b) => a + b.targetOutputKg, 0);
      const totalActual = productionPlans.reduce((a, b) => a + (b.actualOutputKg ?? 0), 0);
      return {
        key: "production-summary",
        name: reportName,
        generatedAt,
        period,
        summary: [
          { label: "Total Batch Diproses", value: formatNumber(productionPlans.length) },
          { label: "Total Input", value: formatKg(totalInput) },
          { label: "Target Output", value: formatKg(totalTarget) },
          { label: "Realisasi Output", value: formatKg(totalActual) },
        ],
        tables: [
          {
            title: "Rencana & Realisasi Produksi",
            columns: [
              { key: "id", label: "ID" },
              { key: "date", label: "Tanggal" },
              { key: "batchId", label: "Batch" },
              { key: "skuCode", label: "SKU" },
              { key: "machine", label: "Mesin" },
              { key: "inputKg", label: "Input (kg)", align: "right" },
              { key: "targetOutputKg", label: "Target (kg)", align: "right" },
              { key: "actualOutputKg", label: "Aktual (kg)", align: "right" },
              { key: "status", label: "Status" },
            ],
            rows: productionPlans.map((p) => [
              p.id,
              p.date,
              p.batchId,
              p.skuCode,
              p.machine,
              formatNumber(p.inputKg),
              formatNumber(p.targetOutputKg),
              p.actualOutputKg != null ? formatNumber(p.actualOutputKg) : "-",
              p.status,
            ]),
          },
        ],
        notes: ["Data bersifat ilustratif (mock/dummy) untuk kebutuhan prototipe dashboard Aruna FISH."],
      };
    }

    case "Energy Efficiency": {
      return {
        key: "energy-efficiency",
        name: reportName,
        generatedAt,
        period,
        summary: [
          { label: "Total Konsumsi Energi", value: formatKwh(totalEnergyKwh) },
          { label: "Total Biaya Energi", value: formatRupiah(totalEnergyCostRupiah) },
          { label: "Jumlah Proses Termonitor", value: formatNumber(energyProcesses.length) },
        ],
        tables: [
          {
            title: "Konsumsi Energi per Proses",
            columns: [
              { key: "name", label: "Proses" },
              { key: "powerKw", label: "Daya (kW)", align: "right" },
              { key: "runtimeHours", label: "Runtime (jam)", align: "right" },
              { key: "kwh", label: "Energi (kWh)", align: "right" },
              { key: "costRupiah", label: "Biaya (Rp)", align: "right" },
              { key: "sharePct", label: "Share (%)", align: "right" },
            ],
            rows: energyProcesses.map((e) => [
              e.name,
              formatNumber(e.powerKw, 1),
              formatNumber(e.runtimeHours, 1),
              formatNumber(e.kwh, 1),
              formatNumber(e.costRupiah),
              formatNumber(e.sharePct, 1),
            ]),
          },
          {
            title: "Intensitas Energi per SKU",
            columns: [
              { key: "skuCode", label: "SKU" },
              { key: "kwhPerKg", label: "kWh/kg", align: "right" },
              { key: "energyCostPerKg", label: "Biaya Energi/kg (Rp)", align: "right" },
              { key: "profitPerKwh", label: "Profit/kWh (Rp)", align: "right" },
            ],
            rows: skuEnergyProfiles.map((s) => [
              s.skuCode,
              formatNumber(s.kwhPerKg, 2),
              formatNumber(s.energyCostPerKg),
              formatNumber(s.profitPerKwh),
            ]),
          },
        ],
        notes: [`Tarif listrik industri diasumsikan Rp1.444,7/kWh (ilustratif).`],
      };
    }

    case "SKU Profitability": {
      return {
        key: "sku-profitability",
        name: reportName,
        generatedAt,
        period,
        summary: [
          { label: "Jumlah SKU Aktif", value: formatNumber(skus.length) },
          { label: "Kurs Acuan", value: formatRupiah(16481) + "/USD" },
        ],
        tables: [
          {
            title: "Profitabilitas per SKU",
            columns: [
              { key: "code", label: "SKU" },
              { key: "category", label: "Kategori" },
              { key: "priceUsd", label: "Harga (USD/kg)", align: "right" },
              { key: "priceIdr", label: "Harga (Rp/kg)", align: "right" },
              { key: "yield", label: "Yield dari Loin (%)", align: "right" },
              { key: "exportEligible", label: "Eligible Ekspor" },
            ],
            rows: skus.map((s) => [
              s.code,
              s.category,
              formatUSD(s.priceUsdPerKg),
              formatRupiah(usdToIdr(s.priceUsdPerKg)),
              formatPercent(s.yieldFromLoinPct),
              s.exportEligible ? "Ya" : "Tidak",
            ]),
          },
        ],
      };
    }

    case "Yield Analysis": {
      const yieldMetric = performanceMetrics.find((m) => m.kpi.startsWith("Yield"));
      return {
        key: "yield-analysis",
        name: reportName,
        generatedAt,
        period,
        summary: [
          { label: "Yield Rencana", value: `${yieldMetric?.planned ?? "-"}%` },
          { label: "Yield Aktual", value: `${yieldMetric?.actual ?? "-"}%` },
          { label: "Varians", value: `${yieldMetric?.variancePct ?? "-"}%` },
        ],
        tables: [
          {
            title: "Yield per SKU (Loin → Finished Goods)",
            columns: [
              { key: "code", label: "SKU" },
              { key: "yield", label: "Yield dari Loin (%)", align: "right" },
              { key: "minSize", label: "Ukuran Minimum" },
              { key: "minGrade", label: "Grade Minimum" },
            ],
            rows: skus.map((s) => [s.code, formatPercent(s.yieldFromLoinPct), s.minSizeGrade, s.minQualityGrade]),
          },
        ],
      };
    }

    case "Excess Report": {
      const excessMetric = performanceMetrics.find((m) => m.kpi.includes("Excess"));
      const belowTarget = productionPlans.filter(
        (p) => p.actualOutputKg != null && p.actualOutputKg < p.targetOutputKg
      );
      return {
        key: "excess-report",
        name: reportName,
        generatedAt,
        period,
        summary: [
          { label: "Excess Product Ratio (Rencana)", value: `${excessMetric?.planned ?? "-"}%` },
          { label: "Excess Product Ratio (Aktual)", value: `${excessMetric?.actual ?? "-"}%` },
          { label: "Batch dengan Output di Bawah Target", value: formatNumber(belowTarget.length) },
        ],
        tables: [
          {
            title: "Batch dengan Selisih Output vs Target",
            columns: [
              { key: "batchId", label: "Batch" },
              { key: "skuCode", label: "SKU" },
              { key: "targetOutputKg", label: "Target (kg)", align: "right" },
              { key: "actualOutputKg", label: "Aktual (kg)", align: "right" },
              { key: "selisih", label: "Selisih (kg)", align: "right" },
            ],
            rows: belowTarget.map((p) => [
              p.batchId,
              p.skuCode,
              formatNumber(p.targetOutputKg),
              formatNumber(p.actualOutputKg ?? 0),
              formatNumber((p.actualOutputKg ?? 0) - p.targetOutputKg),
            ]),
          },
        ],
        notes: ["Excess/side product dialokasikan ke Ground Meat dan kanal nilai residual lain sesuai SOP alokasi excess."],
      };
    }

    case "Shipment Report": {
      const totalWeight = shipments.reduce((a, b) => a + b.totalWeightKg, 0);
      const totalValue = shipments.reduce((a, b) => a + b.items.reduce((x, i) => x + i.valueUsd, 0), 0);
      return {
        key: "shipment-report",
        name: reportName,
        generatedAt,
        period,
        summary: [
          { label: "Jumlah Shipment", value: formatNumber(shipments.length) },
          { label: "Total Berat", value: formatKg(totalWeight) },
          { label: "Total Nilai Ekspor", value: formatUSD(totalValue) },
        ],
        tables: shipments.map((s) => ({
          title: `${s.containerNo} — ${s.buyer} (${s.status})`,
          columns: [
            { key: "skuCode", label: "SKU" },
            { key: "weightKg", label: "Berat (kg)", align: "right" },
            { key: "cartons", label: "Karton", align: "right" },
            { key: "valueUsd", label: "Nilai (USD)", align: "right" },
          ],
          rows: s.items.map((i) => [i.skuCode, formatNumber(i.weightKg), formatNumber(i.cartons), formatUSD(i.valueUsd)]),
        })),
        notes: [`Kapasitas kontainer standar: ${formatKg(19000)} per unit 20ft reefer.`],
      };
    }

    case "Plan vs Actual": {
      return {
        key: "plan-vs-actual",
        name: reportName,
        generatedAt,
        period,
        summary: [
          { label: "Jumlah KPI Termonitor", value: formatNumber(performanceMetrics.length) },
          {
            label: "KPI di Bawah Target",
            value: formatNumber(performanceMetrics.filter((m) => m.variancePct < 0).length),
          },
        ],
        tables: [
          {
            title: "Perbandingan Rencana vs Realisasi KPI",
            columns: [
              { key: "kpi", label: "KPI" },
              { key: "planned", label: "Rencana", align: "right" },
              { key: "actual", label: "Aktual", align: "right" },
              { key: "unit", label: "Satuan" },
              { key: "variancePct", label: "Varians (%)", align: "right" },
            ],
            rows: performanceMetrics.map((m) => [
              m.kpi,
              formatNumber(m.planned, m.planned < 10 ? 2 : 0),
              formatNumber(m.actual, m.actual < 10 ? 2 : 0),
              m.unit,
              formatPercent(m.variancePct),
            ]),
          },
        ],
      };
    }

    case "Management Summary": {
      const revenue = performanceMetrics.find((m) => m.kpi === "Revenue");
      const margin = performanceMetrics.find((m) => m.kpi === "Margin");
      return {
        key: "management-summary",
        name: reportName,
        generatedAt,
        period,
        summary: [
          { label: "Revenue Aktual", value: `Rp${formatNumber(revenue?.actual ?? 0)} juta` },
          { label: "Margin Aktual", value: `Rp${formatNumber(margin?.actual ?? 0)} juta` },
          { label: "Jumlah Shipment", value: formatNumber(shipments.length) },
          { label: "Jumlah Batch Produksi", value: formatNumber(productionPlans.length) },
        ],
        tables: [
          {
            title: "Ringkasan Eksekutif KPI Operasional",
            columns: [
              { key: "kpi", label: "KPI" },
              { key: "planned", label: "Rencana", align: "right" },
              { key: "actual", label: "Aktual", align: "right" },
              { key: "unit", label: "Satuan" },
              { key: "variancePct", label: "Varians (%)", align: "right" },
            ],
            rows: performanceMetrics.map((m) => [
              m.kpi,
              formatNumber(m.planned, m.planned < 10 ? 2 : 0),
              formatNumber(m.actual, m.actual < 10 ? 2 : 0),
              m.unit,
              formatPercent(m.variancePct),
            ]),
          },
          {
            title: "Ringkasan Shipment",
            columns: [
              { key: "containerNo", label: "Kontainer" },
              { key: "buyer", label: "Buyer" },
              { key: "totalWeightKg", label: "Berat (kg)", align: "right" },
              { key: "status", label: "Status" },
            ],
            rows: shipments.map((s) => [s.containerNo, s.buyer, formatNumber(s.totalWeightKg), s.status]),
          },
        ],
        notes: ["Ringkasan ini dikompilasi dari seluruh modul operasional FISH Platform untuk kebutuhan manajemen."],
      };
    }

    default:
      return {
        key: "unknown",
        name: reportName,
        generatedAt,
        period,
        summary: [],
        tables: [],
      };
  }
}
