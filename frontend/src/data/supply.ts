import type { SupplyBatch } from "@/types";

// Data ilustratif untuk prototype — merepresentasikan pola supply Hub Bungus.
export const supplyBatches: SupplyBatch[] = [
  { id: "BT-2408-01", vessel: "KM Samudra Jaya 2", arrivalDate: "2024-08-02", sizeGrade: "30 UP", qualityGrade: "Grade C", totalWeightKg: 6250, availableStockKg: 0, purchasePricePerKg: 42000, freshness: "Baik", supplier: "Koperasi Nelayan Bungus", status: "Selesai Diproses" },
  { id: "BT-2408-03", vessel: "KM Camar Laut", arrivalDate: "2024-08-04", sizeGrade: "30 UP", qualityGrade: "Grade B", totalWeightKg: 4180, availableStockKg: 0, purchasePricePerKg: 47500, freshness: "Prima", supplier: "Nelayan Mandiri Teluk Kabung", status: "Selesai Diproses" },
  { id: "BT-2408-05", vessel: "KM Samudra Jaya 2", arrivalDate: "2024-08-06", sizeGrade: "20 UP", qualityGrade: "Grade C", totalWeightKg: 5420, availableStockKg: 860, purchasePricePerKg: 39500, freshness: "Baik", supplier: "Koperasi Nelayan Bungus", status: "Diproses" },
  { id: "BT-2408-07", vessel: "KM Bintang Selatan", arrivalDate: "2024-08-08", sizeGrade: "14 UP", qualityGrade: "Grade C", totalWeightKg: 3960, availableStockKg: 1240, purchasePricePerKg: 34000, freshness: "Baik", supplier: "Nelayan Mandiri Teluk Kabung", status: "Diproses" },
  { id: "BT-2408-09", vessel: "KM Camar Laut", arrivalDate: "2024-08-10", sizeGrade: "30 UP", qualityGrade: "Grade C", totalWeightKg: 7120, availableStockKg: 2150, purchasePricePerKg: 42500, freshness: "Baik", supplier: "Koperasi Nelayan Bungus", status: "Diproses" },
  { id: "BT-2408-10", vessel: "KM Elang Pesisir", arrivalDate: "2024-08-11", sizeGrade: "30 UP", qualityGrade: "Grade B", totalWeightKg: 3340, availableStockKg: 3340, purchasePricePerKg: 48000, freshness: "Prima", supplier: "Nelayan Mandiri Teluk Kabung", status: "Menunggu QC" },
  { id: "BT-2408-11", vessel: "KM Samudra Jaya 2", arrivalDate: "2024-08-12", sizeGrade: "20 UP", qualityGrade: "Grade C", totalWeightKg: 4870, availableStockKg: 4870, purchasePricePerKg: 39000, freshness: "Baik", supplier: "Koperasi Nelayan Bungus", status: "Diterima" },
  { id: "BT-2408-12", vessel: "KM Bintang Selatan", arrivalDate: "2024-08-12", sizeGrade: "14 UP", qualityGrade: "Grade C", totalWeightKg: 2860, availableStockKg: 2860, purchasePricePerKg: 33500, freshness: "Perlu Perhatian", supplier: "Nelayan Mandiri Teluk Kabung", status: "Diterima" },
  { id: "BT-2408-13", vessel: "KM Camar Laut", arrivalDate: "2024-08-13", sizeGrade: "30 UP", qualityGrade: "Grade C", totalWeightKg: 6890, availableStockKg: 6890, purchasePricePerKg: 42000, freshness: "Baik", supplier: "Koperasi Nelayan Bungus", status: "Diterima" },
  { id: "BT-2408-14", vessel: "KM Elang Pesisir", arrivalDate: "2024-08-14", sizeGrade: "30 UP", qualityGrade: "Grade B", totalWeightKg: 5109, availableStockKg: 5109, purchasePricePerKg: 47800, freshness: "Prima", supplier: "Nelayan Mandiri Teluk Kabung", status: "Diterima" },
];

export const totalIncomingSupplyKg = supplyBatches.reduce((a, b) => a + b.totalWeightKg, 0);
export const totalAvailableStockKg = supplyBatches.reduce((a, b) => a + b.availableStockKg, 0);
