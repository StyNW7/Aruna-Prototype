import type { RoleName } from "@/types";

export interface RoleDefinition {
  name: RoleName;
  focusAreas: string[];
  defaultRoute: string;
  description: string;
}

export const roleDefinitions: RoleDefinition[] = [
  { name: "Plant Manager", focusAreas: ["Overview KPI", "Approval Center", "Production Plan", "Risk"], defaultRoute: "/app/overview", description: "Melihat gambaran menyeluruh operasional dan menyetujui keputusan penting." },
  { name: "Production Planner", focusAreas: ["Supply Intake", "Production Optimizer", "Production Plan", "Inventory"], defaultRoute: "/app/supply", description: "Merencanakan produksi berdasarkan supply dan hasil optimasi." },
  { name: "Finance", focusAreas: ["Pricing Advisor", "Value Optimization", "Profitability"], defaultRoute: "/app/value", description: "Mengelola pricing, margin, dan profitabilitas SKU." },
  { name: "Engineering", focusAreas: ["Factory Energy", "Machine", "Capacity"], defaultRoute: "/app/energy", description: "Memantau konsumsi energi, kapasitas mesin, dan efisiensi proses." },
  { name: "Quality Control", focusAreas: ["Quality Control", "Eligibility", "Traceability"], defaultRoute: "/app/quality", description: "Memastikan grade, kesegaran, dan eligibility produk terpenuhi." },
  { name: "Commercial", focusAreas: ["Pricing", "Demand", "Buyer Order"], defaultRoute: "/app/pricing", description: "Mengelola hubungan buyer, demand, dan strategi harga." },
];

export const currentUser = {
  name: "Andi Wirawan",
  role: "Production Planner" as RoleName,
  plant: "Hub Pelabuhan Bungus, Padang",
  avatarInitials: "AW",
};
