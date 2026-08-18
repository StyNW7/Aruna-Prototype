import type { ProductionPlan } from "@/types";

// Data ilustratif untuk prototype.
export const productionPlans: ProductionPlan[] = [
  { id: "PP-001", date: "2024-08-12", batchId: "BT-2408-14", skuCode: "SAKU-16OZ", inputKg: 2100, targetOutputKg: 1302, actualOutputKg: 1275, machine: "Bandsaw Line 1", start: "07:00", finish: "11:30", status: "Selesai" },
  { id: "PP-002", date: "2024-08-12", batchId: "BT-2408-13", skuCode: "STEAK-8OZ", inputKg: 2600, targetOutputKg: 1820, actualOutputKg: 1795, machine: "Bandsaw Line 2", start: "07:00", finish: "13:00", status: "Selesai" },
  { id: "PP-003", date: "2024-08-13", batchId: "BT-2408-09", skuCode: "STEAK-6OZ", inputKg: 1900, targetOutputKg: 1349, machine: "Bandsaw Line 1", start: "08:00", finish: "12:30", status: "Dalam Proses" },
  { id: "PP-004", date: "2024-08-13", batchId: "BT-2408-05", skuCode: "POKE-1.5CM", inputKg: 1200, targetOutputKg: 792, machine: "Trimming Station A", start: "08:30", finish: "12:00", status: "Dalam Proses" },
  { id: "PP-005", date: "2024-08-13", batchId: "BT-2408-11", skuCode: "MEDALLION-2-3OZ", inputKg: 1450, targetOutputKg: 1088, machine: "Trimming Station B", start: "09:00", finish: "13:30", status: "Belum Dimulai" },
  { id: "PP-006", date: "2024-08-14", batchId: "BT-2408-12", skuCode: "GROUND-MEAT", inputKg: 980, targetOutputKg: 804, machine: "Grinding Line", start: "07:30", finish: "10:00", status: "Belum Dimulai" },
  { id: "PP-007", date: "2024-08-14", batchId: "BT-2408-14", skuCode: "STEAK-4OZ", inputKg: 1600, targetOutputKg: 1168, machine: "Bandsaw Line 2", start: "10:00", finish: "14:00", status: "Tertunda" },
];
