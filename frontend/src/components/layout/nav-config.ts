import {
  Gauge,
  Ship,
  Boxes,
  MapPinned,
  Calculator,
  Zap,
  TrendingUp,
  CircleDollarSign,
  SlidersHorizontal,
  ClipboardList,
  Truck,
  PackageX,
  ShieldCheck,
  BarChart3,
  FileText,
  ClipboardCheck,
  CheckSquare,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Ringkasan Operasional", href: "/app/overview", icon: Gauge }],
  },
  {
    label: "Supply",
    items: [
      { label: "Supply Intake", href: "/app/supply", icon: Ship },
      { label: "Inventory", href: "/app/inventory", icon: Boxes },
      { label: "Traceability", href: "/app/traceability", icon: MapPinned },
    ],
  },
  {
    label: "Optimization",
    items: [
      { label: "Production Optimizer", href: "/app/optimizer", icon: Calculator },
      { label: "Factory Energy", href: "/app/energy", icon: Zap },
      { label: "Value Optimization", href: "/app/value", icon: TrendingUp },
      { label: "Pricing Advisor", href: "/app/pricing", icon: CircleDollarSign },
      { label: "Scenario Simulator", href: "/app/scenario", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Execution",
    items: [
      { label: "Production Plan", href: "/app/production", icon: ClipboardList },
      { label: "Shipment Planner", href: "/app/shipment", icon: Truck },
      { label: "Excess & Side Product", href: "/app/excess", icon: PackageX },
      { label: "Quality Control", href: "/app/quality", icon: ShieldCheck },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "Plan vs Actual", href: "/app/performance", icon: BarChart3 },
      { label: "Reports", href: "/app/reports", icon: FileText },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "SOP & Decision Rules", href: "/app/sop", icon: ClipboardCheck },
      { label: "Approval Center", href: "/app/approvals", icon: CheckSquare },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/app/settings", icon: Settings },
      { label: "Help", href: "/app/help", icon: HelpCircle },
    ],
  },
];
