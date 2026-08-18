import { skus } from "@/data/skus";
import { skuEnergyProfiles } from "@/data/energy";
import { usdToIdr } from "./format";
import type { SKUCode } from "@/types";

// Prototype Optimization Simulation — logika deterministik front-end.
// Bukan LP solver produksi sesungguhnya, namun perilaku bereaksi konsisten
// terhadap perubahan supply, demand, tarif energi, yield, dan kapasitas.

export type OptimizationPriority = "Maksimalkan Profit" | "Efisiensi Energi" | "Balanced Optimization";

export interface OptimizerInputs {
  totalSupplyKg: number;
  size30UpPct: number; // 0-100, sisanya terbagi 20UP/14UP
  gradeBPct: number; // 0-100
  energyTariffRupiahPerKwh: number;
  yieldDeltaPp: number; // -5..+5
  freezerCapacityKg: number;
  demandCeilingKg: Partial<Record<SKUCode, number>>;
  priority: OptimizationPriority;
}

export interface OptimizerMixRow {
  skuCode: SKUCode;
  recommendedInputKg: number;
  expectedOutputKg: number;
  mixPct: number;
  yieldPct: number;
  marginRupiah: number;
  energyKwh: number;
  demandFulfillmentPct: number;
}

export interface OptimizerOutput {
  mix: OptimizerMixRow[];
  totalOutputKg: number;
  expectedProfitRupiah: number;
  totalEnergyKwh: number;
  energyIntensity: number;
  capacityUtilizationPct: number;
  excessRatioPct: number;
}

const BASE_DEMAND_CEILING: Record<SKUCode, number> = {
  "SAKU-16OZ": 1400,
  "STEAK-10OZ": 900,
  "STEAK-8OZ": 2400,
  "STEAK-6OZ": 1900,
  "STEAK-4OZ": 1600,
  "POKE-1.5CM": 1300,
  "MEDALLION-2-3OZ": 1200,
  "GROUND-MEAT": 1000,
};

const PROCESSING_COST_PER_KG = 3200; // Rupiah, biaya proses non-energi (data ilustratif)

function scoreForSku(skuCode: SKUCode, priority: OptimizationPriority, tariff: number): number {
  const sku = skus.find((s) => s.code === skuCode)!;
  const energy = skuEnergyProfiles.find((e) => e.skuCode === skuCode)!;
  const priceRupiahPerKg = usdToIdr(sku.priceUsdPerKg);
  const energyCost = energy.totalKwh * tariff;
  const marginPerKg = priceRupiahPerKg - PROCESSING_COST_PER_KG - energyCost;

  if (priority === "Maksimalkan Profit") return marginPerKg;
  if (priority === "Efisiensi Energi") return marginPerKg / Math.max(energy.totalKwh, 0.05);
  // Balanced: normalisasi sederhana margin & efisiensi energi
  return marginPerKg * 0.6 + (marginPerKg / Math.max(energy.totalKwh, 0.05)) * 4000 * 0.4;
}

export function runOptimizer(inputs: OptimizerInputs): OptimizerOutput {
  const {
    totalSupplyKg,
    energyTariffRupiahPerKwh,
    yieldDeltaPp,
    freezerCapacityKg,
    demandCeilingKg,
    priority,
  } = inputs;

  const eligible = skus; // semua SKU dianggap eligible di level agregat prototype ini
  const scored = eligible
    .map((s) => ({ sku: s, score: scoreForSku(s.code, priority, energyTariffRupiahPerKwh) }))
    .sort((a, b) => b.score - a.score);

  const totalScore = scored.reduce((a, b) => a + Math.max(b.score, 1), 0);

  let remainingSupply = totalSupplyKg;
  const rows: OptimizerMixRow[] = [];

  for (const { sku, score } of scored) {
    const weight = Math.max(score, 1) / totalScore;
    const energy = skuEnergyProfiles.find((e) => e.skuCode === sku.code)!;
    const ceiling = demandCeilingKg[sku.code] ?? BASE_DEMAND_CEILING[sku.code];
    const yieldPct = Math.min(95, Math.max(30, sku.yieldFromLoinPct + yieldDeltaPp));

    let inputKg = totalSupplyKg * weight;
    let outputKg = inputKg * (yieldPct / 100);

    // Terapkan demand ceiling
    if (outputKg > ceiling) {
      outputKg = ceiling;
      inputKg = outputKg / (yieldPct / 100);
    }
    if (inputKg > remainingSupply) {
      inputKg = remainingSupply;
      outputKg = inputKg * (yieldPct / 100);
    }
    remainingSupply = Math.max(0, remainingSupply - inputKg);

    rows.push({
      skuCode: sku.code,
      recommendedInputKg: Math.round(inputKg),
      expectedOutputKg: Math.round(outputKg),
      mixPct: 0,
      yieldPct,
      marginRupiah: Math.round(outputKg * (usdToIdr(sku.priceUsdPerKg) - PROCESSING_COST_PER_KG - energy.totalKwh * energyTariffRupiahPerKwh)),
      energyKwh: Math.round(outputKg * energy.totalKwh),
      demandFulfillmentPct: Math.min(100, Math.round((outputKg / ceiling) * 1000) / 10),
    });
  }

  const totalOutputKg = rows.reduce((a, b) => a + b.expectedOutputKg, 0);
  rows.forEach((r) => {
    r.mixPct = totalOutputKg > 0 ? Math.round((r.expectedOutputKg / totalOutputKg) * 1000) / 10 : 0;
  });

  const expectedProfitRupiah = rows.reduce((a, b) => a + b.marginRupiah, 0);
  const totalEnergyKwh = rows.reduce((a, b) => a + b.energyKwh, 0);
  const capacityUtilizationPct = Math.min(100, Math.round((totalOutputKg / freezerCapacityKg) * 1000) / 10);
  const excessRatioPct = Math.max(0, Math.round((remainingSupply / totalSupplyKg) * 1000) / 10);

  return {
    mix: rows.sort((a, b) => b.expectedOutputKg - a.expectedOutputKg),
    totalOutputKg: Math.round(totalOutputKg),
    expectedProfitRupiah: Math.round(expectedProfitRupiah),
    totalEnergyKwh: Math.round(totalEnergyKwh),
    energyIntensity: totalOutputKg > 0 ? Math.round((totalEnergyKwh / totalOutputKg) * 1000) / 1000 : 0,
    capacityUtilizationPct,
    excessRatioPct,
  };
}

export const DEFAULT_OPTIMIZER_INPUTS: OptimizerInputs = {
  totalSupplyKg: 18750,
  size30UpPct: 85.2,
  gradeBPct: 8.4,
  energyTariffRupiahPerKwh: 1444.7,
  yieldDeltaPp: 0,
  freezerCapacityKg: 12500,
  demandCeilingKg: {},
  priority: "Balanced Optimization",
};
