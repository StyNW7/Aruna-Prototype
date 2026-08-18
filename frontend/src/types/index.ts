// Data model utama platform operasional FISH — PT Aruna Jaya Nuswantara.
// Seluruh data yang mengisi tipe ini bersifat ilustratif untuk kebutuhan prototype.

export type SizeGrade = "14 UP" | "20 UP" | "30 UP";
export type QualityGrade = "Grade B" | "Grade C";
export type FreshnessStatus = "Prima" | "Baik" | "Perlu Perhatian";

export interface SupplyBatch {
  id: string;
  vessel: string;
  arrivalDate: string;
  sizeGrade: SizeGrade;
  qualityGrade: QualityGrade;
  totalWeightKg: number;
  availableStockKg: number;
  purchasePricePerKg: number; // Rupiah
  freshness: FreshnessStatus;
  supplier: string;
  status: "Diterima" | "Diproses" | "Selesai Diproses" | "Menunggu QC";
}

export type ProductStage = "Whole Fish" | "Fresh Loin" | "WIP" | "Finished Goods" | "Side Product";

export type SKUCode =
  | "SAKU-16OZ"
  | "STEAK-10OZ"
  | "STEAK-8OZ"
  | "STEAK-6OZ"
  | "STEAK-4OZ"
  | "POKE-1.5CM"
  | "MEDALLION-2-3OZ"
  | "GROUND-MEAT";

export interface SKU {
  code: SKUCode;
  name: string;
  category: "SAKU" | "Steak" | "Poke" | "Medallion" | "Ground Meat";
  priceUsdPerKg: number;
  yieldFromLoinPct: number;
  minSizeGrade: SizeGrade;
  minQualityGrade: QualityGrade;
  processingKwhPerKg: number;
  exportEligible: boolean;
  description: string;
}

export interface InventoryItem {
  id: string;
  productCode: string;
  productName: string;
  category: ProductStage;
  weightKg: number;
  reservedKg: number;
  ageDays: number;
  storage: "Cold Storage" | "Freezer" | "Chiller" | "Ruang Proses";
  status: "Aman" | "Perlu Diproses" | "Prioritas" | "Risiko Aging";
  batchId: string;
}

export interface EnergyProcess {
  id: string;
  name: string;
  powerKw: number;
  runtimeHours: number;
  volumeKg: number;
  kwh: number;
  costRupiah: number;
  sharePct: number;
}

export interface SKUEnergyProfile {
  skuCode: SKUCode;
  cuttingKwh: number;
  trimmingKwh: number;
  freezingKwh: number;
  storageKwh: number;
  totalKwh: number;
  kwhPerKg: number;
  energyCostPerKg: number;
  profitPerKwh: number;
}

export interface ProductionPlan {
  id: string;
  date: string;
  batchId: string;
  skuCode: SKUCode;
  inputKg: number;
  targetOutputKg: number;
  actualOutputKg?: number;
  machine: string;
  start: string;
  finish: string;
  status: "Belum Dimulai" | "Dalam Proses" | "Selesai" | "Tertunda";
}

export interface OptimizationAllocationCell {
  supplySegment: string; // e.g. "30 UP Grade B"
  skuCode: SKUCode;
  allocatedKg: number;
  allocationPct: number;
}

export interface OptimizationResult {
  id: string;
  generatedAt: string;
  priority: "Maksimalkan Profit" | "Efisiensi Energi" | "Balanced Optimization";
  totalInputKg: number;
  expectedProfitRupiah: number;
  profitUpliftPct: number;
  energyEfficiencyImprovementPct: number;
  excessReductionPct: number;
  capacityUtilizationPct: number;
  mix: {
    skuCode: SKUCode;
    recommendedInputKg: number;
    expectedOutputKg: number;
    mixPct: number;
    yieldPct: number;
    marginRupiah: number;
    energyKwh: number;
    demandFulfillmentPct: number;
  }[];
  allocationMatrix: OptimizationAllocationCell[];
  reasoning: string[];
}

export interface PricingRecommendation {
  skuCode: SKUCode;
  buyerPriceUsd: number;
  volumeKg: number;
  energyTariffRupiah: number;
  targetMarginPct: number;
  currentPriceUsd: number;
  minimumProfitablePriceUsd: number;
  targetPriceUsd: number;
  expectedMarginPct: number;
  incrementalMarginRupiah: number;
  recommendation: "Terima" | "Negosiasikan" | "Produksi Selektif" | "Tolak";
  reason: string;
}

export interface Scenario {
  id: string;
  name: string;
  supplyDeltaPct: number;
  size30UpDistributionPct: number;
  energyTariffDeltaPct: number;
  yieldDeltaPp: number;
  freezerCapacityDeltaPct: number;
  demandDeltaPct: number;
}

export interface ScenarioResult {
  profitRupiah: number;
  energyKwh: number;
  excessRatioPct: number;
  capacityUtilizationPct: number;
  mix: { skuCode: SKUCode; mixPct: number }[];
}

export interface Shipment {
  id: string;
  containerNo: string;
  buyer: string;
  plannedDate: string;
  items: { skuCode: SKUCode; weightKg: number; cartons: number; valueUsd: number }[];
  totalWeightKg: number;
  capacityKg: number;
  status: "Draft" | "Terjadwal" | "Dikirim" | "Selesai";
}

export interface QualityRecord {
  id: string;
  batchId: string;
  sizeGrade: SizeGrade;
  qualityGrade: QualityGrade;
  freshness: FreshnessStatus;
  eligibleSkus: SKUCode[];
  approvalStatus: "Disetujui" | "Menunggu" | "Ditolak";
  inspector: string;
  date: string;
}

export interface SOPRule {
  id: string;
  title: string;
  description: string;
  category: "Eligibility" | "Pricing" | "Capacity" | "Energy" | "Governance";
}

export interface ApprovalRequest {
  id: string;
  type: "Production Plan" | "Pricing Override" | "Capacity Override" | "Manual Optimization Override" | "Quality Exception";
  title: string;
  requester: string;
  date: string;
  impact: string;
  status: "Menunggu" | "Disetujui" | "Ditolak" | "Revisi";
  approver: string;
}

export interface PerformanceMetric {
  kpi: string;
  planned: number;
  actual: number;
  unit: string;
  variancePct: number;
}

export type RoleName =
  | "Plant Manager"
  | "Production Planner"
  | "Finance"
  | "Engineering"
  | "Quality Control"
  | "Commercial";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: "info" | "warning" | "critical" | "success";
  read: boolean;
}
