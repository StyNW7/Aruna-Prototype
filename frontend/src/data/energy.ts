import type { EnergyProcess, SKUEnergyProfile } from "@/types";

export const ENERGY_TARIFF_RUPIAH_PER_KWH = 1444.7; // Data ilustratif — tarif industri rata-rata

// Data ilustratif untuk prototype.
export const energyProcesses: EnergyProcess[] = [
  { id: "EP-01", name: "Receiving", powerKw: 4.2, runtimeHours: 3.5, volumeKg: 18750, kwh: 14.7, costRupiah: 21237, sharePct: 2.1 },
  { id: "EP-02", name: "Bandsaw Cutting", powerKw: 11.5, runtimeHours: 18.2, volumeKg: 18750, kwh: 209.3, costRupiah: 302408, sharePct: 30.4 },
  { id: "EP-03", name: "Trimming", powerKw: 3.8, runtimeHours: 14.6, volumeKg: 15600, kwh: 55.5, costRupiah: 80181, sharePct: 8.1 },
  { id: "EP-04", name: "Chilling", powerKw: 9.6, runtimeHours: 12.0, volumeKg: 18750, kwh: 115.2, costRupiah: 166453, sharePct: 16.7 },
  { id: "EP-05", name: "Freezing", powerKw: 18.4, runtimeHours: 15.5, volumeKg: 10980, kwh: 285.2, costRupiah: 412126, sharePct: 41.4 },
  { id: "EP-06", name: "Cold Storage", powerKw: 6.2, runtimeHours: 24.0, volumeKg: 10980, kwh: 148.8, costRupiah: 215002, sharePct: 21.6 },
  { id: "EP-07", name: "Packaging", powerKw: 2.4, runtimeHours: 8.0, volumeKg: 10980, kwh: 19.2, costRupiah: 27738, sharePct: 2.8 },
];

export const totalEnergyKwh = energyProcesses.reduce((a, b) => a + b.kwh, 0);
export const totalEnergyCostRupiah = energyProcesses.reduce((a, b) => a + b.costRupiah, 0);

// Data ilustratif untuk prototype — profil energi per SKU (kWh untuk memproses 1 kg finished goods).
export const skuEnergyProfiles: SKUEnergyProfile[] = [
  { skuCode: "SAKU-16OZ", cuttingKwh: 0.19, trimmingKwh: 0.06, freezingKwh: 0.16, storageKwh: 0.07, totalKwh: 0.48, kwhPerKg: 0.48, energyCostPerKg: 693, profitPerKwh: 41236 },
  { skuCode: "STEAK-10OZ", cuttingKwh: 0.17, trimmingKwh: 0.05, freezingKwh: 0.13, storageKwh: 0.06, totalKwh: 0.41, kwhPerKg: 0.41, energyCostPerKg: 592, profitPerKwh: 26890 },
  { skuCode: "STEAK-8OZ", cuttingKwh: 0.16, trimmingKwh: 0.05, freezingKwh: 0.12, storageKwh: 0.06, totalKwh: 0.39, kwhPerKg: 0.39, energyCostPerKg: 563, profitPerKwh: 28230 },
  { skuCode: "STEAK-6OZ", cuttingKwh: 0.15, trimmingKwh: 0.05, freezingKwh: 0.11, storageKwh: 0.06, totalKwh: 0.37, kwhPerKg: 0.37, energyCostPerKg: 535, profitPerKwh: 27690 },
  { skuCode: "STEAK-4OZ", cuttingKwh: 0.14, trimmingKwh: 0.04, freezingKwh: 0.10, storageKwh: 0.06, totalKwh: 0.34, kwhPerKg: 0.34, energyCostPerKg: 491, profitPerKwh: 23850 },
  { skuCode: "POKE-1.5CM", cuttingKwh: 0.15, trimmingKwh: 0.11, freezingKwh: 0.12, storageKwh: 0.06, totalKwh: 0.44, kwhPerKg: 0.44, energyCostPerKg: 636, profitPerKwh: 17420 },
  { skuCode: "MEDALLION-2-3OZ", cuttingKwh: 0.11, trimmingKwh: 0.05, freezingKwh: 0.09, storageKwh: 0.05, totalKwh: 0.30, kwhPerKg: 0.30, energyCostPerKg: 434, profitPerKwh: 15370 },
  { skuCode: "GROUND-MEAT", cuttingKwh: 0.07, trimmingKwh: 0.03, freezingKwh: 0.07, storageKwh: 0.05, totalKwh: 0.22, kwhPerKg: 0.22, energyCostPerKg: 318, profitPerKwh: 9430 },
];
