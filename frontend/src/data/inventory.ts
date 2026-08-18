import type { InventoryItem } from "@/types";

// Data ilustratif untuk prototype.
export const inventoryItems: InventoryItem[] = [
  { id: "INV-001", productCode: "WGG", productName: "Whole Fish / WGG", category: "Whole Fish", weightKg: 4210, reservedKg: 1800, ageDays: 1, storage: "Chiller", status: "Perlu Diproses", batchId: "BT-2408-11" },
  { id: "INV-002", productCode: "WGG", productName: "Whole Fish / WGG", category: "Whole Fish", weightKg: 2860, reservedKg: 0, ageDays: 2, storage: "Chiller", status: "Prioritas", batchId: "BT-2408-12" },
  { id: "INV-003", productCode: "LOIN-30UPB", productName: "Fresh Loin 30 UP Grade B", category: "Fresh Loin", weightKg: 1980, reservedKg: 1200, ageDays: 1, storage: "Chiller", status: "Aman", batchId: "BT-2408-14" },
  { id: "INV-004", productCode: "LOIN-30UPC", productName: "Fresh Loin 30 UP Grade C", category: "Fresh Loin", weightKg: 3120, reservedKg: 1900, ageDays: 2, storage: "Chiller", status: "Aman", batchId: "BT-2408-13" },
  { id: "INV-005", productCode: "LOIN-20UPC", productName: "Fresh Loin 20 UP Grade C", category: "Fresh Loin", weightKg: 2340, reservedKg: 900, ageDays: 3, storage: "Chiller", status: "Perlu Diproses", batchId: "BT-2408-05" },
  { id: "INV-006", productCode: "WIP-STEAK", productName: "WIP Steak (belum dipotong final)", category: "WIP", weightKg: 1450, reservedKg: 1450, ageDays: 1, storage: "Ruang Proses", status: "Aman", batchId: "BT-2408-09" },
  { id: "INV-007", productCode: "WIP-SAKU", productName: "WIP SAKU", category: "WIP", weightKg: 860, reservedKg: 600, ageDays: 1, storage: "Ruang Proses", status: "Aman", batchId: "BT-2408-14" },
  { id: "INV-008", productCode: "FG-SAKU16", productName: "SAKU 16 OZ", category: "Finished Goods", weightKg: 1120, reservedKg: 1120, ageDays: 4, storage: "Freezer", status: "Aman", batchId: "BT-2408-03" },
  { id: "INV-009", productCode: "FG-ST8", productName: "Steak 8 OZ", category: "Finished Goods", weightKg: 2380, reservedKg: 1850, ageDays: 5, storage: "Freezer", status: "Aman", batchId: "BT-2408-01" },
  { id: "INV-010", productCode: "FG-ST6", productName: "Steak 6 OZ", category: "Finished Goods", weightKg: 1640, reservedKg: 900, ageDays: 6, storage: "Freezer", status: "Aman", batchId: "BT-2408-05" },
  { id: "INV-011", productCode: "FG-PK15", productName: "Poke / Cube 1,5 CM", category: "Finished Goods", weightKg: 980, reservedKg: 400, ageDays: 8, storage: "Freezer", status: "Risiko Aging", batchId: "BT-2408-01" },
  { id: "INV-012", productCode: "FG-MD", productName: "Medallion 2-3 OZ", category: "Finished Goods", weightKg: 740, reservedKg: 300, ageDays: 9, storage: "Freezer", status: "Risiko Aging", batchId: "BT-2408-05" },
  { id: "INV-013", productCode: "FG-GM", productName: "Ground Meat", category: "Finished Goods", weightKg: 520, reservedKg: 0, ageDays: 3, storage: "Freezer", status: "Aman", batchId: "BT-2408-09" },
  { id: "INV-014", productCode: "SIDE-HD", productName: "Kepala & Rahang", category: "Side Product", weightKg: 890, reservedKg: 0, ageDays: 2, storage: "Cold Storage", status: "Perlu Diproses", batchId: "BT-2408-09" },
  { id: "INV-015", productCode: "SIDE-BL", productName: "Toro / Belly", category: "Side Product", weightKg: 410, reservedKg: 180, ageDays: 2, storage: "Cold Storage", status: "Prioritas", batchId: "BT-2408-13" },
];
