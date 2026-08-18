import type { Shipment } from "@/types";

export const CONTAINER_CAPACITY_KG = 19000;

// Data ilustratif untuk prototype.
export const shipments: Shipment[] = [
  {
    id: "SH-001",
    containerNo: "MSKU-7712340",
    buyer: "Pacific Seafood Co. (US)",
    plannedDate: "2024-08-18",
    items: [
      { skuCode: "SAKU-16OZ", weightKg: 4200, cartons: 210, valueUsd: 62496 },
      { skuCode: "STEAK-8OZ", weightKg: 6100, cartons: 305, valueUsd: 51118 },
      { skuCode: "STEAK-6OZ", weightKg: 4300, cartons: 215, valueUsd: 35088 },
      { skuCode: "POKE-1.5CM", weightKg: 3250, cartons: 163, valueUsd: 25090 },
    ],
    totalWeightKg: 17850,
    capacityKg: CONTAINER_CAPACITY_KG,
    status: "Terjadwal",
  },
  {
    id: "SH-002",
    containerNo: "MSKU-7712389",
    buyer: "Bluewave Foods (JP)",
    plannedDate: "2024-08-24",
    items: [
      { skuCode: "STEAK-4OZ", weightKg: 5200, cartons: 260, valueUsd: 37284 },
      { skuCode: "MEDALLION-2-3OZ", weightKg: 4100, cartons: 205, valueUsd: 22591 },
      { skuCode: "GROUND-MEAT", weightKg: 2600, cartons: 130, valueUsd: 10270 },
    ],
    totalWeightKg: 11900,
    capacityKg: CONTAINER_CAPACITY_KG,
    status: "Draft",
  },
];
