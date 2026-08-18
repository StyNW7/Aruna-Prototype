import type { QualityRecord } from "@/types";

// Data ilustratif untuk prototype.
export const qualityRecords: QualityRecord[] = [
  { id: "QC-001", batchId: "BT-2408-10", sizeGrade: "30 UP", qualityGrade: "Grade B", freshness: "Prima", eligibleSkus: ["SAKU-16OZ", "STEAK-10OZ", "STEAK-8OZ", "STEAK-6OZ", "STEAK-4OZ", "POKE-1.5CM", "MEDALLION-2-3OZ", "GROUND-MEAT"], approvalStatus: "Disetujui", inspector: "Rani Kusuma", date: "2024-08-11" },
  { id: "QC-002", batchId: "BT-2408-11", sizeGrade: "20 UP", qualityGrade: "Grade C", freshness: "Baik", eligibleSkus: ["STEAK-8OZ", "STEAK-6OZ", "STEAK-4OZ", "POKE-1.5CM", "MEDALLION-2-3OZ", "GROUND-MEAT"], approvalStatus: "Disetujui", inspector: "Rani Kusuma", date: "2024-08-12" },
  { id: "QC-003", batchId: "BT-2408-12", sizeGrade: "14 UP", qualityGrade: "Grade C", freshness: "Perlu Perhatian", eligibleSkus: ["STEAK-4OZ", "MEDALLION-2-3OZ", "GROUND-MEAT"], approvalStatus: "Menunggu", inspector: "Dedi Prasetyo", date: "2024-08-12" },
  { id: "QC-004", batchId: "BT-2408-13", sizeGrade: "30 UP", qualityGrade: "Grade C", freshness: "Baik", eligibleSkus: ["STEAK-8OZ", "STEAK-6OZ", "STEAK-4OZ", "POKE-1.5CM", "MEDALLION-2-3OZ", "GROUND-MEAT"], approvalStatus: "Disetujui", inspector: "Dedi Prasetyo", date: "2024-08-13" },
  { id: "QC-005", batchId: "BT-2408-14", sizeGrade: "30 UP", qualityGrade: "Grade B", freshness: "Prima", eligibleSkus: ["SAKU-16OZ", "STEAK-10OZ", "STEAK-8OZ", "STEAK-6OZ", "STEAK-4OZ", "POKE-1.5CM", "MEDALLION-2-3OZ", "GROUND-MEAT"], approvalStatus: "Disetujui", inspector: "Rani Kusuma", date: "2024-08-14" },
];
